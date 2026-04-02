import { useEffect, useState } from 'react'
import axios from 'axios'
import StatusBadge from '../components/StatusBadge'
import EditContactModal from '../components/EditContactModal'
import BulkActionBar from '../components/BulkActionBar'

const s = {
  page: { padding: '32px', maxWidth: '1200px', width: '100%', paddingBottom: '80px' },
  back: { background: 'none', border: '1px solid #222', color: '#888', padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '24px' },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#fff' },
  sub: { color: '#666', fontSize: '0.85rem', marginTop: '4px', marginBottom: '28px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px', marginBottom: '20px' },
  statCard: { background: '#111', border: '1px solid #1f1f1f', borderRadius: '10px', padding: '16px', textAlign: 'center' },
  statValue: { fontSize: '1.7rem', fontWeight: 800, color: '#d4a017' },
  statLabel: { fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px' },
  progressWrap: { background: '#1a1a1a', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '28px' },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#d4a017,#22c55e)', borderRadius: '6px', transition: 'width 0.8s ease' }),

  tableWrap: { border: '1px solid #1f1f1f', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '11px 14px', background: '#0f0f0f', color: '#666', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1f1f1f', whiteSpace: 'nowrap' },
  td: { padding: '11px 14px', borderBottom: '1px solid #141414', color: '#ddd', verticalAlign: 'middle' },
  nil: { color: '#333' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d4a017' },
  selectedRow: { background: '#1a1500' },
  iconBtn: { background: 'none', border: '1px solid #222', borderRadius: '6px', color: '#b0b0b0', cursor: 'pointer', padding: '5px 8px', fontSize: '13px' },
  spinner: { display: 'flex', justifyContent: 'center', padding: '60px' },
}

const COLS = ['Prénom','Nom','Email','Téléphone','N° Commande','Statut','']

export default function CampaignDetailPage({ campaign, onBack }) {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [editing, setEditing]   = useState(null)
  const [bulkDel, setBulkDel]   = useState(false)

  useEffect(() => {
    axios.get(`/api/campaigns/${campaign.id}/orders?page_size=500`)
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [campaign.id])

  const total   = orders.length
  const sent    = orders.filter(o => o.status === 'sent').length
  const pending = orders.filter(o => o.status === 'pending').length
  const error   = orders.filter(o => o.status === 'error').length
  const sentPct = total > 0 ? Math.round(sent / total * 100) : 0

  const allSelected = total > 0 && orders.every(o => selected.has(o.id))
  const someSelected = orders.some(o => selected.has(o.id))

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(orders.map(o => o.id)))
  }
  function toggleOne(id) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function handleSaved(updated) {
    setOrders(os => os.map(o => o.id === updated.id ? { ...o, ...updated } : o))
    setEditing(null)
  }

  async function handleBulkDelete() {
    setBulkDel(true)
    const ids = [...selected]
    try {
      await axios.delete('/api/contacts/bulk', { data: { ids } })
      setOrders(os => os.filter(o => !selected.has(o.id)))
      setSelected(new Set())
    } finally { setBulkDel(false) }
  }

  return (
    <div style={s.page} className="fade-in">
      <button style={s.back} onClick={onBack}>← Retour au tableau de bord</button>

      <div style={s.title}>{campaign.name}</div>
      <div style={s.sub}>
        {campaign.filename} · {new Date(campaign.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>

      <div style={s.statsGrid}>
        {[
          { label: 'Total',      value: total   },
          { label: 'En attente', value: pending  },
          { label: 'Envoyés',    value: sent     },
          { label: 'Erreurs',    value: error    },
          { label: 'Taux envoi', value: `${sentPct}%` },
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

      {loading ? (
        <div style={s.spinner}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: '40px' }}>
                  <input
                    type="checkbox" style={s.checkbox}
                    checked={allSelected}
                    ref={el => el && (el.indeterminate = someSelected && !allSelected)}
                    onChange={toggleAll}
                  />
                </th>
                <th style={s.th}>#</th>
                {COLS.map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr key={order.id} style={selected.has(order.id) ? s.selectedRow : i % 2 === 1 ? { background: '#0d0d0d' } : {}}>
                  <td style={s.td}>
                    <input type="checkbox" style={s.checkbox} checked={selected.has(order.id)} onChange={() => toggleOne(order.id)} />
                  </td>
                  <td style={{ ...s.td, color: '#444' }}>{i + 1}</td>
                  <td style={s.td}><span style={order.first_name ? {} : s.nil}>{order.first_name || '—'}</span></td>
                  <td style={s.td}><span style={order.last_name  ? {} : s.nil}>{order.last_name  || '—'}</span></td>
                  <td style={s.td}>{order.email        || <span style={s.nil}>—</span>}</td>
                  <td style={s.td}>{order.phone        || <span style={s.nil}>—</span>}</td>
                  <td style={s.td}>{order.order_number || <span style={s.nil}>—</span>}</td>
                  <td style={s.td}><StatusBadge status={order.status} /></td>
                  <td style={s.td}>
                    <button style={s.iconBtn} title="Modifier" onClick={() => setEditing(order)}>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BulkActionBar count={selected.size} onDelete={handleBulkDelete} onClear={() => setSelected(new Set())} deleting={bulkDel} />

      {editing && <EditContactModal contact={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
    </div>
  )
}
