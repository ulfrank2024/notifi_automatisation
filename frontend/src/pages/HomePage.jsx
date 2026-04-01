import { useEffect, useState } from 'react'
import axios from 'axios'
import StatusBadge from '../components/StatusBadge'

const s = {
  page: { padding: '32px', maxWidth: '1100px', width: '100%' },
  pageTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '28px' },

  // Stats cards
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '36px' },
  card: { background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px' },
  cardIcon: { fontSize: '20px', marginBottom: '10px' },
  cardValue: { fontSize: '2rem', fontWeight: 800, color: '#d4a017', lineHeight: 1 },
  cardLabel: { fontSize: '0.75rem', color: '#666', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  cardSub: { fontSize: '0.85rem', color: '#22c55e', fontWeight: 600, marginTop: '4px' },

  // History table
  section: { marginBottom: '36px' },
  sectionTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '10px 14px', background: '#0f0f0f', color: '#666', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1f1f1f' },
  td: { padding: '12px 14px', borderBottom: '1px solid #141414', color: '#ddd', verticalAlign: 'middle' },
  progressBar: { height: '4px', background: '#1a1a1a', borderRadius: '2px', marginTop: '5px', overflow: 'hidden' },
  progressFill: (pct, color) => ({ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.5s ease' }),
  viewBtn: { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#d4a017', padding: '5px 14px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '48px', color: '#555' },
  spinner: { display: 'flex', justifyContent: 'center', padding: '48px' },
}

export default function HomePage({ onViewCampaign, onImport }) {
  const [stats, setStats]       = useState(null)
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/campaigns/stats'),
      axios.get('/api/campaigns/history'),
    ]).then(([s, h]) => {
      setStats(s.data)
      setHistory(h.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={s.spinner}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>

  const CARDS = [
    { icon: '📁', value: stats?.total_campaigns ?? 0, label: 'Campagnes',       sub: null },
    { icon: '👥', value: stats?.total_contacts  ?? 0, label: 'Contacts',        sub: null },
    { icon: '🟢', value: stats?.sent            ?? 0, label: 'Envoyés',         sub: stats?.send_rate ? `${stats.send_rate}%` : null },
    { icon: '🔵', value: stats?.pending         ?? 0, label: 'En attente',      sub: null },
    { icon: '🔴', value: stats?.error           ?? 0, label: 'Erreurs',         sub: null },
  ]

  return (
    <div style={s.page} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={s.pageTitle}>Tableau de bord</div>
        <button
          onClick={onImport}
          style={{ background: 'linear-gradient(135deg, #d4a017, #8b6914)', color: '#000', fontWeight: 700, padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          + Nouvelle importation
        </button>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
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
        <div style={s.sectionTitle}>Historique des campagnes</div>
        {history.length === 0 ? (
          <div style={s.empty}>Aucune campagne. <span style={{ color: '#d4a017', cursor: 'pointer' }} onClick={onImport}>Importer un fichier →</span></div>
        ) : (
          <div style={{ border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Campagne', 'Fichier', 'Date', 'Total', 'Progression', 'Erreurs', ''].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((c, i) => {
                  const total = c.total_orders || 0
                  const sentPct  = total > 0 ? Math.round(c.sent  / total * 100) : 0
                  const errPct   = total > 0 ? Math.round(c.error / total * 100) : 0
                  return (
                    <tr key={c.id} style={i % 2 === 1 ? { background: '#0d0d0d' } : {}}>
                      <td style={{ ...s.td, fontWeight: 600, color: '#fff' }}>{c.name}</td>
                      <td style={{ ...s.td, color: '#777', fontSize: '0.8rem' }}>{c.filename}</td>
                      <td style={{ ...s.td, color: '#666', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{total}</td>
                      <td style={{ ...s.td, minWidth: '120px' }}>
                        <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '3px' }}>
                          {c.sent}/{total} envoyés ({sentPct}%)
                        </div>
                        <div style={s.progressBar}>
                          <div style={s.progressFill(sentPct, '#22c55e')} />
                        </div>
                      </td>
                      <td style={s.td}>
                        {c.error > 0
                          ? <span style={{ color: '#ef4444', fontWeight: 600 }}>{c.error}</span>
                          : <span style={{ color: '#333' }}>—</span>}
                      </td>
                      <td style={s.td}>
                        <button style={s.viewBtn} onClick={() => onViewCampaign(c)}>
                          Voir →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
