import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

export default function InstancedChunk({ size = [16, 4, 16], offset = [0, 0, 0], density = 0.35, blockScale = 0.9 }) {
  const ref = useRef()

  // Generamos solo una capa de bloques por (x,z) y con probabilidad `density`
  const matrices = useMemo(() => {
    const [sx, /*sy*/, sz] = size
    const list = []
    for (let x = 0; x < sx; x++) {
      for (let z = 0; z < sz; z++) {
        if (Math.random() > density) continue // espacio libre para ver el plano
        const y = 0 // una sola capa sobre la superficie
        const tx = x + offset[0]
        const ty = y + offset[1]
        const tz = z + offset[2]

        // centrar cada bloque en su celda y aplicar escala para dejar hueco
        const position = new THREE.Vector3(tx - sx / 2 + 0.5, ty + 0.5, tz - sz / 2 + 0.5)
        const quaternion = new THREE.Quaternion()
        const scale = new THREE.Vector3(blockScale, blockScale, blockScale)
        const m = new THREE.Matrix4().compose(position, quaternion, scale)
        list.push(m)
      }
    }
    return list
  }, [size, offset, density, blockScale])

  useEffect(() => {
    if (!ref.current) return
    matrices.forEach((m, i) => ref.current.setMatrixAt(i, m))
    ref.current.count = matrices.length
    ref.current.instanceMatrix.needsUpdate = true
  }, [matrices])

  return (
    <instancedMesh
      ref={ref}
      args={[new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#8B5A2B' }), matrices.length]}
      castShadow
      receiveShadow
    />
  )
}