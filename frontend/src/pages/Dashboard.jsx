import { useState } from 'react'
import axios from 'axios'
import FileUpload from '../components/FileUpload'
import ColumnMapper from '../components/ColumnMapper'
import DataTable from '../components/DataTable'

const s = {
  root: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' },

  // Header
  header: {
    borderBottom: '1px solid #1a1a1a',
    padding: '0 32px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#0d0d0d',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { fontSize: '22px' },
  logoText: { fontWeight: 700, fontSize: '1.15rem', background: 'linear-gradient(90deg, #d4a017, #f0c040)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  headerBadge: { background: '#1a1500', border: '1px solid #d4a017', color: '#d4a017', borderRadius: '20px', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600 },

  // Layout
  main: { flex: 1, padding: '32px', maxWidth: '1100px', margin: '0 auto', width: '100%' },

  // Section card
  card: { background: '#111111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '28px' },
  cardTitle: { color: '#d4a017', fontWeight: 600, fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },

  // Steps
  steps: { display: 'flex', gap: '8px', marginBottom: '32px' },
  step: (active, done) => ({
    flex: 1,
    textAlign: 'center',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    border: '1px solid',
    borderColor: done ? '#22c55e' : active ? '#d4a017' : '#2a2a2a',
    color: done ? '#22c55e' : active ? '#d4a017' : '#444',
    background: done ? '#0d2b1a' : active ? '#1a1500' : 'transparent',
    transition: 'all 0.2s',
  }),

  // Inputs
  inputGroup: { marginBottom: '16px' },
  inputLabel: { display: 'block', color: '#b0b0b0', fontSize: '0.8rem', marginBottom: '6px', fontWeight: 500 },
  input: {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#fff',
    padding: '10px 14px',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
  },

  // Toast
  toast: (type) => ({
    position: 'fixed', bottom: '24px', right: '24px',
    padding: '14px 20px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500,
    background: type === 'success' ? '#0d2b1a' : '#2d0d0d',
    border: `1px solid ${type === 'success' ? '#22c55e' : '#ef4444'}`,
    color: type === 'success' ? '#22c55e' : '#ef4444',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease',
  }),

  // Stats bar
  stats: { display: 'flex', gap: '16px', marginBottom: '24px' },
  statCard: { flex: 1, background: '#1a1a1a', borderRadius: '10px', padding: '16px', border: '1px solid #2a2a2a', textAlign: 'center' },
  statValue: { fontSize: '1.6rem', fontWeight: 700, color: '#d4a017' },
  statLabel: { fontSize: '0.75rem', color: '#666', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' },
}

const STEPS = ['1. Import', '2. Mapping', '3. Données']

export default function Dashboard() {
  const [step, setStep] = useState(0)
  const [preview, setPreview] = useState(null)
  const [rawFile, setRawFile] = useState(null)
  const [mapping, setMapping] = useState({})
  const [campaignName, setCampaignName] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  function handlePreview(data, file) {
    setPreview(data)
    setRawFile(file)
    setMapping({})
    setCampaignName(file.name.replace(/\.[^.]+$/, ''))
    setStep(1)
  }

  async function handleImport() {
    if (!campaignName.trim()) { showToast('Veuillez nommer la campagne.', 'error'); return }
    setLoading(true)
    try {
      const b64 = await toBase64(rawFile)
      const { data } = await axios.post('/api/campaigns/', {
        filename: rawFile.name,
        file_content_b64: b64,
        campaign_name: campaignName,
        mapping,
      })
      showToast(`Campagne créée — ${data.inserted} lignes importées.`)
      // Charger les commandes de la campagne
      const res = await axios.get(`/api/campaigns/${data.campaign_id}/orders`)
      setOrders(res.data)
      setStep(2)
    } catch (e) {
      showToast(e.response?.data?.detail || 'Erreur lors de l\'importation.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep(0); setPreview(null); setRawFile(null); setMapping({}); setCampaignName(''); setOrders([])
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          <span style={s.logoIcon}>⚡</span>
          <span style={s.logoText}>NOTIF-FLOW</span>
        </div>
        <span style={s.headerBadge}>Jalon 1 — Beta</span>
      </header>

      <main style={s.main}>
        {/* Steps */}
        <div style={s.steps}>
          {STEPS.map((label, i) => (
            <div key={i} style={s.step(step === i, step > i)}>{label}</div>
          ))}
        </div>

        {/* STEP 0 — Import */}
        {step === 0 && (
          <div style={s.card} className="fade-in">
            <div style={s.cardTitle}><span>📂</span> Importer un fichier</div>
            <FileUpload onPreview={handlePreview} />
          </div>
        )}

        {/* STEP 1 — Mapping */}
        {step === 1 && preview && (
          <div style={s.card} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={s.cardTitle}><span>📄</span> {preview.filename} — {preview.total} lignes détectées</div>
              <button onClick={reset} style={{ background: 'none', color: '#666', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px', border: '1px solid #2a2a2a' }}>← Recommencer</button>
            </div>

            <div style={s.inputGroup}>
              <label style={s.inputLabel}>Nom de la campagne</label>
              <input
                style={s.input}
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Ex: Commandes Juin 2024"
              />
            </div>

            <ColumnMapper
              columns={preview.columns}
              mapping={mapping}
              onChange={setMapping}
              onConfirm={handleImport}
              loading={loading}
            />
          </div>
        )}

        {/* STEP 2 — Données */}
        {step === 2 && (
          <div style={s.card} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={s.cardTitle}><span>📊</span> Données importées</div>
              <button
                onClick={reset}
                style={{ background: 'linear-gradient(135deg, #d4a017, #8b6914)', color: '#000', fontWeight: 700, padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                + Nouvelle importation
              </button>
            </div>

            {/* Stats */}
            <div style={s.stats}>
              {[
                { label: 'Total', value: orders.length },
                { label: 'En attente', value: orders.filter(o => o.status === 'pending').length },
                { label: 'Envoyés', value: orders.filter(o => o.status === 'sent').length },
                { label: 'Erreurs', value: orders.filter(o => o.status === 'error').length },
              ].map(({ label, value }) => (
                <div key={label} style={s.statCard}>
                  <div style={s.statValue}>{value}</div>
                  <div style={s.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            <DataTable rows={orders} showStatus />
          </div>
        )}
      </main>

      {/* Toast */}
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
