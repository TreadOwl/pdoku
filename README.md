# Pixel-doku

Color-based browser Sudoku. Instead of digits, you place one of nine colors. Each color maps permanently to a digit (color slot *k* is always digit *k*); the player never sees numbers at any point.

Stack: Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · shadcn · TypeScript · Bun.

---

## Board and rules

Standard 9×9 Sudoku constraints: every row, column, and 3×3 box must contain each of the nine colors exactly once. Pre-filled cells (givens) and player-placed cells look identical on the board — no visual distinction. The unique solution is computed at generation time and stored alongside the puzzle; all error checking and hints run against it directly.

---

## Input model

Nine colored swatches sit below the board. Two orthogonal pieces of state compose the input:

- **`selectedColor`** — the active color (one of nine, or none).
- **`focusedCell`** — the currently highlighted cell (index 0–80, or none), showing a tint across its row, column, and 3×3 box.

Tapping a swatch selects that color (tapping the same swatch deselects it). Tapping any cell focuses it. If a color is selected when you tap an **empty** cell, the color is placed immediately. If an empty cell is focused and you tap a swatch, the cell is filled in that single swatch tap — skipping the two-step flow.

**Placements are permanent.** Once a cell contains a color (player-placed or hint-placed), it cannot be overwritten by tapping or swatch selection. The only way to reverse a placement is undo. This design makes every move deliberate and keeps the undo budget meaningful at higher difficulties — if overwriting were allowed, the undo limit would be trivially circumventable by cycling colors.

Tapping outside the board and palette clears both `selectedColor` and `focusedCell`.

---

## Error feedback

Wrong placements are flagged immediately with a red border. The **conflict cell** — the existing cell in the same row, column, or box that the wrong color already occupies — also gets a red border. Both endpoints of the contradiction are highlighted simultaneously, giving the player both sides of the conflict rather than just the symptom.

Error state is derived by comparing `userCells[i]` to `solution[i]`; it does not scan for duplicates. A second pass via `findConflictCells` locates the peer cell that creates the constraint violation.

---

## Hints

Each game starts with three hints. A hint fills one empty cell with its correct color and locks it permanently (hint-placed cells cannot be undone). The targeting cascade:

1. An empty cell matching `selectedColor`
2. An empty cell matching the most recently correctly-placed color (undo stack scan, newest-first, skipping wrong placements)
3. A random empty cell

The budget decrements only when a cell is actually filled. If no eligible empty cell exists for the current cascade target, the action is a no-op and no hint is consumed.

---

## Undo

Each player placement pushes an entry `{ cell, prevColor, newColor }` onto an undo stack. `UNDO` pops the top entry and restores `prevColor` to that cell. Hint placements do not push entries. Pressing undo on an empty stack is a no-op — no budget is consumed. The counter next to the button shows remaining undos.

---

## Difficulty

| Difficulty | Clues | Undo limit | Generation strategy |
|------------|-------|------------|---------------------|
| Easy       | 41    | Unlimited  | Simple dig |
| Medium     | 35    | 15         | Simple dig |
| Hard       | 29    | 10         | Simple dig |
| Extreme    | 23    | 5          | Weighted asymmetric dig |

**Generation — three stages:**

1. **Solved board.** Backtracking fill with a randomly shuffled candidate order per call; produces a complete, valid 9×9 in a few milliseconds.

2. **Digging (Easy / Medium / Hard).** The 81 cell indices are shuffled, then walked in order. Each cell is tentatively cleared and `countSolutions(puzzle, cap=2)` is called — a backtracking solver that bails the moment it finds a second solution. If the count is 1 (uniquely solvable), the removal is committed; otherwise it is restored. This continues until the clue-count target is reached.

3. **Digging (Extreme).** Cells are selected by weighted probability rather than uniform random order. Two biases are applied: cells whose digit is already scarce on the board are preferred (`weight = 1 / (remaining clues of that digit + ε)`), and cells in low-density box zones receive an additional factor. After the weighted pass, a uniform mop-up walk attempts any remaining removable cells. If 23 clues cannot be reached — the algorithm hits a local minimum where no single-cell removal preserves a unique solution — the process restarts from a fresh solved board. Up to 50 retries are attempted. In practice ~5 retries are needed; every extreme puzzle produced is **exactly 23 clues**. The asymmetric weighting produces uneven digit distributions (some colors appear once or twice as givens) and clustered hole patterns.

All puzzles across all difficulties are guaranteed to have exactly one solution, verified by `countSolutions` on each individual removal.

---

## Persistence

An in-progress game serializes to `localStorage` on every state change under the key `pixeldoku:active-match`. The payload stores the full board state (givens, solution, userCells, hintLocked flags), the undo stack, hint and undo budgets, and elapsed seconds. On loading `/play/sudoku?difficulty=…`, the saved match is resumed if the difficulty matches; otherwise a fresh puzzle is generated on the main thread behind a loading screen.

The timer counts elapsed seconds and is gated on `!document.hidden` — backgrounding the tab pauses it automatically.

---

## Stats

Completed games are appended to `localStorage` under `pixeldoku:stats`. The stats drawer on the home screen shows:

- Games started vs. finished
- Best completion time overall and per difficulty
- Favorite difficulty (most completions)
- Total time played across all finished games

---

## Visual design

The UI targets a pixel-art / CRT aesthetic:

- **Scan lines** — a fixed full-viewport overlay (`z-index: 9999`, `pointer-events: none`) with a 4px `repeating-linear-gradient` (2px dark / 2px transparent). The pattern scrolls downward via a `scan-roll` keyframe (`background-position-y: 0 → 8px`, 1s linear infinite), simulating the rolling refresh of a CRT phosphor display.
- **Vignette** — a fixed radial gradient overlay that darkens screen edges (transparent center, ~50% black at corners).
- **Pixel shadows** — all interactive buttons use a flat 4px `box-shadow` with no blur. On `:active`, the shadow shrinks to 2px and the element translates `(2px, 2px)` for a physical press-in effect.
- **Page transitions** — browser View Transitions API via `next-view-transitions`. All navigation uses `useTransitionRouter` to trigger `::view-transition-old/new(root)` keyframes: a monitor-flicker sequence (brightness ramp to 2.5× then fade to black on exit; reverse on enter, 160ms + 220ms).

---

## Running locally

Requires [Bun](https://bun.sh).

```bash
bun install
bun dev        # dev server at http://localhost:3000
bun build      # production build
bun typecheck  # TypeScript check (tsc --noEmit)
bun lint       # ESLint
bun format     # Prettier
bun smoke      # generator smoke test: 50 boards/difficulty, asserts unique solutions, exact clue counts, and digit-asymmetry threshold for extreme
```
