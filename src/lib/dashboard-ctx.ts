/* =====================================================
   DASHBOARD CONTEXT — shared state between chrome and routes.
   ===================================================== */

import { createContext, useContext } from 'react'
import type { Reactor } from '../data/reactors'

export interface DossierFocus {
  // Selected reactor from /, or custom dossier content from another route
  reactor?: Reactor | null
  // Optional override block (for /reactors model spec, /fusion readout, etc.)
  override?: {
    tag: string         // e.g. "MODEL SPEC", "PLASMA STATE"
    title: string
    rows: { k: string; v: string }[]
    note?: string
    field?: string      // FIELD NOTE — quirky one-liner
  }
}

export interface DashboardState {
  focus: DossierFocus
  setFocus: (f: DossierFocus) => void
  /** number to display in the topbar NODES counter */
  nodes: number
  setNodes: (n: number) => void
  /** lat/lon shown in topbar; "--" if none */
  coords: { lat: number | null; lng: number | null }
  setCoords: (c: { lat: number | null; lng: number | null }) => void
  /** push an alert into the live log */
  pushAlert: (line: string, level?: 'OK' | 'INFO' | 'WARN' | 'CRIT') => void
  /** per-country EXTRA pins (keyed by display name) — each unit adds one
      visible pin to the globe on top of the baseline REACTORS pins. */
  pinOverrides: Record<string, number>
  /** Bump extra pins for a country by delta. Persists to localStorage.
      Caps total visible pins (base + extra) at the country's real-world fleet count. */
  setPins: (country: string, delta: number) => void
  /** Reset overrides — pass a country name to clear just that one, or omit to clear all. */
  resetPins: (country?: string) => void
  /** Synthetic "phantom" reactors generated from pinOverrides — these are
      shown on the globe in addition to REACTORS + sandbox builds. */
  phantoms: Reactor[]
  /** Mission-control DEFCON level 1-5 (1 = critical, 4 = nominal). Routes can
      bump this when something dramatic happens (Fission supercritical, Grids brownout). */
  defcon: number
  /** Set DEFCON. If `reason` is provided, an alert is pushed describing why. */
  setDefcon: (n: number, reason?: string) => void
  /** Short live status text the ticker prefixes onto its stream. Routes set this
      on mount/update to surface their current state in the chrome. Null = static stream. */
  routeHint: string | null
  setRouteHint: (s: string | null) => void
}

export const DashboardContext = createContext<DashboardState | null>(null)

export function useDashboard(): DashboardState {
  const v = useContext(DashboardContext)
  if (!v) throw new Error('useDashboard must be used inside DashboardContext')
  return v
}
