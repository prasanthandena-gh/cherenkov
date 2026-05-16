/* =====================================================
   /grids — Balance The Grid live simulator.
   Sliders for generation mix. Live frequency gauge + demand curve.
   ===================================================== */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDashboard } from '../lib/dashboard-ctx'
import { getBriefing } from '../lib/briefings'
import {
  RouteStage, RouteHeader, FrameCorners, ControlPanel,
  Chip, ChipGroup, RangeSlider, Gauge,
  StatGrid, Stat,
} from '../components/cmd'
import './Grids.css'

interface Source {
  id: string
  label: string
  color: string
  capacityFactor: number
  intensity: number
  cost: number
  tag: 'firm' | 'renewable' | 'fossil' | 'storage'
}

const SOURCES: Source[] = [
  { id: 'nuclear', label: 'NUCLEAR', color: '#facc15', capacityFactor: 0.92, intensity: 12,  cost: 95, tag: 'firm' },
  { id: 'gas',     label: 'GAS',     color: '#ff8c00', capacityFactor: 0.55, intensity: 490, cost: 65, tag: 'fossil' },
  { id: 'coal',    label: 'COAL',    color: '#ff3333', capacityFactor: 0.50, intensity: 820, cost: 75, tag: 'fossil' },
  { id: 'hydro',   label: 'HYDRO',   color: '#4cc8ff', capacityFactor: 0.40, intensity: 24,  cost: 40, tag: 'firm' },
  { id: 'wind',    label: 'WIND',    color: '#a371ff', capacityFactor: 0.35, intensity: 11,  cost: 35, tag: 'renewable' },
  { id: 'solar',   label: 'SOLAR',   color: '#ff4081', capacityFactor: 0.22, intensity: 40,  cost: 30, tag: 'renewable' },
  { id: 'storage', label: 'STORAGE', color: '#00ff88', capacityFactor: 1.00, intensity: 0,   cost: 120, tag: 'storage' },
]

type Mix = Record<string, number>

const PRESETS: { id: string; label: string; mix: Mix }[] = [
  { id: 'fr-2025',  label: 'FRENCH 2025',   mix: { nuclear: 95, gas: 5,  coal: 0,  hydro: 60, wind: 30, solar: 20, storage: 10 } },
  { id: 'de-2024',  label: 'GERMAN 2024',   mix: { nuclear: 0,  gas: 35, coal: 30, hydro: 25, wind: 65, solar: 70, storage: 20 } },
  { id: 'us-2024',  label: 'US AVG',        mix: { nuclear: 65, gas: 60, coal: 25, hydro: 30, wind: 35, solar: 25, storage: 15 } },
  { id: 'cn-2024',  label: 'CHINESE 2024',  mix: { nuclear: 35, gas: 15, coal: 80, hydro: 45, wind: 40, solar: 50, storage: 10 } },
  { id: 'zero-c',   label: 'ZERO-CARBON',   mix: { nuclear: 90, gas: 0,  coal: 0,  hydro: 55, wind: 70, solar: 75, storage: 60 } },
]

const HOURS = 48
const TICK_MS = 600

function demandAt(hour: number): number {
  const h = ((hour % 24) + 24) % 24
  const morning = Math.exp(-((h - 7.5) ** 2) / 6) * 0.45
  const evening = Math.exp(-((h - 19) ** 2) / 6) * 0.55
  const base = 0.45
  return Math.max(0.3, Math.min(1.0, base + morning + evening))
}

function availability(id: string, hour: number): number {
  const h = ((hour % 24) + 24) % 24
  if (id === 'solar') return Math.max(0, Math.exp(-((h - 12) ** 2) / 12))
  if (id === 'wind')  return 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(h * 0.6 + 1))
  return 1.0
}

