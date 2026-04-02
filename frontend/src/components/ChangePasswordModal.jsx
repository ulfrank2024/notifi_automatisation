import { useState } from 'react'
import axios from 'axios'
import Modal from './Modal'

const s = {
  label: { display: 'block', color: '#999', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px' },
  btn: { width: '100%', background: 'linear-gradient(135deg,#d4a017,#8b6914)', color: '#000', fontWeight: 700, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', marginTop: '8px' },
  error:   { padding: '10px 14px', background: '#1f0a0a', border: '1px solid #3f1010', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem', marginTop: '12px' },
  success: { padding: '10px 14px', background: '#0a1f12', border: '1px solid #1a4a2a', borderRadius: '8px', color: '#22c55e', fontSize: '0.85rem', marginTop: '12px' },
  hint: { color: '#555', fontSize: '0.78rem', marginBottom: '20px' },
}

export default function ChangePasswordModal({ onClose }) {
  const [current, setCurrent]   = useState('')
  const [next, setNext]         = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (next !== confirm) { setError('Les deux nouveaux mots de passe ne correspondent pas.'); return }
    if (next.length < 8)  { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setLoading(true)
    try {
      await axios.post('/api/auth/change-password', { current_password: current, new_password: next })
      setSuccess(true)
      setTimeout(onClose, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du changement.')
    } finally { setLoading(false) }
  }

  return (
    <Modal title="🔑 Changer le mot de passe" onClose={onClose} width="420px">
      {success ? (
        <div style={s.success}>✅ Mot de passe mis à jour ! Fermeture…</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={s.hint}>Le nouveau mot de passe sera actif immédiatement.</p>
          <label style={s.label}>Mot de passe actuel</label>
          <input style={s.input} type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••" />
          <label style={s.label}>Nouveau mot de passe</label>
          <input style={s.input} type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="Min. 8 caractères" />
          <label style={s.label}>Confirmer le nouveau mot de passe</label>
          <input style={s.input} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
          {error && <div style={s.error}>{error}</div>}
          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Mise à jour…' : '💾 Mettre à jour'}
          </button>
        </form>
      )}
    </Modal>
  )
}
