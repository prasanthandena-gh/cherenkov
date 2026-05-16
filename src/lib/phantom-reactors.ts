/* =====================================================
   PHANTOM REACTORS — when the user bumps a nation's fleet
   count via the NATIONS +/- adjusters, this module reveals
   real reactor sites for that country first (drawing from
   EXTRA_REACTORS, ordered by capacity desc), and only falls
   back to jittered synthetic phantoms if the real pool is
   exhausted.
   ===================================================== */

import { REACTORS, type Reactor } from '../data/reactors'
import { EXTRA_REACTORS } from '../data/extra-reactors'
import { FUSION_PROJECTS } from '../data/fusion-projects'

/** Display-name → REACTORS country short label. */
const DISPLAY_TO_SHORT: Record<string, string> = {
  'United States':  'USA',
  'France':         'France',
  'China':          'China',
  'Russia':         'Russia',
  'Japan':          'Japan',
  'South Korea':    'S. Korea',
  'India':          'India',
  'Canada':         'Canada',
  'Ukraine':        'Ukraine',
  'United Kingdom': 'UK',
  'Germany':        'Germany',
  'Spain':          'Spain',
  'Sweden':         'Sweden',
  'Belgium':        'Belgium',
  'Czechia':        'Czechia',
  'Switzerland':    'Switzerland',
  'Finland':        'Finland',
  'Türkiye':        'Türkiye',
  'UAE':            'UAE',
  'Brazil':         'Brazil',
  'Argentina':      'Argentina',
  'Mexico':         'Mexico',
  'South Africa':   'S. Africa',
  'Austria':        'Austria',
  'Philippines':    'Philippines',
  'Pakistan':       'Pakistan',
  'Slovakia':       'Slovakia',
  'Hungary':        'Hungary',
  'Romania':        'Romania',
  'Bulgaria':       'Bulgaria',
  'Iran':           'Iran',
  'Belarus':        'Belarus',
  'Armenia':        'Armenia',
  'Netherlands':    'Netherlands',
}

/** Country centroids for countries with no REACTORS pins (synthetic fallback only). */
const FALLBACK_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  'Pakistan':     { lat: 30.4, lng:  69.3 },
  'Slovakia':     { lat: 48.7, lng:  19.7 },
  'Hungary':      { lat: 47.2, lng:  19.5 },
  'Romania':      { lat: 45.9, lng:  24.97 },
  'Bulgaria':     { lat: 42.7, lng:  25.5 },
  'Slovenia':     { lat: 46.15, lng: 14.99 },
  'Belarus':      { lat: 53.7, lng:  27.95 },
  'Iran':         { lat: 32.4, lng:  53.7 },
  'Armenia':      { lat: 40.07, lng: 45.04 },
  'Netherlands':  { lat: 52.13, lng:  5.29 },
  'Germany':      { lat: 51.2, lng:  10.4 },
}

function centroidFor(displayName: string): { lat: number; lng: number } {
  const short = DISPLAY_TO_SHORT[displayName]
  if (short) {
    const pins = REACTORS.filter(r => r.country === short)
    if (pins.length > 0) {
      const lat = pins.reduce((s, r) => s + r.lat, 0) / pins.length
      const lng = pins.reduce((s, r) => s + r.lng, 0) / pins.length
      return { lat, lng }
    }
  }
  return FALLBACK_CENTROIDS[displayName] ?? { lat: 0, lng: 0 }
}

function extrasForCountry(displayName: string): Reactor[] {
  const short = DISPLAY_TO_SHORT[displayName]
  if (!short) return []
  // Order by capacity desc so the biggest sites reveal first
  return EXTRA_REACTORS
    .filter(r => r.country === short)
    .slice()
    .sort((a, b) => b.capGW - a.capGW)
}

function hashJitter(seed: string): { dlat: number; dlng: number } {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const a = (h & 0xffff) / 0xffff
  const b = ((h >> 16) & 0xffff) / 0xffff
  return { dlat: (a - 0.5) * 6, dlng: (b - 0.5) * 8 }
}

/**
 * Given the per-country EXTRA pin counts, produce the list of additional pins
 * to render on the globe. Each unit in the override adds one pin on top of
 * the baseline REACTORS set — first revealing real EXTRA_REACTORS plants
 * (ordered by capacity), then synthesizing jittered phantoms once the real
 * pool is exhausted.
 */
export function buildPhantomReactors(
  overrides: Record<string, number>,
): Reactor[] {
  const out: Reactor[] = []
  for (const [name, extra] of Object.entries(overrides)) {
    if (extra <= 0) continue

    const realExtras = extrasForCountry(name)
    let revealed = 0
    for (let i = 0; i < extra && i < realExtras.length; i++) {
      out.push(realExtras[i])
      revealed++
    }

    const missing = extra - revealed
    if (missing > 0) {
      const c = centroidFor(name)
      const short = DISPLAY_TO_SHORT[name] ?? name
      for (let i = 0; i < missing; i++) {
        const seed = `${name}:phantom:${i}`
        const { dlat, dlng } = hashJitter(seed)
        out.push({
          id:      `phantom-${name.replace(/\s+/g, '-')}-${revealed + i}`,
          name:    `${name.toUpperCase()} +${revealed + i + 1}`,
          country: short,
          lat:     c.lat + dlat,
          lng:     c.lng + dlng,
          capGW:   1.0,
          status:  'active',
          year:    2025,
          type:    'SITE TBD',
          kind:    'custom',
          note:    `Real reactor data exhausted for ${name} — this pin is a synthetic placeholder.`,
        })
      }
    }
  }
  return out
}

/**
 * Surface the fusion frontier on the Command globe. Each project becomes a
 * synthetic Reactor tagged `kind: 'fusion'`. Always-on — no override required.
 */
export function buildFusionPins(): Reactor[] {
  return FUSION_PROJECTS.map(p => ({
    id:      `fusion-${p.id}`,
    name:    p.name,
    country: p.country,
    lat:     p.lat,
    lng:     p.lng,
    capGW:   0.5,                // visual size only
    status:  p.category === 'ignited' ? 'active' : 'paused',
    year:    Number(p.milestone.match(/\d{4}/)?.[0] ?? 2025),
    type:    `${p.geometry.toUpperCase()} · ${p.category.toUpperCase()}`,
    kind:    'fusion',
    note:    p.blurb,
    fun:     p.fun,
  }))
}
