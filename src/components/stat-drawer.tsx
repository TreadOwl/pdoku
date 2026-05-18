'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { loadStats, summarize, type Difficulty, type Stats } from '@/lib/sudoku'
import { formatTime } from '@/components/sudoku/state'

const EMPTY_STATS: Stats = { started: 0, matches: [] }

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard', 'extreme']

export function StatDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [finishedOpen, setFinishedOpen] = useState(false)
  const isFinishedOpen = open && finishedOpen
  const stats = open ? loadStats() : EMPTY_STATS
  const summary = summarize(stats)
  const totalTime = stats.matches.reduce((acc, m) => acc + m.elapsedSeconds, 0)
  const hasData = summary.finished > 0 || summary.started > 0

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Player</DrawerTitle>
          <DrawerDescription>Gameplay Stats</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 px-4">
          <Row label="Games played" value={summary.started} />
          <button
            type="button"
            onClick={() => setFinishedOpen((v) => !v)}
            className="flex justify-between gap-4 w-full cursor-pointer"
          >
            <span className="opacity-75 tracking-wide">Games finished</span>
            <span className="flex items-center gap-1 font-semibold tabular-nums">
              {summary.finished}
              <ChevronDown
                size={14}
                className="transition-transform duration-300"
                style={{ transform: isFinishedOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </span>
          </button>
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: isFinishedOpen ? '200px' : '0px' }}
          >
            <div className="p-3 border shadow-md">
              {DIFFICULTIES.map((d) => (
                <Row key={d} label={d} value={summary.finishedByDifficulty[d]} capitalize />
              ))}
            </div>
          </div>
          <Row
            label="Best time"
            value={
              summary.bestOverall ? `${formatTime(summary.bestOverall.time)} (${summary.bestOverall.difficulty})` : '—'
            }
          />
          <Row
            label="Favorite difficulty"
            value={summary.favoriteDifficulty ?? '—'}
            capitalize={summary.favoriteDifficulty !== null}
          />
          <div className="w-full border-2 rounded-full my-2" />
          <div className="p-3 border shadow-md">
            {DIFFICULTIES.map((d) => {
              const t = summary.bestTimeByDifficulty[d]
              return <Row key={d} label={d} value={t === null ? '—' : formatTime(t)} capitalize />
            })}
          </div>
        </div>
        <DrawerFooter className="text-secondary">
          <div className="flex justify-center text-3xl tabular-nums">{hasData ? formatTime(totalTime) : '—'}</div>
          <div className="text-center text-sm uppercase tracking-wider opacity-66">
            Total time across finished games
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function Row({ label, value, capitalize }: { label: string; value: string | number; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="opacity-75 tracking-wide">{label}</span>
      <span className={`font-semibold tabular-nums ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  )
}
