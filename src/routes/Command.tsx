/* =====================================================
   / COMMAND — globe view + overlay controls + STORY mode.
   Year scrub becomes a 70-year nuclear narrative when
   STORY is on. Events fire pin-status flips, DEFCON
   spikes, banner reveals, and ring pulses on the globe.
   ===================================================== */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GlobeView, { type GlobeFilter } from '../components/GlobeView'
import { useDashboard } from '../lib/dashboard-ctx'
import { type Reactor } from '../data/reactors'
import { NUCLEAR_EVENTS, type NuclearEvent, type EventTone } from '../data/nuclear-events'
import { computeEventState, eventsFiredInRange } from '../lib/event-machine'
import './Command.css'

const STORAGE_KEY = 'fc.sandbox.builds.v1'

function loadCustoms(): Reactor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as Reactor[]
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

const FILTERS: { id: GlobeFilter; label: string; tone: string }[] = [
  { id: 'all',     label: 'ALL',     tone: 'ink' },
  { id: 'active',  label: 'ACTIVE',  tone: 'signal' },
  { id: 'paused',  label: 'PAUSED',  tone: 'warn' },
  { id: 'ghost',   label: 'GHOST',   tone: 'ghost' },
  { id: 'smr',     label: 'SMR',     tone: 'ok' },
  { id: 'fusion',  label: 'FUSION',  tone: 'plasma' },
]

const YEAR_MIN = 1942
const YEAR_MAX = 2050

interface ActiveFlash { id: number; lat: number; lng: number; color: string; ms: number; bornAt: number }

const TONE_TO_LEVEL: Record<EventTone, 'OK' | 'INFO' | 'WARN' | 'CRIT'> = {
  milestone: 'OK',
  incident:  'CRIT',
  policy:    'WARN',
  fusion:    'INFO',
}

