/* =====================================================
   TICKER — bottom scrolling event marquee.
   When a route writes `routeHint` to DashboardContext,
   it's spliced in as a styled ▸ LIVE · segment.
   ===================================================== */

import { useDashboard } from '../../lib/dashboard-ctx'
import './chrome.css'

const ITEMS = [
  '▸ CHANNEL OPEN',
  '▸ UPLINK ESTABLISHED // 416 NODES TRACKED',
  '▸ VOGTLE-4 SYNCED TO US SOUTHEAST GRID',
  '▸ BARAKAH UNIT 4 ONLINE // UAE 4 OF 4 ACTIVE',
  '▴ ZAPORIZHZHIA — STATUS COLD SHUTDOWN',
  '▸ OLKILUOTO-3 STABLE @ 1,600 MWe',
  '▸ KASHIWAZAKI-7 RESTART CANDIDATE',
  '▸ HINKLEY POINT C DOME INSTALL T-MINUS 14M',
  '▸ NATRIUM DEMO — FIRST CONCRETE ANTICIPATED',
  '▸ HALEU CASCADE — CENTRUS OPERATIONAL',
  '▴ ATHENS, GA — GRID FREQUENCY 60.001 Hz',
  '▸ ITER VACUUM VESSEL — SECTOR 6 INSTALLED',
]

const SEP = '   '
const STATIC_STREAM = ITEMS.join(SEP)

export default function Ticker() {
  const { routeHint } = useDashboard()
  const livePrefix = routeHint ? `▸ LIVE · ${routeHint}` : null

  // One "cycle" = [live? + static]. The track holds two cycles for seamless loop.
  return (
    <div className="ticker">
      <div className="ticker-track">
        <Cycle live={livePrefix} stream={STATIC_STREAM} />
        <Cycle live={livePrefix} stream={STATIC_STREAM} />
      </div>
    </div>
  )
}

function Cycle({ live, stream }: { live: string | null; stream: string }) {
  return (
    <span className="ticker-stream">
      {live && <span className="ticker-live">{live}</span>}
      {live && <span>{SEP}</span>}
      {stream}
      <span>{SEP}</span>
    </span>
  )
}
