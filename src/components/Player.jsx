import React, { useRef, useEffect } from 'react'
import { useBox } from '@react-three/cannon'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Player({ firstPerson = false, controlsRef = null, enabled = true }) {
  const { camera } = useThree()

  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 1.0, 5],
    args: [0.6, 1.2, 0.45],
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

  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const upVec = new THREE.Vector3(0, 1, 0)
  const camPos = useRef(new THREE.Vector3())

  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()

  const visualYOffset = 0.18
  const headLocalY = 0.7 // posición Y de la cabeza dentro del grupo visual

  // cuando controlsRef y el mesh existan, parentear el objeto de controls al mesh (una sola vez)
  useEffect(() => {
    const tryAttach = () => {
      if (!controlsRef || !controlsRef.current || !ref.current) return
      const ctrlObj = typeof controlsRef.current.getObject === 'function'
        ? controlsRef.current.getObject()
        : controlsRef.current
      if (!ctrlObj) return

      // si no está ya parentado, añadirlo al mesh para que la cámara siga al collider
      if (ctrlObj.parent !== ref.current) {
        // posición local dentro del jugador: colocar en la altura de la cabeza
        ctrlObj.position.set(0, visualYOffset + headLocalY, 0)
        ref.current.add(ctrlObj)
      }
    }

    tryAttach()
    // también reintentar si controles se montan más tarde
    const id = setInterval(tryAttach, 500)
    return () => {
      clearInterval(id)
      if (controlsRef && controlsRef.current && ref.current) {
        const ctrlObj = typeof controlsRef.current.getObject === 'function'
          ? controlsRef.current.getObject()
          : controlsRef.current
        if (ctrlObj && ctrlObj.parent === ref.current) ref.current.remove(ctrlObj)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlsRef, ref.current])

  useFrame((state) => {
    // si no está enabled, bloquear movimiento horizontal
    if (!enabled) {
      const currentY = vel.current[1] ?? 0
      api.velocity.set(0, currentY, 0)
      return
    }

    // determine control object: prefer controls object (FP) otherwise camera
    const ctrlObj = controlsRef && controlsRef.current
      ? (typeof controlsRef.current.getObject === 'function' ? controlsRef.current.getObject() : controlsRef.current)
      : null

    // dirección de referencia: control object (FP) o cámara (TP)
    const dirSource = ctrlObj || camera
    dirSource.getWorldDirection(forward.current)
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

    // salto
    const onGround = Math.abs(currentY) < 0.15
    if (keys.current.space && onGround) {
      api.applyImpulse([0, 5, 0], [0, 0, 0])
    }

    // animaciones
    const hSpeed = Math.hypot(vel.current[0] ?? 0, vel.current[2] ?? 0)
    const t = state.clock.getElapsedTime()
    const walkSpeed = Math.min(hSpeed, 6) / 6
    const angle = Math.sin(t * 8) * 0.6 * walkSpeed
    if (leftLegRef.current) leftLegRef.current.rotation.x = angle
    if (rightLegRef.current) rightLegRef.current.rotation.x = -angle
    if (leftArmRef.current) leftArmRef.current.rotation.x = -angle * 0.6
    if (rightArmRef.current) rightArmRef.current.rotation.x = angle * 0.6

    if (headRef.current) headRef.current.position.y = headLocalY + 0.06 * Math.abs(Math.sin(t * 8)) * walkSpeed

    // EN ESTA VERSIÓN NO FORZAMOS ctrlObj.position cada frame.
    // La cámara ya está parentada al mesh (en useEffect) y seguirá al collider automáticamente.
    if (!firstPerson) {
      // tercera persona: cámara detrás del jugador (lerp)
      if (ref.current) {
        ref.current.getWorldPosition(camPos.current)
        const target = new THREE.Vector3(camPos.current.x, camPos.current.y + 0.6, camPos.current.z)
        const desiredPos = new THREE.Vector3(camPos.current.x + 3, camPos.current.y + 2, camPos.current.z + 6)
        camera.position.lerp(desiredPos, 0.08)
        camera.lookAt(target)
      }
    }
  })

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[0.6, 1.2, 0.45]} />
      <meshBasicMaterial visible={false} />

      {!firstPerson && (
        <group position={[0, visualYOffset, 0]}>
          <mesh ref={headRef} position={[0, headLocalY, 0]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ffcc99" />
          </mesh>

          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.6, 0.7, 0.35]} />
            <meshStandardMaterial color="#8b5a2b" />
          </mesh>

          <mesh ref={leftArmRef} position={[-0.45, 0.1, 0]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.18]} />
            <meshStandardMaterial color="#ffcc99" />
          </mesh>
          <mesh ref={rightArmRef} position={[0.45, 0.1, 0]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.18]} />
            <meshStandardMaterial color="#ffcc99" />
          </mesh>

          <mesh ref={leftLegRef} position={[-0.15, -0.45, 0]} castShadow>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh ref={rightLegRef} position={[0.15, -0.45, 0]} castShadow>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      )}
    </mesh>
  )
}