export default function Command() {
  const { setFocus, setNodes, setCoords, focus, pushAlert, phantoms, setRouteHint, setDefcon } = useDashboard()
  const [filter, setFilter]       = useState<GlobeFilter>('all')
  const [year, setYear]           = useState<number>(2025)
  const [showGrid, setShowGrid]   = useState<boolean>(false)
  const [autoRotate, setAutoRotate] = useState<boolean>(true)
  const [customs, setCustoms]     = useState<Reactor[]>(loadCustoms())

  // === STORY MODE STATE ===
  const [story, setStory]         = useState<boolean>(true)
  const [playing, setPlaying]     = useState<boolean>(false)
  const [speed, setSpeed]         = useState<1 | 5 | 25>(5)
  const [banner, setBanner]       = useState<NuclearEvent | null>(null)
  const [flashes, setFlashes]     = useState<ActiveFlash[]>([])
  const lastYearRef               = useRef<number>(year)
  const flashIdRef                = useRef<number>(0)

  // Combine sandbox custom builds + NATIONS-driven phantom pins.
  const extraPins = useMemo(() => [...customs, ...phantoms], [customs, phantoms])

  // STORY world-state overrides (derived from year + events)
  const eventState = useMemo(
    () => story ? computeEventState(NUCLEAR_EVENTS, year) : { pinStatus: {}, fleetStatus: {} },
    [story, year],
  )

  useEffect(() => {
    const onStorage = () => setCustoms(loadCustoms())
    window.addEventListener('cherenkov:builds', onStorage)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('cherenkov:builds', onStorage)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  // === Fire one-shot effects when the cursor crosses an event forward ===
  useEffect(() => {
    if (!story) { lastYearRef.current = year; return }
    const fired = eventsFiredInRange(NUCLEAR_EVENTS, lastYearRef.current, year)
    lastYearRef.current = year
    if (fired.length === 0) return

    // Use the latest fired event for the banner (most relevant for fast scrubs)
    const headline = fired[fired.length - 1]
    setBanner(headline)
    window.setTimeout(() => {
      setBanner(b => (b && b.id === headline.id ? null : b))
    }, 2800)

    for (const e of fired) {
      pushAlert(`▸ ${e.date} · ${e.tag} — ${e.detail}`, TONE_TO_LEVEL[e.tone])
      setRouteHint(`▸ ${e.year} · ${e.tag}`)
      for (const fx of e.effects) {
        if (fx.kind === 'defcon') {
          setDefcon(fx.level, e.tag)
          window.setTimeout(() => setDefcon(4), fx.ms)
        } else if (fx.kind === 'flash') {
          const f: ActiveFlash = {
            id: ++flashIdRef.current,
            lat: fx.lat, lng: fx.lng,
            color: fx.color,
            ms: fx.ms ?? 1500,
            bornAt: performance.now(),
          }
          setFlashes(arr => [...arr, f])
          window.setTimeout(() => {
            setFlashes(arr => arr.filter(x => x.id !== f.id))
          }, f.ms)
        }
        // pin-status / fleet-status are handled by computeEventState above
      }
    }
  }, [year, story, pushAlert, setDefcon, setRouteHint])

  // === Playback loop ===
  useEffect(() => {
    if (!playing) return
    const stepYears = speed / 12        // 1× ≈ 1yr/sec across the timeline
    const id = window.setInterval(() => {
      setYear(y => {
        const next = y + stepYears
        if (next >= YEAR_MAX) {
          setPlaying(false)
          return YEAR_MAX
        }
        return next
      })
    }, 80)                              // ~12.5 Hz tick
    return () => window.clearInterval(id)
  }, [playing, speed])

  const onSelect = useCallback((r: Reactor | null) => {
    setFocus({ reactor: r })
    setCoords(r ? { lat: r.lat, lng: r.lng } : { lat: null, lng: null })
    setAutoRotate(false)
    if (r) pushAlert(`TARGET LOCKED — ${r.name.toUpperCase()}`, 'OK')
  }, [setFocus, setCoords, pushAlert])

  const onCountChange = useCallback((n: number) => setNodes(n), [setNodes])

  useEffect(() => {
    setRouteHint(`TARGET ${focus.reactor?.name?.toUpperCase() ?? 'AWAITING'} · YEAR ${Math.round(year)}`)
  }, [focus.reactor, year, setRouteHint])
  useEffect(() => () => setRouteHint(null), [setRouteHint])

  const yearPct = useMemo(() => ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100, [year])

  const onResetView = () => {
    setFocus({}); setCoords({ lat: null, lng: null })
    setYear(2025); setFilter('all'); setShowGrid(false); setAutoRotate(true)
    setPlaying(false); setStory(true)
    pushAlert('VIEW RESET — RETURNING TO HOME', 'INFO')
  }

  return (
    <div className="cmd-stage">
      {/* Frame label corners */}
      <div className="cmd-frame">
        <span className="cmd-frame-tag mono">FIG.001 // EARTH</span>
        <span className="cmd-frame-meta mono">SCALE 1 : 12,742 KM</span>
      </div>
      <div className="cmd-frame cmd-frame-right">
        <span className="cmd-frame-tag mono">FRAME 002316</span>
        <span className="cmd-frame-meta mono">ROT -90.7°</span>
      </div>

      <GlobeView
        filter={filter}
        yearGate={Math.floor(year)}
        showGrid={showGrid}
        autoRotate={autoRotate}
        extraPins={extraPins}
        pinStatusOverrides={eventState.pinStatus}
        fleetStatusOverrides={eventState.fleetStatus}
        onSelect={onSelect}
        onCountChange={onCountChange}
      />

      {/* Top-center event banner */}
      {banner && (
        <div className="cmd-event-banner">
          <div className="cmd-event-banner__date mono">{banner.date}</div>
          <div className="cmd-event-banner__tag">{banner.tag}</div>
          <div className="cmd-event-banner__detail">{banner.detail}</div>
          {banner.fun && <em className="cmd-event-banner__fun">{banner.fun}</em>}
        </div>
      )}

      {/* Globe flash overlays (CSS pulses positioned by lat/lng) */}
      {flashes.length > 0 && (
        <FlashLayer flashes={flashes} />
      )}

      {/* Top-right control panel */}
      <div className="cmd-controls">
        <div className="cmd-control-row">
          <button
            className={`cmd-chip ${showGrid ? 'on' : ''}`}
            onClick={() => { setShowGrid(g => !g); pushAlert(showGrid ? 'GRID OVERLAY DISENGAGED' : 'GRID OVERLAY ENGAGED', 'OK') }}
            title="Toggle transmission-line overlay"
          >⌬ GRID</button>
          <button
            className={`cmd-chip ${autoRotate ? 'on' : ''}`}
            onClick={() => setAutoRotate(r => !r)}
          >↻ AUTO</button>
        </div>

        <div className="cmd-filter">
          <span className="cmd-filter-tag mono">FILTER</span>
          <div className="cmd-filter-chips">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`cmd-fchip cmd-fchip-${f.tone} ${filter === f.id ? 'on' : ''}`}
                onClick={() => { setFilter(f.id); pushAlert(`FILTER SET — ${f.label}`, 'INFO') }}
              >{f.label}</button>
            ))}
          </div>
        </div>

        {/* STORY controls */}
        <div className="cmd-story">
          <div className="cmd-story-row">
            <button
              className={`cmd-chip ${story ? 'on' : ''}`}
              onClick={() => { setStory(s => !s); setPlaying(false) }}
              title="Play the 70-year nuclear narrative as you scrub the year"
            >◈ STORY</button>
            <button
              className={`cmd-chip ${playing ? 'on' : ''}`}
              onClick={() => setPlaying(p => !p)}
              disabled={!story}
              title={playing ? 'Pause playback' : 'Auto-advance through history'}
            >{playing ? '⏸ PAUSE' : '◉ PLAY'}</button>
            <div className="cmd-story-speed">
              {([1, 5, 25] as const).map(s => (
                <button
                  key={s}
                  className={`cmd-chip cmd-chip-s ${speed === s ? 'on' : ''}`}
                  onClick={() => setSpeed(s)}
                  disabled={!story}
                >{s}×</button>
              ))}
            </div>
          </div>
        </div>

        <div className="cmd-year">
          <div className="cmd-year-head">
            <span className="cmd-year-tag mono">YEAR</span>
            <span className="cmd-year-val">{Math.round(year)}</span>
          </div>
          <div className="cmd-year-track">
            <div className="cmd-year-fill" style={{ width: `${yearPct}%` }} />
            <input
              type="range" min={YEAR_MIN} max={YEAR_MAX} step={story ? 0.1 : 1} value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="cmd-year-input"
            />
          </div>
          {story && (
            <div className="cmd-story-strip" title="Event timeline">
              {NUCLEAR_EVENTS.map(e => {
                const x = ((e.year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100
                return (
                  <button
                    key={e.id}
                    className={`cmd-story-dot cmd-story-dot--${e.tone}`}
                    style={{ left: `${x}%` }}
                    onClick={() => { setYear(e.year); setPlaying(false) }}
                    title={`${e.date} · ${e.tag}`}
                  />
                )
              })}
            </div>
          )}
          <div className="cmd-year-range mono">
            <span>{YEAR_MIN}</span><span>{YEAR_MAX}</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA bar (Launch Simulation matching screenshot) */}
      <div className="cmd-cta-bar">
        <div className="cmd-cta-coord mono">
          {focus.reactor
            ? `▸ TARGET RANGE: ${Math.abs(focus.reactor.lat).toFixed(2)}°${focus.reactor.lat >= 0 ? 'N' : 'S'} / ${Math.abs(focus.reactor.lng).toFixed(2)}°${focus.reactor.lng >= 0 ? 'E' : 'W'}`
            : '+ NO TARGET · RANGE ∞'}
        </div>
        <div className="cmd-cta-buttons">
          <button
            className="cmd-cta-btn"
            onClick={() => { setAutoRotate(true); pushAlert('AUTO-ROTATE RESUMED', 'OK') }}
          >AUTO-ROTATE</button>
          <button className="cmd-cta-btn" onClick={onResetView}>RESET VIEW</button>
          <button
            className="cmd-cta-btn cmd-cta-launch"
            onClick={() => {
              pushAlert('SIMULATION LAUNCHED — INSPECTING NODE', 'OK')
              window.location.href = '/reactors'
            }}
          >▸ LAUNCH SIMULATION</button>
        </div>
        <div className="cmd-cta-help mono">DRAG TO ROTATE / SCROLL TO ZOOM</div>
      </div>
    </div>
  )
}

/* === Globe flash overlay ===
   Simplified projection: project lat/lng onto a square 2D mapping of the
   visible hemisphere centered on lon=0. Good enough for dramatic punctuation;
   does NOT track globe rotation precisely. The pulses live ~1.5s anyway.

   Implementation note: react-globe.gl doesn't expose camera projection
   publicly. We render the pulse as an absolutely-positioned div using a
   simple equirectangular mapping to globe-canvas coords. For accuracy,
   a future pass could read globeRef.toScreenCoords(lat, lng). */
function FlashLayer({ flashes }: { flashes: ActiveFlash[] }) {
  return (
    <div className="cmd-flash-layer">
      {flashes.map(f => {
        // Equirectangular pseudo-projection onto the stage; flashes drift
        // with rotation but the burst is the point, not pixel accuracy.
        const x = ((f.lng + 180) / 360) * 100
        const y = ((90 - f.lat) / 180) * 100
        return (
          <span
            key={f.id}
            className="cmd-flash"
            style={{
              left: `${x}%`, top: `${y}%`,
              color: f.color,
              animationDuration: `${f.ms}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
