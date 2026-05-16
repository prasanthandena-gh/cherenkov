/* =====================================================
   FISSION RENDERER — pure canvas drawing.
   Each draw fn takes (ctx, ...) and writes pixels. No state mutation.
   ===================================================== */

import type { ScenarioConfig } from '../data/fission-scenarios'
import {
  W, H, ATOM_R, NEUTRON_R, FRAG_MS,
  ROD_TOP_Y, ROD_WIDTH, ROD_LENGTH,
  type Atom, type Neutron, type Rod, type SimState,
} from './fission-physics'

export function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(250, 204, 21, 0.04)'
  for (let x = 0; x < W; x += 30) {
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
    }
  }
}

export function drawAtoms(ctx: CanvasRenderingContext2D, atoms: Atom[], scenario: string, now: number) {
  for (const a of atoms) {
    if (a.state === 'intact') {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.22)'
      ctx.beginPath(); ctx.arc(a.x, a.y, ATOM_R + 4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = scenario === 'bomb' ? '#ff8c00' : '#facc15'
      ctx.beginPath(); ctx.arc(a.x, a.y, ATOM_R, 0, Math.PI * 2); ctx.fill()
    } else if (a.state === 'shaking') {
      const j = Math.sin((now - a.shakenAt) * 0.08) * 2.5
      ctx.fillStyle = '#ff8c00'
      ctx.beginPath(); ctx.arc(a.x + j, a.y, ATOM_R, 0, Math.PI * 2); ctx.fill()
    } else if (a.state === 'split' && a.fragA && a.fragB) {
      const age = now - a.splitAt
      const alpha = 1 - age / FRAG_MS
      ctx.fillStyle = `rgba(255, 51, 51, ${alpha})`
      ctx.beginPath(); ctx.arc(a.fragA.x, a.fragA.y, ATOM_R * 0.7, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(a.fragB.x, a.fragB.y, ATOM_R * 0.7, 0, Math.PI * 2); ctx.fill()
      const r = (age / FRAG_MS) * 26
      ctx.strokeStyle = `rgba(250, 204, 21, ${alpha * 0.7})`
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(a.x, a.y, r, 0, Math.PI * 2); ctx.stroke()
    }
  }
}

export function drawNeutrons(ctx: CanvasRenderingContext2D, neutrons: Neutron[]) {
  for (const n of neutrons) {
    const color = n.gen === 0 ? '#ffffff'
                : n.gen === 1 ? '#facc15'
                : n.gen === 2 ? '#ff8c00'
                              : '#ff3333'
    ctx.fillStyle = color
    ctx.shadowBlur = 10
    ctx.shadowColor = color
    ctx.beginPath(); ctx.arc(n.x, n.y, NEUTRON_R, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0
  }
}

export function drawRods(ctx: CanvasRenderingContext2D, rods: Rod[]) {
  for (const rod of rods) {
    const tipY = ROD_TOP_Y + ROD_LENGTH * rod.insertion
    ctx.fillStyle = 'rgba(255, 140, 0, 0.85)'
    ctx.fillRect(rod.x - ROD_WIDTH / 2, ROD_TOP_Y, ROD_WIDTH, tipY - ROD_TOP_Y)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.lineWidth = 1
    for (let y = ROD_TOP_Y; y < tipY; y += 12) {
      ctx.beginPath()
      ctx.moveTo(rod.x - ROD_WIDTH / 2, y)
      ctx.lineTo(rod.x + ROD_WIDTH / 2, y)
      ctx.stroke()
    }
    ctx.fillStyle = '#facc15'
    ctx.fillRect(rod.x - ROD_WIDTH / 2 - 2, tipY - 3, ROD_WIDTH + 4, 3)
    ctx.fillStyle = 'rgba(255, 140, 0, 0.4)'
    ctx.fillRect(rod.x - ROD_WIDTH, ROD_TOP_Y, ROD_WIDTH * 2, 6)
  }
}

export function drawMeltedOverlay(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(255, 51, 51, 0.18)'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#ff3333'
  ctx.font = 'bold 28px JetBrains Mono'
  ctx.textAlign = 'center'
  ctx.fillText('CORE DAMAGE', W / 2, H / 2 - 12)
  ctx.fillStyle = '#fff'
  ctx.font = '12px JetBrains Mono'
  ctx.fillText('SCRAM TO RESET', W / 2, H / 2 + 14)
}

/** Top-level frame draw — composes the others. */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: SimState,
  rods: Rod[],
  cfg: ScenarioConfig,
  scenario: string,
  now: number,
) {
  drawBackground(ctx)
  drawAtoms(ctx, state.atoms, scenario, now)
  drawNeutrons(ctx, state.neutrons)
  if (cfg.rodVisible) drawRods(ctx, rods)
  if (state.melted)   drawMeltedOverlay(ctx)
}
