import type { Board, Color, Solution } from './types'
import { ALL_DIGITS_MASK, BIT_TO_COLOR, BOX_OF, COL_OF, ROW_OF, popcount9 } from './indices'

type State = {
  cells: number[]
  rowMask: number[]
  colMask: number[]
  boxMask: number[]
}

function initState(board: Board): State | null {
  const cells = new Array<number>(81).fill(0)
  const rowMask = new Array<number>(9).fill(0)
  const colMask = new Array<number>(9).fill(0)
  const boxMask = new Array<number>(9).fill(0)
  for (let i = 0; i < 81; i++) {
    const v = board[i]
    if (v == null) continue
    const bit = 1 << (v - 1)
    const r = ROW_OF[i]
    const c = COL_OF[i]
    const b = BOX_OF[i]
    if (rowMask[r] & bit || colMask[c] & bit || boxMask[b] & bit) return null
    rowMask[r] |= bit
    colMask[c] |= bit
    boxMask[b] |= bit
    cells[i] = v
  }
  return { cells, rowMask, colMask, boxMask }
}

type Pick = { idx: number; mask: number } | 'solved' | 'dead'

function pickMRV(state: State): Pick {
  let bestIdx = -1
  let bestCount = 10
  let bestMask = 0
  for (let i = 0; i < 81; i++) {
    if (state.cells[i] !== 0) continue
    const r = ROW_OF[i]
    const c = COL_OF[i]
    const b = BOX_OF[i]
    const candidates = ~(state.rowMask[r] | state.colMask[c] | state.boxMask[b]) & ALL_DIGITS_MASK
    if (candidates === 0) return 'dead'
    const count = popcount9(candidates)
    if (count < bestCount) {
      bestCount = count
      bestIdx = i
      bestMask = candidates
    }
  }
  return bestIdx === -1 ? 'solved' : { idx: bestIdx, mask: bestMask }
}

type SearchResult = { count: number; first: Solution | null }

function search(state: State, cap: number, result: SearchResult, captureFirst: boolean): void {
  if (result.count >= cap) return
  const pick = pickMRV(state)
  if (pick === 'dead') return
  if (pick === 'solved') {
    result.count++
    if (captureFirst && result.first === null) {
      result.first = state.cells.slice() as Solution
    }
    return
  }
  const { idx, mask } = pick
  const r = ROW_OF[idx]
  const c = COL_OF[idx]
  const b = BOX_OF[idx]
  let m = mask
  while (m !== 0) {
    const bit = m & -m
    const color = BIT_TO_COLOR[bit]
    state.cells[idx] = color
    state.rowMask[r] |= bit
    state.colMask[c] |= bit
    state.boxMask[b] |= bit
    search(state, cap, result, captureFirst)
    state.cells[idx] = 0
    state.rowMask[r] &= ~bit
    state.colMask[c] &= ~bit
    state.boxMask[b] &= ~bit
    if (result.count >= cap) return
    m &= m - 1
  }
}

function searchRandom(state: State, rng: () => number): boolean {
  const pick = pickMRV(state)
  if (pick === 'dead') return false
  if (pick === 'solved') return true
  const { idx, mask } = pick
  const r = ROW_OF[idx]
  const c = COL_OF[idx]
  const b = BOX_OF[idx]
  const colors: number[] = []
  let m = mask
  while (m !== 0) {
    const bit = m & -m
    colors.push(BIT_TO_COLOR[bit])
    m &= m - 1
  }
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = colors[i]
    colors[i] = colors[j]
    colors[j] = tmp
  }
  for (const color of colors) {
    const bit = 1 << (color - 1)
    state.cells[idx] = color
    state.rowMask[r] |= bit
    state.colMask[c] |= bit
    state.boxMask[b] |= bit
    if (searchRandom(state, rng)) return true
    state.cells[idx] = 0
    state.rowMask[r] &= ~bit
    state.colMask[c] &= ~bit
    state.boxMask[b] &= ~bit
  }
  return false
}

export function solve(board: Board): Solution | null {
  const state = initState(board)
  if (state === null) return null
  const result: SearchResult = { count: 0, first: null }
  search(state, 1, result, true)
  return result.first
}

export function countSolutions(board: Board, cap = 2): number {
  const state = initState(board)
  if (state === null) return 0
  const result: SearchResult = { count: 0, first: null }
  search(state, cap, result, false)
  return result.count
}

export function randomSolve(board: Board, rng: () => number = Math.random): Solution | null {
  const state = initState(board)
  if (state === null) return null
  const ok = searchRandom(state, rng)
  if (!ok) return null
  return state.cells.slice() as Solution
}

export function isValidColor(v: unknown): v is Color {
  return typeof v === 'number' && v >= 1 && v <= 9 && Number.isInteger(v)
}
