import React, { useRef, useEffect } from 'react'
import { useSphere } from '@react-three/cannon'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Player() {
  const { camera } = useThree()
  // physics body (sphere) - attach to a group so visual meshes follow physics
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 2, 5],
    args: [0.5],
    linearDamping: 0.9,
    angularDamping: 1
  }))

  // subscribe to velocity to know movement speed
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
      if (k === ' ') keys.current.space = 1
    }
    function up(e) {
      const k = e.key.toLowerCase()
      if (k === 'w') keys.current.w = 0
      if (k === 's') keys.current.s = 0
      if (k === 'a') keys.current.a = 0
      if (k === 'd') keys.current.d = 0
      if (k === ' ') keys.current.space = 0
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // reusable vectors
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const upVec = new THREE.Vector3(0, 1, 0)
  const camPos = useRef(new THREE.Vector3())

  // refs for visual parts
  const bodyRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()

  useFrame((state, dt) => {
    // movement direction relative to camera
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

    // jump
    const onGround = Math.abs(currentY) < 0.15
    if (keys.current.space && onGround) {
      api.applyImpulse([0, 5, 0], [0, 0, 0])
    }

    // animate legs based on horizontal speed
    const hSpeed = Math.hypot(vel.current[0] ?? 0, vel.current[2] ?? 0)
    const t = state.clock.getElapsedTime()
    const walkSpeed = Math.min(hSpeed, 6) / 6 // 0..1
    const angle = Math.sin(t * 10) * 0.6 * walkSpeed
    if (leftLegRef.current) leftLegRef.current.rotation.x = angle
    if (rightLegRef.current) rightLegRef.current.rotation.x = -angle

    // subtle body bob
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.1 * Math.abs(Math.sin(t * 8)) * walkSpeed
    }

    // camera follow
    if (ref.current) {
      ref.current.getWorldPosition(camPos.current)
      const target = new THREE.Vector3(camPos.current.x, camPos.current.y + 1.2, camPos.current.z)
      const desiredPos = new THREE.Vector3(camPos.current.x + 3, camPos.current.y + 2, camPos.current.z + 6)
      camera.position.lerp(desiredPos, 0.08)
      camera.lookAt(target)
    }
  })

  // The physics body is attached to this group (ref) so the visual child meshes follow it.
  return (
    <group ref={ref}>
      {/* invisible helper collider is the group synced by cannon */}
      {/* visual: small body */}
      <mesh ref={bodyRef} position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.4]} />
        <meshStandardMaterial color="#ffcc99" />
      </mesh>

      {/* left leg */}
      <mesh ref={leftLegRef} position={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* right leg */}
      <mesh ref={rightLegRef} position={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}
