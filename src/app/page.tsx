'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTransitionRouter } from 'next-view-transitions'
import { GithubLogoIcon } from '@phosphor-icons/react'
import { StatDrawer } from '@/components/stat-drawer'
import { SettingsModal } from '@/components/settings-modal'
import { useSettings } from '@/hooks/use-settings'

export default function Home() {
  const router = useTransitionRouter()
  const [settings, updateSettings] = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <main className="h-full flex flex-col gap-12 items-center justify-center">
      <h1
        className="w-fit mx-auto my-12 text-7xl sm:text-[7rem] font-bold
        animate-[bounce_1.5s_infinite,textPulse_6s_infinite] transition-colors"
      >
        Pixel-doku
      </h1>
      <div className="max-w-75 w-full flex flex-col gap-12 items-center mb-12">
        <button
          className="text-3xl w-full py-6 mx-6 font-semibold cursor-pointer border-3 btn-pixel
          hover:bg-secondary hover:text-primary hover:border-secondary-foreground"
          onClick={() => router.push('/play')}
        >
          Play!
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatDrawer>
            <div
              className="text-xl py-3 px-6 font-semibold cursor-pointer border-3 btn-pixel
              hover:bg-secondary hover:text-primary hover:border-secondary-foreground"
            >
              Stats
            </div>
          </StatDrawer>
          <button
            className="text-xl py-3 px-6 font-semibold cursor-pointer border-3 btn-pixel
            hover:bg-secondary hover:text-primary hover:border-secondary-foreground"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
        </div>
      </div>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={updateSettings}
      />
      <h4 className="absolute bottom-12 text-sm text-secondary inline-flex gap-2 items-center">
        @ 2026, by{' '}
        <Link
          href="https://github.com/TreadOwl"
          target="_blank"
          className="underline underline-offset-2 inline-flex items-center italic"
        >
          <GithubLogoIcon size={18} className="" />
          TreadOwl
        </Link>
      </h4>
    </main>
  )
}
