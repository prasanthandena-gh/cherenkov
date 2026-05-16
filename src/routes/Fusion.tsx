/* =====================================================
   /fusion — Tokamak (KEPT verbatim) + NIF interaction + Projects tab.
   ===================================================== */

import { useCallback, useEffect, useMemo, useState } from 'react'
import Tokamak from '../components/sections/Tokamak'
import { useDashboard } from '../lib/dashboard-ctx'
import { getBriefing } from '../lib/briefings'
import { FUSION_PROJECTS, type FusionGeometry, type FusionCategory } from '../data/fusion-projects'
import {
  RouteStage, RouteHeader, FrameCorners, ControlPanel,
  Chip, ChipGroup, RangeSlider, NoteCard,
} from '../components/cmd'
import './Fusion.css'

type Tab = 'tokamak' | 'inertial' | 'projects'
const TAB_LABEL: Record<Tab, string> = { tokamak: 'TOKAMAK', inertial: 'INERTIAL', projects: 'PROJECTS' }

const GEOMETRIES: { id: FusionGeometry | 'all'; label: string; tone?: 'plasma' | 'signal' | 'ok' | 'warn' | 'violet' }[] = [
  { id: 'all',         label: 'ALL' },
  { id: 'tokamak',     label: 'TOKAMAK',     tone: 'signal' },
  { id: 'stellarator', label: 'STELLARATOR', tone: 'violet' },
  { id: 'icf',         label: 'ICF',         tone: 'plasma' },
  { id: 'frc',         label: 'FRC',         tone: 'ok' },
  { id: 'st',          label: 'ST',          tone: 'signal' },
  { id: 'mif',         label: 'MIF',         tone: 'warn' },
]

const CATEGORIES: { id: FusionCategory | 'all'; label: string }[] = [
  { id: 'all',     label: 'ALL' },
  { id: 'public',  label: 'PUBLIC' },
  { id: 'private', label: 'PRIVATE' },
  { id: 'ignited', label: 'IGNITED' },
]

