'use client'

import Link from 'next/link'
import { StatDrawer } from './stat-drawer'
import { UserCircleIcon } from '@phosphor-icons/react'

export function Header() {
  return (
    <header
      className="absolute top-0 w-[80%] max-w-2xl mx-auto px-6 py-3 rounded-b-xl
      flex items-center justify-between bg-foreground text-background font-bold shadow-xl"
    >
      <StatDrawer>
        <UserCircleIcon
          size={32}
          className="hover:scale-110 hover:opacity-75 transition-all duration-200 cursor-pointer"
        />
      </StatDrawer>
      <Link
        href="/"
        className="text-2xl transition-opacity duration-150 ease-in-out
        hover:underline hover:cursor-pointer hover:opacity-75"
      >
        Pixel-doku
      </Link>
    </header>
  )
}
