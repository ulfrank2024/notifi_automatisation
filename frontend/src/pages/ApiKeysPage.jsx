import { useEffect, useState } from 'react'
import axios from 'axios'

const s = {
  page: { padding: '32px', maxWidth: '900px', width: '100%', paddingBottom: '80px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#fff' },
  sub: { color: '#666', fontSize: '0.85rem', marginTop: '3px' },

  genBtn: { background: 'linear-gradient(135deg,#d4a017,#b8860b)', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' },

  // Formulaire création
  createBox: { background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '24px' },
  createTitle: { color: '#d4a017', fontWeight: 700, marginBottom: '14px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  row: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  input: { background: '#111', border: '1px solid #222', borderRadius: '8px', color: '#fff', padding: '9px 14px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', flex: 1, minWidth: '200px' },
  submitBtn: { background: '#d4a017', color: '#000', border: 'none', borderRadius: '8px', padding: '9px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },

  // Alerte clé affichée une seule fois
  keyAlert: { background: '#0a1a0a', border: '1px solid #2a5a2a', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' },
  keyAlertTitle: { color: '#4ade80', fontWeight: 700, marginBottom: '8px', fontSize: '0.9rem' },
  keyAlertWarn: { color: '#f59e0b', fontSize: '0.8rem', marginBottom: '10px' },
  keyDisplay: { background: '#060f06', border: '1px solid #1a3a1a', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#4ade80', wordBreak: 'break-all', marginBottom: '10px' },
  copyBtn: { background: '#1a3a1a', color: '#4ade80', border: '1px solid #2a5a2a', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit' },

  tableWrap: { border: '1px solid #1f1f1f', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '11px 14px', background: '#0f0f0f', color: '#666', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1f1f1f', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: '1px solid #141414', color: '#ddd', verticalAlign: 'middle' },

  badge: (active) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
    background: active ? '#0a3a0a' : '#1a0a0a',
    color: active ? '#4ade80' : '#ef4444',
    border: `1px solid ${active ? '#1a5a1a' : '#3a1010'}`,
  }),

  revokeBtn: { background: 'none', border: '1px solid #333', color: '#ef4444', padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 },

  confirmBox: { background: '#1a0808', padding: '10px 14px', borderBottom: '1px solid #3a1010' },
  confirmTxt: { color: '#ef4444', fontSize: '0.82rem', marginBottom: '8px' },
  confirmBtns: { display: 'flex', gap: '8px' },
  btnConfirm: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  btnCancel: { background: 'none', border: '1px solid #333', color: '#888', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.8rem' },

  empty: { textAlign: 'center', padding: '60px 20px', color: '#444' },
  mono: { fontFamily: 'monospace', color: '#d4a017' },
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('fr-CA', { dateStyle: 'short', timeStyle: 'short' })
}

export default function ApiKeysPage() {
  const [keys, setKeys]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName]     = useState('')
  const [creating, setCreating]   = useState(false)
  const [newKey, setNewKey]       = useState(null)   // clé affichée une seule fois
  const [copied, setCopied]       = useState(false)
  const [revoking, setRevoking]   = useState(null)   // id en cours de confirmation

  const load = () => {
    axios.get('/api/api-keys/').then(r => setKeys(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const r = await axios.post('/api/api-keys/', { name: newName.trim() })
      setNewKey(r.data)
      setNewName('')
      setShowCreate(false)
      load()
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id) => {
    await axios.delete(`/api/api-keys/${id}`)
    setRevoking(null)
    load()
  }

  const handleCopy = () => {
    if (!newKey) return
    navigator.clipboard.writeText(newKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <div style={s.title}>Clés API Partenaires</div>
          <div style={s.sub}>Accès sécurisé pour la compagnie partenaire (X-API-Key)</div>
        </div>
        <button style={s.genBtn} onClick={() => { setShowCreate(true); setNewKey(null) }}>
          + Nouvelle clé
        </button>
      </div>

      {/* Formulaire création */}
      {showCreate && (
        <div style={s.createBox}>
          <div style={s.createTitle}>Créer une nouvelle clé API</div>
          <div style={s.row}>
            <input
              style={s.input}
              placeholder="Nom de la clé (ex: Compagnie X - Production)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button style={s.submitBtn} onClick={handleCreate} disabled={creating}>
              {creating ? 'Création…' : 'Créer'}
            </button>
            <button style={{ ...s.btnCancel, padding: '9px 16px' }} onClick={() => setShowCreate(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Alerte clé générée — visible une seule fois */}
      {newKey && (
        <div style={s.keyAlert}>
          <div style={s.keyAlertTitle}>Clé API créée avec succès</div>
          <div style={s.keyAlertWarn}>
            Copiez cette clé maintenant. Elle ne sera plus jamais affichée.
          </div>
          <div style={s.keyDisplay}>{newKey.key}</div>
          <button style={s.copyBtn} onClick={handleCopy}>
            {copied ? 'Copié !' : 'Copier la clé'}
          </button>
        </div>
      )}

      {/* Tableau des clés */}
      {loading ? (
        <div style={s.empty}>Chargement…</div>
      ) : keys.length === 0 ? (
        <div style={s.empty}>Aucune clé API. Créez-en une pour commencer.</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Nom</th>
                <th style={s.th}>Préfixe</th>
                <th style={s.th}>Statut</th>
                <th style={s.th}>Dernière utilisation</th>
                <th style={s.th}>Créée le</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <>
                  <tr key={k.id} style={revoking === k.id ? { background: '#1a0808' } : {}}>
                    <td style={s.td}><strong style={{ color: '#fff' }}>{k.name}</strong></td>
                    <td style={{ ...s.td, ...s.mono }}>{k.key_prefix}</td>
                    <td style={s.td}><span style={s.badge(k.is_active)}>{k.is_active ? 'Active' : 'Révoquée'}</span></td>
                    <td style={s.td}>{fmt(k.last_used_at)}</td>
                    <td style={s.td}>{fmt(k.created_at)}</td>
                    <td style={s.td}>
                      {k.is_active && (
                        <button style={s.revokeBtn} onClick={() => setRevoking(revoking === k.id ? null : k.id)}>
                          Révoquer
                        </button>
                      )}
                    </td>
                  </tr>
                  {revoking === k.id && (
                    <tr key={k.id + '_confirm'}>
                      <td colSpan={6} style={s.confirmBox}>
                        <div style={s.confirmTxt}>Révoquer définitivement cette clé ? Toutes les intégrations utilisant cette clé cesseront de fonctionner.</div>
                        <div style={s.confirmBtns}>
                          <button style={s.btnConfirm} onClick={() => handleRevoke(k.id)}>Oui, révoquer</button>
                          <button style={s.btnCancel} onClick={() => setRevoking(null)}>Annuler</button>
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

      {/* Doc rapide */}
      <div style={{ marginTop: '32px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' }}>
        <div style={{ color: '#888', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Utilisation</div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#aaa', lineHeight: 1.8 }}>
          <div style={{ color: '#555', marginBottom: '6px' }}># Header à ajouter à chaque requête</div>
          <div><span style={{ color: '#d4a017' }}>X-API-Key</span><span style={{ color: '#fff' }}>: nf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</span></div>
          <div style={{ marginTop: '14px', color: '#555' }}># Endpoints disponibles</div>
          <div><span style={{ color: '#4ade80' }}>GET </span> /company/campaigns</div>
          <div><span style={{ color: '#4ade80' }}>GET </span> /company/campaigns/&#123;id&#125;/status</div>
          <div><span style={{ color: '#60a5fa' }}>POST</span> /company/campaigns/&#123;id&#125;/send</div>
          <div><span style={{ color: '#60a5fa' }}>POST</span> /company/contacts/import</div>
        </div>
      </div>
    </div>
  )
}
