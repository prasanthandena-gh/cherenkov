/* =====================================================
   /fission — interactive reactor sim.
   Thin controller. Physics in lib/fission-physics.ts,
   rendering in lib/fission-renderer.ts, scenarios in
   data/fission-scenarios.ts.
   ===================================================== */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDashboard } from '../lib/dashboard-ctx'
import { getBriefing } from '../lib/briefings'
import { SCENARIOS, type Scenario } from '../data/fission-scenarios'
import {
  W, H, ROD_TOP_Y, ROD_LENGTH, ROD_WIDTH,
  createState, step, samplePower, fireNeutronAt,
  type Rod, type SimState,
} from '../lib/fission-physics'
import { drawFrame } from '../lib/fission-renderer'
import {
  RouteStage, RouteHeader, FrameCorners, ControlPanel,
  Chip, ChipGroup, CTABar, StatGrid, Stat, NoteCard, Sparkline,
} from '../components/cmd'
import './Fission.css'

export default function Fission() {
  const { setFocus, setNodes, setCoords, pushAlert, setRouteHint, setDefcon } = useDashboard()
  const brief = getBriefing('fission')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shellRef  = useRef<HTMLDivElement>(null)

  const stateRef = useRef<SimState>(createState(220))
  const rodsRef  = useRef<Rod[]>([
    { x: W * 0.22, insertion: 0.5 },
    { x: W * 0.50, insertion: 0.5 },
    { x: W * 0.78, insertion: 0.5 },
  ])
  const pausedRef       = useRef<boolean>(false)
  const supercritAnnouncedRef = useRef<boolean>(false)
  const draggingRodRef  = useRef<number | null>(null)
  const dragOffsetRef   = useRef<number>(0)

  const [, force]           = useState(0)
  const [scenario, setScn]  = useState<Scenario>('reactor')
  const [paused, setPaused] = useState(false)

  // Reset state when scenario changes
  useEffect(() => {
    const cfg = SCENARIOS[scenario]
    stateRef.current = createState(220)
    rodsRef.current.forEach(r => { r.insertion = cfg.rodInsertion })
    supercritAnnouncedRef.current = false
    setDefcon(4)
    const v = brief.voice?.scenario
    if (typeof v === 'function') pushAlert(v(cfg.label), scenario === 'bomb' ? 'CRIT' : 'INFO')
    force(n => n + 1)
  }, [scenario, brief, pushAlert, setDefcon])

  // Live routeHint for the ticker (1Hz so it doesn't spam re-renders)
  useEffect(() => {
    const id = window.setInterval(() => {
      const S = stateRef.current
      const cfg = SCENARIOS[scenario]
      setRouteHint(`${cfg.label} · k-eff ${S.kEff.toFixed(2)} · GEN ${S.genMax}${S.melted ? ' · MELTED' : ''}`)
    }, 1000)
    return () => window.clearInterval(id)
  }, [scenario, setRouteHint])
  useEffect(() => () => { setRouteHint(null); setDefcon(4) }, [setRouteHint, setDefcon])

  useEffect(() => { pausedRef.current = paused }, [paused])

  // Dossier
  useEffect(() => {
    const cfg = SCENARIOS[scenario]
    setNodes(stateRef.current.atoms.filter(a => a.state !== 'gone').length)
    setCoords({ lat: null, lng: null })
    setFocus({
      override: {
        tag: 'REACTOR STATE',
        title: cfg.label,
        rows: [
          { k: 'FUEL',  v: cfg.fuelLabel },
          { k: 'BASE k', v: cfg.baseK.toFixed(2) },
          { k: 'RODS',  v: cfg.rodVisible ? 'INSTALLED' : 'NONE' },
          { k: 'STATE', v: stateRef.current.melted ? 'MELTED' : 'OPERATING' },
        ],
        note:  cfg.blurb,
        field: cfg.snark,
      },
    })
  }, [scenario, setFocus, setNodes, setCoords])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    canvas.width  = W * dpr
    canvas.height = H * dpr
    canvas.style.width  = `${W}px`
    canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    let raf = 0
    let last = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(40, now - last)
      last = now
      const cfg = SCENARIOS[scenario]
      const S = stateRef.current
      if (!pausedRef.current && !S.melted) {
        step(S, rodsRef.current, cfg, dt, now, () => {
          pushAlert(brief.voice?.meltdown as string ?? '▸ MELTDOWN.', 'CRIT')
          setDefcon(1, 'CORE MELT')
        })
      }
      // supercritical voice + DEFCON (one-shot per scenario load)
      if (!supercritAnnouncedRef.current && S.kEff > 1.4 && !S.melted) {
        supercritAnnouncedRef.current = true
        pushAlert(brief.voice?.supercrit as string ?? '▸ SUPERCRITICAL.', 'WARN')
        setDefcon(2, 'FISSION SUPERCRITICAL')
      }
      samplePower(S, now)
      drawFrame(ctx, S, rodsRef.current, cfg, scenario, now)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [scenario, brief, pushAlert, setDefcon])

  // Re-render React shell at 5 Hz so the stat overlay tracks the sim
  useEffect(() => {
    const id = window.setInterval(() => force(n => n + 1), 200)
    return () => window.clearInterval(id)
  }, [])

  // === Mouse interactions ===
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cfg = SCENARIOS[scenario]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (cfg.rodVisible) {
      for (let i = 0; i < rodsRef.current.length; i++) {
        const rod = rodsRef.current[i]
        if (Math.abs(x - rod.x) < ROD_WIDTH * 1.5) {
          draggingRodRef.current = i
          const tipY = ROD_TOP_Y + ROD_LENGTH * rod.insertion
          dragOffsetRef.current = y - tipY
          return
        }
      }
    }

    fireNeutronAt(stateRef.current, x, y, performance.now())
  }
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingRodRef.current === null) return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const rod = rodsRef.current[draggingRodRef.current]
    const tipY = y - dragOffsetRef.current
    rod.insertion = Math.max(0, Math.min(1, (tipY - ROD_TOP_Y) / ROD_LENGTH))
    force(n => n + 1)
  }
  const onMouseUp = () => { draggingRodRef.current = null }
  const cursorFor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cfg = SCENARIOS[scenario]
    if (!cfg.rodVisible) return 'crosshair'
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    for (const rod of rodsRef.current) {
      if (Math.abs(x - rod.x) < ROD_WIDTH * 1.5) return 'ns-resize'
    }
    return 'crosshair'
  }

  // === Actions ===
  const scram = useCallback(() => {
    const cfg = SCENARIOS[scenario]
    if (!cfg.rodVisible) return
    rodsRef.current.forEach(r => { r.insertion = 1.0 })
    pushAlert('▸ SCRAM — ALL RODS INSERTED.', 'WARN')
    force(n => n + 1)
  }, [scenario, pushAlert])

  const reset = useCallback(() => {
    setScn(scenario)
    pushAlert(brief.voice?.reset as string ?? '▸ CORE RESET.', 'OK')
    force(n => n + 1)
  }, [scenario, brief, pushAlert])

  const jettison = useCallback(() => {
    shellRef.current?.classList.add('fc-shake')
    window.setTimeout(() => shellRef.current?.classList.remove('fc-shake'), 400)
    pushAlert(brief.voice?.jettison as string ?? '▸ CORE JETTISONED. (KIDDING.)', 'INFO')
  }, [brief, pushAlert])

  const S = stateRef.current
  const cfg = SCENARIOS[scenario]
  const mev = S.fissions * 200
  const avgRod = cfg.rodVisible
    ? rodsRef.current.reduce((s, r) => s + r.insertion, 0) / rodsRef.current.length
    : 0
  const power = S.powerHistory[S.powerHistory.length - 1] ?? 0
  const tempC = Math.round(280 + S.temp * 700)
  const mwe   = Math.round(power * 0.3)
  const kTone = S.kEff > 1.5 ? 'crit' : S.kEff > 1.05 ? 'warn' : S.kEff < 0.95 ? 'ink' : 'ok'
  const tTone = S.temp > 0.8 ? 'crit' : S.temp > 0.5 ? 'warn' : 'ok'

  return (
    <RouteStage variant="bleed">
      <FrameCorners
        leftTag={brief.frame.leftTag}
        leftMeta={cfg.fuelLabel}
        rightTag={brief.frame.rightTag}
        rightMeta={`GEN ${String(S.genMax).padStart(2, '0')}`}
      />
      <RouteHeader mod={brief.mod} title={brief.title} deck={brief.deck} />

      <div className="fsn-body" ref={shellRef}>
        <ChipGroup label="SCENARIO">
          {(Object.keys(SCENARIOS) as Scenario[]).map(k => (
            <Chip
              key={k}
              tone={SCENARIOS[k].tone}
              on={scenario === k}
              onClick={() => setScn(k)}
            >
              {SCENARIOS[k].label}
            </Chip>
          ))}
          <Chip tone="crit" onClick={jettison} title="Does absolutely nothing">[ JETTISON CORE ]</Chip>
        </ChipGroup>

        <div className="fsn-grid">
          {/* Left: canvas */}
          <div className="fsn-canvas-wrap">
            <canvas
              ref={canvasRef}
              className="fsn-canvas"
              onMouseDown={onMouseDown}
              onMouseMove={(e) => {
                onMouseMove(e)
                e.currentTarget.style.cursor = cursorFor(e)
              }}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
            <div className="fsn-canvas-overlay mono">
              {cfg.rodVisible ? 'DRAG RODS · CLICK EDGE TO FIRE NEUTRON' : 'CLICK ANYWHERE TO FIRE NEUTRON'}
            </div>
          </div>

          {/* Right: panels */}
          <div className="fsn-side">
            <ControlPanel position="inline" tag="LIVE STATE" id="04.STA">
              <StatGrid cols={2}>
                <Stat k="k-EFF"    v={S.kEff.toFixed(2)}      tone={kTone} small />
                <Stat k="FISSIONS" v={S.fissions.toLocaleString()} small tone="ink" />
                <Stat k="NEUTRONS" v={String(S.neutrons.length)} small tone="ink" />
                <Stat k="GEN MAX"  v={String(S.genMax)}          small tone="ink" />
                <Stat k="MeV"      v={mev.toLocaleString()}      small tone="ink" />
                <Stat k="MWe"      v={String(mwe)}                small />
                <Stat k="T °C"     v={String(tempC)}              tone={tTone} small />
                <Stat k="RODS"     v={cfg.rodVisible ? `${(avgRod * 100).toFixed(0)}%` : '—'} small tone="ink" />
              </StatGrid>
            </ControlPanel>

            <ControlPanel position="inline" tag={`POWER · FISSIONS / SEC · ${power}`} id="04.PWR">
              <Sparkline
                data={S.powerHistory}
                width={260}
                height={60}
                tone={S.kEff > 1.5 ? 'crit' : 'signal'}
              />
            </ControlPanel>

            <NoteCard kind={cfg.tone === 'crit' ? 'crit' : cfg.tone === 'warn' ? 'warn' : cfg.tone === 'ok' ? 'field' : 'note'}
              tag={`SCENARIO · ${cfg.label}`}
              fun={cfg.snark}
            >{cfg.blurb}</NoteCard>
          </div>
        </div>
      </div>

      <CTABar
        actions={[
          { label: '▼ SCRAM',     onClick: scram,                    tone: 'warn', disabled: !cfg.rodVisible },
          { label: paused ? '▸ RESUME' : '⏸ PAUSE', onClick: () => setPaused(p => !p) },
          { label: '↻ RESET',     onClick: reset },
          { label: '▸ LAUNCH SIMULATION', onClick: () => { stateRef.current.fissions = 0 }, primary: true },
        ]}
        help={cfg.rodVisible ? 'DRAG RODS UP TO RELEASE NEUTRONS, DOWN TO ABSORB' : 'NO RODS. WATCH IT GO.'}
      />
    </RouteStage>
  )
}
