'use client'

import { useEffect, useState } from 'react'
import { useTransitionRouter } from 'next-view-transitions'
import { clearMatch, loadMatch, type SavedMatch } from '@/lib/sudoku'
import { formatTime } from '@/components/sudoku/state'

const difficulties = [
  { name: 'Easy', value: 'easy' },
  { name: 'Medium', value: 'medium' },
  { name: 'Hard', value: 'hard' },
  { name: 'Extreme', value: 'extreme' },
]

export default function PlayPage() {
  const router = useTransitionRouter()
  const [saved, setSaved] = useState<SavedMatch | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      setSaved(loadMatch())
      setHydrated(true)
    }, 0)
    return () => clearTimeout(id)
  }, [])

  const showResume = hydrated && saved !== null

  return (
    <main className="flex flex-col h-full justify-center items-center py-6">
      {showResume && (
        <>
          <button
            className="mb-8 flex flex-col items-center gap-1 py-3 px-8 font-semibold cursor-pointer
            border-3 btn-pixel hover:bg-secondary hover:border-primary hover:text-primary"
            onClick={() => router.push(`/play/sudoku?difficulty=${saved!.difficulty}`)}
          >
            <span className="text-2xl">
              Resume <span className="capitalize">&ldquo;{saved!.difficulty}&rdquo;</span>
            </span>
            <span className="text-sm tabular-nums opacity-70">{formatTime(saved!.elapsedSeconds)}</span>
          </button>
          <span className="text-xl mb-8 tracking-wider">Or Start New</span>
        </>
      )}
      {!showResume && <span className="text-2xl mb-12 font-semibold animate-bounce">Select a Difficulty</span>}
      <div className="flex flex-col gap-12">
        {difficulties.map(({ name, value }) => {
          return (
            <button
              key={value}
              className={`text-2xl py-2 px-4 font-semibold cursor-pointer border-3 btn-pixel
            hover:bg-secondary hover:border-primary hover:text-primary`}
              onClick={() => {
                clearMatch()
                router.push(`/play/sudoku?difficulty=${value}`)
              }}
            >
              {name}
            </button>
          )
        })}
      </div>
    </main>
  )
}
