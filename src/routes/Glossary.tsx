/* =====================================================
   /glossary — full-screen two-pane knowledge browser.
   Optional ?term=slug query opens that entry on mount.
   ===================================================== */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { KB, KB_BY_SLUG } from '../data/knowledge-base'
import { useDashboard } from '../lib/dashboard-ctx'
import { getBriefing } from '../lib/briefings'
import {
  RouteStage, RouteHeader, FrameCorners,
  Chip, ChipGroup,
} from '../components/cmd'
import './Glossary.css'

type ViewMode = 'list' | 'graph'

export default function Glossary() {
  const [params] = useSearchParams()
  const initial = params.get('term') ?? null
  const [slug, setSlug] = useState<string | null>(initial)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<ViewMode>('list')
  const { setFocus, setNodes, setCoords, pushAlert, setRouteHint } = useDashboard()
  const brief = getBriefing('glossary')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return KB
    return KB.filter(e =>
      e.term.toLowerCase().includes(q) ||
      e.short.toLowerCase().includes(q) ||
      e.slug.toLowerCase().includes(q)
    )
  }, [query])

  const current = slug ? KB_BY_SLUG[slug] : null

  useEffect(() => {
    setRouteHint(`KB · ${current?.term?.toUpperCase() ?? `${filtered.length}/${KB.length}`} · ${mode === 'graph' ? 'GRAPH' : 'LIST'}`)
  }, [current, filtered.length, mode, setRouteHint])
  useEffect(() => () => setRouteHint(null), [setRouteHint])

  useEffect(() => {
    setNodes(KB.length)
    setCoords({ lat: null, lng: null })
    setFocus({
      override: {
        tag: 'GLOSSARY',
        title: current ? current.term : 'Field Glossary',
        rows: current
          ? [
              { k: 'SLUG',    v: current.slug },
              { k: 'RELATED', v: (current.related ?? []).join(', ') || '—' },
            ]
          : [
              { k: 'ENTRIES',  v: String(KB.length) },
              { k: 'FILTERED', v: String(filtered.length) },
            ],
        note: current?.short ?? 'Click any term to expand. Inline links inside other modules open this view at the matching entry.',
      },
    })
  }, [current, filtered.length, setFocus, setNodes, setCoords])

  const pickTerm = useCallback((nextSlug: string) => {
    setSlug(nextSlug)
    const v = brief.voice?.pick
    const term = KB_BY_SLUG[nextSlug]?.term ?? nextSlug
    if (typeof v === 'function') pushAlert(v(term), 'INFO')
  }, [brief, pushAlert])

  const onSearch = useCallback((q: string) => {
    setQuery(q)
    const v = brief.voice?.search
    if (typeof v === 'function') pushAlert(v(q), 'INFO')
  }, [brief, pushAlert])

  return (
    <RouteStage variant="bleed">
      <FrameCorners
        leftTag={brief.frame.leftTag}
        leftMeta={`TERMS ${KB.length}`}
        rightTag={brief.frame.rightTag}
        rightMeta={`FILTERED ${filtered.length}`}
      />
      <RouteHeader mod={brief.mod} title={brief.title} deck={brief.deck} />

      <div className="glo-body">
        <div className="glo-search">
          <input
            className="glo-input"
            placeholder="search the glossary…"
            value={query}
            onChange={e => onSearch(e.target.value)}
          />
          <ChipGroup>
            <Chip on={mode === 'list'}  onClick={() => setMode('list')}>LIST</Chip>
            <Chip on={mode === 'graph'} onClick={() => setMode('graph')}>GRAPH</Chip>
          </ChipGroup>
          <span className="glo-count mono">{filtered.length} / {KB.length}</span>
        </div>

        <div className="glo-grid">
          {mode === 'graph' ? (
            <KbGraph activeSlug={slug} onPick={pickTerm} />
          ) : (
            <ul className="glo-list">
              {filtered.map(e => (
                <li key={e.slug}>
                  <button
                    className={`glo-item ${slug === e.slug ? 'on' : ''}`}
                    onClick={() => pickTerm(e.slug)}
                  >
                    <span className="glo-item-term">{e.term}</span>
                    <span className="glo-item-short">{e.short}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="glo-empty">No matches. The glossary is finite. Try fewer letters.</li>
              )}
            </ul>
          )}

          <div className="glo-detail">
            {!current && (
              <div className="glo-empty-detail">
                <div className="glo-empty-tag mono">▸ NO ENTRY</div>
                <p>Pick a term from the list. Or search. The glossary remembers your filter.</p>
              </div>
            )}
            {current && (
              <article className="glo-entry">
                <div className="glo-entry-tag mono">ENTRY · {current.slug}</div>
                <h2 className="glo-entry-term">{current.term}</h2>
                <p className="glo-entry-short">{current.short}</p>
                <p className="glo-entry-long">{current.long}</p>
                {current.related && current.related.length > 0 && (
                  <div className="glo-related">
                    <ChipGroup label="RELATED">
                      {current.related.map(r => (
                        <Chip key={r} tone="signal" on onClick={() => pickTerm(r)}>
                          {KB_BY_SLUG[r]?.term ?? r}
                        </Chip>
                      ))}
                    </ChipGroup>
                  </div>
                )}
              </article>
            )}
          </div>
        </div>
      </div>
    </RouteStage>
  )
}

