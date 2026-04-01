import { useEffect, useState } from 'react'
import axios from 'axios'
import BulkActionBar from '../components/BulkActionBar'

const s = {
  page: { padding: '32px', maxWidth: '1100px', width: '100%', paddingBottom: '80px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#fff' },
  sub: { color: '#666', fontSize: '0.85rem', marginTop: '3px' },
  search: { background: '#111', border: '1px solid #222', borderRadius: '8px', color: '#fff', padding: '9px 14px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', width: '240px' },

  tableWrap: { border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '11px 14px', background: '#0f0f0f', color: '#666', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1f1f1f', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: '1px solid #141414', color: '#ddd', verticalAlign: 'middle' },

  checkbox: { width: '16px', height: '16px', cursor: 'pointer', accentColor: '#d4a017' },
  selectedRow: { background: '#1a1500' },

  progressBar: { height: '5px', background: '#1a1a1a', borderRadius: '3px', marginTop: '5px', overflow: 'hidden', minWidth: '100px' },
  progressFill: (pct, color) => ({ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s ease' }),

  viewBtn: { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#d4a017', padding: '5px 14px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, marginRight: '6px' },
  delBtn:  { background: 'none', border: '1px solid #333', color: '#ef4444', padding: '5px 10px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },

  confirmRow: { background: '#1a0808' },
  confirmCell: { padding: '10px 14px', color: '#ef4444', fontSize: '0.82rem', borderBottom: '1px solid #3a1010' },
  confirmBtns: { display: 'flex', gap: '8px', marginTop: '6px' },
  btnDel: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  btnCancel: { background: 'none', border: '1px solid #333', color: '#888', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.8rem' },

  spinner: { display: 'flex', justifyContent: 'center', padding: '60px' },
  empty: { textAlign: 'center', padding: '48px', color: '#555' },
}

export default function CampaignsPage({ onView, onImport }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(new Set())
  const [confirming, setConfirm]  = useState(null)
  const [deleting, setDeleting]   = useState(false)
  const [bulkDel, setBulkDel]     = useState(false)

  function load() {
    setLoading(true)
    axios.get('/api/campaigns/history')
      .then(r => setCampaigns(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = campaigns.filter(c =>
    !search || [c.name, c.filename].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const allSelected  = filtered.length > 0 && filtered.every(c => selected.has(c.id))
  const someSelected = filtered.some(c => selected.has(c.id))

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(filtered.map(c => c.id)))
  }
  function toggleOne(id) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  async function handleDelete(id) {
    setDeleting(true)
    try {
      await axios.delete(`/api/campaigns/${id}`)
      setCampaigns(cs => cs.filter(c => c.id !== id))
      setSelected(s => { const n = new Set(s); n.delete(id); return n })
      setConfirm(null)
    } finally { setDeleting(false) }
  }

  async function handleBulkDelete() {
    setBulkDel(true)
    const ids = [...selected]
    try {
      await Promise.all(ids.map(id => axios.delete(`/api/campaigns/${id}`)))
      setCampaigns(cs => cs.filter(c => !selected.has(c.id)))
      setSelected(new Set())
    } finally { setBulkDel(false) }
  }

  return (
    <div style={s.page} className="fade-in">
      <div style={s.topBar}>
        <div>
          <div style={s.title}>Campagnes</div>
          <div style={s.sub}>{campaigns.length} campagne{campaigns.length > 1 ? 's' : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input style={s.search} placeholder="🔍  Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={onImport} style={{ background: 'linear-gradient(135deg,#d4a017,#8b6914)', color: '#000', fontWeight: 700, padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            + Importer
          </button>
        </div>
      </div>

      {loading ? (
        <div style={s.spinner}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          Aucune campagne. <span style={{ color: '#d4a017', cursor: 'pointer' }} onClick={onImport}>Importer un fichier →</span>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: '40px' }}>
                  <input type="checkbox" style={s.checkbox} checked={allSelected}
                    ref={el => el && (el.indeterminate = someSelected && !allSelected)}
                    onChange={toggleAll} />
                </th>
                {['Campagne','Fichier','Date','Contacts','Progression','Erreurs',''].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const total   = c.total_orders || 0
                const sentPct = total > 0 ? Math.round(c.sent  / total * 100) : 0
                const errPct  = total > 0 ? Math.round(c.error / total * 100) : 0
                return (
                  <>
                    <tr key={c.id} style={selected.has(c.id) ? s.selectedRow : i % 2 === 1 ? { background: '#0d0d0d' } : {}}>
                      <td style={s.td}>
                        <input type="checkbox" style={s.checkbox} checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} />
                      </td>
                      <td style={{ ...s.td, fontWeight: 600, color: '#fff' }}>{c.name}</td>
                      <td style={{ ...s.td, color: '#777', fontSize: '0.8rem' }}>{c.filename}</td>
                      <td style={{ ...s.td, color: '#888', fontSize: '0.8rem' }}>
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{total}</td>
                      <td style={{ ...s.td, minWidth: '130px' }}>
                        <div style={{ fontSize: '0.78rem', color: '#888' }}>{c.sent}/{total} ({sentPct}%)</div>
                        <div style={s.progressBar}><div style={s.progressFill(sentPct, '#22c55e')} /></div>
                      </td>
                      <td style={s.td}>
                        {c.error > 0
                          ? <span style={{ color: '#ef4444', fontWeight: 600 }}>{c.error}</span>
                          : <span style={{ color: '#333' }}>—</span>}
                      </td>
                      <td style={s.td}>
                        <button style={s.viewBtn} onClick={() => onView(c)}>Voir →</button>
                        <button style={s.delBtn} title="Supprimer" onClick={() => { setConfirm(c.id); }}>🗑️</button>
                      </td>
                    </tr>

                    {confirming === c.id && (
                      <tr key={`confirm-${c.id}`} style={s.confirmRow}>
                        <td colSpan={8} style={s.confirmCell}>
                          Supprimer la campagne <strong>"{c.name}"</strong> et ses {total} contacts ?
                          <div style={s.confirmBtns}>
                            <button style={s.btnDel} onClick={() => handleDelete(c.id)} disabled={deleting}>
                              {deleting ? 'Suppression…' : 'Confirmer'}
                            </button>
                            <button style={s.btnCancel} onClick={() => setConfirm(null)}>Annuler</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <BulkActionBar count={selected.size} onDelete={handleBulkDelete} onClear={() => setSelected(new Set())} deleting={bulkDel} />
    </div>
  )
}
