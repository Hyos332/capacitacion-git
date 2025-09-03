import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

export default function InstancedChunk({ size = [16, 4, 16], offset = [0, 0, 0] }) {
  const ref = useRef()
  const matrices = useMemo(() => {
    const [sx, sy, sz] = size
    const list = []
    for (let x = 0; x < sx; x++) {
      for (let z = 0; z < sz; z++) {
        const h = Math.floor(Math.random() * sy) + 1
        for (let y = 0; y < h; y++) {
          const tx = x + offset[0]
          const ty = y + offset[1]
          const tz = z + offset[2]
          const m = new THREE.Matrix4().makeTranslation(tx - sx / 2, ty, tz - sz / 2)
          list.push(m)
        }
      }
    }
    return list
  }, [size, offset])

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
