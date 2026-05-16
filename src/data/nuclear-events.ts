/* =====================================================
   NUCLEAR EVENTS — pivotal moments in the 70-year nuclear arc.
   Powers the Command page's STORY/PLAY time-machine mode.
   Each event fires effects (pin status, fleet status, defcon
   spike, globe flash) when the year cursor crosses its year.
   ===================================================== */

import type { ReactorStatus } from './reactors'

export type EventTone = 'milestone' | 'incident' | 'policy' | 'fusion'

export type EventEffect =
  | { kind: 'pin-status';   pinId: string;   status: ReactorStatus }
  | { kind: 'fleet-status'; country: string; status: ReactorStatus }
  | { kind: 'defcon';       level: number;   ms: number }
  | { kind: 'flash';        lat: number;     lng: number; color: string; radiusKm?: number; ms?: number }

export interface NuclearEvent {
  id: string
  date: string                // ISO YYYY-MM-DD
  year: number                // for slider math
  tag: string                 // short headline e.g. "CHERNOBYL"
  detail: string              // banner one-liner
  fun?: string                // italic flourish
  tone: EventTone
  effects: EventEffect[]
}

const C = {
  yellow: '#facc15',
  green:  '#00ff88',
  red:    '#ff3333',
  plasma: '#ff4081',
  blue:   '#4cc8ff',
}

export const NUCLEAR_EVENTS: NuclearEvent[] = [
  {
    id: 'cp1', date: '1942-12-02', year: 1942,
    tag: 'CHICAGO PILE-1',
    detail: 'Fermi achieves the first sustained chain reaction under Stagg Field bleachers.',
    fun: 'A squash court goes critical. Squash never recovers.',
    tone: 'milestone',
    effects: [{ kind: 'flash', lat: 41.79, lng: -87.60, color: C.yellow, radiusKm: 300 }],
  },
  {
    id: 'hiroshima', date: '1945-08-06', year: 1945,
    tag: 'HIROSHIMA',
    detail: 'Atomic bomb detonated. The age begins.',
    tone: 'incident',
    effects: [
      { kind: 'defcon', level: 1, ms: 2000 },
      { kind: 'flash', lat: 34.39, lng: 132.45, color: C.red, radiusKm: 1800, ms: 2000 },
    ],
  },
  {
    id: 'calder-hall', date: '1956-08-27', year: 1956,
    tag: 'CALDER HALL',
    detail: 'First commercial nuclear reactor opens. The civilian atomic age begins.',
    fun: 'Queen Elizabeth pulled the lever. Marketing was sharper then.',
    tone: 'milestone',
    effects: [{ kind: 'flash', lat: 54.42, lng: -3.50, color: C.green, radiusKm: 500 }],
  },
  {
    id: 'tmi', date: '1979-03-28', year: 1979,
    tag: 'THREE MILE ISLAND',
    detail: 'Partial core melt at TMI-2. No deaths. American nuclear momentum dies anyway.',
    fun: 'The China Syndrome opened twelve days earlier. The press was warmed up.',
    tone: 'incident',
    effects: [
      { kind: 'pin-status', pinId: 'us-tmi', status: 'ghost' },
      { kind: 'defcon', level: 2, ms: 2000 },
      { kind: 'flash', lat: 40.15, lng: -76.72, color: C.red, radiusKm: 400 },
    ],
  },
  {
    id: 'chernobyl', date: '1986-04-26', year: 1986,
    tag: 'CHERNOBYL',
    detail: 'Reactor 4 explodes during a safety test. The 30 km exclusion zone holds for 40 years.',
    fun: 'The only reactor with its own miniseries. Audiobook bigger than reality.',
    tone: 'incident',
    effects: [
      { kind: 'pin-status', pinId: 'ua-cherno', status: 'ghost' },
      { kind: 'defcon', level: 1, ms: 2800 },
      { kind: 'flash', lat: 51.39, lng: 30.10, color: C.red, radiusKm: 800, ms: 2500 },
    ],
  },
  {
    id: 'shoreham', date: '1989-02-28', year: 1989,
    tag: 'SHOREHAM',
    detail: 'Completed, tested, abandoned. Long Island ratepayers eat $6B over 30 years.',
    fun: 'Cost six billion dollars to be allergic to plugging in.',
    tone: 'policy',
    effects: [{ kind: 'pin-status', pinId: 'us-shoreham', status: 'ghost' }],
  },
  {
    id: 'fukushima', date: '2011-03-11', year: 2011,
    tag: 'FUKUSHIMA',
    detail: 'Tōhoku earthquake + tsunami. Three Daiichi cores melt. The whole world reconsiders.',
    fun: 'The waves cleared the seawall in twelve minutes. The reconsideration took years.',
    tone: 'incident',
    effects: [
      { kind: 'fleet-status', country: 'Japan', status: 'paused' },
      { kind: 'defcon', level: 1, ms: 2500 },
      { kind: 'flash', lat: 37.42, lng: 141.03, color: C.red, radiusKm: 600, ms: 2200 },
    ],
  },
  {
    id: 'zaporizhzhia', date: '2022-04-15', year: 2022,
    tag: 'ZAPORIZHZHIA',
    detail: 'Europe\'s largest reactor falls under occupation. IAEA monitors permanently.',
    fun: 'A reactor with weather diplomacy.',
    tone: 'incident',
    effects: [
      { kind: 'pin-status', pinId: 'ua-zapor', status: 'paused' },
      { kind: 'defcon', level: 2, ms: 1500 },
    ],
  },
  {
    id: 'nif-ignition', date: '2022-12-05', year: 2022,
    tag: 'NIF IGNITION',
    detail: 'Lawrence Livermore: 192 lasers, one pellet, fusion energy out > laser energy in.',
    fun: 'Net gain at the pellet. The grid is patient.',
    tone: 'fusion',
    effects: [{ kind: 'flash', lat: 37.41, lng: -121.71, color: C.plasma, radiusKm: 500 }],
  },
  {
    id: 'germany-out', date: '2023-04-15', year: 2023,
    tag: 'GERMAN PHASE-OUT',
    detail: 'Germany shuts down its final three reactors. 23-year phase-out complete.',
    fun: 'Replaced with lignite. The climate sends regards.',
    tone: 'policy',
    effects: [{ kind: 'fleet-status', country: 'Germany', status: 'ghost' }],
  },
  {
    id: 'vogtle-3', date: '2023-07-31', year: 2023,
    tag: 'VOGTLE-3 ONLINE',
    detail: 'First new US reactor in three decades. Unit 3 syncs to the Southeast grid.',
    fun: 'Built so slowly its Wikipedia page outgrew the containment dome.',
    tone: 'milestone',
    effects: [{ kind: 'flash', lat: 33.14, lng: -81.76, color: C.green, radiusKm: 400 }],
  },
  {
    id: 'iter-plasma', date: '2034-12-01', year: 2034,
    tag: 'ITER FIRST PLASMA',
    detail: 'Cadarache lights up — first plasma in the largest tokamak ever built.',
    fun: 'On schedule slipped sideways. Costs measured in geopolitics.',
    tone: 'fusion',
    effects: [{ kind: 'flash', lat: 43.706, lng: 5.760, color: C.plasma, radiusKm: 900, ms: 2000 }],
  },
]
