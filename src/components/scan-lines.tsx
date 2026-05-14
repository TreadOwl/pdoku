'use client'

import { useEffect, useRef } from 'react'

export function ScanLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const periodCss = 4 // 2px transparent + 2px dark
    const speedCss = 12  // CSS px per second

    let offset = 0
    let rafId: number
    let lastTime: number | null = null

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    const draw = (time: number) => {
      if (lastTime !== null && !document.hidden) {
        offset = (offset + (speedCss * (time - lastTime)) / 1000) % periodCss
      }
      lastTime = document.hidden ? null : time

      if (!document.hidden) {
        const w = canvas.width
        const h = canvas.height
        const periodPx = Math.round(periodCss * dpr)
        const stripePx = Math.round(2 * dpr)
        const off = Math.round(offset * dpr)
        const darkStart = (stripePx + off) % periodPx

        ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = 'rgba(0,0,0,0.08)'
        for (let y = darkStart - periodPx; y < h; y += periodPx) {
          ctx.fillRect(0, y, w, stripePx)
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}
