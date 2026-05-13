import type { Color } from '@/lib/sudoku'
import { cn } from '@/lib/utils'
import { COLOR_BG, ColorShape, SHAPE_CLASS } from './color-shape'

const COLORS: readonly Color[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

type Props = {
  selectedColor: Color | null
  exhaustedColors: Set<Color>
  onSelect: (color: Color) => void
}

export function ColorPalette({ selectedColor, exhaustedColors, onSelect }: Props) {
  return (
    <div className="grid w-full max-w-[min(92vw,32rem)] grid-cols-9 gap-1.5" onClick={(e) => e.stopPropagation()}>
      {COLORS.map((c) => {
        const selected = selectedColor === c
        const exhausted = exhaustedColors.has(c)
        return (
          <button
            key={c}
            type="button"
            disabled={exhausted}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(c)
            }}
            className={cn(
              'relative aspect-square rounded-md transition-transform duration-150 ease-out',
              COLOR_BG[c],
              exhausted
                ? 'cursor-not-allowed opacity-30'
                : selected
                  ? 'scale-110 cursor-pointer shadow-[inset_0_0_0_3px_var(--foreground)] active:scale-95'
                  : 'cursor-pointer hover:scale-105 active:scale-95',
            )}
            aria-label={`Color ${c}${selected ? ', selected' : ''}${exhausted ? ', completed' : ''}`}
            aria-pressed={selected}
          >
            <ColorShape color={c} className={SHAPE_CLASS} />
          </button>
        )
      })}
    </div>
  )
}
