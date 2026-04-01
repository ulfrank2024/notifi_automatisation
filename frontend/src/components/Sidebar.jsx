const NAV = [
  { id: 'home',      icon: '📊', label: 'Tableau de bord' },
  { id: 'campaigns', icon: '📁', label: 'Campagnes'       },
  { id: 'import',    icon: '📂', label: 'Importer'        },
  { id: 'contacts',  icon: '👥', label: 'Contacts'        },
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
  version: { marginTop: 'auto', padding: '0 10px', color: '#333', fontSize: '0.72rem' },
}

export default function Sidebar({ active, onNav }) {
  return (
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
      <div style={s.version}>Jalon 1 — Beta</div>
    </aside>
  )
}
