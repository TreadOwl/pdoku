import {
  findConflictCells,
  nextHint,
  type Board,
  type Color,
  type SavedMatch,
  type Solution,
  type UndoEntry,
} from '@/lib/sudoku'
import { BOX_OF, COL_OF, ROW_OF } from '@/lib/sudoku/indices'

export type Status = 'playing' | 'won'

export type GameState = {
  difficulty: SavedMatch['difficulty']
  givens: Board
  solution: Solution
  userCells: Board
  hintLocked: boolean[]
  undoStack: UndoEntry[]
  hintsRemaining: number
  undosRemaining: number | null
  elapsedSeconds: number
  startedAt: number
  selectedColor: Color | null
  focusedCell: number | null
  status: Status
}

export type Action =
  | { type: 'SELECT_COLOR'; color: Color }
  | { type: 'CELL_TAP'; idx: number }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'USE_HINT' }
  | { type: 'UNDO' }
  | { type: 'TICK' }

export function fromSavedMatch(saved: SavedMatch): GameState {
  return {
    difficulty: saved.difficulty,
    givens: saved.givens,
    solution: saved.solution,
    userCells: saved.userCells,
    hintLocked: saved.hintLocked,
    undoStack: saved.undoStack,
    hintsRemaining: saved.hintsRemaining,
    undosRemaining: saved.undosRemaining,
    elapsedSeconds: saved.elapsedSeconds,
    startedAt: saved.startedAt,
    selectedColor: null,
    focusedCell: null,
    status: hasWon(saved.givens, saved.userCells, saved.solution) ? 'won' : 'playing',
  }
}

export function toSavedMatch(state: GameState): SavedMatch {
  return {
    difficulty: state.difficulty,
    givens: state.givens,
    solution: state.solution,
    userCells: state.userCells,
    hintLocked: state.hintLocked,
    undoStack: state.undoStack,
    hintsRemaining: state.hintsRemaining,
    undosRemaining: state.undosRemaining,
    elapsedSeconds: state.elapsedSeconds,
    startedAt: state.startedAt,
  }
}

function hasWon(givens: Board, userCells: Board, solution: Solution): boolean {
  for (let i = 0; i < 81; i++) {
    if (givens[i] !== null) continue
    if (userCells[i] === null) return false
    if (userCells[i] !== solution[i]) return false
  }
  return true
}

function lastCorrectColor(state: GameState): Color | null {
  for (let i = state.undoStack.length - 1; i >= 0; i--) {
    const e = state.undoStack[i]
    if (e.newColor !== null && e.newColor === state.solution[e.cell]) {
      return e.newColor
    }
  }
  return null
}

