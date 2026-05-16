/* =====================================================
   /carbon — Country mix CO₂ calculator.
   Pick country → preloads real 2024 mix → tune to see emissions.
   ===================================================== */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDashboard } from '../lib/dashboard-ctx'
import { getBriefing } from '../lib/briefings'
import {
  RouteStage, RouteHeader, FrameCorners, ControlPanel,
  Chip, ChipGroup, StatGrid, Stat, NoteCard,
} from '../components/cmd'
import './Carbon.css'

interface Source { id: string; label: string; color: string; intensity: number }
const SOURCES: Source[] = [
  { id: 'nuclear', label: 'NUCLEAR', color: '#facc15', intensity: 12 },
  { id: 'hydro',   label: 'HYDRO',   color: '#4cc8ff', intensity: 24 },
  { id: 'wind',    label: 'WIND',    color: '#a371ff', intensity: 11 },
  { id: 'solar',   label: 'SOLAR',   color: '#ff4081', intensity: 40 },
  { id: 'gas',     label: 'GAS',     color: '#ff8c00', intensity: 490 },
  { id: 'coal',    label: 'COAL',    color: '#ff3333', intensity: 820 },
  { id: 'oil',     label: 'OIL',     color: '#666666', intensity: 720 },
  { id: 'other',   label: 'OTHER',   color: '#3a4861', intensity: 200 },
]

type Mix = Record<string, number>

interface Country { id: string; label: string; twh: number; mix: Mix }
const COUNTRIES: Country[] = [
  { id: 'fra', label: 'FRANCE',    twh: 487,  mix: { nuclear: 65, hydro: 11, wind: 7,  solar: 5,  gas: 6,  coal: 1,  oil: 1, other: 4  } },
  { id: 'usa', label: 'USA',       twh: 4178, mix: { nuclear: 18, hydro: 6,  wind: 10, solar: 5,  gas: 42, coal: 16, oil: 1, other: 2  } },
  { id: 'chn', label: 'CHINA',     twh: 9456, mix: { nuclear: 5,  hydro: 13, wind: 9,  solar: 5,  gas: 3,  coal: 60, oil: 1, other: 4  } },
  { id: 'deu', label: 'GERMANY',   twh: 466,  mix: { nuclear: 0,  hydro: 4,  wind: 28, solar: 13, gas: 14, coal: 27, oil: 1, other: 13 } },
  { id: 'ind', label: 'INDIA',     twh: 1869, mix: { nuclear: 3,  hydro: 9,  wind: 4,  solar: 6,  gas: 2,  coal: 71, oil: 1, other: 4  } },
  { id: 'bra', label: 'BRAZIL',    twh: 663,  mix: { nuclear: 2,  hydro: 63, wind: 12, solar: 6,  gas: 9,  coal: 3,  oil: 2, other: 3  } },
  { id: 'nor', label: 'NORWAY',    twh: 153,  mix: { nuclear: 0,  hydro: 88, wind: 11, solar: 0,  gas: 1,  coal: 0,  oil: 0, other: 0  } },
  { id: 'are', label: 'UAE',       twh: 147,  mix: { nuclear: 22, hydro: 0,  wind: 0,  solar: 6,  gas: 70, coal: 1,  oil: 1, other: 0  } },
  { id: 'jpn', label: 'JAPAN',     twh: 1011, mix: { nuclear: 7,  hydro: 8,  wind: 1,  solar: 11, gas: 32, coal: 30, oil: 5, other: 6  } },
  { id: 'aus', label: 'AUSTRALIA', twh: 271,  mix: { nuclear: 0,  hydro: 6,  wind: 12, solar: 17, gas: 19, coal: 43, oil: 2, other: 1  } },
]

const ALL_COAL: Mix      = { nuclear: 0, hydro: 0, wind: 0, solar: 0, gas: 0, coal: 100, oil: 0, other: 0 }
const NUCLEAR_HEAVY: Mix = { nuclear: 75, hydro: 5, wind: 8, solar: 6, gas: 4, coal: 0, oil: 0, other: 2 }

function gCO2(mix: Mix): number {
  let total = 0, sum = 0
  for (const s of SOURCES) {
    const pct = mix[s.id] ?? 0
    sum += pct
    total += pct * s.intensity
  }
  return sum > 0 ? total / sum : 0
}

