# Pixel-doku

Color-based browser Sudoku. Instead of digits, you place one of nine colors — each color slot *k* is permanently mapped to digit *k*. The player never sees numbers.

Stack: Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · shadcn · TypeScript · Bun.

---

## Board and rules

Standard 9×9 Sudoku: every row, column, and 3×3 box must contain each of the nine colors exactly once. Pre-filled (given) and player-placed cells look identical — no visual distinction. The unique solution is computed at generation time; all error checking and hint targeting run against it directly.

---

## Input model

Nine colored swatches sit below the board. Two orthogonal pieces of state drive input:

- **`selectedColor`** — the active color (one of nine, or none).
- **`focusedCell`** — the highlighted cell (index 0–80, or none), tinting its row, column, and 3×3 box.

Tapping a swatch selects that color; tapping the same swatch deselects it. Tapping a cell focuses it. If a color is selected when you tap an **empty** cell, the color is placed immediately; if an empty cell is already focused, tapping a swatch fills it in one tap.

After any placement, `focusedCell` is cleared. By default `selectedColor` is also cleared, so each move requires re-selecting a color. The **Keep Color Selected** setting changes this: the color persists after each placement for rapid multi-cell fills.

**Same-color highlighting.** Focusing a filled cell highlights all other cells with the same color via an inset border. Selecting a swatch without a focused cell does the same. The focused cell's color always takes priority over the selected swatch color.

**Placements are permanent.** A placed cell cannot be overwritten — only undo reverses it. This makes every move deliberate and keeps the undo budget meaningful at higher difficulties.

Tapping outside the board and palette clears both `selectedColor` and `focusedCell`.

---

## Error feedback

Wrong placements are flagged immediately with a red border. The **conflict cell** — the peer in the same row, column, or box already holding that color — also gets a red border, showing both sides of the contradiction simultaneously.

---

## Hints

Each game starts with three hints. A hint fills one empty cell with its correct color and locks it permanently (hint cells cannot be undone). Targeting cascade:

1. An empty cell matching `selectedColor`
2. An empty cell matching the most recently correctly-placed color
3. A random empty cell

The budget decrements only on a successful fill; no hint is consumed if no eligible cell exists.

---

## Undo

Each player placement pushes `{ cell, prevColor, newColor }` onto an undo stack. `UNDO` pops the top entry, restores `prevColor`, and clears `focusedCell`. Hint placements are not undoable. Pressing undo on an empty stack is a no-op — no budget is consumed.

---

## Difficulty

| Difficulty | Clues | Undo limit | Generation |
|------------|-------|------------|------------|
| Easy       | 41    | Unlimited  | Simple dig |
| Medium     | 35    | 15         | Simple dig |
| Hard       | 29    | 10         | Simple dig |
| Extreme    | 23    | 5          | Weighted asymmetric dig |

**Generation:** A complete solved board is produced by backtracking fill with a shuffled candidate order. For Easy–Hard, cells are walked in random order and removed if the puzzle remains uniquely solvable (`countSolutions(cap=2)`). For Extreme, removal is weighted toward scarce digits and low-density boxes, producing clustered holes and uneven color distributions. If 23 clues can't be reached, the process retries from a fresh solved board (up to 50 times; ~5 retries typical). Every puzzle across all difficulties has exactly one solution.

---

## Persistence

An in-progress game serializes to `localStorage` (`pixeldoku:active-match`) on every state change. On loading `/play/sudoku?difficulty=…`, the saved match is resumed if the difficulty matches; otherwise a fresh puzzle is generated. Choosing a difficulty from `/play` clears the saved match first — so picking a difficulty always starts fresh, while refreshing mid-puzzle resumes it. The timer pauses automatically when the tab is hidden.

---

## Stats

Completed games are stored under `pixeldoku:stats`. The stats drawer shows games started vs. finished (expandable per-difficulty breakdown), best time overall and per difficulty, favorite difficulty, and total time played.

---

## Settings

Accessible from the home screen and the in-game header (gear icon). Persists to `pixeldoku:settings`.

| Setting | Default | Description |
|---------|---------|-------------|
| Keep Color Selected | Off | Keep the active color after each placement for rapid multi-cell fills. |

---

## Win screen

On completing a puzzle the overlay shows elapsed time, difficulty, and hints used, with two options: **Play Again** (same difficulty, fresh puzzle) and **Return** (back to difficulty select).

---

## Visual design

- **Scan lines** — canvas-based CRT simulation (`z-index: 9999`, `pointer-events: none`). 2px dark / 2px transparent stripes scrolling at 8 CSS px/s, drawn at native DPR resolution to avoid Moiré banding on iOS Safari.
- **Vignette** — fixed radial gradient overlay darkening screen edges.
- **Pixel shadows** — all buttons use a flat 4px `box-shadow`. On `:active`, shadow shrinks to 2px and the element translates `(2px, 2px)`.
- **Page transitions** — View Transitions API via `next-view-transitions`: monitor-flicker sequence (brightness spike → fade to black → fade from black, 160ms + 220ms).

---

## Running locally

Requires [Bun](https://bun.sh).

```bash
bun install
bun dev        # dev server at http://localhost:3000
bun build      # production build
bun typecheck  # tsc --noEmit
bun lint       # ESLint
bun format     # Prettier
bun smoke      # generator smoke test: 50 boards/difficulty
```
