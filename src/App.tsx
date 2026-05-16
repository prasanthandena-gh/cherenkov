/* =====================================================
   APP — dashboard shell. Chrome is fixed; the center routes.
   ===================================================== */

import { useCallback, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './components/chrome/TopBar'
import LeftRail from './components/chrome/LeftRail'
import RightRail from './components/chrome/RightRail'
import Ticker from './components/chrome/Ticker'
import { DashboardContext, type DossierFocus } from './lib/dashboard-ctx'
import { useAlertLog, type AlertLevel } from './lib/uplink-clock'
import { buildPhantomReactors, buildFusionPins } from './lib/phantom-reactors'
import { NATION_LEADERBOARD } from './data/reactors'

const PIN_STORAGE_KEY = 'fc.nation-pin-overrides.v1'

function loadPinOverrides(): Record<string, number> {
  try {
    const raw = localStorage.getItem(PIN_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, number>
  } catch { return {} }
}

export default function App() {
  const [focus, setFocus]   = useState<DossierFocus>({})
  const [nodes, setNodes]   = useState<number>(0)
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })
  const [leftCollapsed, setLeftCollapsed] = useState<boolean>(false)
  const [pinOverrides, setPinOverrides] = useState<Record<string, number>>(loadPinOverrides)
  const [defcon, setDefconState]    = useState<number>(4)
  const [routeHint, setRouteHint]   = useState<string | null>(null)
  const { alerts, push }    = useAlertLog()

  const pushAlert = useCallback((line: string, level: AlertLevel = 'INFO') => push(line, level), [push])

  const setDefcon = useCallback((n: number, reason?: string) => {
    const clamped = Math.max(1, Math.min(5, Math.round(n)))
    setDefconState(prev => {
      if (prev === clamped) return prev
      if (reason) {
        const level: AlertLevel = clamped <= 1 ? 'CRIT' : clamped <= 2 ? 'WARN' : 'INFO'
        push(`▸ DEFCON ${clamped} — ${reason}`, level)
      }
      return clamped
    })
  }, [push])

  const setPins = useCallback((country: string, delta: number) => {
    const row = NATION_LEADERBOARD.find(n => n.name === country)
    const basePins = row?.pins  ?? 0
    const fleetCap = row?.fleet ?? 0
    // Override stores EXTRA pins above the baseline. Cap so total visible (base + extra) <= fleet.
    const maxOverride = Math.max(0, fleetCap - basePins)

    let cappedAt = false
    setPinOverrides(prev => {
      const current = prev[country] ?? 0
      const next = Math.min(maxOverride, Math.max(0, current + delta))
      cappedAt = delta > 0 && next === current && current === maxOverride
      const merged = { ...prev, [country]: next }
      try { localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(merged)) } catch {}
      return merged
    })

    if (cappedAt) {
      pushAlert(`▸ FLEET CAP — ${country.toUpperCase()}. ${fleetCap} IS THE REAL NUMBER.`, 'WARN')
    } else if (delta > 0) {
      pushAlert(`PINS ↑  ${country.toUpperCase()}  +${delta}`, 'OK')
    } else if (delta < 0) {
      pushAlert(`PINS ↓  ${country.toUpperCase()}  ${delta}`, 'WARN')
    }
  }, [pushAlert])

  const resetPins = useCallback((country?: string) => {
    setPinOverrides(prev => {
      const next = country ? { ...prev, [country]: 0 } : {}
      try { localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
    if (country) pushAlert(`▸ PINS RESET — ${country.toUpperCase()}.`, 'INFO')
    else         pushAlert('▸ ALL PIN OVERRIDES CLEARED. THE MAP IS FACTUAL AGAIN.', 'INFO')
  }, [pushAlert])

  const phantoms = useMemo(
    () => [...buildPhantomReactors(pinOverrides), ...buildFusionPins()],
    [pinOverrides],
  )

  const value = useMemo(() => ({
    focus, setFocus,
    nodes, setNodes,
    coords, setCoords,
    pushAlert,
    pinOverrides, setPins, resetPins,
    phantoms,
    defcon, setDefcon,
    routeHint, setRouteHint,
  }), [focus, nodes, coords, pushAlert, pinOverrides, setPins, resetPins, phantoms, defcon, setDefcon, routeHint])

  return (
    <DashboardContext.Provider value={value}>
      <div className="app-shell">
        <div className="app-topbar"><TopBar /></div>
        <div className="app-leftrail">
          <LeftRail
            alerts={alerts}
            collapsed={leftCollapsed}
            onToggle={() => setLeftCollapsed(v => !v)}
          />
        </div>
        <div className="app-center"><Outlet /></div>
        <div className="app-rightrail"><RightRail /></div>
        <div className="app-ticker"><Ticker /></div>
      </div>
    </DashboardContext.Provider>
  )
}
