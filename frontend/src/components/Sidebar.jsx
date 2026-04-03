import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ChangePasswordModal from './ChangePasswordModal'

const NAV = [
  { id: 'home',      icon: '📊', label: 'Tableau de bord' },
  { id: 'import',    icon: '📂', label: 'Importer'        },
  { id: 'campaigns', icon: '📁', label: 'Campagnes'       },
  { id: 'send',      icon: '📨', label: 'Envoyer'         },
  { id: 'contacts',  icon: '👥', label: 'Contacts'        },
  { id: 'api-keys',  icon: '🔐', label: 'API Partenaire'  },
]

const s = {
  sidebar: { width: '220px', minWidth: '220px', background: '#0d0d0d', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', padding: '24px 12px', gap: '4px' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px', marginBottom: '32px' },
  logoText: { fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(90deg, #d4a017, #f0c040)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  item: (active) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: active ? 600 : 400,
    color: active ? '#d4a017' : '#888',
    background: active ? '#1a1500' : 'transparent',
    border: active ? '1px solid #3a2800' : '1px solid transparent',
    transition: 'all 0.15s',
  }),
  footer: { marginTop: 'auto', borderTop: '1px solid #1a1a1a', paddingTop: '12px' },
  emailBadge: { padding: '8px 10px', color: '#555', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.875rem', color: '#666', border: '1px solid transparent',
    background: 'transparent', width: '100%', fontFamily: 'inherit',
    transition: 'color 0.15s, background 0.15s',
  },
  version: { color: '#2a2a2a', fontSize: '0.7rem', padding: '6px 10px 0' },
}

export default function Sidebar({ active, onNav }) {
  const { email, logout } = useAuth()
  const [showChangePwd, setShowChangePwd] = useState(false)

  return (
    <>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <span>⚡</span>
          <span style={s.logoText}>NOTIF-FLOW</span>
        </div>

        {NAV.map(({ id, icon, label }) => (
          <div key={id} style={s.item(active === id)} onClick={() => onNav(id)}>
            <span style={{ fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{icon}</span>
            {label}
          </div>
        ))}

        <div style={s.footer}>
          <div style={s.emailBadge}>👤 {email}</div>
          <button
            style={s.logoutBtn}
            onClick={() => setShowChangePwd(true)}
            onMouseEnter={e => { e.currentTarget.style.color = '#d4a017'; e.currentTarget.style.background = '#1a1500' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#666';    e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: '15px' }}>🔑</span> Changer le mot de passe
          </button>
          <button
            style={s.logoutBtn}
            onClick={logout}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#1f0a0a' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#666';    e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: '15px' }}>🚪</span> Déconnexion
          </button>
          <div style={s.version}>Jalon 2 — Beta</div>
        </div>
      </aside>

      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
    </>
  )
}
