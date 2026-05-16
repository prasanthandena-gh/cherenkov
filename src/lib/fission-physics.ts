/* =====================================================
   FISSION PHYSICS — pure simulation logic. No DOM, no canvas.
   ===================================================== */

import type { ScenarioConfig } from '../data/fission-scenarios'

export interface Neutron { x: number; y: number; vx: number; vy: number; born: number; gen: number }
export interface Atom {
  x: number; y: number
  state: 'intact' | 'shaking' | 'split' | 'gone'
  shakenAt: number; splitAt: number
  fragA?: { x: number; y: number; vx: number; vy: number }
  fragB?: { x: number; y: number; vx: number; vy: number }
}
export interface Rod { x: number; insertion: number /* 0..1 */ }

export interface SimState {
  atoms: Atom[]
  neutrons: Neutron[]
  fissions: number
  kEff: number
  genMax: number
  temp: number              // 0..1.2
  melted: boolean
  powerHistory: number[]
  lastSampleAt: number
  fissionsThisSecond: number
}

export const W = 760
export const H = 460
export const ATOM_R       = 11
export const NEUTRON_R    = 3.2
export const NEUTRON_LIFE = 1800
export const SHAKE_MS     = 160
export const FRAG_MS      = 1400

export const ROD_TOP_Y    = -50
export const ROD_BOTTOM_Y = H - 30
export const ROD_WIDTH    = 22
export const ROD_LENGTH   = H + 80

export const POWER_HISTORY = 60   // ~30s @ 2 Hz

export function seed(count: number): Atom[] {
  const out: Atom[] = []
  const cols = Math.floor(Math.sqrt(count * (W / H)))
  const rows = Math.ceil(count / cols)
  const dx = W / (cols + 1)
  const dy = H / (rows + 1)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (out.length >= count) break
      out.push({
        x: (c + 1) * dx + (Math.random() - 0.5) * dx * 0.5,
        y: (r + 1) * dy + (Math.random() - 0.5) * dy * 0.5,
        state: 'intact', shakenAt: 0, splitAt: 0,
      })
    }
  }
  return out
}

export function createState(atomCount = 220): SimState {
  return {
    atoms: seed(atomCount),
    neutrons: [],
    fissions: 0,
    kEff: 1.0,
    genMax: 0,
    temp: 0,
    melted: false,
    powerHistory: new Array<number>(POWER_HISTORY).fill(0),
    lastSampleAt: typeof performance !== 'undefined' ? performance.now() : 0,
    fissionsThisSecond: 0,
  }
}

/** k_effective = baseK + rod modulation (0 inserted → +0.4, full inserted → -1.0) */
export function computeKEff(baseK: number, rodInsertion: number): number {
  const rodEffect = (1 - rodInsertion) * 0.4 - rodInsertion * 1.0
  return Math.max(0, baseK + rodEffect)
}

/** Run one physics tick. Mutates `state` and `rods` in place. */
export function step(
  state: SimState,
  rods: Rod[],
  cfg: ScenarioConfig,
  dt: number,
  now: number,
  onMelt?: () => void,
) {
  const avgRod = cfg.rodVisible
    ? rods.reduce((s, r) => s + r.insertion, 0) / rods.length
    : 0
  state.kEff = computeKEff(cfg.baseK, avgRod)

  // neutrons
  for (let i = state.neutrons.length - 1; i >= 0; i--) {
    const n = state.neutrons[i]
    n.x += (n.vx * dt) / 16
    n.y += (n.vy * dt) / 16
    if (n.x < 0 || n.x > W) n.vx *= -1
    if (n.y < 0 || n.y > H) n.vy *= -1
    if (now - n.born > NEUTRON_LIFE) { state.neutrons.splice(i, 1); continue }

    // rod absorption
    if (cfg.rodVisible) {
      let absorbed = false
      for (const rod of rods) {
        const rodBottom = ROD_TOP_Y + ROD_LENGTH * rod.insertion
        if (n.y < rodBottom && Math.abs(n.x - rod.x) < ROD_WIDTH / 2) { absorbed = true; break }
      }
      if (absorbed) { state.neutrons.splice(i, 1); continue }
    }

    // atom collision
    for (const a of state.atoms) {
      if (a.state !== 'intact') continue
      const dx = a.x - n.x, dy = a.y - n.y
      if (dx * dx + dy * dy < (ATOM_R + NEUTRON_R) ** 2) {
        a.state = 'shaking'; a.shakenAt = now
        state.neutrons.splice(i, 1)
        break
      }
    }
  }

  // shaking → split
  for (const a of state.atoms) {
    if (a.state === 'shaking' && now - a.shakenAt > SHAKE_MS) {
      a.state = 'split'; a.splitAt = now
      state.fissions++; state.fissionsThisSecond++
      state.temp += 0.005
      const ang = Math.random() * Math.PI * 2
      a.fragA = { x: a.x, y: a.y, vx:  Math.cos(ang) * 1.2, vy:  Math.sin(ang) * 1.2 }
      a.fragB = { x: a.x, y: a.y, vx: -Math.cos(ang) * 1.2, vy: -Math.sin(ang) * 1.2 }

      const daughter = Math.max(0, Math.min(4, Math.round(state.kEff * 2 + (Math.random() - 0.5) * 0.6)))
      const incomingGen = state.neutrons.reduce((m, n) => Math.max(m, n.gen), 0)
      const baseGen = incomingGen + 1
      for (let j = 0; j < daughter; j++) {
        const a2 = ang + (Math.PI * 2 * (j + 1)) / daughter
        state.neutrons.push({
          x: a.x + Math.cos(a2) * (ATOM_R + 2),
          y: a.y + Math.sin(a2) * (ATOM_R + 2),
          vx: Math.cos(a2) * 1.8, vy: Math.sin(a2) * 1.8,
          born: now, gen: baseGen,
        })
      }
      state.genMax = Math.max(state.genMax, baseGen)
    }
    if (a.state === 'split' && now - a.splitAt > FRAG_MS) {
      a.state = 'gone'
    }
    if (a.state === 'split' && a.fragA && a.fragB) {
      a.fragA.x += (a.fragA.vx * dt) / 16
      a.fragA.y += (a.fragA.vy * dt) / 16
      a.fragB.x += (a.fragB.vx * dt) / 16
      a.fragB.y += (a.fragB.vy * dt) / 16
    }
  }

  // temperature decay & meltdown trip
  state.temp = Math.max(0, state.temp - dt * 0.0001)
  if (state.temp > 1.0 && !state.melted) {
    state.melted = true
    onMelt?.()
  }
}

/** Sample the 500ms power bucket into history. */
export function samplePower(state: SimState, now: number) {
  if (now - state.lastSampleAt < 500) return
  state.lastSampleAt = now
  state.powerHistory.shift()
  state.powerHistory.push(state.fissionsThisSecond * 2)
  state.fissionsThisSecond = 0
}

/** Spawn a neutron from the canvas edge aimed at the click point. */
export function fireNeutronAt(state: SimState, x: number, y: number, now: number) {
  const ang = Math.atan2(y - H / 2, x - W / 2)
  const startR = Math.hypot(W, H) / 2 + 30
  const sx = W / 2 + Math.cos(ang + Math.PI) * startR
  const sy = H / 2 + Math.sin(ang + Math.PI) * startR
  state.neutrons.push({
    x: sx, y: sy,
    vx: Math.cos(ang) * 2.4, vy: Math.sin(ang) * 2.4,
    born: now, gen: 0,
  })
}
