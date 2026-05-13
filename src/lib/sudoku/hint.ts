import type { Board, Color, Solution } from './types'

export type HintInput = {
  givens: Board
  userCells: Board
  hintLocked: boolean[]
  solution: Solution
  selectedColor: Color | null
  lastCorrectlyPlacedColor: Color | null
  rng?: () => number
}

export type HintResult = { cell: number; color: Color } | null

export function nextHint(input: HintInput): HintResult {
  const { givens, userCells, hintLocked, solution, selectedColor, lastCorrectlyPlacedColor } = input
  const rng = input.rng ?? Math.random

  const isEligible = (i: number): boolean => givens[i] === null && !hintLocked[i] && userCells[i] === null

  const pickForColor = (color: Color): HintResult => {
    const candidates: number[] = []
    for (let i = 0; i < 81; i++) {
      if (isEligible(i) && solution[i] === color) candidates.push(i)
    }
    if (candidates.length === 0) return null
    const cell = candidates[Math.floor(rng() * candidates.length)]
    return { cell, color }
  }

  if (selectedColor !== null) {
    const r = pickForColor(selectedColor)
    if (r !== null) return r
  }
  if (lastCorrectlyPlacedColor !== null) {
    const r = pickForColor(lastCorrectlyPlacedColor)
    if (r !== null) return r
  }
  const candidates: number[] = []
  for (let i = 0; i < 81; i++) {
    if (isEligible(i)) candidates.push(i)
  }
  if (candidates.length === 0) return null
  const cell = candidates[Math.floor(rng() * candidates.length)]
  return { cell, color: solution[cell] }
}