function normalize(mix: Mix): Mix {
  let sum = 0
  for (const s of SOURCES) sum += mix[s.id] ?? 0
  if (sum === 0) return mix
  const out: Mix = {}
  for (const s of SOURCES) out[s.id] = ((mix[s.id] ?? 0) / sum) * 100
  return out
}

export default function Carbon() {
  const { setFocus, setNodes, setCoords, pushAlert, setRouteHint } = useDashboard()
  const brief = getBriefing('carbon')
  const [country, setCountry] = useState<Country>(COUNTRIES[0])
  const [mix, setMix] = useState<Mix>({ ...country.mix })

  const norm                  = useMemo(() => normalize(mix), [mix])
  const intensity             = useMemo(() => gCO2(norm), [norm])
  const coalIntensity         = useMemo(() => gCO2(ALL_COAL), [])
  const nuclearHeavyIntensity = useMemo(() => gCO2(NUCLEAR_HEAVY), [])
  const annualMt              = useMemo(() => (intensity * country.twh) / 1000, [intensity, country])

  const tonnes    = annualMt * 1e6
  const carsEq    = tonnes / 4.6
  const forestEq  = tonnes / 0.84
  const eiffelEq  = tonnes / 7300

  useEffect(() => {
    setRouteHint(`${country.label} · ${intensity.toFixed(0)} gCO₂/kWh · ${annualMt.toFixed(0)} Mt/yr`)
  }, [country.label, intensity, annualMt, setRouteHint])
  useEffect(() => () => setRouteHint(null), [setRouteHint])

  useEffect(() => {
    setNodes(SOURCES.filter(s => (mix[s.id] ?? 0) > 0).length)
    setCoords({ lat: null, lng: null })
    setFocus({
      override: {
        tag: 'CARBON PROFILE',
        title: country.label,
        rows: [
          { k: 'gCO₂/kWh', v: intensity.toFixed(0) },
          { k: 'TWh/yr',   v: country.twh.toString() },
          { k: 'Mt CO₂',   v: annualMt.toFixed(0) },
          { k: 'vs COAL',  v: `${(100 - (intensity / coalIntensity) * 100).toFixed(0)}% cleaner` },
        ],
        note: 'Tune the mix with +/- buttons. The country\'s annual electricity demand is fixed — only the carbon intensity changes.',
      },
    })
  }, [country, intensity, annualMt, mix, coalIntensity, setFocus, setNodes, setCoords])

  const loadCountry = useCallback((c: Country) => {
    setCountry(c)
    setMix({ ...c.mix })
    const v = brief.voice?.pick
    if (typeof v === 'function') pushAlert(v(c.label), 'INFO')
  }, [brief, pushAlert])

  const adjust = useCallback((id: string, label: string, delta: number) => {
    setMix(prev => ({ ...prev, [id]: Math.max(0, Math.min(100, (prev[id] ?? 0) + delta)) }))
    const v = brief.voice?.adjust
    if (typeof v === 'function') pushAlert(v(label, delta > 0 ? '↑' : '↓'), delta > 0 ? 'WARN' : 'OK')
  }, [brief, pushAlert])

  const vsCoal       = 100 - (intensity / coalIntensity) * 100
  const vsNuclear    = intensity / nuclearHeavyIntensity
  const vsNuclearSig = vsNuclear > 1 ? `+${((vsNuclear - 1) * 100).toFixed(0)}%` : `−${((1 - vsNuclear) * 100).toFixed(0)}%`

  return (
    <RouteStage variant="scroll">
      <FrameCorners
        leftTag={brief.frame.leftTag}
        leftMeta={brief.frame.leftMeta}
        rightTag={brief.frame.rightTag}
        rightMeta={brief.frame.rightMeta}
      />
      <RouteHeader mod={brief.mod} title={brief.title} deck={brief.deck} />

      <div className="car-body">
        <ChipGroup label="COUNTRY · 2024 MIX">
          {COUNTRIES.map(c => (
            <Chip key={c.id} on={country.id === c.id} onClick={() => loadCountry(c)}>
              {c.label}
            </Chip>
          ))}
        </ChipGroup>

        <div className="car-grid">
          {/* Donut */}
          <ControlPanel position="inline" tag="MIX" id="07.MIX">
            <div className="car-donut-wrap">
              <DonutMix mix={norm} sources={SOURCES} />
              <div className="car-donut-center">
                <div className="car-donut-v">{intensity.toFixed(0)}</div>
                <div className="car-donut-u">gCO₂ / kWh</div>
              </div>
            </div>
          </ControlPanel>

          {/* Bars */}
          <ControlPanel position="inline" tag="ENERGY MIX · % SHARE" id="07.SRC">
            {SOURCES.map(s => {
              const v = norm[s.id] ?? 0
              return (
                <div key={s.id} className="car-bar-row">
                  <div className="car-bar-head">
                    <span className="car-bar-dot" style={{ background: s.color, color: s.color }} />
                    <span className="car-bar-label mono">{s.label}</span>
                    <span className="car-bar-int mono" title="gCO₂/kWh lifecycle intensity">{s.intensity}</span>
                    <span className="car-bar-pct">{v.toFixed(0)}%</span>
                    <div className="car-bar-buttons">
                      <button className="car-bar-btn" onClick={() => adjust(s.id, s.label, -5)}>−</button>
                      <button className="car-bar-btn" onClick={() => adjust(s.id, s.label,  5)}>+</button>
                    </div>
                  </div>
                  <div className="car-bar-track">
                    <div className="car-bar-fill" style={{ width: `${v}%`, background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                  </div>
                </div>
              )
            })}
          </ControlPanel>

          {/* Outcomes */}
          <div className="car-outcomes">
            <StatGrid cols={1}>
              <Stat
                k={`ANNUAL CO₂ — ${country.label}`}
                v={annualMt.toFixed(0)}
                u="Mt"
                tone={intensity > coalIntensity * 0.6 ? 'crit' : intensity > 200 ? 'warn' : 'ok'}
              />
            </StatGrid>

            <StatGrid cols={2}>
              <Stat k="vs ALL-COAL"      v={`−${vsCoal.toFixed(0)}%`} tone="ok" small />
              <Stat k="vs NUCLEAR-HEAVY" v={vsNuclearSig} tone={vsNuclear > 1 ? 'warn' : 'ok'} small />
            </StatGrid>

            <NoteCard kind="field" tag="EQUIVALENCE" fun="Read it three ways. Atmosphere doesn't care how you count.">
              <div className="car-eq-row"><b>{fmt(carsEq)}</b> cars on the road / year</div>
              <div className="car-eq-row"><b>{fmt(forestEq)}</b> acres of forest absorbing</div>
              <div className="car-eq-row"><b>{fmt(eiffelEq)}</b> Eiffel Towers in mass of CO₂</div>
            </NoteCard>
          </div>
        </div>
      </div>
    </RouteStage>
  )
}

function fmt(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return Math.round(n).toString()
}

function DonutMix({ mix, sources }: { mix: Mix; sources: Source[] }) {
  const cx = 120, cy = 120, rOuter = 110, rInner = 70
  let acc = 0
  const total = sources.reduce((s, src) => s + (mix[src.id] ?? 0), 0)
  return (
    <svg viewBox="0 0 240 240" className="car-donut">
      {sources.map(s => {
        const v = mix[s.id] ?? 0
        if (v <= 0) return null
        const start = acc / total
        const end   = (acc + v) / total
        acc += v
        const path = arcPath(cx, cy, rOuter, rInner, start, end)
        return <path key={s.id} d={path} fill={s.color} opacity="0.85"
          style={{ filter: `drop-shadow(0 0 4px ${s.color})` }} />
      })}
      <circle cx={cx} cy={cy} r={rInner - 2} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </svg>
  )
}

function arcPath(cx: number, cy: number, r1: number, r2: number, startFrac: number, endFrac: number): string {
  const a0 = startFrac * Math.PI * 2 - Math.PI / 2
  const a1 = endFrac   * Math.PI * 2 - Math.PI / 2
  const x0 = cx + r1 * Math.cos(a0), y0 = cy + r1 * Math.sin(a0)
  const x1 = cx + r1 * Math.cos(a1), y1 = cy + r1 * Math.sin(a1)
  const x2 = cx + r2 * Math.cos(a1), y2 = cy + r2 * Math.sin(a1)
  const x3 = cx + r2 * Math.cos(a0), y3 = cy + r2 * Math.sin(a0)
  const large = endFrac - startFrac > 0.5 ? 1 : 0
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 ${large} 0 ${x3} ${y3} Z`
}
