import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Enemy({ targetRef, speed = 2.2, chaseDistance = 0.6, start = [-8, 0.7, -8] }) {
  const ref = useRef()
  const tmp = useRef(new THREE.Vector3())

  React.useEffect(() => {
    if (ref.current) ref.current.position.set(start[0], start[1], start[2])
  }, [start])

  useFrame((_, delta) => {
    if (!ref.current || !targetRef || !targetRef.current) return

    const enemyPos = ref.current.position
    const targetPos = tmp.current.copy(targetRef.current)
    targetPos.y = enemyPos.y // mantener misma altura

    const dir = tmp.current.sub(enemyPos)
    const dist = dir.length()
    if (dist > chaseDistance) {
      dir.normalize()
      enemyPos.addScaledVector(dir, Math.min(speed * delta, dist))
    }

    // mirar al jugador
    ref.current.lookAt(new THREE.Vector3(targetRef.current.x, enemyPos.y, targetRef.current.z))
  })

  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 1.2, 0.45]} />
        <meshStandardMaterial color="#075500ff" />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.28, 12, 8]} />
        <meshStandardMaterial color="#ff0101ff" />
      </mesh>
    </group>
  )
}