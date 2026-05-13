export type Color = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type Cell = Color | null

export type Board = Cell[]

export type Solution = Color[]

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme'

export type Puzzle = {
  difficulty: Difficulty
  givens: Board
  solution: Solution
}

export type UndoEntry = {
  cell: number
  prevColor: Cell
  newColor: Cell
}

export type SavedMatch = {
  difficulty: Difficulty
  givens: Board
  solution: Solution
  userCells: Board
  hintLocked: boolean[]
  undoStack: UndoEntry[]
  hintsRemaining: number
  undosRemaining: number | null
  elapsedSeconds: number
  startedAt: number
}
