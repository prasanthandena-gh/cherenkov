/* =====================================================
   /reactors — yellow card gallery of reactor designs.
   Clicking a card navigates to /reactors/:id for dissection.
   ===================================================== */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { REACTOR_CARDS } from '../data/reactor-family'
import { SMRS } from '../data/smrs'
import { REACTOR_MODELS } from '../data/reactor-models'
import { useDashboard } from '../lib/dashboard-ctx'
import { getBriefing } from '../lib/briefings'
import {
  RouteStage, RouteHeader, FrameCorners,
  Chip, ChipGroup,
} from '../components/cmd'
import { GlyphFor } from '../components/glyphs/reactor-glyphs'
import './Reactors.css'

interface CardModel {
  id: string
  name: string
  vendor: string
  type: string
  mwe: number
  country: string
  gen?: string
  blurb: string
  fun: string
  modelId: string
}

function buildCards(): CardModel[] {
  const fam: CardModel[] = REACTOR_CARDS.map(c => ({
    id: c.id, name: c.name, vendor: c.country.toUpperCase(),
    type: c.type, mwe: c.mwe, country: c.country, gen: c.gen,
    blurb: c.blurb, fun: c.fun,
    modelId: REACTOR_MODELS[c.id]?.id ?? 'pwr-generic',
  }))
  const smrs: CardModel[] = SMRS.map(s => ({
    id: s.id, name: s.name, vendor: s.vendor,
    type: s.type, mwe: s.mwe, country: s.country,
    blurb: s.blurb, fun: s.fun,
    modelId: REACTOR_MODELS[s.id]?.id ?? 'smr-integral',
  }))
  return [...fam, ...smrs]
}

type Filter = 'all' | 'II' | 'III' | 'III+' | 'IV' | 'SMR'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',  label: 'ALL'    },
  { id: 'II',   label: 'GEN II' },
  { id: 'III',  label: 'GEN III' },
  { id: 'III+', label: 'GEN III+' },
  { id: 'IV',   label: 'GEN IV' },
  { id: 'SMR',  label: 'SMR'    },
]

function matches(card: CardModel, f: Filter): boolean {
  if (f === 'all') return true
  if (f === 'SMR') return !card.gen
  return card.gen === f
}

export default function Reactors() {
  const { setFocus, setNodes, setCoords, pushAlert, setRouteHint } = useDashboard()
  const brief = getBriefing('reactors')
  const cards = useMemo(buildCards, [])
  const [filter, setFilter] = useState<Filter>('all')

  const visible = useMemo(() => cards.filter(c => matches(c, filter)), [cards, filter])

  useEffect(() => {
    setRouteHint(`ROSTER ${visible.length}/${cards.length} · ${filter === 'all' ? 'ALL' : filter}`)
  }, [visible.length, cards.length, filter, setRouteHint])
  useEffect(() => () => setRouteHint(null), [setRouteHint])

  useEffect(() => {
    setNodes(visible.length)
    setCoords({ lat: null, lng: null })
    setFocus({
      override: {
        tag: 'REACTOR ROSTER',
        title: 'Reactor Models',
        rows: [
          { k: 'TOTAL',    v: `${cards.length} designs` },
          { k: 'VISIBLE',  v: `${visible.length}` },
          { k: 'GEN III+', v: `${cards.filter(c => c.gen === 'III+').length}` },
          { k: 'GEN IV',   v: `${cards.filter(c => c.gen === 'IV').length}` },
          { k: 'SMR',      v: `${cards.filter(c => !c.gen).length}` },
        ],
        note: 'Click any card to enter the dissection rig. Drag to rotate, EXPLODE to separate parts, click a part for its label.',
      },
    })
  }, [cards, visible.length, setNodes, setCoords, setFocus])

  const pickFilter = useCallback((f: Filter, label: string) => {
    setFilter(f)
    const v = brief.voice?.filter
    if (typeof v === 'function') pushAlert(v(label), 'INFO')
  }, [brief, pushAlert])

  return (
    <RouteStage variant="scroll">
      <FrameCorners
        leftTag={brief.frame.leftTag}
        leftMeta={brief.frame.leftMeta}
        rightTag={brief.frame.rightTag}
        rightMeta={`SHOWING ${visible.length}/${cards.length}`}
      />
      <RouteHeader mod={brief.mod} title={brief.title} deck={brief.deck} />

      <div className="reactors-body">
        <ChipGroup label="FILTER">
          {FILTERS.map(f => (
            <Chip key={f.id} on={filter === f.id} onClick={() => pickFilter(f.id, f.label)}>
              {f.label}
            </Chip>
          ))}
        </ChipGroup>

        <div className="reactors-grid">
          {visible.map(c => (
            <Link
              key={c.id}
              to={`/reactors/${c.id}`}
              className="rcard"
              onClick={() => {
                const v = brief.voice?.pickFamily
                if (typeof v === 'function') pushAlert(v(c.name), 'OK')
              }}
            >
              <div className="rcard-vendor mono">{c.vendor}</div>
              {c.gen && <div className="rcard-gen mono">GEN {c.gen}</div>}
              <GlyphFor modelId={c.modelId} className="rcard-glyph" />
              <div className="rcard-name">{c.name}</div>
              <div className="rcard-meta mono">
                <span>{c.type}</span>
                <span>·</span>
                <span>{c.mwe} MWe</span>
              </div>
              {c.fun && <div className="rcard-fun">{c.fun}</div>}
              <div className="rcard-cta mono">▸ INSPECT</div>
            </Link>
          ))}
          {visible.length === 0 && (
            <div className="reactors-empty">
              No designs match this filter. The roster is finite. Try ALL.
            </div>
          )}
        </div>
      </div>
    </RouteStage>
  )
}
