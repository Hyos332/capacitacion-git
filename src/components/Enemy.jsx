import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

export default function Enemy({
  targetRef,
  speed = 2.2,
  chaseDistance = 0.6,
  start = [-8, 0.7, -8],
  facePath = '/textures/face.png' // ruta en public/
}) {
  const ref = useRef()
  const tmp = useRef(new THREE.Vector3())

  // Cargar textura original
  const faceTexture = useLoader(THREE.TextureLoader, facePath)

  // Crear textura circular a partir de la imagen usando un canvas
  const circleTexture = useMemo(() => {
    if (!faceTexture || !faceTexture.image) return null
    const img = faceTexture.image
    const size = 512 // resolución del canvas; puedes bajar para perf
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // dibujar máscara circular
    ctx.clearRect(0, 0, size, size)
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    // cubrir canvas con la imagen (cover)
    const iw = img.width || size
    const ih = img.height || size
    const scale = Math.max(size / iw, size / ih)
    const sw = iw * scale
    const sh = ih * scale
    const sx = (size - sw) / 2
    const sy = (size - sh) / 2
    ctx.drawImage(img, sx, sy, sw, sh)
    ctx.restore()

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return tex
  }, [faceTexture])

  React.useEffect(() => {
    if (ref.current) ref.current.position.set(start[0], start[1], start[2])
  }, [start])

  useFrame((_, delta) => {
    if (!ref.current || !targetRef || !targetRef.current) return

    const enemyPos = ref.current.position
    tmp.current.copy(targetRef.current)
    tmp.current.y = enemyPos.y // mantener misma altura

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
      {/* torso */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 1.2, 0.45]} />
        <meshStandardMaterial color="#550000" />
      </mesh>

      {/* cabeza base */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color="#331111" />
      </mesh>

      {/* cara circular (usa circleGeometry para una forma realmente circular) */}
      {circleTexture && (
        <mesh position={[0, 0.9, 0.32]} renderOrder={999}>
          <circleGeometry args={[0.28, 64]} />
          <meshBasicMaterial
            map={circleTexture}
            transparent={true}
            depthTest={true}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  )
}