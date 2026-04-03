import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ChangePasswordModal from './ChangePasswordModal'

export default function MobileHeader({ onNav }) {
  const { email, logout } = useAuth()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [showPwd, setShowPwd]     = useState(false)

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '52px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          <span style={{
            fontWeight: 800, fontSize: '1rem',
            background: 'linear-gradient(90deg,#d4a017,#f0c040)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>NOTIF-FLOW</span>
        </div>

        {/* Menu burger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{ background: 'none', border: '1px solid #222', borderRadius: '7px', color: '#888', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Drawer menu */}
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{
              position: 'absolute', top: '52px', right: 0, width: '240px',
              background: '#111', border: '1px solid #1f1f1f', borderRadius: '0 0 0 12px',
              padding: '12px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ color: '#555', fontSize: '0.78rem', padding: '8px 10px' }}>👤 {email}</div>
            <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '8px', paddingTop: '8px' }}>
              {[
                { icon: '🔐', label: 'API Partenaire', action: () => { onNav?.('api-keys'); setMenuOpen(false) } },
                { icon: '🔑', label: 'Changer le mot de passe', action: () => { setShowPwd(true); setMenuOpen(false) } },
                { icon: '🚪', label: 'Déconnexion', action: logout, red: true },
              ].map(({ icon, label, action, red }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '8px', background: 'none',
                    border: 'none', cursor: 'pointer', color: red ? '#ef4444' : '#aaa',
                    fontSize: '0.875rem', fontFamily: 'inherit', textAlign: 'left',
                  }}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPwd && <ChangePasswordModal onClose={() => setShowPwd(false)} />}
    </>
  )
}