export function reducer(state: GameState, action: Action): GameState {
  if (state.status === 'won' && action.type !== 'TICK') return state

  switch (action.type) {
    case 'SELECT_COLOR': {
      const next = state.selectedColor === action.color ? null : action.color
      if (
        next !== null &&
        state.focusedCell !== null &&
        state.givens[state.focusedCell] === null &&
        !state.hintLocked[state.focusedCell] &&
        state.userCells[state.focusedCell] !== next
      ) {
        const idx = state.focusedCell
        const prev = state.userCells[idx]
        const userCells = state.userCells.slice()
        userCells[idx] = next
        const undoStack = state.undoStack.concat({
          cell: idx,
          prevColor: prev,
          newColor: next,
        })
        const status: Status = hasWon(state.givens, userCells, state.solution) ? 'won' : 'playing'
        const selectedColor = colorCount(state.givens, userCells, next) >= 9 ? null : next
        return { ...state, selectedColor, userCells, undoStack, status }
      }
      return { ...state, selectedColor: next }
    }

    case 'CLEAR_SELECTION': {
      if (state.selectedColor === null && state.focusedCell === null) return state
      return { ...state, selectedColor: null, focusedCell: null }
    }

    case 'CELL_TAP': {
      const idx = action.idx
      const givenHere = state.givens[idx] !== null
      const lockedByHint = state.hintLocked[idx]
      const canPaint = !givenHere && !lockedByHint && state.selectedColor !== null

      if (!canPaint) {
        if (state.focusedCell === idx) return state
        return { ...state, focusedCell: idx }
      }

      const newColor = state.selectedColor as Color
      const prev = state.userCells[idx]
      if (prev === newColor) {
        if (state.focusedCell === idx) return state
        return { ...state, focusedCell: idx }
      }

      const userCells = state.userCells.slice()
      userCells[idx] = newColor
      const undoStack = state.undoStack.concat({
        cell: idx,
        prevColor: prev,
        newColor,
      })

      const status: Status = hasWon(state.givens, userCells, state.solution) ? 'won' : 'playing'
      const selectedColor = colorCount(state.givens, userCells, newColor) >= 9 ? null : state.selectedColor
      return {
        ...state,
        selectedColor,
        userCells,
        undoStack,
        focusedCell: idx,
        status,
      }
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state
      if (state.undosRemaining !== null && state.undosRemaining <= 0) return state
      const top = state.undoStack[state.undoStack.length - 1]
      const userCells = state.userCells.slice()
      userCells[top.cell] = top.prevColor
      return {
        ...state,
        userCells,
        undoStack: state.undoStack.slice(0, -1),
        undosRemaining: state.undosRemaining !== null ? state.undosRemaining - 1 : null,
        focusedCell: top.cell,
      }
    }

    case 'USE_HINT': {
      if (state.hintsRemaining <= 0) return state
      const result = nextHint({
        givens: state.givens,
        userCells: state.userCells,
        hintLocked: state.hintLocked,
        solution: state.solution,
        selectedColor: state.selectedColor,
        lastCorrectlyPlacedColor: lastCorrectColor(state),
      })
      if (result === null) return state

      const userCells = state.userCells.slice()
      userCells[result.cell] = result.color
      const hintLocked = state.hintLocked.slice()
      hintLocked[result.cell] = true

      const status: Status = hasWon(state.givens, userCells, state.solution) ? 'won' : 'playing'
      const selectedColor = colorCount(state.givens, userCells, result.color) >= 9 ? null : state.selectedColor
      return {
        ...state,
        selectedColor,
        userCells,
        hintLocked,
        hintsRemaining: state.hintsRemaining - 1,
        focusedCell: result.cell,
        status,
      }
    }

    case 'TICK': {
      if (state.status === 'won') return state
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 }
    }
  }
}

function colorCount(givens: Board, userCells: Board, color: Color): number {
  let n = 0
  for (let i = 0; i < 81; i++) {
    if ((givens[i] ?? userCells[i]) === color) n++
  }
  return n
}

export function computeExhaustedColors(givens: Board, userCells: Board): Set<Color> {
  const counts = new Array(10).fill(0)
  for (let i = 0; i < 81; i++) {
    const v = givens[i] ?? userCells[i]
    if (v !== null) counts[v]++
  }
  const out = new Set<Color>()
  for (let c = 1; c <= 9; c++) {
    if (counts[c] === 9) out.add(c as Color)
  }
  return out
}

export function computeErrorCells(state: GameState): Set<number> {
  const errors = new Set<number>()
  const { givens, userCells, solution } = state
  let board: Board | null = null
  for (let i = 0; i < 81; i++) {
    const v = userCells[i]
    if (v === null) continue
    if (v === solution[i]) continue
    errors.add(i)
    if (board === null) board = Array.from({ length: 81 }, (_, j) => givens[j] ?? userCells[j])
    for (const j of findConflictCells(board, i, v)) errors.add(j)
  }
  return errors
}

export function computeFocusUnit(focusedCell: number | null): Set<number> {
  const unit = new Set<number>()
  if (focusedCell === null) return unit
  const r = ROW_OF[focusedCell]
  const c = COL_OF[focusedCell]
  const b = BOX_OF[focusedCell]
  for (let i = 0; i < 81; i++) {
    if (ROW_OF[i] === r || COL_OF[i] === c || BOX_OF[i] === b) unit.add(i)
  }
  return unit
}

export function formatTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}
