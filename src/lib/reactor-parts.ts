/* =====================================================
   REACTOR PARTS — primitive Three.js builders.
   Each builder returns a THREE.Group whose leaf meshes carry
   userData = { partId, partName, blurb, kbSlug? }.
   ===================================================== */

import * as THREE from 'three'

export interface PartInfo {
  partId: string
  partName: string
  blurb: string
  kbSlug?: string
}

export interface BuilderOpts {
  color?: number
  scale?: number
  info: PartInfo
}

const YELLOW = 0xfacc15
const ORANGE = 0xff8c00
const GREEN  = 0x00ff88
const PINK   = 0xff4081
const GREY   = 0x888888
const DARK   = 0x222222

function tagMesh(mesh: THREE.Mesh, info: PartInfo) {
  mesh.userData = info
  return mesh
}

function lineMat(color: number, opacity = 0.9): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity })
}

function faceMat(color: number, opacity = 0.18): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide })
}

/** Wrap a mesh + edges overlay into one group so they animate together */
function withEdges(geo: THREE.BufferGeometry, color: number, info: PartInfo): THREE.Group {
  const g = new THREE.Group()
  const mesh = new THREE.Mesh(geo, faceMat(color, 0.14))
  tagMesh(mesh, info)
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 18), lineMat(color, 0.9))
  edges.userData = info
  g.add(mesh, edges)
  g.userData = info
  return g
}

/* ===================== BUILDERS ===================== */

export function buildContainmentDome(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? YELLOW
  const s = opts.scale ?? 1
  const g = new THREE.Group()
  const cylGeo = new THREE.CylinderGeometry(0.9 * s, 0.9 * s, 1.2 * s, 32, 1, true)
  const domeGeo = new THREE.SphereGeometry(0.9 * s, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  const cyl = withEdges(cylGeo, color, opts.info)
  cyl.position.y = 0
  const dome = withEdges(domeGeo, color, opts.info)
  dome.position.y = 0.6 * s
  g.add(cyl, dome)
  g.userData = opts.info
  return g
}

export function buildPressureVessel(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? ORANGE
  const s = opts.scale ?? 1
  const geo = new THREE.CylinderGeometry(0.35 * s, 0.35 * s, 0.9 * s, 24, 1)
  return withEdges(geo, color, opts.info)
}

export function buildFuelAssemblies(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? GREEN
  const s = opts.scale ?? 1
  const g = new THREE.Group()
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const rodGeo = new THREE.CylinderGeometry(0.04 * s, 0.04 * s, 0.7 * s, 8, 1)
      const m = withEdges(rodGeo, color, opts.info)
      m.position.set(i * 0.13 * s, 0, j * 0.13 * s)
      g.add(m)
    }
  }
  g.userData = opts.info
  return g
}

export function buildControlRods(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? ORANGE
  const s = opts.scale ?? 1
  const g = new THREE.Group()
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if ((i + j) % 2 !== 0) continue
      const geo = new THREE.CylinderGeometry(0.03 * s, 0.03 * s, 0.5 * s, 6, 1)
      const m = withEdges(geo, color, opts.info)
      m.position.set(i * 0.13 * s, 0.25 * s, j * 0.13 * s)
      g.add(m)
    }
  }
  g.userData = opts.info
  return g
}

export function buildCoolantLoop(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? 0x4cc8ff
  const s = opts.scale ?? 1
  const geo = new THREE.TorusGeometry(0.65 * s, 0.04 * s, 8, 32)
  return withEdges(geo, color, opts.info)
}

export function buildSteamGenerator(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? YELLOW
  const s = opts.scale ?? 1
  const geo = new THREE.CylinderGeometry(0.16 * s, 0.16 * s, 1.0 * s, 16, 1)
  return withEdges(geo, color, opts.info)
}

