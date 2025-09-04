import React, { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls, Stats } from '@react-three/drei'
import { Physics, usePlane } from '@react-three/cannon'
import Player from './components/Player'
import InstancedChunk from './components/InstancedChunk'
import Menu from './components/Menu'

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
  const [menuOpen, setMenuOpen] = useState(true)
  const firstPerson = true

  const tryLock = () => {
    const ctrl = controlsRef.current
    if (ctrl && typeof ctrl.lock === 'function' && !ctrl.isLocked) {
      try { ctrl.lock() } catch (e) { /* requiere gesto del usuario */ }
    }
  }

  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const onClick = () => tryLock()
    canvas.addEventListener('click', onClick)
    return () => canvas.removeEventListener('click', onClick)
  }, [])

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
      {/* Menu overlay */}
      {menuOpen && (
        <Menu
          title="SCAPE THE MOYS"
          onPlay={() => { setMenuOpen(false); setTimeout(tryLock, 50) }}
          onSettings={() => {}}
          onControls={() => {}}
        />
      )}

      {/* blood-y vignette cuando el juego está corriendo (puedes ajustar opacidad/estilo) */}
      {!menuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 5,
          background: 'radial-gradient(ellipse at center, rgba(120,0,0,0.06) 0%, rgba(30,0,0,0.18) 40%, rgba(0,0,0,0.6) 90%)'
        }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: 160,
            background: 'linear-gradient(180deg, rgba(180,0,0,0.45), rgba(180,0,0,0.12))',
            mixBlendMode: 'multiply',
            opacity: 0.7,
            transform: 'skewY(-2deg)'
          }} />
        </div>
      )}

      <Canvas shadows camera={{ position: [6, 3, 10], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 40, 20]} intensity={0.9} castShadow />
        <Physics gravity={[0, -9.81, 0]}>
          <Ground />
          {chunkElements}
          {/* enabled = !menuOpen -> jugador solo puede moverse cuando menu cerrado */}
          <Player firstPerson={firstPerson} controlsRef={controlsRef} enabled={!menuOpen} />
        </Physics>

        {/* PointerLockControls montado siempre; lock se realiza al Play o click */}
        <PointerLockControls ref={controlsRef} />
        <Stats />
      </Canvas>

      <div style={{ position: 'fixed', left: 12, bottom: 12, color: '#fff', fontFamily: 'Arial', zIndex: 6 }}>
        <div>Primera persona (siempre). Click en canvas para bloquear cursor. W A S D: mover · Space: salto</div>
        <div>Esc desbloquea cursor.</div>
      </div>
    </div>
  )
}