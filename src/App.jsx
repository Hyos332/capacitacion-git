import React, { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls, Stats } from '@react-three/drei'
import { Physics, usePlane } from '@react-three/cannon'
import Player from './components/Player'
import InstancedChunk from './components/InstancedChunk'

function Ground() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -0.5, 0] }))
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#228B22" />
    </mesh>
  )
}

export default function App() {
  const controlsRef = useRef()
  const firstPerson = true // siempre primera persona

  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    function tryLock() {
      const ctrl = controlsRef.current
      if (ctrl && typeof ctrl.lock === 'function' && !ctrl.isLocked) {
        try { ctrl.lock() } catch (e) { /* requiere gesto del usuario */ }
      }
    }

    function onClickOnce() {
      tryLock()
      canvas.removeEventListener('click', onClickOnce)
    }

    // siempre escuchar click para intentar lock (necesario por gesture policy)
    canvas.addEventListener('click', onClickOnce)
    tryLock()

    return () => {
      canvas.removeEventListener('click', onClickOnce)
      const ctrl = controlsRef.current
      if (ctrl && typeof ctrl.unlock === 'function' && ctrl.isLocked) ctrl.unlock()
    }
  }, [])

  // world chunks (opcionales)
  const chunkSize = [16, 4, 16]
  const chunksX = 3
  const chunksZ = 3
  const [sx,, sz] = chunkSize
  const startX = - (chunksX * sx) / 2
  const startZ = - (chunksZ * sz) / 2
  const chunkElements = []
  for (let cx = 0; cx < chunksX; cx++) {
    for (let cz = 0; cz < chunksZ; cz++) {
      const offsetX = startX + cx * sx
      const offsetZ = startZ + cz * sz
      chunkElements.push(<InstancedChunk key={`c-${cx}-${cz}`} size={chunkSize} offset={[offsetX, 0, offsetZ]} density={0.18} />)
    }
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Canvas shadows camera={{ position: [6, 3, 10], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 40, 20]} intensity={0.9} castShadow />
        <Physics gravity={[0, -9.81, 0]}>
          <Ground />
          {chunkElements}
          <Player firstPerson={firstPerson} controlsRef={controlsRef} />
        </Physics>

        {/* siempre montamos PointerLockControls para FP */}
        <PointerLockControls ref={controlsRef} />
        <Stats />
      </Canvas>

      <div style={{ position: 'fixed', left: 12, bottom: 12, color: '#fff', fontFamily: 'Arial' }}>
        <div>Primera persona (siempre). Click en canvas para bloquear cursor. W A S D: mover · Space: salto</div>
        <div>Esc desbloquea cursor.</div>
      </div>
    </div>
  )
}