/* =====================================================
   /sandbox — Build-a-Reactor configurator.
   Fuel × Coolant × Moderator × Enrichment → verdict + live physics + 3D preview.
   ===================================================== */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FUELS, COOLANTS, MODERATORS, lookupVerdict,
  type Fuel, type Coolant, type Moderator,
} from '../data/sandbox-recipes'
import { type Reactor } from '../data/reactors'
import { REACTOR_MODELS } from '../data/reactor-models'
import DissectableModel from '../components/DissectableModel'
import { useDashboard } from '../lib/dashboard-ctx'
import { getBriefing } from '../lib/briefings'
import {
  RouteStage, RouteHeader, FrameCorners, ControlPanel,
  Chip, ChipGroup, RangeSlider, CTABar,
  StatGrid, Stat, NoteCard, type RangeBand, type NoteKind,
} from '../components/cmd'
import './Sandbox.css'

const STORAGE_KEY = 'fc.sandbox.builds.v1'

interface SavedBuild extends Reactor {
  recipe: { fuel: Fuel; coolant: Coolant; moderator: Moderator; enrichment: number }
}

function loadBuilds(): SavedBuild[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
function saveBuilds(b: SavedBuild[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
  window.dispatchEvent(new Event('cherenkov:builds'))
}

const ENRICHMENT_BANDS = [
  { id: 'nat',   label: 'NATURAL', range: '0.7%',   tone: 'ok',     min: 0.7, max: 1   },
  { id: 'leu',   label: 'LEU',     range: '3-5%',   tone: 'signal', min: 1,   max: 5   },
  { id: 'haleu', label: 'HALEU',   range: '5-20%',  tone: 'warn',   min: 5,   max: 20  },
  { id: 'heu',   label: 'HEU',     range: '>20%',   tone: 'crit',   min: 20,  max: 90  },
] as const

const BAND_FILL: Record<typeof ENRICHMENT_BANDS[number]['tone'], string> = {
  ok:     'rgba(0, 255, 136, 0.55)',
  signal: 'rgba(250, 204, 21, 0.55)',
  warn:   'rgba(255, 140, 0, 0.55)',
  crit:   'rgba(255, 51, 51, 0.55)',
}

function bandFor(e: number) {
  return ENRICHMENT_BANDS.find(b => e <= b.max) ?? ENRICHMENT_BANDS[3]
}

const FUEL_KIND_MAP: Record<Fuel, string> = {
  u235:  'pwr-generic',
  u238:  'candu',
  pu239: 'sfr-fast',
  th232: 'msr-salt',
  dt:    'tokamak-fusion',
}

function chooseModelId(fuel: Fuel, coolant: Coolant, moderator: Moderator): string {
  if (coolant === 'sodium')   return 'sfr-fast'
  if (coolant === 'salt')     return 'msr-salt'
  if (coolant === 'helium')   return 'htgr-pebble'
  if (moderator === 'hwater') return 'candu'
  if (coolant === 'none')     return 'microreactor-sealed'
  return FUEL_KIND_MAP[fuel] ?? 'pwr-generic'
}

function kInfinity(fuel: Fuel, coolant: Coolant, moderator: Moderator, e: number): number {
  let base = 0.8
  if (fuel === 'u235')  base += 0.0 + e * 0.04
  if (fuel === 'u238')  base += -0.4
  if (fuel === 'pu239') base += 1.2
  if (fuel === 'th232') base += -0.2
  if (moderator === 'lwater')   base += 0.4
  if (moderator === 'hwater')   base += 0.7
  if (moderator === 'graphite') base += 0.5
  if (moderator === 'beryllium') base += 0.45
  if (moderator === 'none')     base += -0.5
  if (coolant === 'none')        base += -0.6
  return Math.max(0.1, Math.min(3.0, base))
}

const LEAKAGE_MAP: Record<Coolant, 'low' | 'medium' | 'high'> = {
  lwater: 'low',  hwater: 'low',  sodium: 'medium',
  salt:   'medium', helium: 'high', leadbi: 'medium', none: 'high',
}

function verdictKind(vibe: 'good' | 'bad' | 'weird'): NoteKind {
  if (vibe === 'good')  return 'field'
  if (vibe === 'bad')   return 'crit'
  return 'violet'
}

type CenterView = 'preview' | 'matrix'

export default function Sandbox() {
  const { setFocus, setNodes, setCoords, pushAlert, setRouteHint } = useDashboard()
  const brief = getBriefing('sandbox')
  const [fuel, setFuel]               = useState<Fuel>('u235')
  const [coolant, setCoolant]         = useState<Coolant>('lwater')
  const [moderator, setModerator]     = useState<Moderator>('lwater')
  const [enrichment, setEnrichment]   = useState<number>(4)
  const [builds, setBuilds]           = useState<SavedBuild[]>(loadBuilds())
  const [hint, setHint]               = useState<string | null>(null)
  const [center, setCenter]           = useState<CenterView>('preview')

  const verdict   = useMemo(() => lookupVerdict(fuel, coolant, moderator), [fuel, coolant, moderator])
  const band      = bandFor(enrichment)
  const modelId   = useMemo(() => chooseModelId(fuel, coolant, moderator), [fuel, coolant, moderator])
  const manifest  = REACTOR_MODELS[modelId] ?? REACTOR_MODELS['pwr-generic']
  const kInf      = kInfinity(fuel, coolant, moderator, enrichment)
  const leakage   = LEAKAGE_MAP[coolant]
  const burnup    = fuel === 'pu239' ? 60 : fuel === 'th232' ? 80 : enrichment * 8
  const doubling  = fuel === 'pu239' ? '15-30 y' : fuel === 'u238' ? '20-50 y' : '—'
  const kTone     = kInf > 1.2 ? 'warn' : kInf < 0.95 ? 'crit' : 'ok'

  useEffect(() => {
    setRouteHint(`BUILD · ${verdict.name.toUpperCase()} · k∞ ${kInf.toFixed(2)}`)
  }, [verdict.name, kInf, setRouteHint])
  useEffect(() => () => setRouteHint(null), [setRouteHint])

  useEffect(() => {
    setNodes(builds.length)
    setCoords({ lat: null, lng: null })
    setFocus({
      override: {
        tag: 'BUILD VERDICT',
        title: verdict.name,
        rows: [
          { k: 'CLASS',  v: verdict.real ? 'REAL DESIGN' : verdict.vibe === 'bad' ? 'DO NOT BUILD' : 'PAPER REACTOR' },
          { k: 'BAND',   v: `${band.label} · ${enrichment.toFixed(1)}%` },
          { k: 'k∞',     v: kInf.toFixed(2) },
          { k: 'LEAKAGE',v: leakage.toUpperCase() },
          { k: 'BURNUP', v: `${burnup.toFixed(0)} GWd/tU` },
          { k: 'ROSTER', v: `${builds.length} saved` },
        ],
        note: verdict.verdict,
        field: verdict.snark,
      },
    })
  }, [verdict, band, kInf, leakage, burnup, builds.length, enrichment, setFocus, setNodes, setCoords])

  useEffect(() => {
    if (!hint) return
    const id = window.setTimeout(() => setHint(null), 1800)
    return () => window.clearTimeout(id)
  }, [hint])

  const pickWithVoice = useCallback((labelText: string, picker: () => void) => () => {
    picker()
    const v = brief.voice?.pick
    if (typeof v === 'function') pushAlert(v(labelText), 'INFO')
  }, [brief, pushAlert])

  const save = (pin: boolean) => {
    const id = `custom-${Date.now()}`
    const r: SavedBuild = {
      id, name: verdict.name, country: 'Your Build',
      lat: (Math.random() - 0.5) * 60, lng: (Math.random() - 0.5) * 280,
      capGW: verdict.vibe === 'good' ? 1.0 : 0,
      status: verdict.vibe === 'good' ? 'active' : 'ghost',
      year: 2025,
      type: `${fuel.toUpperCase()} ${band.label} · ${coolant.toUpperCase()} · ${moderator.toUpperCase()}`,
      note: verdict.verdict,
      fun: verdict.snark,
      kind: 'custom',
      recipe: { fuel, coolant, moderator, enrichment },
    }
    if (pin) {
      const next = [...builds, r]
      setBuilds(next); saveBuilds(next)
      setHint(`PINNED — ${r.name.toUpperCase()}`)
      pushAlert(`▸ PINNED ON GLOBE — ${r.name.toUpperCase()}.`, 'OK')
    } else {
      setHint('SAVED')
      pushAlert(brief.voice?.save as string ?? `BUILD SAVED — ${r.name.toUpperCase()}`, 'INFO')
    }
  }

  const removeBuild = (id: string) => {
    const next = builds.filter(b => b.id !== id)
    setBuilds(next); saveBuilds(next)
    pushAlert('▸ BUILD REMOVED FROM ROSTER.', 'WARN')
  }

  const clear = () => {
    saveBuilds([]); setBuilds([])
    pushAlert('▸ SANDBOX ROSTER WIPED. CLEAN SLATE.', 'WARN')
  }

  const enrichBands: RangeBand[] = ENRICHMENT_BANDS.map(b => ({
    from: b.min,
    to: b.max,
    color: BAND_FILL[b.tone],
    label: `${b.label} (${b.range})`,
  }))

  return (
    <RouteStage variant="scroll">
      <FrameCorners
        leftTag={brief.frame.leftTag}
        leftMeta={`MODEL ${manifest.id.toUpperCase()}`}
        rightTag={brief.frame.rightTag}
        rightMeta={`BUILD ${builds.length}`}
      />
      <RouteHeader mod={brief.mod} title={brief.title} deck={brief.deck} />

      <div className="sbx-body">
        <div className="sbx-grid">
          {/* Left: pickers + enrichment */}
          <ControlPanel position="inline" tag="RECIPE" id="05.RX">
            <ChipGroup label="FUEL" columns={3}>
              {FUELS.map(o => (
                <Chip key={o.id} on={fuel === o.id} onClick={pickWithVoice(o.label, () => setFuel(o.id))}>
                  {o.label}
                </Chip>
              ))}
            </ChipGroup>
            <ChipGroup label="COOLANT" columns={3}>
              {COOLANTS.map(o => (
                <Chip key={o.id} on={coolant === o.id} onClick={pickWithVoice(o.label, () => setCoolant(o.id))}>
                  {o.label}
                </Chip>
              ))}
            </ChipGroup>
            <ChipGroup label="MODERATOR" columns={3}>
              {MODERATORS.map(o => (
                <Chip key={o.id} on={moderator === o.id} onClick={pickWithVoice(o.label, () => setModerator(o.id))}>
                  {o.label}
                </Chip>
              ))}
            </ChipGroup>
            <div className="sbx-enrich-wrap">
              <RangeSlider
                label={`ENRICHMENT · ${band.label}`}
                min={0.7}
                max={90}
                step={0.1}
                value={enrichment}
                onChange={setEnrichment}
                unit="%"
                format={v => v.toFixed(1)}
                bands={enrichBands}
              />
            </div>
          </ControlPanel>

          {/* Center: 3D preview OR design-space matrix */}
          <ControlPanel
            position="inline"
            tag={center === 'preview' ? `PREVIEW · ${manifest.name}` : `MATRIX · ${FUELS.find(f => f.id === fuel)?.label.split(' (')[0] ?? fuel}`}
            id={center === 'preview' ? `PARTS ${manifest.parts.length}` : 'COOLANT × MODERATOR'}
          >
            <ChipGroup columns={2}>
              <Chip on={center === 'preview'} onClick={() => setCenter('preview')}>3D PREVIEW</Chip>
              <Chip on={center === 'matrix'}  onClick={() => setCenter('matrix')}>MATRIX</Chip>
            </ChipGroup>
            {center === 'preview' ? (
              <div className="sbx-preview-stage">
                <DissectableModel
                  key={manifest.id}
                  manifest={manifest}
                  explode={0}
                  rotate={true}
                />
              </div>
            ) : (
              <DesignMatrix
                fuel={fuel}
                coolant={coolant}
                moderator={moderator}
                onPick={(c, m) => {
                  setCoolant(c); setModerator(m)
                  const v = brief.voice?.verdict
                  const next = lookupVerdict(fuel, c, m)
                  if (typeof v === 'function') pushAlert(v(next.name), 'INFO')
                }}
              />
            )}
          </ControlPanel>

          {/* Right: verdict + physics */}
          <div className="sbx-verdict-col">
            <NoteCard
              kind={verdictKind(verdict.vibe)}
              tag={verdict.real ? '✓ REAL DESIGN' : verdict.vibe === 'bad' ? '✗ DO NOT BUILD' : '◇ PAPER REACTOR'}
              fun={verdict.snark}
            >
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 6 }}>
                {verdict.name}
              </strong>
              {verdict.verdict}
            </NoteCard>

            <StatGrid cols={2}>
              <Stat k="k∞"        v={kInf.toFixed(2)} tone={kTone} />
              <Stat k="LEAKAGE"   v={leakage.toUpperCase()} small tone="ink" />
              <Stat k="BURNUP"    v={burnup.toFixed(0)} u="GWd/tU" small />
              <Stat k="DOUBLING"  v={doubling} small tone="ink" />
            </StatGrid>

            <CTABar
              inline
              actions={[
                { label: 'SAVE BUILD',  onClick: () => save(false) },
                { label: '▸ PIN GLOBE', onClick: () => save(true), primary: true },
              ]}
              help={hint ?? undefined}
            />
          </div>
        </div>

        {builds.length > 0 && (
          <ControlPanel position="inline" tag={`ROSTER · ${builds.length}`} id="05.ROS">
            <div className="sbx-roster-bar">
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-dim)' }}>SAVED BUILDS APPEAR ON THE COMMAND GLOBE</span>
              <button className="sbx-roster-clear mono" onClick={clear}>CLEAR ALL</button>
            </div>
            <div className="sbx-roster-grid">
              {builds.map(b => (
                <div key={b.id} className="sbx-roster-card">
                  <button className="sbx-roster-del" onClick={() => removeBuild(b.id)} title="Remove">✕</button>
                  <div className="sbx-roster-name">{b.name}</div>
                  <div className="sbx-roster-meta mono">{b.type}</div>
                  {b.fun && <p className="sbx-roster-fun">{b.fun}</p>}
                </div>
              ))}
            </div>
          </ControlPanel>
        )}
      </div>
    </RouteStage>
  )
}

