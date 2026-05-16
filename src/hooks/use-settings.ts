'use client'

import { useEffect, useState } from 'react'
import { loadSettings, saveSettings, type Settings } from '@/lib/settings'

const DEFAULTS: Settings = { colorFillEnabled: false }

export function useSettings(): [Settings, (s: Settings) => void] {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  useEffect(() => {
    const id = setTimeout(() => setSettings(loadSettings()), 0)
    return () => clearTimeout(id)
  }, [])

  const update = (s: Settings) => {
    setSettings(s)
    saveSettings(s)
  }

  return [settings, update]
}
