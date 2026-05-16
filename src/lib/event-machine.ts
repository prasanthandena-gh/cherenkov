/* =====================================================
   EVENT MACHINE — pure helpers for the Command time-machine.
   Given the NUCLEAR_EVENTS list and a year cursor, produce
   deterministic "world state" overrides (pin/fleet status)
   and detect which events fired across a scrub range.
   ===================================================== */

import type { NuclearEvent } from '../data/nuclear-events'
import type { ReactorStatus } from '../data/reactors'

export interface EventWorldState {
  /** Override REACTOR pin status keyed by reactor id. */
  pinStatus:   Record<string, ReactorStatus>
  /** Override REACTOR status keyed by country (display name in reactors.country). */
  fleetStatus: Record<string, ReactorStatus>
}

/**
 * Apply all events with year ≤ yearCursor in chronological order.
 * Later events override earlier ones for the same key.
 * Pure — call freely from useMemo.
 */
export function computeEventState(events: NuclearEvent[], yearCursor: number): EventWorldState {
  const pinStatus:   Record<string, ReactorStatus> = {}
  const fleetStatus: Record<string, ReactorStatus> = {}
  const eligible = events.filter(e => e.year <= yearCursor)
  // events are authored in chronological order; sort defensively
  eligible.sort((a, b) => a.year - b.year || a.date.localeCompare(b.date))
  for (const e of eligible) {
    for (const fx of e.effects) {
      if (fx.kind === 'pin-status')   pinStatus[fx.pinId]   = fx.status
      if (fx.kind === 'fleet-status') fleetStatus[fx.country] = fx.status
    }
  }
  return { pinStatus, fleetStatus }
}

/**
 * Events whose year falls strictly after `fromYear` and at or before `toYear`.
 * Used to trigger one-shot effects (defcon spikes, banners, flashes, alerts)
 * when the user scrubs forward across an event. Reverse scrub returns empty.
 */
export function eventsFiredInRange(events: NuclearEvent[], fromYear: number, toYear: number): NuclearEvent[] {
  if (toYear <= fromYear) return []
  return events
    .filter(e => e.year > fromYear && e.year <= toYear)
    .sort((a, b) => a.year - b.year || a.date.localeCompare(b.date))
}
