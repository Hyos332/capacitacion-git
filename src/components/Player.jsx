import React, { useRef, useEffect } from 'react'
import { useBox } from '@react-three/cannon'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Player() {
  const { camera } = useThree()

  // physics box (mejor para personaje cubo)
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 1.0, 5],
    args: [0.6, 1.2, 0.45], // ancho, alto, profundidad
    linearDamping: 0.9,
    angularDamping: 1
  }))

  // velocidad
  const vel = useRef([0, 0, 0])
  useEffect(() => {
    const unsub = api.velocity.subscribe(v => (vel.current = v))
    return unsub
  }, [api])

  // input
  const keys = useRef({ w: 0, a: 0, s: 0, d: 0, space: 0 })
  useEffect(() => {
    function down(e) {
      const k = e.key.toLowerCase()
      if (k === 'w') keys.current.w = 1
      if (k === 's') keys.current.s = 1
      if (k === 'a') keys.current.a = 1
      if (k === 'd') keys.current.d = 1
      if (e.code === 'Space') keys.current.space = 1
    }
    function up(e) {
      const k = e.key.toLowerCase()
      if (k === 'w') keys.current.w = 0
      if (k === 's') keys.current.s = 0
      if (k === 'a') keys.current.a = 0
      if (k === 'd') keys.current.d = 0
      if (e.code === 'Space') keys.current.space = 0
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // vectores reutilizables
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const upVec = new THREE.Vector3(0, 1, 0)
  const camPos = useRef(new THREE.Vector3())

  // refs para partes visuales
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()

  useFrame((state) => {
    // dirección relativa a cámara
    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    right.current.copy(forward.current).cross(upVec).normalize()

    const moveZ = keys.current.w - keys.current.s
    const moveX = keys.current.d - keys.current.a
    const speed = 6

    const vx = right.current.x * moveX * speed + forward.current.x * moveZ * speed
    const vz = right.current.z * moveX * speed + forward.current.z * moveZ * speed

    const currentY = vel.current[1] ?? 0
    api.velocity.set(vx, currentY, vz)

    // salto simple
    const onGround = Math.abs(currentY) < 0.15
    if (keys.current.space && onGround) {
      api.applyImpulse([0, 5, 0], [0, 0, 0])
    }

    // animación de caminar (según velocidad horizontal)
    const hSpeed = Math.hypot(vel.current[0] ?? 0, vel.current[2] ?? 0)
    const t = state.clock.getElapsedTime()
    const walkSpeed = Math.min(hSpeed, 6) / 6
    const angle = Math.sin(t * 8) * 0.6 * walkSpeed
    if (leftLegRef.current) leftLegRef.current.rotation.x = angle
    if (rightLegRef.current) rightLegRef.current.rotation.x = -angle
    if (leftArmRef.current) leftArmRef.current.rotation.x = -angle * 0.6
    if (rightArmRef.current) rightArmRef.current.rotation.x = angle * 0.6

    // bob corporal leve
    if (headRef.current) headRef.current.position.y = 0.55 + 0.06 * Math.abs(Math.sin(t * 8)) * walkSpeed

    // cámara sigue al jugador
    if (ref.current) {
      ref.current.getWorldPosition(camPos.current)
      const target = new THREE.Vector3(camPos.current.x, camPos.current.y + 0.6, camPos.current.z)
      const desiredPos = new THREE.Vector3(camPos.current.x + 3, camPos.current.y + 2, camPos.current.z + 6)
      camera.position.lerp(desiredPos, 0.08)
      camera.lookAt(target)
    }
  })

  // root mesh es el collider; visuales son hijos posicionados relativo a ese centro
  return (
    <mesh ref={ref} castShadow receiveShadow>
      {/* collider invisible */}
      <boxGeometry args={[0.6, 1.2, 0.45]} />
      <meshBasicMaterial visible={false} />

      {/* cabeza (cubo) */}
      <mesh ref={headRef} position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffcc99" />
      </mesh>

      {/* torso */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.6, 0.7, 0.35]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>

      {/* brazos */}
      <mesh ref={leftArmRef} position={[-0.45, 0.1, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color="#ffcc99" />
      </mesh>
      <mesh ref={rightArmRef} position={[0.45, 0.1, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color="#ffcc99" />
      </mesh>

      {/* piernas */}
      <mesh ref={leftLegRef} position={[-0.15, -0.6, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh ref={rightLegRef} position={[0.15, -0.6, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </mesh>
  )
}