export function buildTurbine(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? 0xa371ff
  const s = opts.scale ?? 1
  const g = new THREE.Group()
  const drumGeo = new THREE.CylinderGeometry(0.18 * s, 0.18 * s, 0.5 * s, 18, 1)
  const drum = withEdges(drumGeo, color, opts.info)
  drum.rotation.z = Math.PI / 2
  g.add(drum)
  // shaft
  const shaft = withEdges(new THREE.CylinderGeometry(0.04 * s, 0.04 * s, 0.9 * s, 8), color, opts.info)
  shaft.rotation.z = Math.PI / 2
  g.add(shaft)
  g.userData = opts.info
  return g
}

export function buildCoolingTower(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? GREY
  const s = opts.scale ?? 1
  // Hyperboloid via LatheGeometry
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 12; i++) {
    const t = i / 12
    const y = t * 0.9 * s
    const r = 0.28 * s * (1 - 0.45 * Math.sin(t * Math.PI))
    pts.push(new THREE.Vector2(r, y))
  }
  const geo = new THREE.LatheGeometry(pts, 24)
  return withEdges(geo, color, opts.info)
}

export function buildLowerPlenum(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? ORANGE
  const s = opts.scale ?? 1
  const geo = new THREE.CylinderGeometry(0.35 * s, 0.32 * s, 0.18 * s, 16, 1)
  return withEdges(geo, color, opts.info)
}

export function buildUpperPlenum(opts: BuilderOpts): THREE.Group {
  return buildLowerPlenum(opts)
}

export function buildSodiumPool(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? 0x4cc8ff
  const s = opts.scale ?? 1
  const geo = new THREE.CylinderGeometry(0.7 * s, 0.7 * s, 0.15 * s, 32, 1)
  return withEdges(geo, color, opts.info)
}

export function buildPebble(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? GREEN
  const s = opts.scale ?? 1
  const g = new THREE.Group()
  // big container
  const shell = withEdges(new THREE.SphereGeometry(0.45 * s, 24, 16), color, opts.info)
  g.add(shell)
  // pebbles inside (semi-transparent sphere cluster)
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.random() * 0.35 * s
    const y = (Math.random() - 0.5) * 0.6 * s
    const ball = withEdges(new THREE.SphereGeometry(0.04 * s, 6, 6), color, opts.info)
    ball.position.set(Math.cos(a) * r, y, Math.sin(a) * r)
    g.add(ball)
  }
  g.userData = opts.info
  return g
}

export function buildMoltenSaltVessel(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? PINK
  const s = opts.scale ?? 1
  const g = new THREE.Group()
  const main = withEdges(new THREE.BoxGeometry(0.7 * s, 0.7 * s, 0.7 * s), color, opts.info)
  g.add(main)
  g.userData = opts.info
  return g
}

export function buildMicroreactor(opts: BuilderOpts): THREE.Group {
  const color = opts.color ?? YELLOW
  const s = opts.scale ?? 1
  const g = new THREE.Group()
  const body = withEdges(new THREE.CylinderGeometry(0.3 * s, 0.3 * s, 0.85 * s, 24, 1), color, opts.info)
  g.add(body)
  // cap
  const cap = withEdges(new THREE.CylinderGeometry(0.32 * s, 0.3 * s, 0.08 * s, 16, 1), DARK, { ...opts.info, partName: opts.info.partName + ' — head' })
  cap.position.y = 0.45 * s
  g.add(cap)
  g.userData = opts.info
  return g
}

export const BUILDERS = {
  containmentDome:  buildContainmentDome,
  pressureVessel:   buildPressureVessel,
  fuelAssemblies:   buildFuelAssemblies,
  controlRods:      buildControlRods,
  coolantLoop:      buildCoolantLoop,
  steamGenerator:   buildSteamGenerator,
  turbine:          buildTurbine,
  coolingTower:     buildCoolingTower,
  lowerPlenum:      buildLowerPlenum,
  upperPlenum:      buildUpperPlenum,
  sodiumPool:       buildSodiumPool,
  pebble:           buildPebble,
  moltenSaltVessel: buildMoltenSaltVessel,
  microreactor:     buildMicroreactor,
} as const

export type BuilderKey = keyof typeof BUILDERS
