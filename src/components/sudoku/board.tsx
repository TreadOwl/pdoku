import type { Board as BoardType } from '@/lib/sudoku'
import { Cell } from './cell'

type Props = {
  givens: BoardType
  userCells: BoardType
  hintLocked: boolean[]
  focusedCell: number | null
  focusedUnit: Set<number>
  errorCells: Set<number>
  sameColorCells: Set<number>
  onCellTap: (idx: number) => void
}

export function Board({ givens, userCells, hintLocked, focusedCell, focusedUnit, errorCells, sameColorCells, onCellTap }: Props) {
  return (
    <div
      className="grid grid-cols-9 w-full max-w-[min(92vw,32rem)] border-2 border-board-line-strong"
      onClick={(e) => e.stopPropagation()}
    >
      {Array.from({ length: 81 }, (_, i) => {
        const color = givens[i] ?? userCells[i]
        return (
          <Cell
            key={i}
            idx={i}
            color={color}
            isHintLocked={hintLocked[i]}
            isFocused={focusedCell === i}
            inFocusedUnit={focusedUnit.has(i)}
            isError={errorCells.has(i)}
            isSameColor={sameColorCells.has(i)}
            onTap={onCellTap}
          />
        )
      })}
    </div>
  )
}
