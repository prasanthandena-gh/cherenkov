/* =====================================================
   RIGHT RAIL — TARGET DOSSIER (context-sensitive).
   ===================================================== */

import { useEffect, useState } from 'react'
import { useDashboard } from '../../lib/dashboard-ctx'
import { OPERATOR_HINTS } from '../../lib/briefings'
import './chrome.css'

export default function RightRail() {
  const { focus } = useDashboard()
  const r  = focus.reactor
  const ov = focus.override
  const [hintIdx, setHintIdx] = useState(0)

  useEffect(() => {
    if (r || ov) return
    const id = window.setInterval(() => {
      setHintIdx(i => (i + 1) % OPERATOR_HINTS.length)
    }, 6000)
    return () => window.clearInterval(id)
  }, [r, ov])

  return (
    <aside className="rightrail">
      <section className="rail-panel rail-fill">
        <header className="rail-head">
          <span className="rail-tag mono">
            {ov ? ov.tag : 'TARGET DOSSIER'}
          </span>
          <span className="rail-id mono">03.TGT</span>
        </header>

        {!r && !ov && (
          <div className="dossier-empty">
            <div className="dossier-name awaiting">
              AWAITING <span className="awaiting-italic">target</span>
            </div>
            <div className="dossier-cue mono">
              <span className="dossier-cue-dot"/> CLICK ANY NODE ON THE GLOBE
            </div>
            <p className="dossier-blurb">
              The globe shows every major commercial nuclear reactor on Earth — active, paused, and ghosted. Yellow nodes are running. Orange are idle. Grey are shut down or never operated.
            </p>
            <p className="dossier-blurb">
              Click any node to bring up its dossier. Hit <strong>LAUNCH SIMULATION</strong> for a full systems demo.
            </p>
            <p key={hintIdx} className="dossier-hint">
              <span className="mono dossier-note-tag">OPERATOR HINT</span>
              <em>{OPERATOR_HINTS[hintIdx]}</em>
            </p>
          </div>
        )}

        {r && !ov && (
          <div className="dossier">
            <div className={`dossier-status status-${r.status}`}>
              <span className="dossier-status-dot" />
              {r.status === 'active' ? 'ONLINE'
                : r.status === 'paused' ? 'STANDBY'
                : 'GHOST'}
            </div>
            <h3 className="dossier-name">{r.name.toUpperCase()}</h3>
            <div className="dossier-loc mono">
              {r.country} · {Math.abs(r.lat).toFixed(2)}°{r.lat >= 0 ? 'N' : 'S'} · {Math.abs(r.lng).toFixed(2)}°{r.lng >= 0 ? 'E' : 'W'}
            </div>

            <div className="dossier-grid">
              <div className="dossier-stat">
                <div className="stat-k mono">OUTPUT</div>
                <div className="stat-v">{r.capGW.toFixed(1)}<span className="stat-u">GW</span></div>
              </div>
              <div className="dossier-stat">
                <div className="stat-k mono">FIRST SYNC</div>
                <div className="stat-v">{r.year}</div>
              </div>
              {r.type && (
                <div className="dossier-stat span-2">
                  <div className="stat-k mono">TYPE</div>
                  <div className="stat-v stat-v-sm">{r.type}</div>
                </div>
              )}
            </div>

            {r.note && (
              <div className="dossier-note">
                <div className="dossier-note-tag mono">FILE</div>
                <p>{r.note}</p>
              </div>
            )}
            {r.fun && (
              <div className="dossier-field">
                <div className="dossier-note-tag mono">FIELD NOTE</div>
                <p>{r.fun}</p>
              </div>
            )}

            {r.capGW > 0 && (
              <div className="dossier-equiv">
                <div className="dossier-note-tag mono">{r.capGW.toFixed(1)} GW EQUIVALENT</div>
                <div className="equiv-row"><strong>{fmt(r.capGW * 750e3)}</strong> US homes powered</div>
                <div className="equiv-row"><strong>{(r.capGW * 12).toFixed(1)} km²</strong> solar @ 24/7</div>
                <div className="equiv-row"><strong>{Math.round(r.capGW * 330)}</strong> wind turbines</div>
                <div className="equiv-row"><strong>{(r.capGW * 2.5).toFixed(1)}</strong> coal plants displaced</div>
              </div>
            )}
          </div>
        )}

        {ov && (
          <div className="dossier">
            <h3 className="dossier-name">{ov.title.toUpperCase()}</h3>
            <div className="dossier-grid dossier-grid-1">
              {ov.rows.map(row => (
                <div key={row.k} className="dossier-stat span-2">
                  <div className="stat-k mono">{row.k}</div>
                  <div className="stat-v stat-v-sm">{row.v}</div>
                </div>
              ))}
            </div>
            {ov.note && (
              <div className="dossier-note">
                <div className="dossier-note-tag mono">NOTE</div>
                <p>{ov.note}</p>
              </div>
            )}
            {ov.field && (
              <div className="dossier-field">
                <div className="dossier-note-tag mono">FIELD NOTE</div>
                <p>{ov.field}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </aside>
  )
}

function fmt(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return Math.round(n).toString()
}
