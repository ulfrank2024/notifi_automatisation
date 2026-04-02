import { useEffect, useState } from 'react'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'

const s = {
  page: { padding: '24px 16px', maxWidth: '1100px', width: '100%' },
  pageDesktop: { padding: '32px', maxWidth: '1100px', width: '100%' },

  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '1.2rem', fontWeight: 700, color: '#fff' },

  card: { background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '16px', textAlign: 'center' },
  cardIcon: { fontSize: '18px', marginBottom: '8px' },
  cardValue: { fontSize: '1.8rem', fontWeight: 800, color: '#d4a017', lineHeight: 1 },
  cardLabel: { fontSize: '0.7rem', color: '#666', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  cardSub: { fontSize: '0.8rem', color: '#22c55e', fontWeight: 600, marginTop: '3px' },

  section: { marginBottom: '28px' },
  sectionTitle: { fontSize: '0.78rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' },

  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#0f0f0f', color: '#555', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1f1f1f', whiteSpace: 'nowrap' },
  td: { padding: '11px 12px', borderBottom: '1px solid #141414', color: '#ddd', verticalAlign: 'middle' },

  progressBar: { height: '4px', background: '#1a1a1a', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, background: '#22c55e', borderRadius: '2px', transition: 'width 0.5s ease' }),

  viewBtn: { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#d4a017', padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  importBtn: { background: 'linear-gradient(135deg,#d4a017,#8b6914)', color: '#000', fontWeight: 700, padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' },

  empty: { textAlign: 'center', padding: '36px', color: '#555' },
  spinner: { display: 'flex', justifyContent: 'center', padding: '48px' },
}

export default function HomePage({ onViewCampaign, onImport }) {
  const isMobile = useIsMobile()
  const [stats, setStats]     = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([axios.get('/api/campaigns/stats'), axios.get('/api/campaigns/history')])
      .then(([st, hi]) => { setStats(st.data); setHistory(hi.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={s.spinner}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>

  const CARDS = [
    { icon: '📁', value: stats?.total_campaigns ?? 0, label: 'Campagnes', sub: null },
    { icon: '👥', value: stats?.total_contacts  ?? 0, label: 'Contacts',  sub: null },
    { icon: '🟢', value: stats?.sent            ?? 0, label: 'Envoyés',   sub: stats?.send_rate ? `${stats.send_rate}%` : null },
    { icon: '🔵', value: stats?.pending         ?? 0, label: 'En attente',sub: null },
    { icon: '🔴', value: stats?.error           ?? 0, label: 'Erreurs',   sub: null },
  ]

  return (
    <div style={isMobile ? s.page : s.pageDesktop} className="fade-in">
      <div style={s.topBar}>
        <div style={s.title}>Tableau de bord</div>
        <button style={s.importBtn} onClick={onImport}>+ Importer</button>
      </div>

      {/* Stats grid */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        {CARDS.map(({ icon, value, label, sub }) => (
          <div key={label} style={s.card}>
            <div style={s.cardIcon}>{icon}</div>
            <div style={s.cardValue}>{value}</div>
            <div style={s.cardLabel}>{label}</div>
            {sub && <div style={s.cardSub}>{sub} taux d'envoi</div>}
          </div>
        ))}
      </div>

      {/* Historique */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Campagnes récentes</div>
        {history.length === 0 ? (
          <div style={s.empty}>
            Aucune campagne. <span style={{ color: '#d4a017', cursor: 'pointer' }} onClick={onImport}>Importer →</span>
          </div>
        ) : (
          <div style={{ border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="table-scroll">
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Campagne', 'Date', 'Total', 'Progression', ''].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((c, i) => {
                    const total   = c.total_orders || 0
                    const sentPct = total > 0 ? Math.round(c.sent / total * 100) : 0
                    return (
                      <tr key={c.id} style={i % 2 === 1 ? { background: '#0d0d0d' } : {}}>
                        <td style={{ ...s.td, fontWeight: 600, color: '#fff' }}>{c.name}</td>
                        <td style={{ ...s.td, color: '#777', whiteSpace: 'nowrap' }}>
                          {new Date(c.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{total}</td>
                        <td style={{ ...s.td, minWidth: '100px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>{sentPct}%</div>
                          <div style={s.progressBar}><div style={s.progressFill(sentPct)} /></div>
                        </td>
                        <td style={s.td}>
                          <button style={s.viewBtn} onClick={() => onViewCampaign(c)}>Voir →</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
