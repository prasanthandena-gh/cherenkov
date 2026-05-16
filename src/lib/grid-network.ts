/* =====================================================
   GRID NETWORK — builds the k-nearest-neighbor great-circle
   graph used by Globe.tsx to draw the glowing transmission
   overlay between active reactors.
   ===================================================== */

import { type Reactor } from '../data/reactors'

export interface GridEdge {
  a: Reactor
  b: Reactor
  greatCircleKm: number
}

const EARTH_R_KM = 6371

function greatCircleKm(a: Reactor, b: Reactor): number {
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return EARTH_R_KM * c
}

/**
 * Build a k-NN edge list across the input reactors. Edges are deduped (a-b == b-a).
 * Returns at most `reactors.length * k` edges, but typically fewer after dedupe.
 */
export function buildGridNetwork(reactors: Reactor[], k = 2): GridEdge[] {
  const seen = new Set<string>()
  const edges: GridEdge[] = []

  for (const a of reactors) {
    const neighbors = reactors
      .filter(r => r.id !== a.id)
      .map(b => ({ b, d: greatCircleKm(a, b) }))
      .sort((x, y) => x.d - y.d)
      .slice(0, k)

    for (const { b, d } of neighbors) {
      const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`
      if (seen.has(key)) continue
      seen.add(key)
      edges.push({ a, b, greatCircleKm: d })
    }
  }
  return edges
}
