import { useState, useRef } from 'react'
import axios from 'axios'

const styles = {
  zone: {
    border: '2px dashed #2a2a2a',
    borderRadius: '12px',
    padding: '48px 32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background 0.2s ease',
    background: '#111111',
  },
  zoneActive: {
    borderColor: '#d4a017',
    background: '#1a1500',
  },
  icon: { fontSize: '40px', marginBottom: '12px' },
  title: { color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' },
  sub: { color: '#666666', fontSize: '0.85rem' },
  badge: {
    display: 'inline-block',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    padding: '2px 10px',
    fontSize: '0.75rem',
    color: '#b0b0b0',
    margin: '0 4px',
    marginTop: '12px',
  },
}

export default function FileUpload({ onPreview }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await axios.post('/api/upload/preview', form)
      onPreview(data, file)
    } catch (e) {
      setError(e.response?.data?.detail || 'Erreur lors de la lecture du fichier.')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div>
      <div
        style={{ ...styles.zone, ...(dragging ? styles.zoneActive : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv,.txt"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            <span style={{ color: '#b0b0b0' }}>Analyse en cours…</span>
          </div>
        ) : (
          <>
            <div style={styles.icon}>📂</div>
            <div style={styles.title}>Glissez votre fichier ici</div>
            <div style={styles.sub}>ou cliquez pour parcourir</div>
            <div style={{ marginTop: '16px' }}>
              {['.xlsx', '.csv', '.txt'].map((ext) => (
                <span key={ext} style={styles.badge}>{ext}</span>
              ))}
            </div>
          </>
        )}
      </div>
      {error && (
        <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '0.875rem', padding: '10px 14px', background: '#1f0a0a', borderRadius: '8px', border: '1px solid #3f1010' }}>
          {error}
        </div>
      )}
    </div>
  )
}
