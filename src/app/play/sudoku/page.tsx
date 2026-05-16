'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  clearMatch,
  generate,
  loadMatch,
  recordStart,
  STARTING_HINTS,
  UNDO_LIMITS,
  type Difficulty,
  type Puzzle,
  type SavedMatch,
} from '@/lib/sudoku'
import { SudokuGame } from '@/components/sudoku/sudoku-game'
import { SudokuLoading } from '@/components/sudoku/loading'

const VALID: readonly Difficulty[] = ['easy', 'medium', 'hard', 'extreme']

function parseDifficulty(s: string | null): Difficulty {
  return (VALID as readonly string[]).includes(s ?? '') ? (s as Difficulty) : 'easy'
}

function buildSavedMatch(puzzle: Puzzle): SavedMatch {
  return {
    difficulty: puzzle.difficulty,
    givens: puzzle.givens,
    solution: puzzle.solution,
    userCells: new Array(81).fill(null),
    hintLocked: new Array(81).fill(false),
    undoStack: [],
    hintsRemaining: STARTING_HINTS,
    undosRemaining: UNDO_LIMITS[puzzle.difficulty],
    elapsedSeconds: 0,
    startedAt: Date.now(),
  }
}

function SudokuRoute() {
  const params = useSearchParams()
  const difficulty = parseDifficulty(params.get('difficulty'))
  const isNewGame = params.get('new') === '1'
  const [initial, setInitial] = useState<SavedMatch | null>(null)
  const [regenToken, setRegenToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    const id = setTimeout(() => {
      if (cancelled) return
      const saved = regenToken === 0 && !isNewGame ? loadMatch() : null
      if (saved && saved.difficulty === difficulty) {
        setInitial(saved)
      } else {
        const puzzle = generate(difficulty)
        recordStart()
        setInitial(buildSavedMatch(puzzle))
      }
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [difficulty, regenToken, isNewGame])

  const handleNewGame = useCallback(() => {
    clearMatch()
    setInitial(null)
    setRegenToken((t) => t + 1)
  }, [])

  const stale = initial !== null && initial.difficulty !== difficulty
  if (initial === null || stale) return <SudokuLoading difficulty={difficulty} />
  return <SudokuGame initial={initial} onNewGame={handleNewGame} key={initial.startedAt} />
}

export default function SudokuPage() {
  return (
    <Suspense fallback={<SudokuLoading difficulty="easy" />}>
      <SudokuRoute />
    </Suspense>
  )
}
