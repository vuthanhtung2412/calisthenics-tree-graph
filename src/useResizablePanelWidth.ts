import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

const PANEL_W_KEY = 'cale-skills-detail-panel-width'
const PANEL_W_DEFAULT_PCT = 35
const PANEL_W_MIN_PCT = 20
const PANEL_W_MAX_PCT = 50

function vwBounds(): { min: number; max: number } {
  const vw = window.innerWidth
  return {
    min: Math.round((vw * PANEL_W_MIN_PCT) / 100),
    max: Math.round((vw * PANEL_W_MAX_PCT) / 100),
  }
}

function clampPanelW(px: number): number {
  const { min, max } = vwBounds()
  return Math.min(max, Math.max(min, Math.round(px)))
}

function readPanelWidth(): number {
  const fallback = () =>
    clampPanelW((window.innerWidth * PANEL_W_DEFAULT_PCT) / 100)
  try {
    const n = Number.parseInt(localStorage.getItem(PANEL_W_KEY) ?? '', 10)
    if (Number.isNaN(n)) return fallback()
    return clampPanelW(n)
  } catch {
    return fallback()
  }
}

export function useResizablePanelWidth() {
  const [w, setW] = useState(readPanelWidth)
  const [dragging, setDragging] = useState(false)
  const drag0 = useRef({ x: 0, w: 0 })

  useEffect(() => {
    try {
      localStorage.setItem(PANEL_W_KEY, String(w))
    } catch {
      /* ignore */
    }
  }, [w])

  useEffect(() => {
    if (!dragging) return
    function move(e: globalThis.PointerEvent) {
      const next = drag0.current.w - (e.clientX - drag0.current.x)
      setW(clampPanelW(next))
    }
    function up() {
      setDragging(false)
    }
    const prevC = document.body.style.cursor
    const prevU = document.body.style.userSelect
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
    document.addEventListener('pointercancel', up)
    return () => {
      document.body.style.cursor = prevC
      document.body.style.userSelect = prevU
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      document.removeEventListener('pointercancel', up)
    }
  }, [dragging])

  useEffect(() => {
    function onResize() {
      setW((prev) => clampPanelW(prev))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onResizeDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      drag0.current = { x: e.clientX, w }
      setDragging(true)
    },
    [w]
  )

  return { w, onResizeDown }
}
