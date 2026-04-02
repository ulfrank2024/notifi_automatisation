import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'
import StatusBadge from '../components/StatusBadge'

const VARIABLES_HELP = [
  { var: '{{ prenom }}',       desc: 'Prénom du contact' },
  { var: '{{ nom }}',          desc: 'Nom du contact' },
  { var: '{{ num_commande }}', desc: 'N° de commande' },
  { var: '{{ email }}',        desc: 'Email du contact' },
  { var: '{{ telephone }}',    desc: 'Téléphone' },
]

const DEFAULT_EMAIL_TPL = `<p>Bonjour <strong>{{ prenom }} {{ nom }}</strong>,</p>

<p>Nous vous confirmons la réception de votre commande <strong>{{ num_commande }}</strong>.</p>

<p>Merci pour votre confiance.<br>L'équipe</p>`

const DEFAULT_SMS_TPL = `Bonjour {{ prenom }}, votre commande {{ num_commande }} est confirmée. Merci !`

const s = {
  page: (m) => ({ padding: m ? '16px' : '32px', maxWidth: '900px', width: '100%' }),
  title: { fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '20px' },
  card: { background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  cardTitle: { color: '#d4a017', fontWeight: 600, fontSize: '0.9rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' },

  label: { display: 'block', color: '#999', fontSize: '0.78rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical', minHeight: '140px' },
  select: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none' },

  varChip: { display: 'inline-block', background: '#1a1500', border: '1px solid #3a2800', color: '#d4a017', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', marginRight: '6px', marginBottom: '6px', cursor: 'pointer', fontFamily: 'monospace' },

  sendBtn: { width: '100%', background: 'linear-gradient(135deg,#d4a017,#8b6914)', color: '#000', fontWeight: 800, fontSize: '1rem', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },

  // Console temps réel
  consoleCard: { background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px' },
  statRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' },
  stat: (color) => ({ flex: 1, minWidth: '80px', textAlign: 'center', background: '#111', border: `1px solid ${color}22`, borderRadius: '8px', padding: '12px 8px' }),
  statVal: (color) => ({ fontSize: '1.6rem', fontWeight: 800, color }),
  statLbl: { fontSize: '0.68rem', color: '#666', textTransform: 'uppercase', marginTop: '3px' },

  progressWrap: { background: '#1a1a1a', borderRadius: '8px', height: '10px', overflow: 'hidden', marginBottom: '12px' },
  progressFill: (pct) => ({ height: '100%', width: `${Math.min(pct, 100)}%`, background: 'linear-gradient(90deg,#d4a017,#22c55e)', transition: 'width 0.5s ease', borderRadius: '8px' }),

  log: { background: '#0d0d0d', borderRadius: '8px', padding: '12px', maxHeight: '160px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem' },
  logLine: (type) => ({ color: type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#888', marginBottom: '3px' }),
}

export default function SendPage({ campaigns }) {
  const isMobile = useIsMobile()
  const [campaignId, setCampaignId] = useState(campaigns?.[0]?.id || '')
  const [channel, setChannel]       = useState('email')
  const [subject, setSubject]       = useState('Votre commande — confirmation')
  const [emailTpl, setEmailTpl]     = useState(DEFAULT_EMAIL_TPL)
  const [smsTpl, setSmsTpl]         = useState(DEFAULT_SMS_TPL)
  const [sending, setSending]       = useState(false)
  const [status, setStatus]         = useState(null)
  const [logs, setLogs]             = useState([])
  const [polling, setPolling]       = useState(false)
  const pollRef = useRef(null)

  function addLog(msg, type = 'info') {
    const time = new Date().toLocaleTimeString('fr-FR')
    setLogs(l => [...l, { time, msg, type }])
  }

  function insertVar(v, target) {
    if (target === 'email') setEmailTpl(t => t + v)
    else setSmsTpl(t => t + v)
  }

  async function handleSend() {
    if (!campaignId) return
    setSending(true)
    setLogs([])
    setStatus(null)
    addLog('Lancement de l\'envoi…')
    try {
      const { data } = await axios.post('/api/notifications/send', {
        campaign_id:    campaignId,
        channel,
        subject,
        email_template: emailTpl,
        sms_template:   smsTpl,
      })
      addLog(`✅ ${data.message}`, 'success')
      // Démarrer le polling
      setPolling(true)
    } catch (e) {
      addLog(e.response?.data?.detail || 'Erreur lors du lancement.', 'error')
      setSending(false)
    }
  }

  // Polling du statut toutes les 2s
  useEffect(() => {
    if (!polling || !campaignId) return
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/notifications/status/${campaignId}`)
        setStatus(data)
        const pct = data.total > 0 ? Math.round((data.sent + data.error) / data.total * 100) : 0
        if (data.done) {
          clearInterval(pollRef.current)
          setPolling(false)
          setSending(false)
          addLog(`🏁 Envoi terminé — ${data.sent} envoyés, ${data.error} erreurs.`, data.error > 0 ? 'error' : 'success')
        } else {
          addLog(`⏳ ${data.sent} envoyés, ${data.in_progress} en cours, ${data.error} erreurs (${pct}%)`)
        }
      } catch { clearInterval(pollRef.current); setPolling(false); setSending(false) }
    }, 2000)
    return () => clearInterval(pollRef.current)
  }, [polling, campaignId])

  const total   = status?.total   || 0
  const sentPct = total > 0 ? Math.round((status.sent + status.error) / total * 100) : 0

  return (
    <div style={s.page(isMobile)} className="fade-in">
      <div style={s.title}>📨 Lancer une campagne</div>

      {/* Sélection campagne + canal */}
      <div style={s.card}>
        <div style={s.cardTitle}>⚙️ Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={s.label}>Campagne</label>
            <select style={s.select} value={campaignId} onChange={e => setCampaignId(e.target.value)}>
              {campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Canal d'envoi</label>
            <select style={s.select} value={channel} onChange={e => setChannel(e.target.value)}>
              <option value="email">📧 Email uniquement</option>
              <option value="sms">💬 SMS uniquement</option>
              <option value="both">📧💬 Email + SMS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Template Email */}
      {(channel === 'email' || channel === 'both') && (
        <div style={s.card}>
          <div style={s.cardTitle}>📧 Template Email</div>
          <div style={{ marginBottom: '12px' }}>
            <label style={s.label}>Objet</label>
            <input style={s.input} value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={s.label}>Corps (HTML)</label>
            <textarea style={s.textarea} value={emailTpl} onChange={e => setEmailTpl(e.target.value)} />
          </div>
          <div>
            {VARIABLES_HELP.map(v => (
              <span key={v.var} style={s.varChip} title={v.desc} onClick={() => insertVar(v.var, 'email')}>{v.var}</span>
            ))}
            <span style={{ color: '#555', fontSize: '0.75rem' }}>← clic pour insérer</span>
          </div>
        </div>
      )}

      {/* Template SMS */}
      {(channel === 'sms' || channel === 'both') && (
        <div style={s.card}>
          <div style={s.cardTitle}>💬 Template SMS <span style={{ color: '#555', fontSize: '0.78rem', fontWeight: 400 }}>(max ~120 chars, STOP ajouté automatiquement)</span></div>
          <textarea style={{ ...s.textarea, minHeight: '80px', fontFamily: 'monospace' }} value={smsTpl} onChange={e => setSmsTpl(e.target.value)} />
          <div style={{ marginTop: '8px' }}>
            {VARIABLES_HELP.map(v => (
              <span key={v.var} style={s.varChip} title={v.desc} onClick={() => insertVar(v.var, 'sms')}>{v.var}</span>
            ))}
          </div>
          <div style={{ marginTop: '8px', color: '#666', fontSize: '0.75rem' }}>
            Aperçu : {smsTpl.length}/120 chars · "Répondez STOP pour vous désinscrire." sera ajouté automatiquement.
          </div>
        </div>
      )}

      {/* Bouton envoi */}
      <button style={{ ...s.sendBtn, opacity: sending ? 0.7 : 1 }} onClick={handleSend} disabled={sending || !campaignId}>
        {sending ? <><span className="spinner" /> Envoi en cours…</> : '🚀 Lancer l\'envoi'}
      </button>

      {/* Console temps réel */}
      {(status || logs.length > 0) && (
        <div style={{ ...s.consoleCard, marginTop: '20px' }}>
          <div style={{ ...s.cardTitle, color: '#888' }}>📡 Console temps réel</div>

          {status && (
            <>
              <div style={s.statRow}>
                {[
                  { label: 'Total',      val: status.total,       color: '#b0b0b0' },
                  { label: 'En cours',   val: status.in_progress, color: '#f59e0b' },
                  { label: 'Envoyés',    val: status.sent,        color: '#22c55e' },
                  { label: 'Erreurs',    val: status.error,       color: '#ef4444' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={s.stat(color)}>
                    <div style={s.statVal(color)}>{val}</div>
                    <div style={s.statLbl}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={s.progressWrap}>
                <div style={s.progressFill(sentPct)} />
              </div>
              <div style={{ color: '#555', fontSize: '0.75rem', marginBottom: '12px' }}>{sentPct}% complété</div>
            </>
          )}

          <div style={s.log}>
            {logs.map((l, i) => (
              <div key={i} style={s.logLine(l.type)}>
                <span style={{ color: '#333' }}>[{l.time}]</span> {l.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
