import { useState } from 'react'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'
import FileUpload from '../components/FileUpload'
import ColumnMapper from '../components/ColumnMapper'
import DataTable from '../components/DataTable'

const s = {
  card: { background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px' },
  cardTitle: { color: '#d4a017', fontWeight: 600, fontSize: '0.95rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  steps: { display: 'flex', gap: '6px', marginBottom: '20px' },
  step: (active, done) => ({
    flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: '8px',
    fontSize: '0.75rem', fontWeight: 600, border: '1px solid',
    borderColor: done ? '#22c55e' : active ? '#d4a017' : '#1f1f1f',
    color: done ? '#22c55e' : active ? '#d4a017' : '#444',
    background: done ? '#0a1f12' : active ? '#1a1500' : 'transparent',
  }),
  input: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' },
  label: { display: 'block', color: '#999', fontSize: '0.78rem', marginBottom: '5px', fontWeight: 500 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' },
  statCard: { background: '#1a1a1a', borderRadius: '10px', padding: '14px', border: '1px solid #222', textAlign: 'center' },
  statValue: { fontSize: '1.4rem', fontWeight: 800, color: '#d4a017' },
  statLabel: { fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', marginTop: '3px' },
  toast: (type) => ({
    position: 'fixed', bottom: '80px', right: '16px', left: '16px',
    padding: '12px 16px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, zIndex: 1000,
    background: type === 'success' ? '#0a1f12' : '#1f0a0a',
    border: `1px solid ${type === 'success' ? '#22c55e' : '#ef4444'}`,
    color: type === 'success' ? '#22c55e' : '#ef4444',
  }),
}

const STEPS = ['1. Import', '2. Mapping', '3. Résultat']

export default function ImportPage({ onDone }) {
  const isMobile = useIsMobile()
  const [step, setStep]             = useState(0)
  const [preview, setPreview]       = useState(null)
  const [rawFile, setRawFile]       = useState(null)
  const [mapping, setMapping]       = useState({})
  const [campaignName, setName]     = useState('')
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [toast, setToast]           = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  function handlePreview(data, file) {
    setPreview(data); setRawFile(file); setMapping({})
    setName(file.name.replace(/\.[^.]+$/, '')); setStep(1)
  }

  async function handleImport() {
    if (!campaignName.trim()) { showToast('Nommez la campagne.', 'error'); return }
    setLoading(true)
    try {
      const b64 = await toBase64(rawFile)
      const { data } = await axios.post('/api/campaigns/', { filename: rawFile.name, file_content_b64: b64, campaign_name: campaignName, mapping })
      showToast(`${data.inserted} contacts importés.`)
      const res = await axios.get(`/api/campaigns/${data.campaign_id}/orders`)
      setOrders(res.data); setStep(2); onDone?.()
    } catch (e) {
      showToast(e.response?.data?.detail || 'Erreur d\'importation.', 'error')
    } finally { setLoading(false) }
  }

  function reset() { setStep(0); setPreview(null); setRawFile(null); setMapping({}); setName(''); setOrders([]) }

  const padStyle = { padding: isMobile ? '16px' : '32px', maxWidth: '900px', width: '100%' }

  return (
    <div style={padStyle} className="fade-in">
      <div style={s.steps}>
        {STEPS.map((label, i) => <div key={i} style={s.step(step === i, step > i)}>{label}</div>)}
      </div>

      {step === 0 && (
        <div style={s.card}>
          <div style={s.cardTitle}>📂 Importer un fichier</div>
          <FileUpload onPreview={handlePreview} />
        </div>
      )}

      {step === 1 && preview && (
        <div style={s.card} className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={s.cardTitle}>📄 {preview.filename} — {preview.total} lignes</div>
            <button onClick={reset} style={{ background: 'none', color: '#666', fontSize: '0.78rem', padding: '5px 10px', borderRadius: '6px', border: '1px solid #222', cursor: 'pointer' }}>← Retour</button>
          </div>
          <label style={s.label}>Nom de la campagne</label>
          <input style={{ ...s.input, marginBottom: '4px' }} value={campaignName} onChange={e => setName(e.target.value)} placeholder="Ex: Commandes Avril 2026" />
          <ColumnMapper columns={preview.columns} mapping={mapping} onChange={setMapping} onConfirm={handleImport} loading={loading} />
        </div>
      )}

      {step === 2 && (
        <div style={s.card} className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={s.cardTitle}>✅ Importation réussie</div>
            <button onClick={reset} style={{ background: 'linear-gradient(135deg,#d4a017,#8b6914)', color: '#000', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
              + Nouveau
            </button>
          </div>
          <div style={{ ...s.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)' }}>
            {[
              { label: 'Total',      value: orders.length },
              { label: 'En attente', value: orders.filter(o => o.status === 'pending').length },
              { label: 'Envoyés',    value: orders.filter(o => o.status === 'sent').length },
              { label: 'Erreurs',    value: orders.filter(o => o.status === 'error').length },
            ].map(({ label, value }) => (
              <div key={label} style={s.statCard}>
                <div style={s.statValue}>{value}</div>
                <div style={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>
          <div className="table-scroll">
            <DataTable rows={orders} showStatus />
          </div>
        </div>
      )}

      {toast && <div style={s.toast(toast.type)}>{toast.msg}</div>}
    </div>
  )
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
