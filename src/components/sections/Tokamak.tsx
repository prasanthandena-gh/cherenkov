/* =====================================================
   TOKAMAK — Three.js torus the user can drag-rotate.
   Temperature and density sliders modulate plasma glow.
   ===================================================== */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createScene } from '../../lib/three-scene'

interface Props {
  temperature: number  // 0..1 (0 = cold, 1 = ignited ~200M °C)
  density: number      // 0..1
}

export default function Tokamak({ temperature, density }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const tRef = useRef(temperature)
  const dRef = useRef(density)
  const rotRef = useRef({ x: 0.5, y: 0, tx: 0.5, ty: 0 })

  useEffect(() => { tRef.current = temperature }, [temperature])
  useEffect(() => { dRef.current = density }, [density])

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current

    const handle = createScene(mount, { fov: 45, z: 5 })
    const { scene, camera, renderer, setSize, cleanup } = handle

    // group to spin
    const group = new THREE.Group()
    scene.add(group)

    // outer torus shell (translucent)
    const shellGeo = new THREE.TorusGeometry(1.6, 0.55, 32, 96)
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x4cc8ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    })
    const shell = new THREE.Mesh(shellGeo, shellMat)
    group.add(shell)

    // plasma ring — inner torus that glows
    const plasmaGeo = new THREE.TorusGeometry(1.6, 0.32, 24, 64)
    const plasmaMat = new THREE.MeshBasicMaterial({
      color: 0xff4081,
      transparent: true,
      opacity: 0.7,
    })
    const plasma = new THREE.Mesh(plasmaGeo, plasmaMat)
    group.add(plasma)

    // magnetic coils — 16 hollow rings around the torus tube
    const coilGroup = new THREE.Group()
    group.add(coilGroup)
    const COIL_COUNT = 16
    for (let i = 0; i < COIL_COUNT; i++) {
      const ang = (i / COIL_COUNT) * Math.PI * 2
      const cx = Math.cos(ang) * 1.6
      const cz = Math.sin(ang) * 1.6
      const coil = new THREE.Mesh(
        new THREE.TorusGeometry(0.62, 0.03, 6, 24),
        new THREE.MeshBasicMaterial({ color: 0xa371ff, transparent: true, opacity: 0.6 })
      )
      coil.position.set(cx, 0, cz)
      coil.lookAt(0, 0, 0)
      coil.rotateX(Math.PI / 2)
      coilGroup.add(coil)
    }

    // particle swarm inside the plasma
    const PARTICLE_COUNT = 360
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const swirl: { ang: number; rDev: number; angVel: number; yDev: number }[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const a = Math.random() * Math.PI * 2
      const rDev = (Math.random() - 0.5) * 0.5
      const yDev = (Math.random() - 0.5) * 0.5
      swirl.push({ ang: a, rDev, angVel: 0.4 + Math.random() * 0.6, yDev })
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xff4081,
      size: 0.04,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    group.add(particles)

    // === INTERACTION ===
    let dragging = false
    let drag = { x: 0, y: 0 }
    const canvas = renderer.domElement
    const onDown = (e: MouseEvent) => { dragging = true; drag = { x: e.clientX, y: e.clientY } }
    const onUp = () => { dragging = false }
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      rotRef.current.ty += dx * 0.005
      rotRef.current.tx = Math.max(-1.2, Math.min(1.2, rotRef.current.tx + dy * 0.005))
      drag = { x: e.clientX, y: e.clientY }
    }
    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    canvas.style.cursor = 'grab'

    const ro = new ResizeObserver(setSize)
    ro.observe(mount)

    // animate
    let raf = 0
    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const T = tRef.current
      const D = dRef.current

      // auto idle rotate
      if (!dragging) rotRef.current.ty += 0.003
      rotRef.current.x += (rotRef.current.tx - rotRef.current.x) * 0.1
      rotRef.current.y += (rotRef.current.ty - rotRef.current.y) * 0.1
      group.rotation.x = rotRef.current.x
      group.rotation.y = rotRef.current.y

      // plasma brightness reflects temperature
      ;(plasma.material as THREE.MeshBasicMaterial).opacity = 0.15 + T * 0.6 * (0.4 + D * 0.6)
      const hot = new THREE.Color(0xff4081).lerp(new THREE.Color(0xffffff), Math.max(0, T - 0.6) / 0.4)
      ;(plasma.material as THREE.MeshBasicMaterial).color.copy(hot)
      ;(particleMat).opacity = 0.2 + T * 0.8 * D
      ;(particleMat).size = 0.025 + T * 0.06

      // particles swirl
      const r0 = 1.6
      const tubeR = 0.32
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const s = swirl[i]
        s.ang += s.angVel * 0.01 * (0.4 + T)
        const r = r0 + s.rDev * tubeR
        const x = Math.cos(s.ang) * r
        const z = Math.sin(s.ang) * r
        const y = s.yDev * tubeR + Math.sin(t * 2 + i) * 0.04 * T
        positions[i * 3]     = x
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = z
      }
      particleGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      ro.disconnect()
      cleanup()
    }
  }, [])

  return <div className="tokamak-mount" ref={mountRef} />
}
