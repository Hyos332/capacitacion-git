import React, { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import { useTrimesh } from '@react-three/cannon'

function BaldiMapWithCollision({ position = [0, -1, 0], scale = 1 }) {
  const { scene, nodes } = useGLTF('/models/baldi_map.glb')
  
  // intentar obtener geometría del primer mesh para colisión
  const firstMesh = Object.values(nodes).find(node => node.isMesh)
  const geometry = firstMesh?.geometry
  
  // crear colisión trimesh si tenemos geometría
  const [ref] = useTrimesh(() => {
    if (!geometry) return { args: [] }
    const vertices = geometry.attributes.position.array
    const indices = geometry.index ? geometry.index.array : null
    return {
      args: [vertices, indices],
      position,
      scale: [scale, scale, scale],
      type: 'Static'
    }
  })
  
  const clonedScene = scene.clone()
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} castShadow receiveShadow />
      {geometry && <mesh ref={ref} visible={false} />}
    </group>
  )
}

export default function MapModel({ position, scale }) {
  return (
    <Suspense fallback={null}>
      <BaldiMapWithCollision position={position} scale={scale} />
    </Suspense>
  )
}