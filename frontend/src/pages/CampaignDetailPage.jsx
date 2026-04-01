import { useEffect, useState } from 'react'
import axios from 'axios'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

const s = {
  page: { padding: '32px', maxWidth: '1200px', width: '100%' },
  back: { background: 'none', border: '1px solid #222', color: '#888', padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '24px' },
  header: { marginBottom: '28px' },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#fff' },
  sub: { color: '#666', fontSize: '0.85rem', marginTop: '4px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px', marginBottom: '28px' },
  statCard: { background: '#111', border: '1px solid #1f1f1f', borderRadius: '10px', padding: '16px', textAlign: 'center' },
  statValue: { fontSize: '1.7rem', fontWeight: 800, color: '#d4a017' },
  statLabel: { fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px' },
  spinner: { display: 'flex', justifyContent: 'center', padding: '60px' },
  progressWrap: { background: '#1a1a1a', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '28px' },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#d4a017,#22c55e)', borderRadius: '6px', transition: 'width 0.8s ease' }),
}

export default function CampaignDetailPage({ campaign, onBack }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/campaigns/${campaign.id}/orders?page_size=500`)
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [campaign.id])

  const total    = orders.length
  const sent     = orders.filter(o => o.status === 'sent').length
  const pending  = orders.filter(o => o.status === 'pending').length
  const error    = orders.filter(o => o.status === 'error').length
  const sentPct  = total > 0 ? Math.round(sent / total * 100) : 0

  return (
    <div style={s.page} className="fade-in">
      <button style={s.back} onClick={onBack}>← Retour au tableau de bord</button>

      <div style={s.header}>
        <div style={s.title}>{campaign.name}</div>
        <div style={s.sub}>{campaign.filename} · {new Date(campaign.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>

      <div style={s.stats}>
        {[
          { label: 'Total',       value: total   },
          { label: 'En attente',  value: pending  },
          { label: 'Envoyés',     value: sent     },
          { label: 'Erreurs',     value: error    },
          { label: 'Taux envoi',  value: `${sentPct}%` },
        ].map(({ label, value }) => (
          <div key={label} style={s.statCard}>
            <div style={s.statValue}>{value}</div>
            <div style={s.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={s.progressWrap}>
        <div style={s.progressFill(sentPct)} />
      </div>

      {loading
        ? <div style={s.spinner}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
        : <DataTable rows={orders} showStatus />
      }
    </div>
  )
}
