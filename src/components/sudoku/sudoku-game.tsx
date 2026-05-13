'use client'

import { useEffect, useReducer, useRef } from 'react'
import { clearMatch, recordFinish, saveMatch, STARTING_HINTS, type SavedMatch } from '@/lib/sudoku'
import { Board } from './board'
import { ColorPalette } from './color-palette'
import { Controls } from './controls'
import { WinOverlay } from './win-overlay'
import {
  computeErrorCells,
  computeExhaustedColors,
  computeFocusUnit,
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
        <span className="text-2xl font-semibold tabular-nums">{formatTime(state.elapsedSeconds)}</span>
      </div>
      <Board
        givens={state.givens}
        userCells={state.userCells}
        hintLocked={state.hintLocked}
        focusedCell={state.focusedCell}
        focusedUnit={focusedUnit}
        errorCells={errorCells}
        onCellTap={(idx) => dispatch({ type: 'CELL_TAP', idx })}
      />
      <ColorPalette
        selectedColor={state.selectedColor}
        exhaustedColors={exhaustedColors}
        onSelect={(c) => dispatch({ type: 'SELECT_COLOR', color: c })}
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
    </main>
  )
}
