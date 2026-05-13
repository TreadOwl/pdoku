import { formatTime } from './state'

type Props = {
  elapsedSeconds: number
  difficulty: string
  hintsUsed: number
  onNewGame: () => void
}

export function WinOverlay({ elapsedSeconds, difficulty, hintsUsed, onNewGame }: Props) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 animate-in fade-in duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center gap-6 border-2 border-foreground bg-background px-10 py-8 shadow-[6px_6px_0_0_var(--foreground)] animate-in zoom-in-95 duration-300">
        <span className="text-4xl font-bold animate-bounce">Solved!</span>
        <dl className="flex flex-col items-center gap-2 text-secondary">
          <div className="flex gap-2 text-sm uppercase tracking-wider">
            <dt className="opacity-70">Difficulty</dt>
            <dd className="font-semibold capitalize">{difficulty}</dd>
          </div>
          <div className="flex gap-2 text-sm uppercase tracking-wider">
            <dt className="opacity-70">Time</dt>
            <dd className="font-semibold tabular-nums">{formatTime(elapsedSeconds)}</dd>
          </div>
          <div className="flex gap-2 text-sm uppercase tracking-wider">
            <dt className="opacity-70">Hints used</dt>
            <dd className="font-semibold tabular-nums">{hintsUsed}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onNewGame()
          }}
          className="cursor-pointer border-2 border-foreground px-6 py-2 text-lg font-semibold btn-pixel hover:bg-secondary hover:text-primary"
        >
          New Game
        </button>
      </div>
    </div>
  )
}
