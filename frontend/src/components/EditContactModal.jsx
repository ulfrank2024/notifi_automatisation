import { useState } from 'react'
import axios from 'axios'
import Modal from './Modal'

const STATUSES = [
  { value: 'pending',     label: '🔵 En attente'  },
  { value: 'in_progress', label: '🟡 En cours'    },
  { value: 'sent',        label: '🟢 Envoyé'      },
  { value: 'error',       label: '🔴 Erreur'      },
]

const s = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  full: { gridColumn: '1 / -1' },
  label: { display: 'block', color: '#999', fontSize: '0.78rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '9px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  select: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '9px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none' },
  actions: { display: 'flex', gap: '10px', marginTop: '24px' },
  btnSave: { flex: 1, background: 'linear-gradient(135deg,#d4a017,#8b6914)', color: '#000', fontWeight: 700, padding: '11px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' },
  btnCancel: { background: 'none', border: '1px solid #2a2a2a', color: '#888', padding: '11px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  error: { color: '#ef4444', fontSize: '0.82rem', marginTop: '12px' },
}

export default function EditContactModal({ contact, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name:   contact.first_name   || '',
    last_name:    contact.last_name    || '',
    email:        contact.email        || '',
    phone:        contact.phone        || '',
    order_number: contact.order_number || '',
    status:       contact.status       || 'pending',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function save() {
    setLoading(true); setError(null)
    try {
      const res = await axios.patch(`/api/contacts/${contact.id}`, form)
      onSaved(res.data)
      onClose()
    } catch (e) {
      setError(e.response?.data?.detail || 'Erreur lors de la sauvegarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Modifier le contact" onClose={onClose} width="520px">
      <div style={s.grid}>
        {[
          { key: 'first_name', label: 'Prénom' },
          { key: 'last_name',  label: 'Nom'    },
        ].map(({ key, label }) => (
          <div key={key}>
            <label style={s.label}>{label}</label>
            <input style={s.input} value={form[key]} onChange={e => set(key, e.target.value)} />
          </div>
        ))}

        <div style={s.full}>
          <label style={s.label}>Email</label>
          <input style={s.input} value={form.email} onChange={e => set('email', e.target.value)} />
        </div>

        {[
          { key: 'phone',        label: 'Téléphone'         },
          { key: 'order_number', label: 'N° Commande'        },
        ].map(({ key, label }) => (
          <div key={key}>
            <label style={s.label}>{label}</label>
            <input style={s.input} value={form[key]} onChange={e => set(key, e.target.value)} />
          </div>
        ))}

        <div>
          <label style={s.label}>Statut</label>
          <select style={s.select} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.actions}>
        <button style={s.btnCancel} onClick={onClose}>Annuler</button>
        <button style={{ ...s.btnSave, opacity: loading ? 0.6 : 1 }} onClick={save} disabled={loading}>
          {loading ? 'Sauvegarde…' : '💾 Sauvegarder'}
        </button>
      </div>
    </Modal>
  )
}