export default function Grids() {
  const { setFocus, setNodes, setCoords, pushAlert, setRouteHint, setDefcon } = useDashboard()
  const brief = getBriefing('grids')
  const [mix, setMix] = useState<Mix>({
    nuclear: 60, gas: 35, coal: 15, hydro: 30, wind: 40, solar: 30, storage: 15,
  })
  const [hour, setHour]               = useState<number>(8)
  const [history, setHistory]         = useState<{ demand: number; layers: Record<string, number> }[]>([])
  const [presetId, setPresetId]       = useState<string | null>(null)
  const [trippedSource, setTrippedSource] = useState<string | null>(null)
  const tickRef = useRef<number>()
  const brownoutAnnouncedRef = useRef<boolean>(false)

  useEffect(() => {
    tickRef.current = window.setInterval(() => setHour(h => h + 0.5), TICK_MS)
    return () => { if (tickRef.current) window.clearInterval(tickRef.current) }
  }, [])

  const snap = useMemo(() => {
    const layers: Record<string, number> = {}
    let totalGen = 0
    for (const s of SOURCES) {
      const installed = mix[s.id] ?? 0
      const avail = availability(s.id, hour)
      const tripped = trippedSource === s.id
      const out = tripped ? 0 : (installed / 100) * s.capacityFactor * avail * 100
      layers[s.id] = out
      totalGen += out
    }
    const demand = demandAt(hour) * 100
    return { layers, totalGen, demand }
  }, [mix, hour, trippedSource])

  useEffect(() => {
    setHistory(prev => [...prev, { demand: snap.demand, layers: { ...snap.layers } }].slice(-HOURS))
  }, [hour]) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    let weightedCO2 = 0, weightedCost = 0, totalRenewable = 0, totalFossil = 0
    const gen = snap.totalGen || 1
    for (const s of SOURCES) {
      const share = snap.layers[s.id] / gen
      weightedCO2  += share * s.intensity
      weightedCost += share * s.cost
      if (s.tag === 'renewable') totalRenewable += snap.layers[s.id]
      if (s.tag === 'fossil')    totalFossil    += snap.layers[s.id]
    }
    const balance = snap.totalGen - snap.demand
    const frequency = 50 + balance * 0.06
    const brownout = balance < -1
    return {
      gCO2: weightedCO2,
      cost: weightedCost,
      frequency,
      brownout,
      renewablePct: (totalRenewable / gen) * 100,
      fossilPct:    (totalFossil    / gen) * 100,
    }
  }, [snap])

  // Voice + DEFCON: brownout state transitions
  useEffect(() => {
    if (stats.brownout && !brownoutAnnouncedRef.current) {
      brownoutAnnouncedRef.current = true
      pushAlert(brief.voice?.brownout as string ?? '▸ BROWNOUT.', 'CRIT')
      setDefcon(2, 'GRID BROWNOUT')
    } else if (!stats.brownout && brownoutAnnouncedRef.current) {
      brownoutAnnouncedRef.current = false
      const v = brief.voice?.nominal
      if (typeof v === 'function') pushAlert(v(stats.frequency.toFixed(2)), 'OK')
      setDefcon(4)
    }
  }, [stats.brownout, stats.frequency, brief, pushAlert, setDefcon])

  // routeHint (chrome ticker)
  useEffect(() => {
    setRouteHint(`GRID · ${stats.frequency.toFixed(2)} Hz · ${stats.brownout ? 'BROWNOUT' : 'NOMINAL'}${trippedSource ? ` · ${trippedSource.toUpperCase()} TRIPPED` : ''}`)
  }, [stats.frequency, stats.brownout, trippedSource, setRouteHint])
  useEffect(() => () => { setRouteHint(null); setDefcon(4) }, [setRouteHint, setDefcon])

  // Stress-test auto-clears after 30s
  useEffect(() => {
    if (!trippedSource) return
    const id = window.setTimeout(() => {
      setTrippedSource(null)
      pushAlert(`▸ RECOVERY · ${trippedSource.toUpperCase()} BACK ONLINE.`, 'OK')
    }, 30000)
    return () => window.clearTimeout(id)
  }, [trippedSource, pushAlert])

  const fireStressTest = useCallback(() => {
    if (trippedSource) return
    // Pick the highest current contributor
    const top = SOURCES.reduce((best, s) => {
      const out = snap.layers[s.id] ?? 0
      return out > (snap.layers[best.id] ?? 0) ? s : best
    }, SOURCES[0])
    if ((snap.layers[top.id] ?? 0) <= 0) {
      pushAlert('▸ STRESS TEST · NO LIVE GENERATION TO TRIP.', 'WARN')
      return
    }
    setTrippedSource(top.id)
    setHistory([])
    pushAlert(`▸ STRESS TEST · ${top.label} OFFLINE. SHED LOAD OR LOSE FREQUENCY.`, 'CRIT')
  }, [trippedSource, snap.layers, pushAlert])

  useEffect(() => {
    setNodes(SOURCES.length)
    setCoords({ lat: null, lng: null })
    setFocus({
      override: {
        tag: 'GRID STATE',
        title: 'Grid Balance',
        rows: [
          { k: 'FREQ',       v: `${stats.frequency.toFixed(2)} Hz` },
          { k: 'gCO₂ / kWh', v: `${stats.gCO2.toFixed(0)}` },
          { k: 'COST',       v: `$${stats.cost.toFixed(0)} / MWh` },
          { k: 'RENEWABLE',  v: `${stats.renewablePct.toFixed(0)} %` },
          { k: 'BALANCE',    v: stats.brownout ? 'BROWNOUT' : 'STABLE' },
        ],
        note: 'Move sliders to set installed capacity. Sun and wind vary by virtual hour. Frequency drifts when generation ≠ demand. Brownout when supply falls short.',
      },
    })
  }, [stats, setFocus, setNodes, setCoords])

  const loadPreset = useCallback((p: typeof PRESETS[number]) => {
    setMix(p.mix)
    setHistory([])
    setPresetId(p.id)
    const v = brief.voice?.preset
    if (typeof v === 'function') pushAlert(v(p.label), 'INFO')
  }, [brief, pushAlert])

  const handleMix = useCallback((id: string, val: number) => {
    setMix(m => ({ ...m, [id]: val }))
    setPresetId(null)
  }, [])

  return (
    <RouteStage variant="scroll">
      <FrameCorners
        leftTag={brief.frame.leftTag}
        leftMeta={`HOUR ${Math.round(hour) % 24}:00`}
        rightTag={brief.frame.rightTag}
        rightMeta={`${stats.frequency.toFixed(2)} Hz`}
      />
      <RouteHeader mod={brief.mod} title={brief.title} deck={brief.deck} />

      <div className="gri-body">
        <ChipGroup label="PRESETS">
          {PRESETS.map(p => (
            <Chip key={p.id} on={presetId === p.id} onClick={() => loadPreset(p)}>
              {p.label}
            </Chip>
          ))}
          <Chip tone="crit"
            on={false}
            onClick={() => loadPreset({ id: 'zero', label: 'ZERO', mix: { nuclear: 0, gas: 0, coal: 0, hydro: 0, wind: 0, solar: 0, storage: 0 } })}
          >ZERO</Chip>
          <Chip tone="warn" on={!!trippedSource} onClick={fireStressTest} title="Drop the largest live source for 30 seconds">
            ▴ STRESS TEST
          </Chip>
        </ChipGroup>

        <div className="gri-grid">
          <ControlPanel position="inline" tag="GENERATION MIX · % INSTALLED" id="06.GEN">
            {SOURCES.map(s => {
              const v = mix[s.id] ?? 0
              const out = (snap.layers[s.id] ?? 0).toFixed(0)
              const isTripped = trippedSource === s.id
              return (
                <div key={s.id} className={`gri-row ${isTripped ? 'is-tripped' : ''}`}>
                  <div className="gri-row-head">
                    <span className="gri-row-dot" style={{ background: s.color }} />
                    <span className="gri-row-label mono">{s.label}{isTripped && ' · TRIPPED'}</span>
                    <span className="gri-row-out mono" style={{ color: isTripped ? 'var(--crit)' : s.color }}>{out} MW</span>
                  </div>
                  <RangeSlider
                    label={s.label}
                    min={0}
                    max={100}
                    value={v}
                    onChange={n => handleMix(s.id, n)}
                    unit="%"
                    showRange={false}
                  />
                </div>
              )
            })}
          </ControlPanel>

          <div className="gri-sim">
            <ControlPanel position="inline" tag={`GRID FREQUENCY · NOMINAL 50.00 Hz`} id="06.FRQ">
              <div className="gri-gauge-wrap">
                <Gauge
                  label="LIVE"
                  value={stats.frequency}
                  min={48}
                  max={52}
                  warnline={50.6}
                  redline={51.2}
                  unit="Hz"
                  format={v => v.toFixed(2)}
                  size={150}
                />
                {stats.brownout && (
                  <div className="gri-brownout mono">▴ BROWNOUT — GENERATION SHORT</div>
                )}
              </div>
            </ControlPanel>

            <ControlPanel
              position="inline"
              tag={`DEMAND vs SUPPLY · ${Math.round(hour) % 24}:00`}
              id={`${snap.demand.toFixed(0)} MW`}
            >
              <DemandSupplyChart history={history} sources={SOURCES} />
            </ControlPanel>

            <StatGrid cols={2}>
              <Stat k="gCO₂/kWh"    v={stats.gCO2.toFixed(0)}      tone={stats.gCO2 < 100 ? 'ok' : stats.gCO2 < 400 ? 'warn' : 'crit'} small />
              <Stat k="COST $/MWh"  v={stats.cost.toFixed(0)}      tone="ink" small />
              <Stat k="RENEWABLE"   v={`${stats.renewablePct.toFixed(0)}%`} tone="ok" small />
              <Stat k="FOSSIL"      v={`${stats.fossilPct.toFixed(0)}%`}    tone="crit" small />
            </StatGrid>
          </div>
        </div>
      </div>
    </RouteStage>
  )
}

