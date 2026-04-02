import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const s = {
  root: {
    minHeight: '100vh', background: '#0a0a0a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  },
  card: {
    width: '100%', maxWidth: '420px',
    background: '#111', border: '1px solid #1f1f1f', borderRadius: '16px',
    padding: '40px 36px', boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
  },
  logo: {
    textAlign: 'center', marginBottom: '36px',
  },
  logoIcon: { fontSize: '36px', display: 'block', marginBottom: '10px' },
  logoText: {
    fontSize: '1.6rem', fontWeight: 800,
    background: 'linear-gradient(90deg, #d4a017, #f0c040)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '0.02em',
  },
  logoSub: { color: '#555', fontSize: '0.82rem', marginTop: '4px' },

  label: { display: 'block', color: '#999', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '9px', color: '#fff', padding: '12px 14px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', transition: 'border 0.15s',
  },
  inputFocus: { border: '1px solid #d4a017' },
  group: { marginBottom: '20px' },

  btn: {
    width: '100%', marginTop: '8px',
    background: 'linear-gradient(135deg, #d4a017, #8b6914)',
    color: '#000', fontWeight: 800, fontSize: '0.95rem',
    padding: '13px', borderRadius: '9px', border: 'none',
    cursor: 'pointer', letterSpacing: '0.03em',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    transition: 'opacity 0.15s',
  },
  error: {
    marginTop: '16px', padding: '11px 14px',
    background: '#1f0a0a', border: '1px solid #3f1010',
    borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem',
    textAlign: 'center',
  },
}

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [focusField, setFocus]  = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true); setError(null)
    try {
      const { data } = await axios.post('/api/auth/login', { email, password })
      login(data.access_token, data.email)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.root}>
      <div style={s.card} className="fade-in">
        <div style={s.logo}>
          <span style={s.logoIcon}>⚡</span>
          <div style={s.logoText}>NOTIF-FLOW</div>
          <div style={s.logoSub}>Plateforme d'automatisation</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.group}>
            <label style={s.label}>Email</label>
            <input
              style={{ ...s.input, ...(focusField === 'email' ? s.inputFocus : {}) }}
              type="email" value={email} placeholder="admin@notifflow.com"
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocus('email')} onBlur={() => setFocus(null)}
              autoComplete="email"
            />
          </div>

          <div style={s.group}>
            <label style={s.label}>Mot de passe</label>
            <input
              style={{ ...s.input, ...(focusField === 'password' ? s.inputFocus : {}) }}
              type="password" value={password} placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocus('password')} onBlur={() => setFocus(null)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? <><span className="spinner" /> Connexion…</> : '🔐 Se connecter'}
          </button>
        </form>

        {error && <div style={s.error}>{error}</div>}
      </div>
    </div>
  )
}
