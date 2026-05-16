/* =====================================================
   MODULE NAV — vertical left-rail nav.
   Also registers keyboard shortcuts (1-9).
   ===================================================== */

import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './chrome.css'

const MODULES = [
  { path: '/',          label: 'COMMAND',  key: '1' },
  { path: '/reactors',  label: 'REACTORS', key: '2' },
  { path: '/fusion',    label: 'FUSION',   key: '3' },
  { path: '/fission',   label: 'FISSION',  key: '4' },
  { path: '/sandbox',   label: 'SANDBOX',  key: '5' },
  { path: '/grids',     label: 'GRIDS',    key: '6' },
  { path: '/carbon',    label: 'CARBON',   key: '7' },
  { path: '/roadmap',   label: 'ROADMAP',  key: '8' },
  { path: '/glossary',  label: 'GLOSSARY', key: '9' },
]

export default function ModuleNav() {
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const m = MODULES.find(x => x.key === e.key)
      if (m) {
        e.preventDefault()
        navigate(m.path)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <nav className="modules-panel">
      {MODULES.map(m => (
        <NavLink
          key={m.path}
          to={m.path}
          end={m.path === '/'}
          className={({ isActive }) => `modules-link ${isActive ? 'active' : ''}`}
        >
          <span className="modules-key mono">{m.key}</span>
          <span className="modules-label">{m.label}</span>
          <span className="modules-arrow">▸</span>
        </NavLink>
      ))}
    </nav>
  )
}
