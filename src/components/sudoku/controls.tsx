import { Lightbulb, LightbulbOff, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  hintsRemaining: number
  undosRemaining: number | null
  canUndo: boolean
  canHint: boolean
  onUndo: () => void
  onHint: () => void
}

export function Controls({ hintsRemaining, undosRemaining, canUndo, canHint, onUndo, onHint }: Props) {
  return (
    <div className="flex w-full max-w-[min(92vw,32rem)] gap-3" onClick={(e) => e.stopPropagation()}>
      <ControlButton
        onClick={onUndo}
        disabled={!canUndo}
        ariaLabel={undosRemaining !== null ? `Undo, ${undosRemaining} remaining` : 'Undo'}
      >
        <RotateCcw className="h-6 w-6" strokeWidth={2.25} />
        {undosRemaining !== null && <span className="ml-2 tabular-nums">{undosRemaining}</span>}
      </ControlButton>
      <ControlButton
        onClick={onHint}
        disabled={!canHint}
        ariaLabel={canHint ? `Hint, ${hintsRemaining} remaining` : 'No hints remaining'}
      >
        {canHint ? (
          <>
            <Lightbulb className="h-6 w-6" strokeWidth={2.25} />
            <span className="ml-2 tabular-nums">{hintsRemaining}</span>
          </>
        ) : (
          <LightbulbOff className="h-6 w-6" strokeWidth={2.25} />
        )}
      </ControlButton>
    </div>
  )
}

function ControlButton({
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void
  disabled: boolean
  ariaLabel: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'flex flex-1 items-center justify-center btn-pixel border-2 border-foreground py-3 text-lg font-semibold',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-pointer hover:bg-secondary hover:text-primary hover:border-secondary-foreground',
      )}
    >
      {children}
    </button>
  )
}
