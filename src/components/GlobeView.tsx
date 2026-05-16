/* =====================================================
   GLOBE VIEW — react-globe.gl with NASA Blue Marble texture,
   GeoJSON country polygons, reactor points, grid arcs, rings.
   ===================================================== */

import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { REACTORS, type Reactor, type ReactorStatus } from '../data/reactors'
import { buildGridNetwork } from '../lib/grid-network'

export type GlobeFilter = 'all' | 'active' | 'paused' | 'ghost' | 'smr' | 'fusion'

export interface GlobeViewProps {
  filter: GlobeFilter
  yearGate: number
  showGrid: boolean
  autoRotate: boolean
  extraPins?: Reactor[]
  /** Override pin status by reactor id (time-machine STORY mode) */
  pinStatusOverrides?: Record<string, ReactorStatus>
  /** Override pin status by country display name (e.g. all of "Japan" → paused) */
  fleetStatusOverrides?: Record<string, ReactorStatus>
  onSelect: (r: Reactor | null) => void
  onCountChange?: (n: number) => void
}

const COLOR = {
  active: '#facc15',
  paused: '#ff8c00',
  ghost:  '#666666',
  custom: '#a371ff',
  smr:    '#00ff88',
  fusion: '#ff4081',
}

function colorFor(r: Reactor): string {
  if (r.kind === 'custom') return COLOR.custom
  if (r.kind === 'smr')    return COLOR.smr
  if (r.kind === 'fusion') return COLOR.fusion
  return COLOR[r.status]
}

function passesFilter(r: Reactor, f: GlobeFilter): boolean {
  if (f === 'all') return true
  if (f === 'smr')    return r.kind === 'smr'
  if (f === 'fusion') return r.kind === 'fusion'
  return r.status === f
}

const LIFESPAN_YEARS = 60

export default function GlobeView({
  filter, yearGate, showGrid, autoRotate, extraPins,
  pinStatusOverrides, fleetStatusOverrides,
  onSelect, onCountChange,
}: GlobeViewProps) {
  const globeRef = useRef<any>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })
  const [countries, setCountries] = useState<{ features: any[] }>({ features: [] })
  const [hovered, setHovered] = useState<Reactor | null>(null)

  // Resize observer
  useEffect(() => {
    if (!wrapRef.current) return
    const el = wrapRef.current
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  // Country boundaries
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}world-countries.json`)
      .then(r => r.ok ? r.json() : { features: [] })
      .catch(() => ({ features: [] }))
      .then(setCountries)
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (!globeRef.current) return
    const ctrl = globeRef.current.controls()
    if (ctrl) {
      ctrl.autoRotate = autoRotate
      ctrl.autoRotateSpeed = 0.32
      ctrl.enableDamping = true
    }
  }, [autoRotate, countries])

  // Lock the initial camera distance once we have a Globe instance.
  // Without this, the camera tends to snap closer when the container resizes
  // (e.g. when the left rail collapses or pins are added/removed).
  const povLockedRef = useRef(false)
  useEffect(() => {
    if (povLockedRef.current) return
    if (!globeRef.current) return
    try {
      globeRef.current.pointOfView({ altitude: 2.4 })
      povLockedRef.current = true
    } catch { /* react-globe.gl not ready */ }
  })

  // Combined point set, filtered + year-gated, with time-machine status overrides
  const allPins = useMemo<Reactor[]>(() => {
    const combined = [...REACTORS, ...(extraPins ?? [])]
    return combined
      .filter(r => {
        if (yearGate !== undefined && r.year > yearGate) return false
        return passesFilter(r, filter)
      })
      .map(r => {
        const idOverride    = pinStatusOverrides?.[r.id]
        const fleetOverride = fleetStatusOverrides?.[r.country]
        const overridden    = idOverride ?? fleetOverride
        return overridden ? { ...r, status: overridden } : r
      })
  }, [filter, yearGate, extraPins, pinStatusOverrides, fleetStatusOverrides])

  // ghosting old reactors based on year
  const visualPins = useMemo(() => allPins.map(r => {
    const dead = r.status === 'ghost'
      || (yearGate !== undefined && r.year + LIFESPAN_YEARS < yearGate && r.kind !== 'fusion' && r.kind !== 'smr')
    return {
      ...r,
      __color: dead ? COLOR.ghost : colorFor(r),
      __radius: Math.max(0.3, Math.min(1.0, 0.3 + (r.capGW || 0.5) * 0.12)),
      __altitude: 0.012,
      __dead: dead,
    }
  }), [allPins, yearGate])

  // Rings for live/active reactors
  const rings = useMemo(() => visualPins
    .filter(p => !p.__dead && p.status !== 'ghost')
    .map(p => ({
      lat: p.lat, lng: p.lng, color: p.__color, maxR: 3, propagationSpeed: 1.2, repeatPeriod: 1600 + Math.random() * 800,
    })), [visualPins])

  // Grid arcs (k-NN between active reactors)
  const arcs = useMemo(() => {
    if (!showGrid) return []
    const actives = visualPins.filter(p => p.status === 'active' && !p.__dead)
    const edges = buildGridNetwork(actives, 2)
    return edges.map(e => ({
      startLat: e.a.lat, startLng: e.a.lng,
      endLat: e.b.lat, endLng: e.b.lng,
      color: [[0,255,136,0.55], [0,255,136,0.05]],
    }))
  }, [showGrid, visualPins])

  // Notify parent of count
  useEffect(() => {
    onCountChange?.(visualPins.length)
  }, [visualPins.length, onCountChange])

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#facc15"
        atmosphereAltitude={0.16}
        showGraticules
        showAtmosphere

        polygonsData={countries.features}
        polygonGeoJsonGeometry={(d: any) => d.geometry}
        polygonCapColor={() => 'rgba(250, 204, 21, 0.04)'}
        polygonSideColor={() => 'rgba(250, 204, 21, 0.10)'}
        polygonStrokeColor={() => 'rgba(250, 204, 21, 0.25)'}
        polygonAltitude={0.003}

        pointsData={visualPins}
        pointLat="lat"
        pointLng="lng"
        pointColor={(p: any) => p.__color}
        pointAltitude={(p: any) => p.__altitude}
        pointRadius={(p: any) => p.__radius}
        pointResolution={8}
        onPointClick={(p: any) => onSelect(p as Reactor)}
        onPointHover={(p: any) => setHovered((p as Reactor) ?? null)}

        ringsData={rings}
        ringColor={(r: any) => r.color}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"

        arcsData={arcs}
        arcColor={(a: any) => a.color}
        arcStroke={0.3}
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={2400}
        arcAltitudeAutoScale={0.18}
      />

      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: 14, bottom: 14,
            background: 'var(--bg-elev-1)',
            border: '1px solid var(--signal)',
            padding: '8px 12px',
            pointerEvents: 'none',
            boxShadow: '0 0 16px var(--signal-glow)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
          }}
        >
          <div style={{ color: 'var(--signal)' }}>{hovered.name.toUpperCase()}</div>
          <div style={{ color: 'var(--ink-dim)', fontSize: 10, marginTop: 2 }}>
            {hovered.country} · {hovered.capGW.toFixed(1)} GW · {hovered.status.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  )
}
