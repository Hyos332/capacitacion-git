import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { Physics, usePlane } from '@react-three/cannon'
import Player from './components/Player'

function Ground() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -0.5, 0] }))
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#8b228bff" />
    </mesh>
  )
}

export default function App() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Canvas shadows camera={{ position: [10, 20, 40], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 40, 20]} intensity={0.9} castShadow />
        <Physics gravity={[0, -9.81, 0]}>
          <Ground />
          <Player />
        </Physics>
        <OrbitControls />
        <Stats />
      </Canvas>
    </div>
  )
}