'use client'

import { useEffect, useReducer, useRef, useState } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import { clearMatch, recordFinish, saveMatch, STARTING_HINTS, type SavedMatch } from '@/lib/sudoku'
import { loadSettings, saveSettings, type Settings } from '@/lib/settings'
import { SettingsModal } from '@/components/settings-modal'
import { Board } from './board'
import { ColorPalette } from './color-palette'
import { Controls } from './controls'
import { WinOverlay } from './win-overlay'
import {
  computeErrorCells,
  computeExhaustedColors,
  computeFocusUnit,
  computeSameColorCells,
  formatTime,
  fromSavedMatch,
  reducer,
  toSavedMatch,
} from './state'

type Props = {
  initial: SavedMatch
  onNewGame: () => void
}

export function SudokuGame({ initial, onNewGame }: Props) {
  const [state, dispatch] = useReducer(reducer, initial, fromSavedMatch)
  const recordedRef = useRef(false)
  const [settings, setSettings] = useState<Settings>({ colorFillEnabled: false })
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setSettings(loadSettings()), 0)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (state.status === 'won') return
    const id = setInterval(() => {
      if (!document.hidden) dispatch({ type: 'TICK' })
    }, 1000)
    return () => clearInterval(id)
  }, [state.status])

  useEffect(() => {
    if (state.status === 'won') {
      clearMatch()
      return
    }
    saveMatch(toSavedMatch(state))
  }, [state])

  useEffect(() => {
    if (state.status === 'won' && !recordedRef.current) {
      recordedRef.current = true
      recordFinish({
        difficulty: state.difficulty,
        elapsedSeconds: state.elapsedSeconds,
        hintsUsed: STARTING_HINTS - state.hintsRemaining,
        completedAt: Date.now(),
      })
    }
  }, [state.status, state.difficulty, state.elapsedSeconds, state.hintsRemaining])

  const errorCells = computeErrorCells(state)
  const focusedUnit = computeFocusUnit(state.focusedCell)
  const sameColorCells = computeSameColorCells(state)
  const exhaustedColors = computeExhaustedColors(state.givens, state.userCells)

  const handleRootClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      dispatch({ type: 'CLEAR_SELECTION' })
    }
  }

  return (
    <main className="relative flex h-full flex-col items-center justify-center gap-4 p-4" onClick={handleRootClick}>
      <div
        className="flex w-full max-w-[min(92vw,32rem)] items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-2xl font-semibold capitalize text-secondary">{state.difficulty}</span>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold tabular-nums">{formatTime(state.elapsedSeconds)}</span>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-150"
            aria-label="Settings"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </div>
      <Board
        givens={state.givens}
        userCells={state.userCells}
        hintLocked={state.hintLocked}
        focusedCell={state.focusedCell}
        focusedUnit={focusedUnit}
        errorCells={errorCells}
        sameColorCells={sameColorCells}
        onCellTap={(idx) => dispatch({ type: 'CELL_TAP', idx, keepSelection: settings.colorFillEnabled })}
      />
      <ColorPalette
        selectedColor={state.selectedColor}
        exhaustedColors={exhaustedColors}
        onSelect={(c) => dispatch({ type: 'SELECT_COLOR', color: c, keepSelection: settings.colorFillEnabled })}
      />
      <Controls
        hintsRemaining={state.hintsRemaining}
        undosRemaining={state.undosRemaining}
        canUndo={state.undosRemaining !== 0}
        canHint={state.hintsRemaining > 0}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onHint={() => dispatch({ type: 'USE_HINT' })}
      />
      {state.status === 'won' && (
        <WinOverlay
          elapsedSeconds={state.elapsedSeconds}
          difficulty={state.difficulty}
          hintsUsed={STARTING_HINTS - state.hintsRemaining}
          onNewGame={onNewGame}
        />
      )}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={(s) => {
          setSettings(s)
          saveSettings(s)
        }}
      />
    </main>
  )
}
