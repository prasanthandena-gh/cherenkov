/* =====================================================
   UPLINK CLOCK + ALERT LOG hooks.
   ===================================================== */

import { useEffect, useState, useCallback } from 'react'

export function useUplinkTime(): string {
  const [t, setT] = useState<string>(formatNow())
  useEffect(() => {
    const id = window.setInterval(() => setT(formatNow()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return t
}

function pad(n: number): string { return String(n).padStart(2, '0') }
function formatNow(): string {
  const d = new Date()
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`
}

export type AlertLevel = 'OK' | 'INFO' | 'WARN' | 'CRIT'
export interface Alert {
  id: number
  t: string         // HH:MM:SS
  level: AlertLevel
  msg: string
}

const SEED: Omit<Alert, 'id' | 't'>[] = [
  { level: 'OK',   msg: 'CHANNEL OPEN' },
  { level: 'INFO', msg: 'UPLINK ESTABLISHED // 416 NODES TRACKED' },
  { level: 'OK',   msg: 'VOGTLE-4 — COMMERCIAL OPERATION' },
  { level: 'OK',   msg: 'OLKILUOTO-3 — STABLE AT FULL OUTPUT' },
  { level: 'INFO', msg: 'BARAKAH-4 — SYNCED TO UAE GRID' },
  { level: 'OK',   msg: 'TIANWAN-7 — APPROACHING 100% CRITICAL' },
  { level: 'INFO', msg: 'KORI-2 — REFUELING WINDOW CLOSED' },
  { level: 'WARN', msg: 'ZAPORIZHZHIA — STATUS COLD SHUTDOWN' },
  { level: 'OK',   msg: 'BRUCE-8 — ON-LINE REFUELING NOMINAL' },
  { level: 'INFO', msg: 'SHIDAO BAY — HTR-PM HELIUM TEMP 750°C' },
  { level: 'OK',   msg: 'PALO VERDE — RECLAIM-WATER LOOP CLEAR' },
  { level: 'INFO', msg: 'AKKUYU-3 — FUEL LOAD AUTHORIZED' },
  { level: 'OK',   msg: 'KASHIWAZAKI-7 — RESTART CANDIDATE' },
  { level: 'WARN', msg: 'INDIAN POINT — DECOMMISSIONING WAVE 4' },
  { level: 'INFO', msg: 'HINKLEY POINT C — DOME INSTALL T-MINUS 14M' },
]

const TICKING: Omit<Alert, 'id' | 't'>[] = [
  { level: 'OK',   msg: 'AUTO-ROTATE RESUMED' },
  { level: 'INFO', msg: 'VIEW RESET — RETURNING TO HOME' },
  { level: 'OK',   msg: 'GRID OVERLAY ENGAGED' },
  { level: 'OK',   msg: 'GRID OVERLAY DISENGAGED' },
  { level: 'INFO', msg: 'FILTER SET — ACTIVE NODES' },
  { level: 'INFO', msg: 'FILTER SET — ALL NODES' },
  { level: 'OK',   msg: 'YEAR SCRUB → 2025' },
  { level: 'OK',   msg: 'NEW BUILD PINNED TO ROSTER' },
  { level: 'INFO', msg: 'GLOSSARY QUERY — k-effective' },
  { level: 'OK',   msg: 'TOKAMAK INJECTION NOMINAL' },
]

let nextId = 1

function nowHMS(): string {
  const d = new Date()
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

export function useAlertLog(): {
  alerts: Alert[]
  push: (msg: string, level?: AlertLevel) => void
} {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    return SEED.slice(0, 8).map(s => ({ ...s, id: nextId++, t: nowHMS() }))
  })

  const push = useCallback((msg: string, level: AlertLevel = 'INFO') => {
    setAlerts(prev => [{ id: nextId++, t: nowHMS(), level, msg }, ...prev].slice(0, 60))
  }, [])

  // Random ambient alerts every ~10-16s, pure cosmetic.
  useEffect(() => {
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const seed = [...SEED, ...TICKING]
      const pick = seed[Math.floor(Math.random() * seed.length)]
      push(pick.msg, pick.level)
      window.setTimeout(tick, 10_000 + Math.random() * 6_000)
    }
    const handle = window.setTimeout(tick, 6_000)
    return () => { cancelled = true; window.clearTimeout(handle) }
  }, [push])

  return { alerts, push }
}