export default function Fusion() {
  const { setFocus, setNodes, setCoords, pushAlert, setRouteHint } = useDashboard()
  const brief = getBriefing('fusion')

  const [tab, setTab]         = useState<Tab>('tokamak')
  const [temp, setTemp]       = useState(0.55)
  const [dens, setDens]       = useState(0.6)
  const [laser, setLaser]     = useState(0.4)
  const [firing, setFiring]   = useState(false)
  const [ignited, setIgnited] = useState(false)
  const [geo, setGeo]         = useState<FusionGeometry | 'all'>('all')
  const [cat, setCat]         = useState<FusionCategory | 'all'>('all')

  const tempC = Math.round(temp * 200)
  const densX = (dens * 100).toFixed(0)
  const qFactor = Math.pow(temp * dens, 2) * 25
  const tokIgnited = temp > 0.8 && qFactor > 5
  const tokBurning = temp > 0.55

  const projects = useMemo(
    () => FUSION_PROJECTS.filter(p => (geo === 'all' || p.geometry === geo) && (cat === 'all' || p.category === cat)),
    [geo, cat]
  )

  useEffect(() => {
    setRouteHint(
      tab === 'projects'
        ? `PROJECTS · ${projects.length}/${FUSION_PROJECTS.length}`
        : `${TAB_LABEL[tab]} · Q≈${qFactor.toFixed(1)} · ${tokIgnited ? 'IGNITED' : tokBurning ? 'BURNING' : 'SUB-IGN'}`
    )
  }, [tab, projects.length, qFactor, tokIgnited, tokBurning, setRouteHint])
  useEffect(() => () => setRouteHint(null), [setRouteHint])

  useEffect(() => {
    setNodes(tab === 'projects' ? projects.length : 2)
    setCoords({ lat: null, lng: null })
    setFocus({
      override: {
        tag: 'PLASMA STATE',
        title: tab === 'projects' ? 'Fusion Frontier' : 'Fusion Confinement',
        rows: tab === 'projects'
          ? [
              { k: 'PROJECTS', v: `${projects.length} / ${FUSION_PROJECTS.length}` },
              { k: 'GEOMETRY', v: geo === 'all' ? 'ALL' : geo.toUpperCase() },
              { k: 'CATEGORY', v: cat === 'all' ? 'ALL' : cat.toUpperCase() },
            ]
          : [
              { k: 'TEMP',    v: `${tempC}M °C` },
              { k: 'DENSITY', v: `${densX}%` },
              { k: 'LASER',   v: `${Math.round(laser * 192)} / 192 banks` },
              { k: 'STATE',   v: ignited ? 'IGNITED' : firing ? 'FIRING' : tokIgnited ? 'BURNING' : 'STANDBY' },
            ],
        note: 'Switch tabs above. TOKAMAK: temp + density. INERTIAL: laser power; fire above 70% to ignite. PROJECTS: who is building what.',
      },
    })
  }, [tab, temp, dens, laser, firing, ignited, projects.length, geo, cat, tempC, densX, tokIgnited, setFocus, setNodes, setCoords])

  const pickTab = useCallback((next: Tab) => {
    setTab(next)
    const v = brief.voice?.tab
    if (typeof v === 'function') pushAlert(v(TAB_LABEL[next]), 'INFO')
  }, [brief, pushAlert])

  const fireNif = useCallback(() => {
    if (firing) return
    setFiring(true); setIgnited(false)
    const willIgnite = laser >= 0.7
    window.setTimeout(() => setIgnited(willIgnite), 900)
    window.setTimeout(() => {
      setFiring(false)
      if (willIgnite) pushAlert(brief.voice?.ignition as string ?? '▸ IGNITION.', 'OK')
      else            pushAlert(brief.voice?.fizzle   as string ?? '▸ FIZZLE.',   'WARN')
      setIgnited(false)
    }, 2400)
  }, [firing, laser, brief, pushAlert])

  const pickProject = useCallback((name: string) => {
    const v = brief.voice?.pickProject
    if (typeof v === 'function') pushAlert(v(name), 'INFO')
  }, [brief, pushAlert])

  return (
    <RouteStage variant="scroll">
      <FrameCorners
        leftTag={brief.frame.leftTag}
        leftMeta={TAB_LABEL[tab]}
        rightTag={brief.frame.rightTag}
        rightMeta={tab === 'projects' ? `PROJECTS ${projects.length}` : `Q≈${qFactor.toFixed(1)}`}
      />
      <RouteHeader mod={brief.mod} title={brief.title} deck={brief.deck} />

      <div className="fus-body">
        <ChipGroup label="CHANNEL">
          {(['tokamak', 'inertial', 'projects'] as Tab[]).map(t => (
            <Chip key={t} on={tab === t} onClick={() => pickTab(t)}>{TAB_LABEL[t]}</Chip>
          ))}
        </ChipGroup>

        {tab === 'tokamak' && (
          <div className="fus-grid">
            <ControlPanel position="inline" tag="CONFINEMENT · MAGNETIC" id="DRAG TO ROTATE">
              <div className="fus-tok-frame">
                <Tokamak temperature={temp} density={dens} />
                <div className="fus-readout mono">
                  <span>T · {tempC}M °C</span>
                  <span className={`fus-q ${tokIgnited ? 'fus-q-ignited' : tokBurning ? 'fus-q-burning' : ''}`}>
                    Q ≈ {qFactor.toFixed(1)}
                  </span>
                  <span className={tokIgnited ? 'r-hot' : ''}>
                    {tokIgnited ? 'IGNITED' : tokBurning ? 'IGNITION CANDIDATE' : 'SUB-IGNITION'}
                  </span>
                </div>
              </div>
              <RangeSlider
                label="TEMPERATURE"
                min={0} max={1} step={0.01} value={temp}
                onChange={setTemp}
                unit="M °C"
                format={v => String(Math.round(v * 200))}
                showRange={false}
              />
              <RangeSlider
                label="DENSITY"
                min={0} max={1} step={0.01} value={dens}
                onChange={setDens}
                unit="%"
                format={v => String(Math.round(v * 100))}
                showRange={false}
              />
            </ControlPanel>

            <NoteCard kind="field" tag="HOW IT WORKS"
              fun="A donut wrapped in magnets you can't quite afford. ITER will be the largest one ever built. Probably."
            >
              Magnetic confinement holds plasma in a torus using superconducting coils. Heat to 100M°C, hold dense enough, long enough — Lawson's criterion. Q = (fusion power out) / (heating power in). Net energy needs Q ≥ 1; commercial power needs Q ≥ 10.
            </NoteCard>
          </div>
        )}

        {tab === 'inertial' && (
          <div className="fus-grid">
            <ControlPanel position="inline" tag="CONFINEMENT · INERTIAL" id="192 LASERS / 1 PELLET">
              <div className={`fus-nif-stage ${firing ? 'firing' : ''} ${ignited ? 'ignited' : ''}`}>
                <svg viewBox="0 0 360 360" className="fus-nif-svg">
                  <circle cx="180" cy="180" r={14 - laser * 8} className="fus-nif-pellet"
                    style={{ transition: 'r 220ms cubic-bezier(0.2,0.8,0.2,1)' }} />
                  {Array.from({ length: 8 }).map((_, i) => {
                    const a = (i / 8) * Math.PI * 2
                    const x1 = 180 + Math.cos(a) * 160
                    const y1 = 180 + Math.sin(a) * 160
                    const x2 = 180 + Math.cos(a) * 22
                    const y2 = 180 + Math.sin(a) * 22
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      className="fus-nif-laser"
                      style={{ animationDelay: `${i * 30}ms`, opacity: firing ? 1 : 0.18 + laser * 0.5 }} />
                  })}
                  {ignited && (
                    <>
                      <circle cx="180" cy="180" r="60"  className="fus-nif-shock" />
                      <circle cx="180" cy="180" r="100" className="fus-nif-shock fus-nif-shock-2" />
                    </>
                  )}
                </svg>
              </div>
              <RangeSlider
                label={`LASER POWER · ${laser >= 0.7 ? 'IGNITION READY' : 'BELOW THRESHOLD'}`}
                min={0} max={1} step={0.01} value={laser}
                onChange={setLaser}
                unit="%"
                format={v => String(Math.round(v * 100))}
                showRange={false}
              />
              <button
                className="fus-nif-fire"
                onClick={fireNif}
                disabled={firing}
              >
                {firing ? (ignited ? '◉ IGNITED' : 'FIRING…') : (laser >= 0.7 ? '▸ FIRE — IGNITION READY' : '▸ FIRE (WILL FIZZLE)')}
              </button>
            </ControlPanel>

            <NoteCard kind={laser >= 0.7 ? 'field' : 'warn'} tag="HOW IT WORKS"
              fun="The lasers consumed 300 MJ from the grid to deliver 2 MJ to the pellet. We have a long way to go."
            >
              192 laser beams converge on a deuterium-tritium fuel pellet the size of a peppercorn. The shock compresses the pellet to 100× the density of lead and 100M°C — fusion fires for picoseconds. Crank laser power past 70% to clear the ignition threshold demonstrated by NIF in December 2022.
            </NoteCard>
          </div>
        )}

        {tab === 'projects' && (
          <>
            <ControlPanel position="inline" tag="FILTERS" id="07.FLT">
              <ChipGroup label="GEOMETRY">
                {GEOMETRIES.map(g => (
                  <Chip key={g.id} tone={g.tone ?? 'signal'} on={geo === g.id} onClick={() => setGeo(g.id)}>
                    {g.label}
                  </Chip>
                ))}
              </ChipGroup>
              <ChipGroup label="CATEGORY">
                {CATEGORIES.map(c => (
                  <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>
                    {c.label}
                  </Chip>
                ))}
              </ChipGroup>
            </ControlPanel>

            <div className="fus-projects">
              {projects.map(p => (
                <button key={p.id} className="fus-pcard" onClick={() => pickProject(p.name)} type="button">
                  <div className="fus-pcard-head">
                    <span className="mono fus-pcard-tag">{p.geometry.toUpperCase()} · {p.category.toUpperCase()}</span>
                    <span className="mono fus-pcard-org">{p.org}</span>
                  </div>
                  <div className="fus-pcard-name">{p.name}</div>
                  <div className="fus-pcard-country mono">{p.country}</div>
                  <div className="fus-pcard-milestone mono">▸ {p.milestone}</div>
                  <p className="fus-pcard-blurb">{p.blurb}</p>
                  <em className="fus-pcard-fun">{p.fun}</em>
                </button>
              ))}
              {projects.length === 0 && (
                <div className="fus-projects-empty">No projects match. Try ALL.</div>
              )}
            </div>
          </>
        )}

        {/* D-T strip — always visible, reactive to current state */}
        <div className={`fus-dt ${tokIgnited || ignited ? 'fus-dt-ignited' : tokBurning ? 'fus-dt-burning' : ''}`}>
          <span className="mono fus-dt-tag">
            {tokIgnited || ignited ? 'IGNITION ACHIEVED · D + T → He-4 + n + 17.6 MeV' : 'D + T → He-4 + n + 17.6 MeV'}
          </span>
          <svg viewBox="0 0 600 80" className="fus-dt-svg">
            <circle cx="60"  cy="40" r="11" fill="#facc15"/>
            <circle cx="80"  cy="40" r="8"  fill="#ffffff" opacity="0.8"/>
            <circle cx="170" cy="40" r="11" fill="#facc15"/>
            <circle cx="158" cy="50" r="8"  fill="#ffffff" opacity="0.8"/>
            <circle cx="186" cy="50" r="8"  fill="#ffffff" opacity="0.8"/>
            <path d="M 220 40 L 290 40" stroke="#ff4081" strokeWidth="2"/>
            <path d="M 280 33 L 292 40 L 280 47 Z" fill="#ff4081"/>
            <text x="218" y="28" fontFamily="monospace" fontSize="9" fill="#ff4081" letterSpacing="0.15em">
              {tokIgnited || ignited ? 'IGNITED' : tokBurning ? `${tempC}M °C` : '100M °C →'}
            </text>
            <g className={tokIgnited || ignited ? 'fus-dt-products' : ''}>
              <circle cx="350" cy="40" r="11" fill="#facc15"/>
              <circle cx="330" cy="50" r="11" fill="#facc15"/>
              <circle cx="335" cy="30" r="8"  fill="#ffffff" opacity="0.8"/>
              <circle cx="370" cy="50" r="8"  fill="#ffffff" opacity="0.8"/>
              <text x="320" y="74" fontFamily="monospace" fontSize="9" fill="#facc15" letterSpacing="0.15em">HELIUM-4</text>
              <circle cx="460" cy="40" r="8" fill="#ffffff" opacity="0.85"/>
              <path d="M 430 40 L 480 40" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6"/>
              <text x="438" y="74" fontFamily="monospace" fontSize="9" fill="#ffffff" opacity="0.8">14.1 MeV n</text>
            </g>
          </svg>
        </div>
      </div>
    </RouteStage>
  )
}
