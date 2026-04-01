import { useEffect, useState } from 'react'
import axios from 'axios'
import Modal from './Modal'
import StatusBadge from './StatusBadge'

const s = {
  identity: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  avatar: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#d4a017,#8b6914)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: 800, color: '#000', flexShrink: 0,
  },
  name: { fontSize: '1.1rem', fontWeight: 700, color: '#fff' },
  email: { color: '#888', fontSize: '0.85rem', marginTop: '2px' },
  phone: { color: '#666', fontSize: '0.82rem' },

  sectionTitle: { fontSize: '0.72rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' },

  orderCard: {
    background: '#161616', border: '1px solid #222', borderRadius: '10px',
    padding: '14px 16px', marginBottom: '10px',
    display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center',
  },
  orderNum: { fontWeight: 700, color: '#d4a017', fontSize: '0.9rem' },
  campaign: { color: '#777', fontSize: '0.78rem', marginTop: '2px' },
  date: { color: '#555', fontSize: '0.75rem', marginTop: '3px' },
  spinner: { display: 'flex', justifyContent: 'center', padding: '32px' },
  empty: { textAlign: 'center', color: '#555', padding: '32px' },
}

export default function ContactDetailModal({ contact, onClose }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/contacts/${contact.id}/history`)
      .then(r => setHistory(r.data))
      .finally(() => setLoading(false))
  }, [contact.id])

  const initials = [contact.first_name, contact.last_name]
    .filter(Boolean).map(s => s[0]).join('').toUpperCase() || '?'

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || '—'

  return (
    <Modal title="Historique du contact" onClose={onClose} width="560px">
      {/* Identité */}
      <div style={s.identity}>
        <div style={s.avatar}>{initials}</div>
        <div>
          <div style={s.name}>{fullName}</div>
          <div style={s.email}>{contact.email || '—'}</div>
          <div style={s.phone}>{contact.phone || ''}</div>
        </div>
      </div>

      {/* Historique commandes */}
      <div style={s.sectionTitle}>
        {loading ? 'Chargement…' : `${history.length} commande${history.length > 1 ? 's' : ''} trouvée${history.length > 1 ? 's' : ''}`}
      </div>

      {loading ? (
        <div style={s.spinner}><div className="spinner" /></div>
      ) : history.length === 0 ? (
        <div style={s.empty}>Aucune commande trouvée.</div>
      ) : (
        history.map((order) => (
          <div key={order.id} style={s.orderCard}>
            <div>
              <div style={s.orderNum}>{order.order_number || 'N° non renseigné'}</div>
              <div style={s.campaign}>📁 {order.campaign_name}</div>
              <div style={s.date}>
                {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>
        ))
      )}
    </Modal>
  )
}
