import type { Difficulty } from '@/lib/sudoku'

export function SudokuLoading({ difficulty }: { difficulty: Difficulty }) {
  return (
    <main className="flex flex-col h-full items-center justify-center gap-6 p-4">
      <span className="text-lg capitalize text-secondary">{difficulty}</span>
      <span className="text-3xl font-semibold animate-bounce">Generating...</span>
    </main>
  )
}
