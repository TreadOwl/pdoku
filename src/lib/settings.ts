const KEY = 'pixeldoku:settings'

export type Settings = {
  colorFillEnabled: boolean
}

const DEFAULTS: Settings = { colorFillEnabled: false }

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(s))
}
