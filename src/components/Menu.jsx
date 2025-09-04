import React, { useState, useEffect } from 'react'

export default function Menu({ title = 'SCAPE THE MOYS', onPlay, onSettings, onControls }) {
  const [showSettings, setShowSettings] = useState(false)
  const [showControls, setShowControls] = useState(false)

  // load Google Fonts once
  useEffect(() => {
    const id = 'gfont-horror'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&display=swap'
    document.head.appendChild(link)
  }, [])

  return (
    <>
      <style>{`
        .menu-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 30% 20%, rgba(80,0,0,0.55), rgba(0,0,0,0.9) 60%), linear-gradient(180deg, rgba(10,0,0,0.6), rgba(0,0,0,0.95));
          z-index: 500;
          pointer-events: auto;
          overflow: hidden;
        }
        .menu-card {
          width: min(760px, 92%);
          padding: 36px 30px;
          border-radius: 12px;
          background: rgba(8,8,8,0.5);
          box-shadow: 0 20px 60px rgba(0,0,0,0.85), inset 0 0 40px rgba(120,0,0,0.06);
          color: #f6e9e6;
          text-align: center;
          position: relative;
          border: 1px solid rgba(255,10,10,0.08);
          backdrop-filter: blur(2px);
        }
        /* Title with glitch + dripping blood accent */
        .horror-title {
          font-family: 'Creepster', system-ui, sans-serif;
          font-size: clamp(48px, 8vw, 112px);
          line-height: 0.85;
          margin: 0 0 10px;
          color: #fff;
          position: relative;
          letter-spacing: 2px;
          text-shadow:
            0 2px 0 rgba(0,0,0,0.6),
            0 8px 32px rgba(200,0,0,0.25);
        }
        .horror-title::after, .horror-title::before {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          overflow: hidden;
          clip: rect(0, 9999px, 0, 0);
        }
        /* glitch slices */
        .horror-title::before {
          color: rgba(255,40,40,0.85);
          transform: translate3d(-2px,-1px,0);
          text-shadow: none;
          animation: glitch-anim 2.4s infinite linear alternate-reverse;
        }
        .horror-title::after {
          color: rgba(180,0,0,0.9);
          transform: translate3d(2px,1px,0);
          animation: glitch-anim2 3s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim {
          0% { clip: rect(10px,9999px,60px,0); transform: translate3d(-2px,-1px,0) }
          25% { clip: rect(40px,9999px,90px,0); transform: translate3d(1px,0,0) }
          50% { clip: rect(0px,9999px,30px,0); transform: translate3d(-1px,1px,0) }
          75% { clip: rect(30px,9999px,80px,0); transform: translate3d(2px,-1px,0) }
          100% { clip: rect(15px,9999px,50px,0); transform: translate3d(-1px,0,0) }
        }
        @keyframes glitch-anim2 {
          0% { clip: rect(5px,9999px,40px,0); transform: translate3d(1px,0,0) }
          30% { clip: rect(25px,9999px,70px,0); transform: translate3d(-2px,1px,0) }
          60% { clip: rect(0px,9999px,35px,0); transform: translate3d(2px,-1px,0) }
          100% { clip: rect(20px,9999px,60px,0); transform: translate3d(0,1px,0) }
        }

        /* blood splat top */
        .blood-top {
          position: absolute;
          top: -40px;
          left: -20px;
          right: -20px;
          height: 160px;
          background-image: radial-gradient(ellipse at 10% 10%, rgba(120,0,0,0.9), rgba(0,0,0,0) 35%), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="160"><g fill="%23a30000"><ellipse cx="120" cy="30" rx="80" ry="18"/><ellipse cx="320" cy="24" rx="110" ry="22"/><ellipse cx="480" cy="36" rx="60" ry="16"/></g></svg>');
          background-repeat: no-repeat;
          background-size: cover;
          mix-blend-mode: multiply;
          opacity: 0.95;
          transform: skewY(-3deg);
          pointer-events: none;
        }

        .menu-buttons { display:flex; gap:12px; justify-content:center; margin-top:12px; }
        .btn-horror {
          padding: 12px 22px;
          border-radius: 10px;
          background: linear-gradient(180deg,#7b0000,#2b0000);
          color: #ffeaea;
          font-weight: 800;
          letter-spacing: 1px;
          border: 2px solid rgba(255,120,120,0.08);
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(0,0,0,0.6), inset 0 -6px 18px rgba(0,0,0,0.35);
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .btn-horror:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(0,0,0,0.75); }
        .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.06); color: #f0e8e8; }

        .menu-note { margin-top:10px; color: #d7c7c7; font-size: 14px; opacity: 0.95; }

        /* Modal styles keep similar dark theme */
        .modal-card { width: min(620px,92%); padding: 18px; border-radius: 8px; background: rgba(6,6,6,0.9); color:#f1eaea; box-shadow: 0 8px 36px rgba(0,0,0,0.8); }
        .modal-close { background:transparent; border:none; color:#fff; cursor:pointer; }

      `}</style>

      <div className="menu-overlay">
        <div className="menu-card" role="dialog" aria-modal="true">
          <div className="blood-top" />
          <h1 className="horror-title" data-text={title}>{title}</h1>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            <button className="btn-horror" onClick={() => onPlay && onPlay()}>JUGAR</button>
            <button className="btn-horror btn-ghost" onClick={() => setShowSettings(true)}>SETTINGS</button>
            <button className="btn-horror btn-ghost" onClick={() => setShowControls(true)}>CONTROLES</button>
          </div>

          <div className="menu-note">
            Haz click dentro del juego para bloquear el cursor y usar mouse + WASD. Pulsa Esc para liberar cursor.
          </div>
        </div>
      </div>

      {showSettings && (
        <Modal title="Settings" onClose={() => setShowSettings(false)}>
          <div style={{ color: '#ddd' }}>
            <p>Opciones: sensibilidad del mouse, sonido, efectos.</p>
            <p>Se guardarán en el futuro en localStorage.</p>
          </div>
        </Modal>
      )}

      {showControls && (
        <Modal title="Controles" onClose={() => setShowControls(false)}>
          <div style={{ color: '#ddd', textAlign: 'left' }}>
            <ul>
              <li>W A S D: mover</li>
              <li>Space: saltar</li>
              <li>Esc: desbloquear cursor</li>
              <li>Click: interacción</li>
            </ul>
          </div>
        </Modal>
      )}
    </>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 600, pointerEvents: 'auto'
    }}>
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="modal-close" onClick={onClose}>Cerrar</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}