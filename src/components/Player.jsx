import React, { useRef, useEffect } from 'react'
import { useBox } from '@react-three/cannon'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Player({ firstPerson = false, controlsRef = null, enabled = true, playerPosRef = null }) {
  const { camera } = useThree()

  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 3.5, 5],
    args: [1.5, 4.0, 1.2],
    linearDamping: 0.9,
    angularDamping: 1
  }))

  const vel = useRef([0, 0, 0])
  useEffect(() => {
    const unsub = api.velocity.subscribe(v => (vel.current = v))
    return unsub
  }, [api])

  const keys = useRef({ w: 0, a: 0, s: 0, d: 0, space: 0 })
  useEffect(() => {
    function down(e) {
      if (!enabled) return
      const k = e.key.toLowerCase()
      if (k === 'w') keys.current.w = 1
      if (k === 's') keys.current.s = 1
      if (k === 'a') keys.current.a = 1
      if (k === 'd') keys.current.d = 1
      if (e.code === 'Space') keys.current.space = 1
    }
    function up(e) {
      if (!enabled) return
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
  }, [enabled])

  // reutilizar objetos Vector3 para evitar garbage collection
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const velocity = useRef(new THREE.Vector3())
  const upVec = new THREE.Vector3(0, 1, 0)

  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const torsoRef = useRef()

  const visualYOffset = 0.4
  const headLocalY = 2.5

  useEffect(() => {
    const tryAttach = () => {
      if (!controlsRef || !controlsRef.current || !ref.current) return
      const ctrlObj = typeof controlsRef.current.getObject === 'function'
        ? controlsRef.current.getObject()
        : controlsRef.current
      if (!ctrlObj || ctrlObj.parent === ref.current) return

      ctrlObj.position.set(0, headLocalY + visualYOffset, 0)
      ref.current.add(ctrlObj)
    }

    tryAttach()
    const id = setInterval(tryAttach, 500)
    return () => {
      clearInterval(id)
      if (controlsRef?.current && ref.current) {
        const ctrlObj = typeof controlsRef.current.getObject === 'function'
          ? controlsRef.current.getObject()
          : controlsRef.current
        if (ctrlObj && ctrlObj.parent === ref.current) ref.current.remove(ctrlObj)
      }
    }
  }, [controlsRef])

  useFrame((state) => {
    if (!enabled) return

    const speed = 12 // reducido de 20 a 12 para mejor performance

    // obtener dirección de cámara una sola vez
    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    right.current.crossVectors(forward.current, upVec).normalize()

    // resetear velocity una vez
    velocity.current.set(0, 0, 0)
    
    // input handling (usar keys.current correctamente)
    if (keys.current.w) velocity.current.add(forward.current)
    if (keys.current.s) velocity.current.sub(forward.current)
    if (keys.current.a) velocity.current.sub(right.current)
    if (keys.current.d) velocity.current.add(right.current)

    if (velocity.current.length() > 0) {
      velocity.current.normalize()
      velocity.current.multiplyScalar(speed) // simplificado sin delta complejo
      api.velocity.set(velocity.current.x, vel.current[1], velocity.current.z)
    } else {
      api.velocity.set(0, vel.current[1], 0)
    }

    // salto (corregir variable currentY)
    const currentY = vel.current[1] || 0
    const onGround = Math.abs(currentY) < 0.5
    if (keys.current.space && onGround) {
      api.applyImpulse([0, 12, 0], [0, 0, 0])
    }

    // animaciones simples (throttle a cada 3 frames para performance)
    if (state.frame % 3 === 0) {
      const hSpeed = Math.hypot(vel.current[0] ?? 0, vel.current[2] ?? 0)
      const t = state.clock.getElapsedTime()
      const walkSpeed = Math.min(hSpeed, 6) / 6//
      const angle = Math.sin(t * 8) * 0.6 * walkSpeed
      
      if (leftLegRef.current) leftLegRef.current.rotation.x = angle
      if (rightLegRef.current) rightLegRef.current.rotation.x = -angle
      if (leftArmRef.current) leftArmRef.current.rotation.x = -angle * 0.6
      if (rightArmRef.current) rightArmRef.current.rotation.x = angle * 0.6
      if (headRef.current) headRef.current.position.y = headLocalY + 0.06 * Math.abs(Math.sin(t * 8)) * walkSpeed
    }

    // position sharing para IA (throttle)
    if (ref.current && playerPosRef?.current && state.frame % 2 === 0) {
      const headWorld = new THREE.Vector3()
      if (headRef.current) {
        headRef.current.getWorldPosition(headWorld)
        playerPosRef.current.copy(headWorld)
      } else {
        ref.current.getWorldPosition(playerPosRef.current)
      }
    }

    // cámara en tercera persona (throttle)
    if (!firstPerson && state.frame % 2 === 0) {
      const headWorld = new THREE.Vector3()
      if (headRef.current) headRef.current.getWorldPosition(headWorld)
      const target = new THREE.Vector3(headWorld.x, headWorld.y + 0.6, headWorld.z)
      const desiredPos = new THREE.Vector3(headWorld.x + 3, headWorld.y + 2, headWorld.z + 6)
      camera.position.lerp(desiredPos, 0.08)
      camera.lookAt(target)
    }
  })

  return (
    <group>
      <mesh ref={ref} castShadow receiveShadow>
        <boxGeometry args={[1.5, 4.0, 1.2]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <group position={[0, visualYOffset, 0]}>
        <mesh ref={torsoRef} castShadow>
          <boxGeometry args={[1.2, 2.5, 0.8]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        <mesh ref={headRef} position={[0, headLocalY - visualYOffset, 0]} castShadow>
          <sphereGeometry args={[0.6, 16, 12]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      </group>
    </group>
  )
}
