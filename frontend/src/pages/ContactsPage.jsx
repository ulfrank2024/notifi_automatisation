import { useEffect, useState } from 'react'
import axios from 'axios'
import StatusBadge from '../components/StatusBadge'
import ContactDetailModal from '../components/ContactDetailModal'
import EditContactModal from '../components/EditContactModal'

const s = {
  page: { padding: '32px', maxWidth: '1200px', width: '100%' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#fff' },
  sub: { color: '#666', fontSize: '0.85rem', marginTop: '3px' },
  search: { background: '#111', border: '1px solid #222', borderRadius: '8px', color: '#fff', padding: '9px 14px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', width: '260px' },

  tableWrap: { border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '11px 14px', background: '#0f0f0f', color: '#666', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1f1f1f', whiteSpace: 'nowrap' },
  td: { padding: '11px 14px', borderBottom: '1px solid #141414', color: '#ddd', verticalAlign: 'middle' },
  nil: { color: '#333' },

  rowHover: { cursor: 'pointer', transition: 'background 0.1s' },

  // Action buttons
  iconBtn: (color) => ({
    background: 'none', border: '1px solid #222', borderRadius: '6px',
    color, cursor: 'pointer', padding: '5px 8px', fontSize: '13px',
    transition: 'border-color 0.15s, color 0.15s',
  }),
  actions: { display: 'flex', gap: '6px', justifyContent: 'flex-end' },

  // Delete confirm inline
  confirmRow: { background: '#1a0808', borderBottom: '1px solid #3a1010' },
  confirmCell: { padding: '10px 14px', color: '#ef4444', fontSize: '0.82rem' },
  confirmBtns: { display: 'flex', gap: '8px', marginTop: '6px' },
  btnDel: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  btnCancel: { background: 'none', border: '1px solid #333', color: '#888', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.8rem' },

  spinner: { display: 'flex', justifyContent: 'center', padding: '60px' },
  empty: { textAlign: 'center', padding: '48px', color: '#555' },
}

const COLS = [
  { key: '#',            label: '#'           },
  { key: 'first_name',   label: 'Prénom'      },
  { key: 'last_name',    label: 'Nom'         },
  { key: 'email',        label: 'Email'       },
  { key: 'phone',        label: 'Téléphone'   },
  { key: 'order_number', label: 'N° Commande' },
  { key: 'status',       label: 'Statut'      },
  { key: 'actions',      label: ''            },
]

export default function ContactsPage() {
  const [contacts, setContacts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [detail, setDetail]       = useState(null)   // contact → modal historique
  const [editing, setEditing]     = useState(null)   // contact → modal édition
  const [confirming, setConfirm]  = useState(null)   // contact id → confirm suppression
  const [deleting, setDeleting]   = useState(false)

  function load() {
    setLoading(true)
    axios.get('/api/campaigns/contacts?page_size=500')
      .then(r => setContacts(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function handleSaved(updated) {
    setContacts(cs => cs.map(c => c.id === updated.id ? { ...c, ...updated } : c))
  }

  async function handleDelete(id) {
    setDeleting(true)
    try {
      await axios.delete(`/api/contacts/${id}`)
      setContacts(cs => cs.filter(c => c.id !== id))
      setConfirm(null)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = contacts.filter(c =>
    !search || [c.first_name, c.last_name, c.email, c.phone, c.order_number]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={s.page} className="fade-in">
      <div style={s.topBar}>
        <div>
          <div style={s.title}>Contacts</div>
          <div style={s.sub}>{contacts.length} contact{contacts.length > 1 ? 's' : ''} au total</div>
        </div>
        <input style={s.search} placeholder="🔍  Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={s.spinner}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>Aucun contact.</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>{COLS.map(c => <th key={c.key} style={s.th}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((contact, i) => (
                <>
                  <tr
                    key={contact.id}
                    style={{ ...(i % 2 === 1 ? { background: '#0d0d0d' } : {}), ...s.rowHover }}
                    onClick={(e) => {
                      // Ne pas ouvrir le détail si on clique sur les boutons d'action
                      if (e.target.closest('[data-action]')) return
                      setDetail(contact)
                    }}
                  >
                    <td style={{ ...s.td, color: '#444', width: '40px' }}>{i + 1}</td>
                    <td style={s.td}><span style={contact.first_name ? {} : s.nil}>{contact.first_name || '—'}</span></td>
                    <td style={s.td}><span style={contact.last_name  ? {} : s.nil}>{contact.last_name  || '—'}</span></td>
                    <td style={s.td}>{contact.email        || <span style={s.nil}>—</span>}</td>
                    <td style={s.td}>{contact.phone        || <span style={s.nil}>—</span>}</td>
                    <td style={s.td}>{contact.order_number || <span style={s.nil}>—</span>}</td>
                    <td style={s.td}><StatusBadge status={contact.status} /></td>
                    <td style={s.td}>
                      <div style={s.actions} data-action="true">
                        <button
                          data-action="true"
                          style={s.iconBtn('#b0b0b0')}
                          title="Modifier"
                          onClick={(e) => { e.stopPropagation(); setEditing(contact); setConfirm(null) }}
                        >✏️</button>
                        <button
                          data-action="true"
                          style={s.iconBtn('#ef4444')}
                          title="Supprimer"
                          onClick={(e) => { e.stopPropagation(); setConfirm(contact.id); setEditing(null) }}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>

                  {/* Confirm suppression inline */}
                  {confirming === contact.id && (
                    <tr key={`confirm-${contact.id}`} style={s.confirmRow}>
                      <td colSpan={8} style={s.confirmCell}>
                        Supprimer <strong>{contact.email || 'ce contact'}</strong> définitivement ?
                        <div style={s.confirmBtns}>
                          <button style={s.btnDel} onClick={() => handleDelete(contact.id)} disabled={deleting}>
                            {deleting ? 'Suppression…' : 'Confirmer'}
                          </button>
                          <button style={s.btnCancel} onClick={() => setConfirm(null)}>Annuler</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail  && <ContactDetailModal contact={detail}  onClose={() => setDetail(null)} />}
      {editing && <EditContactModal   contact={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
    </div>
  )
}
