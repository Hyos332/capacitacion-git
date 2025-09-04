import React from 'react'

export default function PauseMenu({ onResume, onSettings, onQuit }) {
  return (
    <>
      <style>{`
        .pause-overlay {
          position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.85));
          z-index: 700; pointer-events: auto;
        }
        .pause-card {
          width: min(560px, 92%); padding: 28px; border-radius: 12px;
          background: rgba(10,8,8,0.6); border: 1px solid rgba(160,0,0,0.08);
          box-shadow: 0 18px 60px rgba(0,0,0,0.85); color: #fff; text-align: center;
        }
        .pause-title {
          font-family: 'Creepster', system-ui, sans-serif;
          font-size: 56px; margin: 6px 0 10px; color: #ffefef; text-shadow: 0 6px 20px rgba(120,0,0,0.25);
        }
        .pause-note { color: #d1c2c2; margin-bottom: 12px; }
        .pause-buttons { display:flex; gap:12px; justify-content:center; margin-top:8px; }
        .btn-horror { padding: 10px 18px; border-radius: 8px; background: linear-gradient(180deg,#7b0000,#2b0000); color:#ffeaea; border:none; cursor:pointer; font-weight:700; }
        .btn-ghost { background: transparent; border:1px solid rgba(255,255,255,0.06); color:#f0e8e8; }
      `}</style>

      <div className="pause-overlay" role="dialog" aria-modal="true">
        <div className="pause-card">
          <h2 className="pause-title">PAUSA</h2>
          <div className="pause-note">Juego en pausa — pulsa Esc o RESUME para volver</div>

          <div className="pause-buttons">
            <button className="btn-horror" onClick={onResume}>RESUME</button>
            <button className="btn-ghost" onClick={onSettings}>SETTINGS</button>
            <button className="btn-ghost" onClick={onQuit}>QUIT</button>
          </div>
        </div>
      </div>
    </>
  )
}