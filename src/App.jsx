import React, { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls, Stats } from '@react-three/drei'
import { Physics, usePlane } from '@react-three/cannon'
import * as THREE from 'three'
import Player from './components/Player'
import InstancedChunk from './components/InstancedChunk'
import Menu from './components/Menu'
import PauseMenu from './components/PauseMenu'
import Enemy from './components/Enemy'

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
  const [paused, setPaused] = useState(false)
  const firstPerson = true
  const playerPosRef = useRef(new THREE.Vector3())

  const tryLock = () => {
    const ctrl = controlsRef.current
    if (ctrl && typeof ctrl.lock === 'function' && !ctrl.isLocked) {
      try { ctrl.lock() } catch (e) { /* necesita gesto del usuario */ }
    }
  }

  // Añade/elimina el listener de click SOBRE EL CANVAS solo cuando estemos en GAMEPLAY
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    function onCanvasClick() {
      if (!menuOpen && !paused) tryLock()
    }

    if (!menuOpen && !paused) {
      canvas.addEventListener('click', onCanvasClick)
    }

    return () => {
      canvas.removeEventListener('click', onCanvasClick)
    }
  }, [menuOpen, paused])

  // ESC: abrir/cerrar pausa (no desbloquea el cursor)
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape' || menuOpen) return
      setPaused(p => {
        const next = !p
        if (!next) setTimeout(tryLock, 50)
        return next
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // si browser sale del pointer lock (p. ej. ESC), abrimos pausa automáticamente
  useEffect(() => {
    function onPointerLockChange() {
      const locked = document.pointerLockElement != null
      if (!locked && !menuOpen && !paused) {
        setPaused(true)
      }
    }
    document.addEventListener('pointerlockchange', onPointerLockChange)
    return () => document.removeEventListener('pointerlockchange', onPointerLockChange)
  }, [menuOpen, paused])

  // G: desbloquear cursor manualmente
  useEffect(() => {
    function onKey(e) {
      if (e.key.toLowerCase() !== 'g') return
      const ctrl = controlsRef.current
      if (ctrl && typeof ctrl.unlock === 'function' && ctrl.isLocked) {
        try { ctrl.unlock() } catch (err) { /* ignore */ }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  const handleResume = () => {
    setPaused(false)
    setTimeout(tryLock, 50)
  }
  const handleQuit = () => {
    const ctrl = controlsRef.current
    if (ctrl && typeof ctrl.unlock === 'function' && ctrl.isLocked) ctrl.unlock()
    setPaused(false)
    setMenuOpen(true)
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {menuOpen && (
        <Menu
          title="SCAPE THE MOYS"
          onPlay={() => { setMenuOpen(false); setTimeout(tryLock, 50) }}
          onSettings={() => {}}
          onControls={() => {}}
        />
      )}

      {paused && !menuOpen && (
        <PauseMenu
          onResume={handleResume}
          onSettings={() => {}}
          onQuit={handleQuit}
        />
      )}

      {!menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: 'radial-gradient(ellipse at center, rgba(120,0,0,0.06) 0%, rgba(30,0,0,0.18) 40%, rgba(0,0,0,0.6) 90%)'
        }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: 160,
            background: 'linear-gradient(180deg, rgba(180,0,0,0.45), rgba(180,0,0,0.12))',
            mixBlendMode: 'multiply', opacity: 0.7, transform: 'skewY(-2deg)'
          }} />
        </div>
      )}

      <Canvas shadows camera={{ position: [6, 3, 10], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 40, 20]} intensity={0.9} castShadow />
        <Physics gravity={[0, -9.81, 0]}>
          <Ground />
          {chunkElements}
          <Player
            firstPerson={firstPerson}
            controlsRef={controlsRef}
            enabled={!menuOpen && !paused}
            playerPosRef={playerPosRef}
          />
        </Physics>

        {(!menuOpen && !paused) && <PointerLockControls ref={controlsRef} />}

        {/* ENEMY: solo en gameplay */}
        {(!menuOpen && !paused) && <Enemy targetRef={playerPosRef} speed={2.5} start={[-10, 0.7, -10]} />}

        <Stats />
      </Canvas>

      <div style={{ position: 'fixed', left: 12, bottom: 12, color: '#fff', fontFamily: 'Arial', zIndex: 6 }}>
        <div>Primera persona (siempre). W A S D: mover · Space: salto</div>
        <div>G desbloquea cursor · Esc abre/cierran menú de pausa.</div>
      </div>
    </div>
  )
}