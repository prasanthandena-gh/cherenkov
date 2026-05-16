/* =====================================================
   /roadmap — horizontal pan + mini-map + HYPE/LIKELY slip lines.
   ===================================================== */

import { useCallback, useEffect, useRef, useState } from 'react'
import { TIMELINE } from '../data/timeline'
import { useDashboard } from '../lib/dashboard-ctx'
import { getBriefing } from '../lib/briefings'
import {
  RouteStage, RouteHeader, FrameCorners, ControlPanel,
  Chip, ChipGroup, RangeSlider,
} from '../components/cmd'
import './Roadmap.css'

const MIN = 2024
const MAX = 2056
const TRACK_WIDTH = 1600

const TONE: Record<string, string> = {
  fission: 'var(--signal)',
  smr:     'var(--ok)',
  fusion:  '#ff4081',
  grid:    'var(--violet)',
}

export default function Roadmap() {
  const { setFocus, setNodes, setCoords, pushAlert, setRouteHint } = useDashboard()
  const brief = getBriefing('roadmap')
  const [hype, setHype] = useState(true)
  const [year, setYear] = useState(2026)
  const [showSlip, setShowSlip] = useState(true)
  const [showPrereqs, setShowPrereqs] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const passed = TIMELINE.filter(m => (hype ? m.hype : m.likely) <= year).length
    setRouteHint(`${hype ? 'HYPE' : 'LIKELY'} · CURSOR ${year} · ${passed}/${TIMELINE.length} PASSED`)
  }, [hype, year, setRouteHint])
  useEffect(() => () => setRouteHint(null), [setRouteHint])

  useEffect(() => {
    setNodes(TIMELINE.length)
    setCoords({ lat: null, lng: null })
    setFocus({
      override: {
        tag: 'ROADMAP',
        title: hype ? 'HYPE TIMELINE' : 'LIKELY TIMELINE',
        rows: [
          { k: 'MILESTONES', v: `${TIMELINE.length} events` },
          { k: 'SPAN',       v: `${MIN}–${MAX}` },
          { k: 'CURSOR',     v: String(year) },
          { k: 'PASSED',     v: `${TIMELINE.filter(m => (hype ? m.hype : m.likely) <= year).length}` },
        ],
        note: hype
          ? 'Press releases and aspirations. Real-world dates often slip.'
          : 'Hype dates shifted by realistic slip factors.',
      },
    })
  }, [hype, year, setFocus, setNodes, setCoords])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let dragging = false
    let startX = 0, startScroll = 0
    const onDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.rm-card')) return
      dragging = true; el.classList.add('dragging')
      startX = e.clientX; startScroll = el.scrollLeft
    }
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      el.scrollLeft = startScroll - (e.clientX - startX)
    }
    const onUp = () => { dragging = false; el.classList.remove('dragging') }
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth
      setScrollPct(max > 0 ? el.scrollLeft / max : 0)
    }
    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('scroll', onScroll)
    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('scroll', onScroll)
    }
  }, [])

  const onMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current
    if (!el) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const max = el.scrollWidth - el.clientWidth
    el.scrollLeft = pct * max
  }

  const viewWidthYears = (() => {
    const el = trackRef.current
    if (!el) return MAX - MIN
    return ((MAX - MIN) * el.clientWidth) / el.scrollWidth
  })()
  const viewStartYear = MIN + scrollPct * (MAX - MIN - viewWidthYears)

  const pickMode = useCallback((nextHype: boolean) => {
    setHype(nextHype)
    const v = brief.voice?.mode
    if (typeof v === 'function') pushAlert(v(nextHype ? 'HYPE' : 'LIKELY'), 'INFO')
  }, [brief, pushAlert])

  const onCardClick = useCallback((label: string, hypeYear: number, likelyYear: number) => {
    const slip = likelyYear - hypeYear
    const v = brief.voice?.pick
    if (typeof v === 'function') pushAlert(v(label, slip), slip > 0 ? 'WARN' : 'OK')
  }, [brief, pushAlert])

  return (
    <RouteStage variant="pan">
      <FrameCorners
        leftTag={brief.frame.leftTag}
        leftMeta={`${TIMELINE.length} MILESTONES`}
        rightTag={brief.frame.rightTag}
        rightMeta={`CURSOR ${year}`}
      />
      <RouteHeader mod={brief.mod} title={brief.title} deck={brief.deck} />

      <div className="rm-body">
        <ControlPanel position="inline" tag="VIEW · DRAG TRACK TO PAN" id="08.CTL">
          <div className="rm-ctl-row">
            <ChipGroup>
              <Chip on={hype}  onClick={() => pickMode(true)}>HYPE</Chip>
              <Chip on={!hype} onClick={() => pickMode(false)}>LIKELY</Chip>
            </ChipGroup>
            <Chip tone="warn" on={showSlip}    onClick={() => setShowSlip(s => !s)}>◇ SHOW SLIP</Chip>
            <Chip tone="ok"   on={showPrereqs} onClick={() => setShowPrereqs(p => !p)}>↳ PREREQS</Chip>
            <div className="rm-year-slider">
              <RangeSlider
                label="YEAR CURSOR"
                min={MIN}
                max={MAX}
                value={year}
                onChange={setYear}
                showRange={true}
              />
            </div>
          </div>
        </ControlPanel>

        <div className="rm-minimap" onClick={onMiniMapClick} title="Click anywhere to jump">
          <div className="rm-minimap-line"/>
          {[2024, 2030, 2035, 2040, 2045, 2050, 2056].map(y => {
            const x = ((y - MIN) / (MAX - MIN)) * 100
            return <span key={y} className="rm-minimap-tick mono" style={{ left: `${x}%` }}>{y}</span>
          })}
          {TIMELINE.map(m => {
            const x = (((hype ? m.hype : m.likely) - MIN) / (MAX - MIN)) * 100
            return <div key={`mm-${m.label}`} className="rm-minimap-dot"
              style={{ left: `${x}%`, color: TONE[m.tone] }} />
          })}
          <div className="rm-minimap-window"
            style={{
              left: `${((viewStartYear - MIN) / (MAX - MIN)) * 100}%`,
              width: `${(viewWidthYears / (MAX - MIN)) * 100}%`,
            }} />
        </div>

        <div className="rm-track-wrap">
          <div className="rm-track" ref={trackRef}>
            <div className="rm-track-inner" style={{ width: `${TRACK_WIDTH}px` }}>
              <div className="rm-line"/>
              <div className="rm-now" style={{ left: `${((year - MIN) / (MAX - MIN)) * 100}%` }}>
                <span className="rm-now-tag mono">{year}</span>
              </div>

              {[2024, 2026, 2028, 2030, 2032, 2034, 2036, 2038, 2040, 2042, 2044, 2046, 2048, 2050, 2052, 2054, 2056].map(y => {
                const x = ((y - MIN) / (MAX - MIN)) * 100
                return (
                  <div key={y} className="rm-tick mono" style={{ left: `${x}%` }}>
                    <span>{y}</span>
                  </div>
                )
              })}

              {showPrereqs && (
                <svg className="rm-prereq-svg" viewBox={`0 0 ${TRACK_WIDTH} 320`} preserveAspectRatio="none">
                  <defs>
                    <marker id="rm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ok)" />
                    </marker>
                  </defs>
                  {TIMELINE.flatMap(m => {
                    if (!m.prereqs) return []
                    const evChild = hype ? m.hype : m.likely
                    const xChild = ((evChild - MIN) / (MAX - MIN)) * TRACK_WIDTH
                    const yChild = m.side === 'above' ? 130 : 190
                    return m.prereqs.flatMap(pname => {
                      const parent = TIMELINE.find(p => p.label === pname)
                      if (!parent) return []
                      const evParent = hype ? parent.hype : parent.likely
                      const xParent  = ((evParent - MIN) / (MAX - MIN)) * TRACK_WIDTH
                      const yParent  = parent.side === 'above' ? 130 : 190
                      const midX = (xParent + xChild) / 2
                      const midY = Math.min(yParent, yChild) - 30
                      return [
                        <path
                          key={`${parent.label}->${m.label}`}
                          d={`M ${xParent} ${yParent} Q ${midX} ${midY} ${xChild} ${yChild}`}
                          fill="none"
                          stroke="var(--ok)"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                          opacity="0.7"
                          markerEnd="url(#rm-arrow)"
                        />,
                      ]
                    })
                  })}
                </svg>
              )}

              {showSlip && TIMELINE.map(m => {
                if (m.hype === m.likely) return null
                const x1 = ((m.hype   - MIN) / (MAX - MIN)) * 100
                const x2 = ((m.likely - MIN) / (MAX - MIN)) * 100
                const left   = Math.min(x1, x2)
                const right  = Math.max(x1, x2)
                return (
                  <div key={`slip-${m.label}`}
                    className={`rm-slip-bar rm-slip-${m.side}`}
                    style={{ left: `${left}%`, width: `${right - left}%`, color: TONE[m.tone] }} />
                )
              })}

              {TIMELINE.map(m => {
                const ev = hype ? m.hype : m.likely
                const x = ((ev - MIN) / (MAX - MIN)) * 100
                const passed = ev <= year
                const c = TONE[m.tone]
                return (
                  <div
                    key={m.label}
                    className={`rm-mark rm-mark-${m.side} ${passed ? 'passed' : ''}`}
                    style={{ left: `${x}%`, color: c }}
                    title={m.detail}
                    onMouseEnter={() => onCardClick(m.label, m.hype, m.likely)}
                  >
                    <div className="rm-diamond"/>
                    <div className="rm-card">
                      <div className="rm-card-year mono">{ev}{m.hype !== m.likely && <span className="rm-card-slip"> · slip {m.likely - m.hype}y</span>}</div>
                      <div className="rm-card-name">{m.label}</div>
                      <div className="rm-card-detail">{m.detail}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </RouteStage>
  )
}
