import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'
import Modal from '../components/Modal'

const LANG_LABELS = { fr: '🇫🇷 Français', en: '🇬🇧 English' }

const VARIABLES_HELP = [
  { var: '{{ prenom }}',       desc: 'Prénom / First name' },
  { var: '{{ nom }}',          desc: 'Nom / Last name' },
  { var: '{{ num_commande }}', desc: 'N° commande / Order #' },
  { var: '{{ email }}',        desc: 'Email' },
  { var: '{{ telephone }}',    desc: 'Téléphone / Phone' },
]

const s = {
  page: (m) => ({ padding: m ? '16px' : '32px', maxWidth: '960px', width: '100%' }),
  title: { fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '20px' },
  card: { background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  cardTitle: { color: '#d4a017', fontWeight: 600, fontSize: '0.9rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
  label: { display: 'block', color: '#999', fontSize: '0.75rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.82rem', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' },
  select: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none' },

  // Template cards
  tplGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '8px' },
  tplCard: (sel) => ({
    background: sel ? '#1a1500' : '#1a1a1a',
    border: `1px solid ${sel ? '#d4a017' : '#2a2a2a'}`,
    borderRadius: '10px', padding: '14px', cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  tplName: (sel) => ({ fontWeight: sel ? 700 : 500, color: sel ? '#d4a017' : '#ccc', fontSize: '0.875rem' }),
  tplLang: { fontSize: '0.75rem', color: '#666', marginTop: '4px' },
  tplSubject: { fontSize: '0.75rem', color: '#888', marginTop: '6px', fontStyle: 'italic' },
  previewBtn: { background: 'none', border: '1px solid #333', color: '#888', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer', marginTop: '8px' },

  varChip: { display: 'inline-block', background: '#1a1500', border: '1px solid #3a2800', color: '#d4a017', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', marginRight: '5px', marginBottom: '5px', cursor: 'pointer', fontFamily: 'monospace' },

  tabs: { display: 'flex', gap: '6px', marginBottom: '14px' },
  tab: (active) => ({ padding: '7px 16px', borderRadius: '7px', fontSize: '0.82rem', fontWeight: active ? 700 : 400, cursor: 'pointer', border: '1px solid', borderColor: active ? '#d4a017' : '#2a2a2a', color: active ? '#d4a017' : '#888', background: active ? '#1a1500' : 'transparent' }),

  sendBtn: { width: '100%', background: 'linear-gradient(135deg,#d4a017,#8b6914)', color: '#000', fontWeight: 800, fontSize: '1rem', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },

  // Console
  consoleCard: { background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px', marginTop: '16px' },
  statRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' },
  stat: (color) => ({ flex: 1, minWidth: '70px', textAlign: 'center', background: '#111', border: `1px solid ${color}22`, borderRadius: '8px', padding: '10px 6px' }),
  statVal: (color) => ({ fontSize: '1.5rem', fontWeight: 800, color }),
  statLbl: { fontSize: '0.65rem', color: '#666', textTransform: 'uppercase', marginTop: '2px' },
  progressWrap: { background: '#1a1a1a', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '10px' },
  progressFill: (pct) => ({ height: '100%', width: `${Math.min(pct, 100)}%`, background: 'linear-gradient(90deg,#d4a017,#22c55e)', transition: 'width 0.5s ease', borderRadius: '8px' }),
  log: { background: '#0d0d0d', borderRadius: '8px', padding: '10px', maxHeight: '150px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.72rem' },
  logLine: (type) => ({ color: type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#666', marginBottom: '2px' }),
}

const SAMPLE = { prenom: 'Marie', nom: 'Curie', num_commande: 'CMD-2024-001', email: 'marie@exemple.com', telephone: '+33600000000' }

function renderPreview(html) {
  return Object.entries(SAMPLE).reduce((s, [k, v]) => s.replaceAll(`{{ ${k} }}`, v), html)
    .replace(/\{%[^%]*%\}/g, '')
}

export default function SendPage({ campaigns }) {
  const isMobile = useIsMobile()
  const [templates, setTemplates]   = useState([])
  const [selectedTpl, setSelectedTpl] = useState(null)
  const [previewOpen, setPreview]   = useState(false)
  const [campaignId, setCampaignId] = useState(campaigns?.[0]?.id || '')
  const [channel, setChannel]       = useState('email')
  const [activeTab, setActiveTab]   = useState('email')
  const [customMode, setCustomMode] = useState(false)
  const [subject, setSubject]       = useState('')
  const [emailTpl, setEmailTpl]     = useState('')
  const [smsTpl, setSmsTpl]         = useState('')
  const [sending, setSending]       = useState(false)
  const [status, setStatus]         = useState(null)
  const [logs, setLogs]             = useState([])
  const [polling, setPolling]       = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    axios.get('/api/notifications/templates').then(r => {
      setTemplates(r.data)
      if (r.data.length) selectTemplate(r.data[0])
    })
  }, [])

  useEffect(() => {
    if (campaigns?.length && !campaignId) setCampaignId(campaigns[0].id)
  }, [campaigns])

  function selectTemplate(tpl) {
    setSelectedTpl(tpl)
    setSubject(tpl.subject)
    setSmsTpl(tpl.sms)
    setEmailTpl(tpl.email || '')
    setCustomMode(false)
  }

  function addLog(msg, type = 'info') {
    const time = new Date().toLocaleTimeString('fr-FR')
    setLogs(l => [...l, { time, msg, type }])
  }

  function insertVar(v) {
    if (activeTab === 'sms') setSmsTpl(t => t + v)
    else setEmailTpl(t => t + v)
  }

  async function handleSend() {
    if (!campaignId) return
    setSending(true); setLogs([]); setStatus(null)
    addLog('Lancement de l\'envoi…')
    try {
      const body = {
        campaign_id:    campaignId,
        channel,
        ...((!customMode && selectedTpl)
          ? { template_id: selectedTpl.id }
          : { subject, email_template: emailTpl, sms_template: smsTpl }),
      }
      const { data } = await axios.post('/api/notifications/send', body)
      addLog(`✅ ${data.message}`, 'success')
      setPolling(true)
    } catch (e) {
      addLog(e.response?.data?.detail || 'Erreur.', 'error')
      setSending(false)
    }
  }

  useEffect(() => {
    if (!polling || !campaignId) return
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/notifications/status/${campaignId}`)
        setStatus(data)
        if (data.done) {
          clearInterval(pollRef.current); setPolling(false); setSending(false)
          addLog(`🏁 Terminé — ${data.sent} envoyés, ${data.error} erreurs.`, data.error > 0 ? 'error' : 'success')
        }
      } catch { clearInterval(pollRef.current); setPolling(false); setSending(false) }
    }, 2000)
    return () => clearInterval(pollRef.current)
  }, [polling, campaignId])

  const total   = status?.total || 0
  const sentPct = total > 0 ? Math.round((status.sent + status.error) / total * 100) : 0

  const frTemplates = templates.filter(t => t.lang === 'fr')
  const enTemplates = templates.filter(t => t.lang === 'en')

  return (
    <div style={s.page(isMobile)} className="fade-in">
      <div style={s.title}>📨 Lancer une campagne</div>

      {/* Configuration */}
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
            <select style={s.select} value={channel} onChange={e => { setChannel(e.target.value); setActiveTab(e.target.value === 'sms' ? 'sms' : 'email') }}>
              <option value="email">📧 Email uniquement</option>
              <option value="sms">💬 SMS uniquement</option>
              <option value="both">📧💬 Email + SMS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sélecteur de template */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={s.cardTitle}>📋 Template</div>
          <button onClick={() => setCustomMode(c => !c)} style={{ ...s.previewBtn, color: customMode ? '#d4a017' : '#888', borderColor: customMode ? '#d4a017' : '#333' }}>
            {customMode ? '← Utiliser un template' : '✏️ Personnaliser'}
          </button>
        </div>

        {!customMode ? (
          <>
            {/* FR */}
            {frTemplates.length > 0 && (
              <>
                <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '8px', fontWeight: 600 }}>🇫🇷 FRANÇAIS</div>
                <div style={s.tplGrid}>
                  {frTemplates.map(t => (
                    <div key={t.id} style={s.tplCard(selectedTpl?.id === t.id)} onClick={() => selectTemplate(t)}>
                      <div style={s.tplName(selectedTpl?.id === t.id)}>{t.name}</div>
                      <div style={s.tplLang}>{LANG_LABELS[t.lang]}</div>
                      <div style={s.tplSubject}>{t.subject.replace(/{{.*?}}/g, '…')}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* EN */}
            {enTemplates.length > 0 && (
              <>
                <div style={{ color: '#666', fontSize: '0.75rem', margin: '12px 0 8px', fontWeight: 600 }}>🇬🇧 ENGLISH</div>
                <div style={s.tplGrid}>
                  {enTemplates.map(t => (
                    <div key={t.id} style={s.tplCard(selectedTpl?.id === t.id)} onClick={() => selectTemplate(t)}>
                      <div style={s.tplName(selectedTpl?.id === t.id)}>{t.name}</div>
                      <div style={s.tplLang}>{LANG_LABELS[t.lang]}</div>
                      <div style={s.tplSubject}>{t.subject.replace(/{{.*?}}/g, '…')}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedTpl && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: '#555', fontSize: '0.78rem' }}>
                  Objet : <em style={{ color: '#aaa' }}>{selectedTpl.subject}</em>
                </span>
                {channel !== 'sms' && (
                  <button style={s.previewBtn} onClick={() => setPreview(true)}>👁️ Aperçu email</button>
                )}
              </div>
            )}

            {/* SMS preview */}
            {selectedTpl && channel !== 'email' && (
              <div style={{ marginTop: '12px', background: '#0d0d0d', borderRadius: '8px', padding: '12px', border: '1px solid #222' }}>
                <div style={{ color: '#666', fontSize: '0.72rem', marginBottom: '6px', fontWeight: 600 }}>APERÇU SMS</div>
                <div style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {renderPreview(selectedTpl.sms)} <span style={{ color: '#555' }}>Répondez STOP pour vous désinscrire.</span>
                </div>
              </div>
            )}
          </>
        ) : (
          // Mode personnalisé
          <>
            {channel !== 'sms' && channel !== 'email' && (
              <div style={s.tabs}>
                {['email', 'sms'].map(t => <div key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>{t === 'email' ? '📧 Email' : '💬 SMS'}</div>)}
              </div>
            )}

            {(activeTab === 'email' || channel === 'email' || channel === 'both') && activeTab !== 'sms' && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <label style={s.label}>Objet</label>
                  <input style={s.input} value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div>
                  <label style={s.label}>Corps (HTML)</label>
                  <textarea style={{ ...s.textarea, minHeight: '160px' }} value={emailTpl} onChange={e => setEmailTpl(e.target.value)} />
                </div>
              </>
            )}

            {(activeTab === 'sms' || channel === 'sms') && (
              <>
                <label style={s.label}>Message SMS <span style={{ color: '#555', fontWeight: 400 }}>(STOP ajouté auto)</span></label>
                <textarea style={{ ...s.textarea, minHeight: '80px' }} value={smsTpl} onChange={e => setSmsTpl(e.target.value)} />
                <div style={{ marginTop: '6px', color: '#666', fontSize: '0.72rem' }}>{smsTpl.length}/120 caractères</div>
              </>
            )}

            <div style={{ marginTop: '10px' }}>
              {VARIABLES_HELP.map(v => (
                <span key={v.var} style={s.varChip} title={v.desc} onClick={() => insertVar(v.var)}>{v.var}</span>
              ))}
              <span style={{ color: '#444', fontSize: '0.72rem' }}>← clic pour insérer</span>
            </div>
          </>
        )}
      </div>

      {/* Bouton envoi */}
      <button style={{ ...s.sendBtn, opacity: (sending || !campaignId) ? 0.7 : 1 }} onClick={handleSend} disabled={sending || !campaignId}>
        {sending ? <><span className="spinner" /> Envoi en cours…</> : '🚀 Lancer l\'envoi'}
      </button>

      {/* Console temps réel */}
      {(status || logs.length > 0) && (
        <div style={s.consoleCard}>
          <div style={{ color: '#555', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>📡 Console temps réel</div>
          {status && (
            <>
              <div style={s.statRow}>
                {[
                  { l: 'Total',    v: status.total,       c: '#b0b0b0' },
                  { l: 'En cours', v: status.in_progress, c: '#f59e0b' },
                  { l: 'Envoyés',  v: status.sent,        c: '#22c55e' },
                  { l: 'Erreurs',  v: status.error,       c: '#ef4444' },
                ].map(({ l, v, c }) => (
                  <div key={l} style={s.stat(c)}>
                    <div style={s.statVal(c)}>{v}</div>
                    <div style={s.statLbl}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={s.progressWrap}><div style={s.progressFill(sentPct)} /></div>
              <div style={{ color: '#555', fontSize: '0.72rem', marginBottom: '10px' }}>{sentPct}% complété</div>
            </>
          )}
          <div style={s.log}>
            {logs.map((l, i) => (
              <div key={i} style={s.logLine(l.type)}><span style={{ color: '#2a2a2a' }}>[{l.time}]</span> {l.msg}</div>
            ))}
          </div>
        </div>
      )}

      {/* Modal prévisualisation email */}
      {previewOpen && selectedTpl && (
        <Modal title={`Aperçu — ${selectedTpl.name}`} onClose={() => setPreview(false)} width="680px">
          <div style={{ marginBottom: '12px', color: '#888', fontSize: '0.8rem' }}>
            Variables remplacées par des données exemples.
          </div>
          <div
            style={{ border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'auto', background: '#fff', maxHeight: '65vh' }}
            dangerouslySetInnerHTML={{ __html: renderPreview(selectedTpl.email || '') }}
          />
        </Modal>
      )}
    </div>
  )
}
