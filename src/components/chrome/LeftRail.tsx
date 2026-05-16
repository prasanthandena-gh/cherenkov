/* =====================================================
   LEFT RAIL — MODULES nav + TOP ATOMIC NATIONS + LIVE ALERT LOG.
   Collapsible. NATIONS rows have +/- fleet adjusters that
   actually spawn phantom pins on the globe.
   ===================================================== */

import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NATION_LEADERBOARD, type NationRow } from '../../data/reactors'
import { type Alert } from '../../lib/uplink-clock'
import { useDashboard } from '../../lib/dashboard-ctx'
import ModuleNav from './ModuleNav'
import './chrome.css'

interface Props {
  alerts: Alert[]
  collapsed: boolean
  onToggle: () => void
}

const MODULES = [
  { path: '/',          label: 'COMMAND',  key: '1' },
  { path: '/reactors',  label: 'REACTORS', key: '2' },
  { path: '/fusion',    label: 'FUSION',   key: '3' },
  { path: '/fission',   label: 'FISSION',  key: '4' },
  { path: '/sandbox',   label: 'SANDBOX',  key: '5' },
  { path: '/grids',     label: 'GRIDS',    key: '6' },
  { path: '/carbon',    label: 'CARBON',   key: '7' },
  { path: '/roadmap',   label: 'ROADMAP',  key: '8' },
  { path: '/glossary',  label: 'GLOSSARY', key: '9' },
]

export default function LeftRail({ alerts, collapsed, onToggle }: Props) {
  const logRef = useRef<HTMLDivElement>(null)
  const { pinOverrides, setPins, resetPins } = useDashboard()
  const hasAnyOverride = useMemo(
    () => Object.values(pinOverrides).some(v => v > 0),
    [pinOverrides],
  )
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [alerts.length])

  // Apply pin overrides: visible pins = baseline + extra. Fleet stays static.
  const nations: NationRow[] = useMemo(() => {
    return NATION_LEADERBOARD.map(n => ({
      ...n,
      pins: n.pins + (pinOverrides[n.name] ?? 0),
    }))
  }, [pinOverrides])

  const maxFleet = useMemo(
    () => nations.reduce((m, n) => Math.max(m, n.fleet, n.pins), 0) || 1,
    [nations],
  )

  return (
    <aside className="leftrail">
      <section className="rail-panel">
        <header className="rail-head">
          <span className="rail-tag mono">MODULES</span>
          <div className="rail-head-tools">
            <span className="rail-id mono">00.NAV</span>
            <button
              className="leftrail-toggle"
              onClick={onToggle}
              title={collapsed ? 'Expand modules' : 'Collapse modules'}
            >{collapsed ? '▾' : '▴'}</button>
          </div>
        </header>
        {collapsed ? (
          <div className="modules-mini">
            {MODULES.map(m => (
              <NavLink
                key={m.path}
                to={m.path}
                end={m.path === '/'}
                className={({ isActive }) => `modules-mini-link ${isActive ? 'active' : ''}`}
                title={`${m.key} · ${m.label}`}
              >
                {m.key}
              </NavLink>
            ))}
          </div>
        ) : (
          <ModuleNav />
        )}
      </section>

      <section className="rail-panel">
        <header className="rail-head">
          <span className="rail-tag mono">TOP NATIONS · PINS / FLEET</span>
          <div className="rail-head-tools">
            {hasAnyOverride && (
              <button
                className="nation-reset-all mono"
                onClick={() => resetPins()}
                title="Clear all pin overrides"
              >↺ RESET ALL</button>
            )}
            <span className="rail-id mono">01.LDR</span>
          </div>
        </header>
        <div className="nations">
          {nations.slice(0, 12).map(n => {
            const fleetPct = (n.fleet / maxFleet) * 100
            const pinsPct  = (n.pins  / maxFleet) * 100
            const isOpen = selected === n.name
            const override = pinOverrides[n.name] ?? 0
            const atCap   = n.pins >= n.fleet
            return (
              <div key={n.name} className={`nation-row ${isOpen ? 'selected' : ''}`}>
                <button
                  className="nation-main"
                  onClick={() => setSelected(s => s === n.name ? null : n.name)}
                  title="Click to adjust pins — they appear on the globe"
                >
                  <span className="nation-rank mono">{String(n.rank).padStart(2, '0')}</span>
                  <span className="nation-name">{n.name}</span>
                  <span className="nation-count mono">
                    <span className={`nation-pins ${atCap ? 'at-cap' : ''}`}>{n.pins}</span>
                    <span className="nation-slash">/</span>
                    <span className="nation-fleet">{n.fleet}</span>
                  </span>
                </button>
                <div className="nation-bar-track">
                  <div className="nation-bar-fleet" style={{ width: `${fleetPct}%` }} />
                  <div className="nation-bar-pins"  style={{ width: `${pinsPct}%`  }} />
                </div>
                {isOpen && (
                  <div className="nation-edit">
                    <button className="nation-adj" onClick={() => setPins(n.name, -1)}>−1</button>
                    <button className="nation-adj" onClick={() => setPins(n.name, -5)}>−5</button>
                    <span className="nation-fleet-val mono">{n.pins}</span>
                    <button className="nation-adj" onClick={() => setPins(n.name,  5)} disabled={atCap}>+5</button>
                    <button className="nation-adj" onClick={() => setPins(n.name,  1)} disabled={atCap}>+1</button>
                    <button
                      className="nation-adj nation-adj-reset"
                      onClick={() => resetPins(n.name)}
                      disabled={override === 0}
                      title="Reset to real-world pin count"
                    >↺</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="rail-panel rail-log">
        <header className="rail-head">
          <span className="rail-tag mono">LIVE ALERT LOG</span>
          <span className="rail-id mono">02.LOG</span>
        </header>
        <div className="alert-list" ref={logRef}>
          {alerts.map(a => (
            <div key={a.id} className="alert-row">
              <span className="alert-time mono">{a.t}</span>
              <span className={`alert-badge mono badge-${a.level}`}>{a.level}</span>
              <span className="alert-msg">{a.msg}</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
