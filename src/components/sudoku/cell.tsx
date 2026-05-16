import { memo } from 'react'
import type { Cell as CellType } from '@/lib/sudoku'
import { cn } from '@/lib/utils'
import { COLOR_BG, ColorShape, SHAPE_CLASS } from './color-shape'

type Props = {
  idx: number
  color: CellType
  isHintLocked: boolean
  isFocused: boolean
  inFocusedUnit: boolean
  isError: boolean
  isSameColor: boolean
  onTap: (idx: number) => void
}

export const Cell = memo(function Cell({
  idx,
  color,
  isHintLocked,
  isFocused,
  inFocusedUnit,
  isError,
  isSameColor,
  onTap,
}: Props) {
  const col = idx % 9
  const row = Math.floor(idx / 9)
  const rightStrong = col === 2 || col === 5
  const bottomStrong = row === 2 || row === 5

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onTap(idx)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative aspect-square cursor-pointer border-r border-b border-board-line bg-cell-empty transition-transform duration-100 active:scale-95',
        col === 0 && 'border-l',
        row === 0 && 'border-t',
        rightStrong && 'border-r-4 border-r-board-line-strong',
        bottomStrong && 'border-b-4 border-b-board-line-strong',
        color !== null && COLOR_BG[color],
      )}
      aria-label={`Cell at row ${row + 1}, column ${col + 1}`}
    >
      {inFocusedUnit && !isFocused && color === null && (
        <span className="pointer-events-none absolute inset-0 bg-cell-focus-tint" />
      )}
      {color !== null && <ColorShape color={color} className={SHAPE_CLASS} />}
      {isHintLocked && (
        <span className="pointer-events-none absolute top-[10%] right-[10%] h-[14%] w-[14%] rounded-full bg-cell-hint-dot" />
      )}
      {isFocused && (
        <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_3px_var(--cell-focus-ring)]" />
      )}
      {isSameColor && !isError && (
        <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_3px_var(--foreground)]" />
      )}
      {isError && <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_3px_var(--cell-error)]" />}
    </button>
  )
})
