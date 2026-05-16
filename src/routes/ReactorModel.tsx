/* =====================================================
   /reactors/:id — dissectable 3D model view.
   ===================================================== */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DissectableModel from '../components/DissectableModel'
import { REACTOR_MODELS } from '../data/reactor-models'
import { REACTOR_CARDS } from '../data/reactor-family'
import { SMRS } from '../data/smrs'
import { useDashboard } from '../lib/dashboard-ctx'
import { getBriefing } from '../lib/briefings'
import type { PartInfo } from '../lib/reactor-parts'
import {
  RouteStage, RouteHeader, FrameCorners, ControlPanel,
  Chip, RangeSlider, NoteCard,
} from '../components/cmd'
import './ReactorModel.css'

export default function ReactorModelRoute() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setFocus, setNodes, setCoords, pushAlert, setRouteHint } = useDashboard()
  const brief = getBriefing('reactorModel')

  const manifest = REACTOR_MODELS[id] ?? REACTOR_MODELS['pwr-generic']
  const cardName = useMemo(() => {
    const fam = REACTOR_CARDS.find(c => c.id === id)
    if (fam) return { name: fam.name, vendor: fam.country.toUpperCase(), meta: `${fam.type} · ${fam.mwe} MWe`, blurb: fam.blurb, fun: fam.fun }
    const smr = SMRS.find(s => s.id === id)
    if (smr) return { name: smr.name, vendor: smr.vendor, meta: `${smr.type} · ${smr.mwe} MWe`, blurb: smr.blurb, fun: smr.fun }
    return { name: manifest.name, vendor: 'GENERIC', meta: manifest.kind.toUpperCase(), blurb: manifest.short, fun: '' }
  }, [id, manifest])

  const [explode, setExplode]     = useState(0)
  const [rotate, setRotate]       = useState(true)
  const [hovered, setHovered]     = useState<PartInfo | null>(null)
  const [selected, setSelected]   = useState<PartInfo | null>(null)

  useEffect(() => {
    setRouteHint(`MODEL ${cardName.name.toUpperCase()} · ${manifest.parts.length} PARTS · EXPLODE ${Math.round(explode * 100)}%`)
  }, [cardName.name, manifest.parts.length, explode, setRouteHint])
  useEffect(() => () => setRouteHint(null), [setRouteHint])

  useEffect(() => {
    setNodes(manifest.parts.length)
    setCoords({ lat: null, lng: null })
    setFocus({
      override: {
        tag: 'MODEL SPEC',
        title: cardName.name,
        rows: [
          { k: 'VENDOR',  v: cardName.vendor },
          { k: 'TYPE',    v: cardName.meta },
          { k: 'PARTS',   v: `${manifest.parts.length} subsystems` },
          { k: 'EXPLODE', v: `${Math.round(explode * 100)}%` },
        ],
        note:  cardName.blurb,
        field: cardName.fun || undefined,
      },
    })
  }, [id, manifest, explode, cardName, setFocus, setNodes, setCoords])

  const onExplode = useCallback((v: number) => {
    const last = explode
    setExplode(v)
    const voice = brief.voice?.explode
    if (typeof voice === 'function' && Math.abs(v - last) > 0.4) {
      pushAlert(voice(`${Math.round(v * 100)}%`), 'INFO')
    }
  }, [brief, explode, pushAlert])

  const onPartHover = useCallback((p: PartInfo | null) => {
    setHovered(p)
  }, [])

  const onPartClick = useCallback((p: PartInfo | null) => {
    setSelected(p)
    if (!p) return
    const voice = brief.voice?.hover
    if (typeof voice === 'function') pushAlert(voice(p.partName), 'INFO')
  }, [brief, pushAlert])

  return (
    <RouteStage variant="bleed">
      <FrameCorners
        leftTag={brief.frame.leftTag}
        leftMeta={cardName.vendor}
        rightTag={brief.frame.rightTag}
        rightMeta={`PARTS ${manifest.parts.length}`}
      />

      <header className="fc-header rmodel-head">
        <div className="fc-header__mod">{brief.mod}</div>
        <h1 className="fc-header__title">{cardName.name}</h1>
        <p className="fc-header__deck">{cardName.meta} — {brief.deck}</p>
        <Link to="/reactors" className="rmodel-back mono">← BACK TO ROSTER</Link>
      </header>

      <div className="rmodel-body">
        <div className="rmodel-3d">
          <DissectableModel
            manifest={manifest}
            explode={explode}
            rotate={rotate}
            onPartHover={onPartHover}
            onPartClick={p => onPartClick(p)}
            selectedId={selected?.partId ?? null}
          />
          <div className="rmodel-hover mono">
            {hovered ? hovered.partName.toUpperCase() : 'DRAG TO ROTATE · CLICK A PART TO INSPECT'}
          </div>
        </div>

        <div className="rmodel-side">
          <ControlPanel position="inline" tag="VIEW CONTROLS" id="02A.CTL">
            <div className="rmodel-control-row">
              <Chip on={rotate} onClick={() => setRotate(r => !r)}>↻ AUTO-ROTATE</Chip>
              <Chip onClick={() => { setExplode(0); setSelected(null) }}>◇ RESET</Chip>
              <Chip on={explode > 0.5} onClick={() => onExplode(explode > 0.5 ? 0 : 1)}>▸▸ EXPLODE</Chip>
            </div>
            <RangeSlider
              label="EXPLODE"
              min={0}
              max={1}
              step={0.01}
              value={explode}
              onChange={onExplode}
              unit="%"
              format={v => `${Math.round(v * 100)}`}
              showRange={false}
            />
          </ControlPanel>

          <ControlPanel position="inline" tag={`PARTS · ${manifest.parts.length}`} id="02A.SUB">
            <ul className="rmodel-parts-list">
              {manifest.parts.map(p => (
                <li key={p.id}>
                  <button
                    className={`rmodel-part-btn ${selected?.partId === p.id ? 'on' : ''}`}
                    onClick={() => onPartClick({ partId: p.id, partName: p.info.partName, blurb: p.info.blurb, kbSlug: p.info.kbSlug })}
                  >
                    <span className="rmodel-part-name">{p.info.partName}</span>
                    <span className="rmodel-part-arrow">▸</span>
                  </button>
                </li>
              ))}
            </ul>
          </ControlPanel>

          {selected && (
            <NoteCard kind="field" tag="SELECTED PART">
              <strong style={{ display: 'block', fontSize: 14, color: 'var(--ink)', marginBottom: 6 }}>
                {selected.partName}
              </strong>
              {selected.blurb}
              {selected.kbSlug && (
                <button className="rmodel-detail-kb" onClick={() => navigate(`/glossary?term=${selected.kbSlug}`)}>
                  GLOSSARY ▸ {selected.kbSlug}
                </button>
              )}
            </NoteCard>
          )}
        </div>
      </div>
    </RouteStage>
  )
}
