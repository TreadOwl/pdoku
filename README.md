# Pixel-doku

A color-based Sudoku game that runs in the browser. Instead of placing digits 1–9, you place colors. Each of the nine colors maps permanently to one digit — the mapping never changes and the player never sees numbers at any point.

Built with Next.js 16, React 19, Tailwind CSS v4, and shadcn.

---

## How it works

### The board

The 9×9 grid works like standard Sudoku: every row, column, and 3×3 box must contain each of the nine colors exactly once. Pre-filled cells (clues) and player-placed cells look identical on the board — no visual distinction.

### Color input

A row of nine colored swatches sits below the board. Tap a swatch to select that color, then tap an empty cell to place it. Alternatively, tap a cell first to focus it, then tap a swatch — the color is placed immediately. Tapping a swatch when a cell is already focused skips the two-step flow entirely.

You can overwrite a color you already placed by selecting a different swatch and tapping that cell again. Tapping outside the board and palette clears your selection.

When a color has been placed exactly nine times across the board (clues + your placements combined), its swatch is grayed out and can no longer be selected.

### Error feedback

Wrong placements are shown immediately with a red border. The conflicting cell in the same row, column, or box also gets a red border — both sides of the contradiction are highlighted simultaneously.

### Hints

Each game starts with three hints. Using a hint fills one empty cell with its correct color. The targeting priority is:

1. An empty cell that matches your currently selected color
2. An empty cell matching the last color you placed correctly
3. A random empty cell

The hint budget decrements only when a cell is actually filled. If there is no valid target (e.g., no empty cells for the selected color), nothing happens and no hint is consumed. Hint-placed cells are permanent and cannot be undone.

### Undo

The undo button reverses your last placement. Pressing undo on a fresh board (nothing placed yet) or after all placements have been undone is a no-op — it doesn't consume any undo budget. The undo count next to the button shows how many you have left. The budget does not recover; once spent, those undos are gone for the match.

### Winning

The game is won when all 81 cells are filled with no errors. A results overlay appears showing your time, difficulty, and how many hints you used. You can immediately start a new game from there.

---

## Difficulty levels

| Difficulty | Clues | Undo limit |
| ---------- | ----- | ---------- |
| Easy       | 41    | Unlimited  |
| Medium     | 35    | 15         |
| Hard       | 29    | 10         |
| Extreme    | 23    | 5          |

Easy and Medium/Hard use a straightforward digging algorithm: cells are removed one at a time in a random order, and each removal is only kept if the puzzle still has exactly one solution.

Extreme uses a different approach: cells are removed with weighted probability that favors digits already well-represented on the board and clusters holes into opposing corners. This produces uneven digit distributions (some colors might appear only once or twice as clues) and irregular hole patterns. The target is 23 clues but the algorithm occasionally stops at 24–26 when no further removal preserves a unique solution — this is expected behavior.

All puzzles across all difficulties are guaranteed to have exactly one solution.

---

## Persistence

An in-progress game is saved to `localStorage` automatically after every move. If you close the tab and return, the game resumes from exactly where you left off — same board, same timer, same undo and hint budgets.

The `/play` screen shows a Resume button when a saved game is detected, alongside the difficulty selection for starting fresh.

The timer only counts while the browser tab is visible. Switching away pauses it automatically.

---

## Stats

All completed games are stored locally. The stats drawer (accessible from the home screen) shows:

- Total games started and finished
- Best completion time overall and per difficulty
- Favorite difficulty (most completions)
- Total time spent across all finished games

---

## Running locally

Requires [Bun](https://bun.sh).

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
bun build       # production build
bun typecheck   # TypeScript check
bun lint        # ESLint
bun format      # Prettier
```

To verify the puzzle generator (runs 50 boards per difficulty, checks unique solutions and clue counts):

```bash
bun smoke
```
