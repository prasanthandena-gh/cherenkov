/* =====================================================
   DISSECTABLE MODEL — Three.js viewer with EXPLODE slider
   and click-to-label parts.
   ===================================================== */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { type ReactorModelManifest } from '../data/reactor-models'
import { BUILDERS, type PartInfo } from '../lib/reactor-parts'

export interface PartRecord {
  id: string
  group: THREE.Group
  basePos: THREE.Vector3
  centroid: THREE.Vector3
  info: PartInfo
}

interface Props {
  manifest: ReactorModelManifest
  explode: number              // 0..1
  rotate: boolean              // auto-rotate
  onPartHover?: (info: PartInfo | null) => void
  onPartClick?: (info: PartInfo) => void
  selectedId?: string | null
}

const EXPLODE_DIST = 1.6

export default function DissectableModel({
  manifest, explode, rotate, onPartHover, onPartClick, selectedId,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const recordsRef = useRef<PartRecord[]>([])
  const explodeRef = useRef(explode)
  const rotateRef  = useRef(rotate)
  const selectedRef = useRef<string | null | undefined>(selectedId)

  useEffect(() => { explodeRef.current = explode }, [explode])
  useEffect(() => { rotateRef.current  = rotate  }, [rotate])
  useEffect(() => { selectedRef.current = selectedId }, [selectedId])

  // Initial scene build (mount-once per manifest)
  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current

    const W = mount.clientWidth
    const H = mount.clientHeight
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100)
    camera.position.set(3.5, 2.6, 5.6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 2.5
    controls.maxDistance = 12
    controls.autoRotate = rotateRef.current
    controls.autoRotateSpeed = 0.6

    // Build parts from manifest
    const root = new THREE.Group()
    scene.add(root)
    const records: PartRecord[] = []
    manifest.parts.forEach(spec => {
      const builder = BUILDERS[spec.build]
      if (!builder) return
      const group = builder({
        color: spec.color,
        scale: spec.scale,
        info: { partId: spec.id, ...spec.info },
      })
      group.position.set(...spec.pos)
      root.add(group)
      const basePos = group.position.clone()
      // Centroid relative to scene origin → direction for explosion
      const bbox = new THREE.Box3().setFromObject(group)
      const c = new THREE.Vector3()
      bbox.getCenter(c)
      records.push({
        id: spec.id,
        group,
        basePos,
        centroid: c.clone(),
        info: { partId: spec.id, ...spec.info },
      })
    })
    recordsRef.current = records

    // Center the assembly
    const overallBox = new THREE.Box3().setFromObject(root)
    const overallCenter = new THREE.Vector3()
    overallBox.getCenter(overallCenter)
    root.position.sub(overallCenter)

    // Lighting (we use mostly BasicMaterial so this is decorative)
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))

    // === Interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let downXY = { x: 0, y: 0 }
    let dragging = false

    const findPartFromObject = (o: THREE.Object3D | null): PartRecord | null => {
      let p: THREE.Object3D | null = o
      while (p) {
        const id = p.userData?.partId
        if (id) {
          const rec = records.find(r => r.id === id)
          if (rec) return rec
        }
        p = p.parent
      }
      return null
    }
    const targets: THREE.Object3D[] = []
    root.traverse(o => { if ((o as THREE.Mesh).isMesh) targets.push(o) })

    const onMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      if (dragging) return
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(targets, false)
      const hit = hits[0]
      const rec = findPartFromObject(hit?.object ?? null)
      onPartHover?.(rec?.info ?? null)
      renderer.domElement.style.cursor = rec ? 'pointer' : 'grab'
    }
    const onDown = (e: MouseEvent) => { dragging = false; downXY = { x: e.clientX, y: e.clientY } }
    const onUp = (e: MouseEvent) => {
      const dx = Math.abs(e.clientX - downXY.x)
      const dy = Math.abs(e.clientY - downXY.y)
      if (dx > 4 || dy > 4) return
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(targets, false)
      const hit = hits[0]
      const rec = findPartFromObject(hit?.object ?? null)
      if (rec) onPartClick?.(rec.info)
    }
    renderer.domElement.addEventListener('mousemove', onMove)
    renderer.domElement.addEventListener('mousedown', onDown)
    renderer.domElement.addEventListener('mouseup', onUp)

    // Resize
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(mount)

    // Animation
    let raf = 0
    const ease = (t: number) => t * t * (3 - 2 * t)
    const animate = () => {
      raf = requestAnimationFrame(animate)
      controls.autoRotate = rotateRef.current
      controls.update()

      const tExp = ease(Math.max(0, Math.min(1, explodeRef.current)))
      // Translate each part outward along (basePos - origin)
      records.forEach(rec => {
        // Use the part's *base* position direction as the explode vector
        // (positions in the manifest are relative to root; we explode outward).
        const dir = rec.basePos.clone().normalize()
        if (dir.lengthSq() < 0.0001) dir.set(0, 1, 0)  // central core blows up
        rec.group.position.copy(rec.basePos).add(dir.multiplyScalar(EXPLODE_DIST * tExp))
        // Highlight selected
        const sel = selectedRef.current
        rec.group.traverse(o => {
          if ((o as THREE.LineSegments).isLineSegments || (o as THREE.Mesh).isMesh) {
            const m = (o as any).material as THREE.Material & { opacity?: number }
            if (!m) return
            const isSelected = sel && rec.id === sel
            const isDimmed   = sel && rec.id !== sel
            if ((o as THREE.LineSegments).isLineSegments) {
              m.opacity = isSelected ? 1.0 : isDimmed ? 0.25 : 0.9
            } else {
              m.opacity = isSelected ? 0.5 : isDimmed ? 0.06 : 0.14
            }
            m.transparent = true
          }
        })
      })

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      controls.dispose()
      ro.disconnect()
      renderer.domElement.removeEventListener('mousemove', onMove)
      renderer.domElement.removeEventListener('mousedown', onDown)
      renderer.domElement.removeEventListener('mouseup', onUp)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [manifest, onPartClick, onPartHover])

  return <div className="dissect-mount" ref={mountRef} />
}
