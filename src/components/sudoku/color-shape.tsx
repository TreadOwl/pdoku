import type { Color } from '@/lib/sudoku'

export const COLOR_BG: readonly string[] = [
  '',
  'bg-sudoku-1',
  'bg-sudoku-2',
  'bg-sudoku-3',
  'bg-sudoku-4',
  'bg-sudoku-5',
  'bg-sudoku-6',
  'bg-sudoku-7',
  'bg-sudoku-8',
  'bg-sudoku-9',
]

export const SHAPE_CLASS =
  'pointer-events-none absolute top-[10%] left-[10%] h-[33%] w-[33%] text-cell-given-ring opacity-55'

const F = 'currentColor'

type Props = {
  color: Color
  className?: string
}

export function ColorShape({ color, className }: Props) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      {renderShape(color)}
    </svg>
  )
}

function renderShape(color: Color): React.ReactElement {
  switch (color) {
    case 1:
      return <circle cx={8} cy={8} r={5} fill={F} />
    case 2:
      return <rect x={3} y={3} width={10} height={10} fill={F} />
    case 3:
      return <polygon points="8,3 14,13 2,13" fill={F} />
    case 4:
      return <polygon points="8,2 14,8 8,14 2,8" fill={F} />
    case 5:
      return <polygon points="8,2 14.65,6.83 12.11,14.66 3.89,14.66 1.35,6.83" fill={F} />
    case 6:
      return <polygon points="8,1.5 9.7,6.3 14.7,6.3 10.5,9.3 12.2,14 8,11 3.8,14 5.5,9.3 1.3,6.3 6.3,6.3" fill={F} />
    case 7:
      return <polygon points="4,2 12,2 15,8 12,14 4,14 1,8" fill={F} />
    case 8:
      return <path d="M6 2 H10 V6 H14 V10 H10 V14 H6 V10 H2 V6 H6 Z" fill={F} />
    case 9:
      return <polygon points="8,13 2,3 14,3" fill={F} />
  }
}
