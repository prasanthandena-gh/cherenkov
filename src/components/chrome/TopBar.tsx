/* =====================================================
   TOPBAR — FISSION COMMAND brand + status indicators.
   ===================================================== */

import { useUplinkTime } from '../../lib/uplink-clock'
import { useDashboard } from '../../lib/dashboard-ctx'
import './chrome.css'

export default function TopBar() {
  const uplink = useUplinkTime()
  const { nodes, coords, defcon, setDefcon } = useDashboard()

  const lat = coords.lat == null ? '--.--'  : `${coords.lat >= 0 ? '' : '-'}${Math.abs(coords.lat).toFixed(2)}`
  const lng = coords.lng == null ? '--.--'  : `${coords.lng >= 0 ? '' : '-'}${Math.abs(coords.lng).toFixed(2)}`

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-mark">F</div>
        <div className="brand-text">
          <div className="brand-name">FISSION COMMAND</div>
          <div className="brand-sub mono">SITUATION ROOM / GLOBAL NUCLEAR GRID</div>
        </div>
      </div>

      <div className="topbar-status">
        <button
          className={`status-cell defcon defcon-${defcon}`}
          onClick={() => setDefcon(defcon > 1 ? defcon - 1 : 5)}
          title="DEFCON — click to cycle (or let the routes raise it)"
        >
          <span className="status-dot" />
          <span className="status-k mono">DEFCON</span>
          <span className="status-v">{defcon}</span>
        </button>

        <div className="status-cell">
          <span className="status-k mono">UPLINK</span>
          <span className="status-v mono">{uplink}</span>
        </div>

        <div className="status-cell">
          <span className="status-k mono">LAT</span>
          <span className="status-v mono">{lat}</span>
        </div>

        <div className="status-cell">
          <span className="status-k mono">LON</span>
          <span className="status-v mono">{lng}</span>
        </div>

        <div className="status-cell">
          <span className="status-k mono">NODES</span>
          <span className="status-v">{nodes}</span>
        </div>

        <div className="status-cell classified mono">
          // CLASSIFIED / FISSION-1
        </div>
      </div>
    </header>
  )
}
