const NAV = [
  { id: 'home',      icon: '📊', label: 'Accueil'   },
  { id: 'campaigns', icon: '📁', label: 'Campagnes' },
  { id: 'import',    icon: '📂', label: 'Importer'  },
  { id: 'contacts',  icon: '👥', label: 'Contacts'  },
]

export default function BottomNav({ active, onNav }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#0d0d0d', borderTop: '1px solid #1a1a1a',
      display: 'flex', height: '60px',
    }}>
      {NAV.map(({ id, icon, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onNav(id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '2px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: isActive ? '#d4a017' : '#555',
              borderTop: isActive ? '2px solid #d4a017' : '2px solid transparent',
              transition: 'color 0.15s',
              padding: '6px 0 2px',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 400, letterSpacing: '0.02em' }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