/* === KbGraph — concentric-ring layout colored by connectivity === */

interface KbGraphProps {
  activeSlug: string | null
  onPick: (slug: string) => void
}

function KbGraph({ activeSlug, onPick }: KbGraphProps) {
  const layout = useMemo(() => {
    // Count degree (related[].length, both directions)
    const degree: Record<string, number> = {}
    for (const e of KB) {
      degree[e.slug] = (degree[e.slug] ?? 0) + (e.related?.length ?? 0)
      for (const r of e.related ?? []) {
        degree[r] = (degree[r] ?? 0) + 1
      }
    }
    const sorted = [...KB].sort((a, b) => (degree[b.slug] ?? 0) - (degree[a.slug] ?? 0))

    const W = 720, H = 520
    const cx = W / 2, cy = H / 2
    const positions: Record<string, { x: number; y: number; r: number }> = {}

    // Inner ring: top 6 most-connected → r=80; middle: next 14 → r=170; outer: rest → r=240
    const tiers: { items: typeof KB; radius: number; nodeR: number }[] = [
      { items: sorted.slice(0, 6),                radius: 80,  nodeR: 8 },
      { items: sorted.slice(6, 20),               radius: 170, nodeR: 6 },
      { items: sorted.slice(20),                  radius: 240, nodeR: 5 },
    ]
    for (const tier of tiers) {
      const n = tier.items.length
      tier.items.forEach((e, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        positions[e.slug] = {
          x: cx + Math.cos(angle) * tier.radius,
          y: cy + Math.sin(angle) * tier.radius,
          r: tier.nodeR,
        }
      })
    }

    // Edges (dedup by sorted key)
    const seen = new Set<string>()
    const edges: { from: string; to: string }[] = []
    for (const e of KB) {
      for (const r of e.related ?? []) {
        const key = [e.slug, r].sort().join('|')
        if (seen.has(key)) continue
        seen.add(key)
        if (positions[e.slug] && positions[r]) edges.push({ from: e.slug, to: r })
      }
    }

    return { W, H, positions, edges }
  }, [])

  return (
    <div className="glo-graph-wrap">
      <svg viewBox={`0 0 ${layout.W} ${layout.H}`} className="glo-graph-svg" preserveAspectRatio="xMidYMid meet">
        {/* concentric guide rings */}
        {[80, 170, 240].map(r => (
          <circle key={r} cx={layout.W / 2} cy={layout.H / 2} r={r} fill="none" stroke="var(--rule)" strokeDasharray="1 3" />
        ))}
        {/* edges */}
        {layout.edges.map(({ from, to }, i) => {
          const a = layout.positions[from]
          const b = layout.positions[to]
          const isActive = activeSlug === from || activeSlug === to
          return (
            <line
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isActive ? 'var(--signal)' : 'var(--rule-strong)'}
              strokeWidth={isActive ? 1.5 : 0.8}
              opacity={isActive ? 0.9 : 0.4}
            />
          )
        })}
        {/* nodes */}
        {KB.map(e => {
          const p = layout.positions[e.slug]
          if (!p) return null
          const isActive = activeSlug === e.slug
          return (
            <g key={e.slug} className="glo-graph-node" onClick={() => onPick(e.slug)}>
              <circle
                cx={p.x} cy={p.y}
                r={p.r + (isActive ? 3 : 0)}
                fill={isActive ? 'var(--signal)' : 'var(--bg-elev-2)'}
                stroke={isActive ? 'var(--signal)' : 'var(--rule-signal)'}
                strokeWidth={isActive ? 2 : 1}
                style={{ filter: isActive ? 'drop-shadow(0 0 8px var(--signal-glow))' : undefined, cursor: 'pointer' }}
              />
              <text
                x={p.x}
                y={p.y + p.r + 12}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={p.r >= 7 ? 9 : 8}
                fill={isActive ? 'var(--signal)' : 'var(--ink-dim)'}
                style={{ pointerEvents: 'none', letterSpacing: '0.08em' }}
              >
                {e.term.length > 14 ? e.term.slice(0, 13) + '…' : e.term}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="glo-graph-legend mono">
        {KB.length} terms · {layout.edges.length} links · CLICK A NODE
      </div>
    </div>
  )
}