function DemandSupplyChart({ history, sources }: { history: { demand: number; layers: Record<string, number> }[]; sources: Source[] }) {
  if (history.length < 2) return <div className="gri-chart-empty mono">COLLECTING…</div>

  const W = 460, H = 130
  const max = Math.max(120, ...history.map(h => h.demand))
  const dx = W / (HOURS - 1)

  const stacks: { source: Source; points: [number, number, number][] }[] = []
  const runningBase = new Array(history.length).fill(0)
  for (const s of sources) {
    const points: [number, number, number][] = []
    history.forEach((sample, i) => {
      const base = runningBase[i]
      const top = base + (sample.layers[s.id] ?? 0)
      runningBase[i] = top
      const x = i * dx
      const baseY = H - (base / max) * H
      const topY = H - (top  / max) * H
      points.push([x, baseY, topY])
    })
    stacks.push({ source: s, points })
  }

  const demandPath = history.map((h, i) => {
    const x = i * dx
    const y = H - (h.demand / max) * H
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="gri-chart-svg">
      {stacks.map(({ source, points }) => {
        const top = points.map(([x, , topY]) => `${x.toFixed(1)},${topY.toFixed(1)}`).join(' ')
        const base = [...points].reverse().map(([x, baseY]) => `${x.toFixed(1)},${baseY.toFixed(1)}`).join(' ')
        return <polygon key={source.id} points={`${top} ${base}`} fill={source.color} opacity="0.6" />
      })}
      <path d={demandPath} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  )
}
