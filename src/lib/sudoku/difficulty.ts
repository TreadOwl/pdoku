import type { Difficulty } from './types'

export const CLUE_TARGETS: Record<Difficulty, number> = {
  easy: 41,
  medium: 35,
  hard: 29,
  extreme: 23,
}

export const STARTING_HINTS = 3

export const UNDO_LIMITS: Record<Difficulty, number | null> = {
  easy: null,
  medium: 15,
  hard: 10,
  extreme: 5,
}
