import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function DancingRobot({ position = [2, 0, -2], speed = 1.0, scale = 1.0 }) {
  const root = useRef()
  const head = useRef()
  const leftArm = useRef()
  const rightArm = useRef()
  const torso = useRef()
  const tmp = useRef(new THREE.Vector3())

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    // cabeza y brazos oscilan para "bailar"
    if (head.current) head.current.rotation.y = Math.sin(t * 1.2) * 0.6
    if (leftArm.current) leftArm.current.rotation.z = Math.sin(t * 2.4) * 1.2
    if (rightArm.current) rightArm.current.rotation.z = -Math.sin(t * 2.4) * 1.2
    // pequeño bounce en el torso
    if (torso.current) {
      tmp.current.set(0, Math.abs(Math.sin(t * 1.3)) * 0.06, 0)
      torso.current.position.lerp(tmp.current, 0.12)
    }
    // sutil movimiento lateral
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.4) * 0.08
    }
  })

  return (
    <group ref={root} position={position} scale={[scale, scale, scale]}>
      {/* torso */}
      <mesh ref={torso} castShadow>
        <boxGeometry args={[0.9, 1.4, 0.5]} />
        <meshStandardMaterial color="#4b0000" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* cabeza */}
      <mesh ref={head} position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color="#ffd7c0" metalness={0.05} roughness={0.8} />
      </mesh>

      {/* brazos */}
      <mesh ref={leftArm} position={[-0.9, 0.4, 0]} rotation={[0, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.0, 10]} />
        <meshStandardMaterial color="#0b7f0b" />
      </mesh>
      <mesh ref={rightArm} position={[0.9, 0.4, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.0, 10]} />
        <meshStandardMaterial color="#0b7f0b" />
      </mesh>

      {/* piernas */}
      <mesh position={[-0.25, -0.9, 0]} castShadow>
        <boxGeometry args={[0.22, 0.9, 0.22]} />
        <meshStandardMaterial color="#221111" />
      </mesh>
      <mesh position={[0.25, -0.9, 0]} castShadow>
        <boxGeometry args={[0.22, 0.9, 0.22]} />
        <meshStandardMaterial color="#221111" />
      </mesh>
    </group>
  )
}