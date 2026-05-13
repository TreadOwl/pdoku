import type { Board, Difficulty, Puzzle, Solution } from './types'
import { BOX_OF } from './indices'
import { countSolutions, randomSolve } from './solver'
import { CLUE_TARGETS } from './difficulty'

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
}

export function generateSolved(rng: () => number = Math.random): Solution {
  const empty: Board = new Array<null>(81).fill(null)
  const sol = randomSolve(empty, rng)
  if (sol === null) throw new Error('generateSolved: unreachable — empty board must be solvable')
  return sol
}

function digSimple(solution: Solution, target: number, rng: () => number): Board {
  const board: Board = solution.slice()
  const order = Array.from({ length: 81 }, (_, i) => i)
  shuffleInPlace(order, rng)
  let clueCount = 81
  for (const i of order) {
    if (clueCount <= target) break
    const saved = board[i]
    if (saved === null) continue
    board[i] = null
    if (countSolutions(board, 2) === 1) {
      clueCount--
    } else {
      board[i] = saved
    }
  }
  return board
}

const DENSE_DIV = 2
const SPARSE_MUL = 2
const DIGIT_EPSILON = 0.5

const ASYMMETRIC_MAX_PASSES = 4

function digAsymmetric(solution: Solution, target: number, rng: () => number): Board {
  const board: Board = solution.slice()
  let clueCount = 81

  const corners = [0, 1, 2, 3, 5, 6, 7, 8]
  shuffleInPlace(corners, rng)
  const denseBoxes = new Set<number>([corners[0], corners[1]])
  const sparseBoxes = new Set<number>()
  for (const c of [corners[0], corners[1]]) {
    const opp = 8 - c
    if (!denseBoxes.has(opp)) sparseBoxes.add(opp)
  }

  const digitCount = new Array<number>(10).fill(0)
  for (let i = 0; i < 81; i++) {
    const v = board[i]
    if (v !== null) digitCount[v]++
  }

  const asymmetricFloor = target + 3

  for (let pass = 0; pass < ASYMMETRIC_MAX_PASSES; pass++) {
    if (clueCount <= asymmetricFloor) break

    const untried: number[] = []
    for (let i = 0; i < 81; i++) if (board[i] !== null) untried.push(i)
    shuffleInPlace(untried, rng)

    let removedThisPass = 0
    while (clueCount > asymmetricFloor && untried.length > 0) {
      const weights = new Array<number>(untried.length)
      let total = 0
      for (let k = 0; k < untried.length; k++) {
        const idx = untried[k]
        const v = board[idx]
        let w: number
        if (v === null) {
          w = 0
        } else {
          const box = BOX_OF[idx]
          w = 1 / (digitCount[v] + DIGIT_EPSILON)
          if (sparseBoxes.has(box)) w *= SPARSE_MUL
          else if (denseBoxes.has(box)) w /= DENSE_DIV
        }
        weights[k] = w
        total += w
      }
      if (total === 0) break
      let pick = rng() * total
      let chosenK = weights.length - 1
      for (let k = 0; k < weights.length; k++) {
        pick -= weights[k]
        if (pick <= 0) {
          chosenK = k
          break
        }
      }
      const cell = untried[chosenK]
      untried.splice(chosenK, 1)
      const saved = board[cell]
      if (saved === null) continue
      board[cell] = null
      if (countSolutions(board, 2) === 1) {
        clueCount--
        digitCount[saved]--
        removedThisPass++
      } else {
        board[cell] = saved
      }
    }

    if (removedThisPass === 0) break
  }

  let progressed = true
  while (clueCount > target && progressed) {
    progressed = false
    const untried: number[] = []
    for (let i = 0; i < 81; i++) if (board[i] !== null) untried.push(i)
    shuffleInPlace(untried, rng)
    for (const cell of untried) {
      if (clueCount <= target) break
      const saved = board[cell]
      if (saved === null) continue
      board[cell] = null
      if (countSolutions(board, 2) === 1) {
        clueCount--
        digitCount[saved]--
        progressed = true
      } else {
        board[cell] = saved
      }
    }
  }
  return board
}

const MAX_EXTREME_ATTEMPTS = 50

export function generate(difficulty: Difficulty, rng: () => number = Math.random): Puzzle {
  const target = CLUE_TARGETS[difficulty]

  if (difficulty !== 'extreme') {
    const solution = generateSolved(rng)
    const givens = digSimple(solution, target, rng)
    return { difficulty, givens, solution }
  }

  let bestGivens: Board | null = null
  let bestSolution: Solution | null = null
  let bestClues = 82

  for (let attempt = 0; attempt < MAX_EXTREME_ATTEMPTS; attempt++) {
    const solution = generateSolved(rng)
    const givens = digAsymmetric(solution, target, rng)
    const clues = countClues(givens)
    if (clues <= target) return { difficulty, givens, solution }
    if (clues < bestClues) {
      bestClues = clues
      bestGivens = givens
      bestSolution = solution
    }
  }

  return { difficulty, givens: bestGivens!, solution: bestSolution! }
}

export function countClues(board: Board): number {
  let n = 0
  for (let i = 0; i < 81; i++) if (board[i] !== null) n++
  return n
}

export function digitDistribution(board: Board): number[] {
  const counts = new Array<number>(9).fill(0)
  for (let i = 0; i < 81; i++) {
    const v = board[i]
    if (v !== null) counts[v - 1]++
  }
  return counts
}
