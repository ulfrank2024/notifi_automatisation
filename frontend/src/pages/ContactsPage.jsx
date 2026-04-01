import { useEffect, useState } from 'react'
import axios from 'axios'
import DataTable from '../components/DataTable'

const s = {
  page: { padding: '32px', maxWidth: '1200px', width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#fff' },
  sub: { color: '#666', fontSize: '0.85rem', marginTop: '3px' },
  spinner: { display: 'flex', justifyContent: 'center', padding: '60px' },
  search: {
    background: '#111', border: '1px solid #222', borderRadius: '8px',
    color: '#fff', padding: '9px 14px', fontSize: '0.875rem', outline: 'none',
    fontFamily: 'inherit', width: '260px',
  },
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    axios.get('/api/campaigns/contacts?page_size=500')
      .then(r => setContacts(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = contacts.filter(c =>
    !search || [c.first_name, c.last_name, c.email, c.phone, c.order_number]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={s.page} className="fade-in">
      <div style={s.header}>
        <div>
          <div style={s.title}>Contacts</div>
          <div style={s.sub}>{contacts.length} contact{contacts.length > 1 ? 's' : ''} au total</div>
        </div>
        <input
          style={s.search}
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading
        ? <div style={s.spinner}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
        : <DataTable rows={filtered} showStatus />
      }
    </div>
  )
}
