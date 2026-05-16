/* =====================================================
   GEO HELPERS
   ===================================================== */

import * as THREE from 'three'

/**
 * Convert lat/lng to a 3D vector on a sphere.
 * @param lat   degrees north (-90 to 90)
 * @param lng   degrees east (-180 to 180)
 * @param radius sphere radius
 */
export function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi   = (90 - lat) * Math.PI / 180
  const theta = (lng + 180) * Math.PI / 180
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  )
}

/**
 * Rotation values to bring a given lat/lng to face the +Z axis (the camera).
 */
export function rotationForLatLng(lat: number, lng: number): { rx: number; ry: number } {
  const v = latLngToVec3(lat, lng, 1)
  return {
    ry: -Math.atan2(-v.x, v.z),
    rx: Math.atan2(v.y, Math.sqrt(v.x * v.x + v.z * v.z))
  }
}
