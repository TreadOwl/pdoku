'use client'

import { cn } from '@/lib/utils'
import { type Settings } from '@/lib/settings'

type ToggleProps = {
  checked: boolean
  onChange: (next: boolean) => void
}

function RetroToggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-16 h-8 border-2 border-foreground cursor-pointer shrink-0 transition-colors duration-150',
        checked ? 'bg-secondary' : 'bg-background',
      )}
      style={{ boxShadow: '2px 2px 0 0 var(--foreground)' }}
    >
      <span
        className={cn(
          'absolute top-0.5 bottom-0.5 w-6 bg-foreground transition-all duration-150',
          checked ? 'left-[calc(100%-1.625rem)]' : 'left-0.5',
        )}
      />
      <span
        className={cn(
          'absolute inset-0 flex items-center text-xs font-bold tracking-widest transition-opacity duration-150 select-none',
          checked ? 'justify-start pl-2 text-background opacity-80' : 'justify-end pr-2 opacity-50',
        )}
      >
        {checked ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

type SettingRowProps = {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}

function SettingRow({ label, description, checked, onChange }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-semibold leading-tight">{label}</span>
        <span className="text-sm opacity-60 leading-snug max-w-52">{description}</span>
      </div>
      <RetroToggle checked={checked} onChange={onChange} />
    </div>
  )
}

type Props = {
  open: boolean
  onClose: () => void
  settings: Settings
  onSettingsChange: (s: Settings) => void
}

export function SettingsModal({ open, onClose, settings, onSettingsChange }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-6 border-2 border-foreground bg-background px-8 py-7 shadow-[6px_6px_0_0_var(--foreground)] animate-in zoom-in-95 duration-200 min-w-72"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-2xl font-bold tracking-wider uppercase">Settings</span>

        <div className="flex flex-col gap-5">
          <SettingRow
            label="Keep color selected"
            description="Keep the same color selected after placing it"
            checked={settings.colorFillEnabled}
            onChange={(v) => onSettingsChange({ ...settings, colorFillEnabled: v })}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="self-end cursor-pointer border-2 border-foreground px-5 py-1.5 text-base font-semibold btn-pixel hover:bg-secondary hover:text-primary"
        >
          Close
        </button>
      </div>
    </div>
  )
}
