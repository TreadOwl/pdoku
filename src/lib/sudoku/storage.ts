import type { SavedMatch } from './types'

const STORAGE_KEY = 'pixeldoku:active-match'

export function loadMatch(): SavedMatch | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SavedMatch
  } catch {
    return null
  }
}

export function saveMatch(match: SavedMatch): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(match))
  } catch {
    // localStorage unavailable or full; intentional swallow
  }
}

export function clearMatch(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // intentional swallow
  }
}
