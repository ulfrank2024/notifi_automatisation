import { useEffect, useState } from 'react'
import axios from 'axios'
import StatusBadge from '../components/StatusBadge'
import ContactDetailModal from '../components/ContactDetailModal'
import EditContactModal from '../components/EditContactModal'
import BulkActionBar from '../components/BulkActionBar'

const s = {
  page: { padding: '32px', maxWidth: '1200px', width: '100%', paddingBottom: '80px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#fff' },
  sub: { color: '#666', fontSize: '0.85rem', marginTop: '3px' },
  search: { background: '#111', border: '1px solid #222', borderRadius: '8px', color: '#fff', padding: '9px 14px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', width: '260px' },
  tableWrap: { border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '11px 14px', background: '#0f0f0f', color: '#666', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1f1f1f', whiteSpace: 'nowrap' },
  td: { padding: '11px 14px', borderBottom: '1px solid #141414', color: '#ddd', verticalAlign: 'middle' },
  nil: { color: '#333' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d4a017' },
  iconBtn: (color) => ({ background: 'none', border: '1px solid #222', borderRadius: '6px', color, cursor: 'pointer', padding: '5px 8px', fontSize: '13px' }),
  actions: { display: 'flex', gap: '6px', justifyContent: 'flex-end' },
  confirmRow: { background: '#1a0808' },
  confirmCell: { padding: '10px 14px', color: '#ef4444', fontSize: '0.82rem', borderBottom: '1px solid #3a1010' },
  confirmBtns: { display: 'flex', gap: '8px', marginTop: '6px' },
  btnDel: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  btnCancel: { background: 'none', border: '1px solid #333', color: '#888', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.8rem' },
  spinner: { display: 'flex', justifyContent: 'center', padding: '60px' },
  empty: { textAlign: 'center', padding: '48px', color: '#555' },
  selectedRow: { background: '#1a1500' },
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(new Set())
  const [detail, setDetail]     = useState(null)
  const [editing, setEditing]   = useState(null)
  const [confirming, setConfirm]= useState(null)
  const [deleting, setDeleting] = useState(false)
  const [bulkDel, setBulkDel]   = useState(false)

  function load() {
    setLoading(true)
    axios.get('/api/campaigns/contacts?page_size=500')
      .then(r => setContacts(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = contacts.filter(c =>
    !search || [c.first_name, c.last_name, c.email, c.phone, c.order_number]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  // Sélection
  const allSelected = filtered.length > 0 && filtered.every(c => selected.has(c.id))
  const someSelected = filtered.some(c => selected.has(c.id))

  function toggleAll() {
    if (allSelected) {
      setSelected(s => { const n = new Set(s); filtered.forEach(c => n.delete(c.id)); return n })
    } else {
      setSelected(s => { const n = new Set(s); filtered.forEach(c => n.add(c.id)); return n })
    }
  }

  function toggleOne(id) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // Suppression simple
  async function handleDelete(id) {
    setDeleting(true)
    try {
      await axios.delete(`/api/contacts/${id}`)
      setContacts(cs => cs.filter(c => c.id !== id))
      setSelected(s => { const n = new Set(s); n.delete(id); return n })
      setConfirm(null)
    } finally { setDeleting(false) }
  }

  // Suppression en masse
  async function handleBulkDelete() {
    setBulkDel(true)
    const ids = [...selected]
    try {
      await axios.delete('/api/contacts/bulk', { data: { ids } })
      setContacts(cs => cs.filter(c => !selected.has(c.id)))
      setSelected(new Set())
    } finally { setBulkDel(false) }
  }

  function handleSaved(updated) {
    setContacts(cs => cs.map(c => c.id === updated.id ? { ...c, ...updated } : c))
  }

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
              <tr>
                <th style={{ ...s.th, width: '40px' }}>
                  <input
                    type="checkbox" style={s.checkbox}
                    checked={allSelected}
                    ref={el => el && (el.indeterminate = someSelected && !allSelected)}
                    onChange={toggleAll}
                  />
                </th>
                {['#','Prénom','Nom','Email','Téléphone','N° Commande','Statut',''].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact, i) => (
                <>
                  <tr
                    key={contact.id}
                    style={selected.has(contact.id) ? s.selectedRow : i % 2 === 1 ? { background: '#0d0d0d' } : {}}
                    onClick={(e) => {
                      if (e.target.closest('[data-action]') || e.target.type === 'checkbox') return
                      setDetail(contact)
                    }}
                    style={{ ...(selected.has(contact.id) ? s.selectedRow : i % 2 === 1 ? { background: '#0d0d0d' } : {}), cursor: 'pointer' }}
                  >
                    <td style={s.td} data-action="true" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" style={s.checkbox} checked={selected.has(contact.id)} onChange={() => toggleOne(contact.id)} />
                    </td>
                    <td style={{ ...s.td, color: '#444', width: '40px' }}>{i + 1}</td>
                    <td style={s.td}><span style={contact.first_name ? {} : s.nil}>{contact.first_name || '—'}</span></td>
                    <td style={s.td}><span style={contact.last_name  ? {} : s.nil}>{contact.last_name  || '—'}</span></td>
                    <td style={s.td}>{contact.email        || <span style={s.nil}>—</span>}</td>
                    <td style={s.td}>{contact.phone        || <span style={s.nil}>—</span>}</td>
                    <td style={s.td}>{contact.order_number || <span style={s.nil}>—</span>}</td>
                    <td style={s.td}><StatusBadge status={contact.status} /></td>
                    <td style={s.td}>
                      <div style={s.actions} data-action="true">
                        <button data-action="true" style={s.iconBtn('#b0b0b0')} title="Modifier"
                          onClick={e => { e.stopPropagation(); setEditing(contact); setConfirm(null) }}>✏️</button>
                        <button data-action="true" style={s.iconBtn('#ef4444')} title="Supprimer"
                          onClick={e => { e.stopPropagation(); setConfirm(contact.id); setEditing(null) }}>🗑️</button>
                      </div>
                    </td>
                  </tr>

                  {confirming === contact.id && (
                    <tr key={`confirm-${contact.id}`} style={s.confirmRow}>
                      <td colSpan={9} style={s.confirmCell}>
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

      <BulkActionBar count={selected.size} onDelete={handleBulkDelete} onClear={() => setSelected(new Set())} deleting={bulkDel} />

      {detail  && <ContactDetailModal contact={detail}  onClose={() => setDetail(null)} />}
      {editing && <EditContactModal   contact={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
    </div>
  )
}
