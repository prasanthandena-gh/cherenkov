/* =====================================================
   THREE-SCENE — small shared helpers for raw Three.js scenes.
   Globe.tsx and Tokamak.tsx use these.
   ===================================================== */

import * as THREE from 'three'

export interface SceneHandle {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  cleanup: () => void
  setSize: () => void
}

export function createScene(mount: HTMLDivElement, opts?: {
  fov?: number
  z?: number
  alpha?: boolean
}): SceneHandle {
  const W = mount.clientWidth
  const H = mount.clientHeight
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(opts?.fov ?? 45, W / H, 0.1, 100)
  camera.position.z = opts?.z ?? 4
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: opts?.alpha ?? true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(W, H)
  mount.appendChild(renderer.domElement)

  const setSize = () => {
    const w = mount.clientWidth
    const h = mount.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  return {
    scene,
    camera,
    renderer,
    setSize,
    cleanup: () => {
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    },
  }
}
