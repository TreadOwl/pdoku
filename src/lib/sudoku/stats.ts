import type { Difficulty } from './types'

export type CompletedMatch = {
  difficulty: Difficulty
  elapsedSeconds: number
  hintsUsed: number
  completedAt: number
}

export type Stats = {
  started: number
  matches: CompletedMatch[]
}

const STATS_KEY = 'pixeldoku:stats'

function emptyStats(): Stats {
  return { started: 0, matches: [] }
}

export function loadStats(): Stats {
  if (typeof window === 'undefined') return emptyStats()
  try {
    const raw = window.localStorage.getItem(STATS_KEY)
    if (!raw) return emptyStats()
    const parsed = JSON.parse(raw) as Partial<Stats> | null
    if (!parsed || typeof parsed !== 'object') return emptyStats()
    const started = typeof parsed.started === 'number' ? parsed.started : 0
    const matches = Array.isArray(parsed.matches) ? parsed.matches : []
    return { started, matches }
  } catch {
    return emptyStats()
  }
}

function writeStats(stats: Stats): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

export function recordStart(): void {
  const stats = loadStats()
  stats.started++
  writeStats(stats)
}

export function recordFinish(match: CompletedMatch): void {
  const stats = loadStats()
  stats.matches.push(match)
  writeStats(stats)
}

export function clearStats(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STATS_KEY)
  } catch {
    // ignore
  }
}

const DIFFICULTY_ORDER: readonly Difficulty[] = ['easy', 'medium', 'hard', 'extreme']

export type StatsSummary = {
  started: number
  finished: number
  bestTimeByDifficulty: Record<Difficulty, number | null>
  bestOverall: { difficulty: Difficulty; time: number } | null
  favoriteDifficulty: Difficulty | null
}

export function summarize(stats: Stats): StatsSummary {
  const bestTimeByDifficulty: Record<Difficulty, number | null> = {
    easy: null,
    medium: null,
    hard: null,
    extreme: null,
  }
  const countByDifficulty: Record<Difficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    extreme: 0,
  }

  for (const m of stats.matches) {
    countByDifficulty[m.difficulty]++
    const cur = bestTimeByDifficulty[m.difficulty]
    if (cur === null || m.elapsedSeconds < cur) {
      bestTimeByDifficulty[m.difficulty] = m.elapsedSeconds
    }
  }

  let bestOverall: { difficulty: Difficulty; time: number } | null = null
  for (const d of DIFFICULTY_ORDER) {
    const t = bestTimeByDifficulty[d]
    if (t === null) continue
    if (bestOverall === null || t < bestOverall.time) bestOverall = { difficulty: d, time: t }
  }

  let favoriteDifficulty: Difficulty | null = null
  let maxCount = 0
  for (const d of DIFFICULTY_ORDER) {
    if (countByDifficulty[d] > maxCount) {
      maxCount = countByDifficulty[d]
      favoriteDifficulty = d
    }
  }

  return {
    started: stats.started,
    finished: stats.matches.length,
    bestTimeByDifficulty,
    bestOverall,
    favoriteDifficulty,
  }
}
