import { CLUE_TARGETS, countClues, countSolutions, digitDistribution, generate, solve } from '../src/lib/sudoku'
import type { Difficulty } from '../src/lib/sudoku'

const PER_DIFFICULTY: Record<Difficulty, number> = {
  easy: 50,
  medium: 50,
  hard: 50,
  extreme: 100,
}

const ASYMMETRY_THRESHOLD = 3
const ASYMMETRY_PCT_TARGET = 0.8

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']

let failures = 0

for (const diff of difficulties) {
  const n = PER_DIFFICULTY[diff]
  const target = CLUE_TARGETS[diff]
  console.log(`\n=== ${diff} (N=${n}, target=${target}) ===`)

  let totalMs = 0
  let asymmetryWins = 0
  let extremeAtTarget = 0
  const clueCounts: number[] = []

  for (let i = 0; i < n; i++) {
    const t0 = performance.now()
    const puzzle = generate(diff)
    const t1 = performance.now()
    totalMs += t1 - t0

    const clues = countClues(puzzle.givens)
    clueCounts.push(clues)
    const sols = countSolutions(puzzle.givens, 2)

    if (sols !== 1) {
      console.log(`  FAIL board ${i}: ${sols} solutions (expected 1)`)
      failures++
    }

    const solverSol = solve(puzzle.givens)
    if (!solverSol) {
      console.log(`  FAIL board ${i}: solver returned null`)
      failures++
    } else {
      for (let j = 0; j < 81; j++) {
        if (solverSol[j] !== puzzle.solution[j]) {
          console.log(`  FAIL board ${i}: solver disagrees with packaged solution at cell ${j}`)
          failures++
          break
        }
      }
    }

    if (diff === 'extreme') {
      if (clues <= target) {
        extremeAtTarget++
      } else {
        console.log(`  FAIL board ${i}: ${clues} clues (expected <=${target})`)
        failures++
      }
      const dist = digitDistribution(puzzle.givens)
      const spread = Math.max(...dist) - Math.min(...dist)
      if (spread >= ASYMMETRY_THRESHOLD) asymmetryWins++
    } else {
      if (clues !== target) {
        console.log(`  FAIL board ${i}: ${clues} clues (expected ${target})`)
        failures++
      }
    }
  }

  const avgMs = totalMs / n
  const minClues = Math.min(...clueCounts)
  const maxClues = Math.max(...clueCounts)
  console.log(`  avg gen time: ${avgMs.toFixed(1)}ms  (clues range ${minClues}..${maxClues})`)
  if (diff === 'extreme') {
    const reachedPct = (extremeAtTarget / n) * 100
    const asymPct = (asymmetryWins / n) * 100
    console.log(`  reached target (<=${target}): ${extremeAtTarget}/${n} (${reachedPct.toFixed(0)}%)`)
    console.log(`  asymmetry (spread >=${ASYMMETRY_THRESHOLD}): ${asymmetryWins}/${n} (${asymPct.toFixed(0)}%)`)
    if (asymPct / 100 < ASYMMETRY_PCT_TARGET) {
      console.log(`  WARN asymmetry below ${ASYMMETRY_PCT_TARGET * 100}% target`)
    }
  }
}

console.log(`\n${failures === 0 ? 'PASS: all checks passed' : `FAIL: ${failures} failures`}`)
process.exit(failures === 0 ? 0 : 1)
