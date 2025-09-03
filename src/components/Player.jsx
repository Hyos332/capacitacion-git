import React, { useRef } from 'react'
import { useSphere } from '@react-three/cannon'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Player() {
  const { camera } = useThree()
  const bodyRef = useRef()
  const [, api] = useSphere(() => ({ mass: 1, position: [0, 2, 5], args: [0.5] }))

  // simple camera follow
  useFrame(() => {
    if (!bodyRef.current) return
    const pos = new THREE.Vector3()
    bodyRef.current.getWorldPosition(pos)
    const camTarget = new THREE.Vector3(pos.x, pos.y + 1.2, pos.z)
    camera.position.lerp(new THREE.Vector3(pos.x + 3, pos.y + 2, pos.z + 6), 0.08)
    camera.lookAt(camTarget)
  })

  return (
    <mesh ref={bodyRef} castShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}