/* === DESIGN MATRIX — heatmap of the (coolant × moderator) space for the current fuel === */

const VIBE_COLOR: Record<'good' | 'bad' | 'weird', string> = {
  good:  'rgba(0, 255, 136, 0.55)',
  bad:   'rgba(255, 51, 51, 0.55)',
  weird: 'rgba(163, 113, 255, 0.55)',
}

interface DesignMatrixProps {
  fuel: Fuel
  coolant: Coolant
  moderator: Moderator
  onPick: (c: Coolant, m: Moderator) => void
}

function DesignMatrix({ fuel, coolant, moderator, onPick }: DesignMatrixProps) {
  return (
    <div className="sbx-matrix">
      <table className="sbx-matrix-table">
        <thead>
          <tr>
            <th />
            {MODERATORS.map(m => (
              <th key={m.id} className="sbx-matrix-col mono" title={m.label}>
                {m.id === 'lwater' ? 'LH₂O' : m.id === 'hwater' ? 'D₂O' : m.id.slice(0, 4).toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COOLANTS.map(c => (
            <tr key={c.id}>
              <th className="sbx-matrix-row mono" title={c.label}>
                {c.id === 'lwater' ? 'LH₂O' : c.id === 'hwater' ? 'D₂O' : c.id.slice(0, 4).toUpperCase()}
              </th>
              {MODERATORS.map(m => {
                const v = lookupVerdict(fuel, c.id, m.id)
                const selected = c.id === coolant && m.id === moderator
                return (
                  <td key={m.id} className={`sbx-matrix-cell ${selected ? 'is-on' : ''}`}>
                    <button
                      className="sbx-matrix-btn"
                      style={{ background: VIBE_COLOR[v.vibe] }}
                      onClick={() => onPick(c.id, m.id)}
                      title={`${v.name} — ${v.verdict.split('.')[0]}`}
                    >
                      {v.real && <span className="sbx-matrix-real">●</span>}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="sbx-matrix-legend mono">
        <span><i style={{ background: VIBE_COLOR.good }}/>GOOD</span>
        <span><i style={{ background: VIBE_COLOR.bad }}/>BAD</span>
        <span><i style={{ background: VIBE_COLOR.weird }}/>WEIRD</span>
        <span><b>●</b> REAL DESIGN</span>
      </div>
    </div>
  )
}
