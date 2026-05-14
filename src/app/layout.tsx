import type { Metadata } from 'next'
import { VT323 } from 'next/font/google'
import { ViewTransitions } from 'next-view-transitions'
import './globals.css'
import { cn } from '@/lib/utils'
import { ScanLines } from '@/components/scan-lines'

const vt323 = VT323({ subsets: ['latin'], variable: '--font-sans', weight: '400' })

export const metadata: Metadata = {
  title: 'Pixel-doku',
  description: 'Color-based Browser Sudoku',
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={cn('h-full', vt323.className)}>
        <body className="h-full flex flex-col">
          <ScanLines />
          <div aria-hidden="true" className="vignette" />
          {children}
        </body>
      </html>
    </ViewTransitions>
  )
}
