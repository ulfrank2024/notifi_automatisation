import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import useIsMobile from '../hooks/useIsMobile'
import Modal from '../components/Modal'

const LANG_LABELS = { fr: '🇫🇷 Français', en: '🇬🇧 English' }

const VARIABLES_HELP = [
  { var: '{{ prenom }}',       desc: 'Prénom' },
  { var: '{{ nom }}',          desc: 'Nom' },
  { var: '{{ num_commande }}', desc: 'N° commande' },
  { var: '{{ email }}',        desc: 'Email' },
  { var: '{{ telephone }}',    desc: 'Téléphone' },
]

const SAMPLE = { prenom: 'Marie', nom: 'Curie', num_commande: 'CMD-2024-001', email: 'marie@exemple.com', telephone: '+33600000000' }

function renderPreview(html) {
  return Object.entries(SAMPLE).reduce((s, [k, v]) => s.replaceAll(`{{ ${k} }}`, v), html)
    .replace(/\{%[^%]*%\}/g, '')
}

const s = {
  page: (m) => ({ padding: m ? '16px' : '32px', maxWidth: '860px', width: '100%', paddingBottom: '80px' }),
  pageTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '24px' },

  // Étape
  step: { marginBottom: '16px' },
  stepHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  stepNum: (done, active) => ({
    width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
    background: done ? '#16a34a' : active ? '#d4a017' : '#1a1a1a',
    color: done || active ? '#000' : '#555',
    border: `2px solid ${done ? '#16a34a' : active ? '#d4a017' : '#2a2a2a'}`,
  }),
  stepTitle: (active) => ({ fontWeight: 700, color: active ? '#fff' : '#666', fontSize: '0.95rem' }),
  stepDesc: { color: '#555', fontSize: '0.78rem', marginLeft: '40px', marginTop: '-6px', marginBottom: '10px' },

  card: { background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '18px', marginLeft: '40px' },

  label: { display: 'block', color: '#888', fontSize: '0.72rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  select: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' },
  input: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '0.82rem', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' },

  // Canal buttons
  channelRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  channelBtn: (active) => ({
    flex: 1, minWidth: '120px', padding: '12px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
    border: `2px solid ${active ? '#d4a017' : '#2a2a2a'}`,
    background: active ? '#1a1500' : '#1a1a1a',
    color: active ? '#d4a017' : '#888', fontWeight: active ? 700 : 400, fontSize: '0.85rem',
    transition: 'all 0.15s',
  }),
  channelIcon: { fontSize: '1.4rem', marginBottom: '4px' },

  // Templates
  tplGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '8px', marginBottom: '8px' },
  tplCard: (sel) => ({
    background: sel ? '#1a1500' : '#1a1a1a', border: `2px solid ${sel ? '#d4a017' : '#2a2a2a'}`,
    borderRadius: '10px', padding: '12px', cursor: 'pointer', transition: 'all 0.15s',
  }),
  tplName: (sel) => ({ fontWeight: sel ? 700 : 500, color: sel ? '#d4a017' : '#ccc', fontSize: '0.85rem' }),
  tplLang: { fontSize: '0.72rem', color: '#666', marginTop: '3px' },
  tplPreview: { fontSize: '0.72rem', color: '#555', marginTop: '5px', fontStyle: 'italic' },
  sectionLabel: { color: '#555', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px', marginTop: '14px' },

  previewBtn: { background: 'none', border: '1px solid #333', color: '#888', borderRadius: '6px', padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer' },
  customToggle: (on) => ({ background: on ? '#1a1500' : 'none', border: `1px solid ${on ? '#d4a017' : '#333'}`, color: on ? '#d4a017' : '#777', borderRadius: '6px', padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer' }),

  varChip: { display: 'inline-block', background: '#1a1500', border: '1px solid #3a2800', color: '#d4a017', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', marginRight: '5px', marginBottom: '5px', cursor: 'pointer', fontFamily: 'monospace' },
  tabs: { display: 'flex', gap: '6px', marginBottom: '14px' },
  tab: (active) => ({ padding: '7px 16px', borderRadius: '7px', fontSize: '0.82rem', fontWeight: active ? 700 : 400, cursor: 'pointer', border: '1px solid', borderColor: active ? '#d4a017' : '#2a2a2a', color: active ? '#d4a017' : '#888', background: active ? '#1a1500' : 'transparent' }),

  // Récap
  recap: { background: '#0a1a0a', border: '1px solid #1a3a1a', borderRadius: '12px', padding: '16px', marginLeft: '40px', marginBottom: '16px' },
  recapRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1a2a1a', fontSize: '0.85rem' },
  recapLabel: { color: '#666' },
  recapValue: { color: '#d4a017', fontWeight: 600 },

  // Bouton envoi
  sendBtn: { width: '100%', background: 'linear-gradient(135deg,#d4a017,#8b6914)', color: '#000', fontWeight: 800, fontSize: '1rem', padding: '15px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  sendWrap: { marginLeft: '40px' },

  // Console
  consoleCard: { background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px', marginTop: '16px' },
  statRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' },
  stat: (c) => ({ flex: 1, minWidth: '70px', textAlign: 'center', background: '#111', border: `1px solid ${c}22`, borderRadius: '8px', padding: '10px 6px' }),
  statVal: (c) => ({ fontSize: '1.5rem', fontWeight: 800, color: c }),
  statLbl: { fontSize: '0.65rem', color: '#666', textTransform: 'uppercase', marginTop: '2px' },
  progressWrap: { background: '#1a1a1a', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '10px' },
  progressFill: (pct) => ({ height: '100%', width: `${Math.min(pct, 100)}%`, background: 'linear-gradient(90deg,#d4a017,#22c55e)', transition: 'width 0.5s ease', borderRadius: '8px' }),
  log: { background: '#0d0d0d', borderRadius: '8px', padding: '10px', maxHeight: '160px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.72rem' },
  logLine: (type) => ({ color: type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#666', marginBottom: '2px' }),
}

const CHANNEL_OPTIONS = [
  { value: 'email', icon: '📧', label: 'Email', sub: 'uniquement' },
  { value: 'sms',   icon: '💬', label: 'SMS',   sub: 'uniquement' },
  { value: 'both',  icon: '📧💬', label: 'Email + SMS', sub: 'les deux' },
]

export default function SendPage({ campaigns }) {
  const isMobile = useIsMobile()
  const [templates, setTemplates]     = useState([])
  const [selectedTpl, setSelectedTpl] = useState(null)
  const [previewOpen, setPreview]     = useState(false)
  const [campaignId, setCampaignId]   = useState(campaigns?.[0]?.id || '')
  const [channel, setChannel]         = useState('email')
  const [activeTab, setActiveTab]     = useState('email')
  const [customMode, setCustomMode]   = useState(false)
  const [subject, setSubject]         = useState('')
  const [emailTpl, setEmailTpl]       = useState('')
  const [smsTpl, setSmsTpl]           = useState('')
  const [sending, setSending]         = useState(false)
  const [status, setStatus]           = useState(null)
  const [logs, setLogs]               = useState([])
  const [polling, setPolling]         = useState(false)
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
        campaign_id: campaignId,
        channel,
        ...(!customMode && selectedTpl
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

  const selectedCampaign = campaigns?.find(c => c.id === campaignId)
  const step1Done = !!campaignId
  const step2Done = !!channel
  const step3Done = customMode ? (subject && emailTpl) : !!selectedTpl

  return (
    <div style={s.page(isMobile)} className="fade-in">
      <div style={s.pageTitle}>📨 Envoyer une campagne</div>

      {/* ── ÉTAPE 1 : Choisir la campagne ─────────────────── */}
      <div style={s.step}>
        <div style={s.stepHeader}>
          <div style={s.stepNum(step1Done, true)}>
            {step1Done ? '✓' : '1'}
          </div>
          <div style={s.stepTitle(true)}>Choisir la campagne à envoyer</div>
        </div>
        <div style={s.card}>
          <label style={s.label}>Campagne</label>
          <select style={s.select} value={campaignId} onChange={e => setCampaignId(e.target.value)}>
            {campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {selectedCampaign && (
            <div style={{ marginTop: '8px', color: '#555', fontSize: '0.78rem' }}>
              Contacts disponibles : <span style={{ color: '#d4a017' }}>{selectedCampaign.total_rows ?? '—'}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── ÉTAPE 2 : Choisir le canal ────────────────────── */}
      <div style={s.step}>
        <div style={s.stepHeader}>
          <div style={s.stepNum(step2Done, step1Done)}>
            {step2Done ? '✓' : '2'}
          </div>
          <div style={s.stepTitle(step1Done)}>Choisir le canal d'envoi</div>
        </div>
        <div style={{ ...s.card }}>
          <div style={s.channelRow}>
            {CHANNEL_OPTIONS.map(opt => (
              <div key={opt.value} style={s.channelBtn(channel === opt.value)} onClick={() => {
                setChannel(opt.value)
                setActiveTab(opt.value === 'sms' ? 'sms' : 'email')
              }}>
                <div style={s.channelIcon}>{opt.icon}</div>
                <div style={{ fontWeight: 700 }}>{opt.label}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>{opt.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ÉTAPE 3 : Choisir le message ─────────────────── */}
      <div style={s.step}>
        <div style={s.stepHeader}>
          <div style={s.stepNum(step3Done, step1Done && step2Done)}>
            {step3Done ? '✓' : '3'}
          </div>
          <div style={s.stepTitle(step1Done && step2Done)}>Choisir le message à envoyer</div>
        </div>
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ color: '#888', fontSize: '0.82rem' }}>
              {customMode ? 'Mode personnalisé activé' : 'Sélectionnez un modèle prêt à l\'emploi'}
            </div>
            <button style={s.customToggle(customMode)} onClick={() => setCustomMode(c => !c)}>
              {customMode ? '← Utiliser un modèle' : '✏️ Message personnalisé'}
            </button>
          </div>

          {!customMode ? (
            <>
              {frTemplates.length > 0 && (
                <>
                  <div style={s.sectionLabel}>🇫🇷 Français</div>
                  <div style={s.tplGrid}>
                    {frTemplates.map(t => (
                      <div key={t.id} style={s.tplCard(selectedTpl?.id === t.id)} onClick={() => selectTemplate(t)}>
                        <div style={s.tplName(selectedTpl?.id === t.id)}>{t.name}</div>
                        <div style={s.tplLang}>{LANG_LABELS[t.lang]}</div>
                        <div style={s.tplPreview}>{t.subject.replace(/{{.*?}}/g, '…')}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {enTemplates.length > 0 && (
                <>
                  <div style={s.sectionLabel}>🇬🇧 English</div>
                  <div style={s.tplGrid}>
                    {enTemplates.map(t => (
                      <div key={t.id} style={s.tplCard(selectedTpl?.id === t.id)} onClick={() => selectTemplate(t)}>
                        <div style={s.tplName(selectedTpl?.id === t.id)}>{t.name}</div>
                        <div style={s.tplLang}>{LANG_LABELS[t.lang]}</div>
                        <div style={s.tplPreview}>{t.subject.replace(/{{.*?}}/g, '…')}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedTpl && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {channel !== 'sms' && (
                    <button style={s.previewBtn} onClick={() => setPreview(true)}>👁️ Voir l'aperçu email</button>
                  )}
                  {channel !== 'email' && selectedTpl && (
                    <div style={{ flex: 1, background: '#0d0d0d', borderRadius: '8px', padding: '10px 14px', border: '1px solid #222' }}>
                      <div style={{ color: '#555', fontSize: '0.7rem', marginBottom: '4px', fontWeight: 600 }}>APERÇU SMS</div>
                      <div style={{ color: '#ccc', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        {renderPreview(selectedTpl.sms)} <span style={{ color: '#444' }}>Répondez STOP pour vous désinscrire.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {channel === 'both' && (
                <div style={s.tabs}>
                  {['email', 'sms'].map(t => (
                    <div key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
                      {t === 'email' ? '📧 Email' : '💬 SMS'}
                    </div>
                  ))}
                </div>
              )}

              {(channel === 'email' || (channel === 'both' && activeTab === 'email')) && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={s.label}>Objet de l'email</label>
                    <input style={s.input} placeholder="ex: Votre commande {{ num_commande }} est confirmée" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                  <div>
                    <label style={s.label}>Corps du message (HTML)</label>
                    <textarea style={{ ...s.textarea, minHeight: '160px' }} value={emailTpl} onChange={e => setEmailTpl(e.target.value)} />
                  </div>
                </>
              )}

              {(channel === 'sms' || (channel === 'both' && activeTab === 'sms')) && (
                <>
                  <label style={s.label}>Message SMS <span style={{ color: '#555', fontWeight: 400, textTransform: 'none' }}>(mention STOP ajoutée automatiquement)</span></label>
                  <textarea style={{ ...s.textarea, minHeight: '80px' }} value={smsTpl} onChange={e => setSmsTpl(e.target.value)} />
                  <div style={{ marginTop: '6px', color: smsTpl.length > 120 ? '#ef4444' : '#555', fontSize: '0.72rem' }}>
                    {smsTpl.length}/120 caractères
                  </div>
                </>
              )}

              <div style={{ marginTop: '12px' }}>
                <div style={{ color: '#555', fontSize: '0.72rem', marginBottom: '6px' }}>Variables disponibles (clic pour insérer) :</div>
                {VARIABLES_HELP.map(v => (
                  <span key={v.var} style={s.varChip} title={v.desc} onClick={() => insertVar(v.var)}>{v.var}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── RÉCAP avant envoi ─────────────────────────────── */}
      {step1Done && step2Done && step3Done && (
        <div style={s.recap}>
          <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.82rem', marginBottom: '10px' }}>✅ Prêt à envoyer</div>
          {[
            { label: 'Campagne', value: selectedCampaign?.name || '—' },
            { label: 'Canal',    value: CHANNEL_OPTIONS.find(o => o.value === channel)?.label || channel },
            { label: 'Message',  value: customMode ? 'Message personnalisé' : selectedTpl?.name || '—' },
          ].map(({ label, value }) => (
            <div key={label} style={s.recapRow}>
              <span style={s.recapLabel}>{label}</span>
              <span style={s.recapValue}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── BOUTON ENVOI ──────────────────────────────────── */}
      <div style={s.sendWrap}>
        <button
          style={{ ...s.sendBtn, opacity: (sending || !step1Done || !step3Done) ? 0.6 : 1 }}
          onClick={handleSend}
          disabled={sending || !step1Done || !step3Done}
        >
          {sending
            ? <><span className="spinner" /> Envoi en cours…</>
            : '🚀 Lancer l\'envoi'}
        </button>
      </div>

      {/* ── CONSOLE TEMPS RÉEL ────────────────────────────── */}
      {(status || logs.length > 0) && (
        <div style={s.consoleCard}>
          <div style={{ color: '#555', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>📡 Suivi en temps réel</div>
          {status && (
            <>
              <div style={s.statRow}>
                {[
                  { l: 'Total',    v: status.total,        c: '#b0b0b0' },
                  { l: 'En cours', v: status.in_progress,  c: '#f59e0b' },
                  { l: 'Envoyés',  v: status.sent,         c: '#22c55e' },
                  { l: 'Erreurs',  v: status.error,        c: '#ef4444' },
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
              <div key={i} style={s.logLine(l.type)}>
                <span style={{ color: '#2a2a2a' }}>[{l.time}]</span> {l.msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL APERÇU EMAIL ────────────────────────────── */}
      {previewOpen && selectedTpl && (
        <Modal title={`Aperçu — ${selectedTpl.name}`} onClose={() => setPreview(false)} width="680px">
          <div style={{ marginBottom: '12px', color: '#888', fontSize: '0.8rem' }}>
            Données exemples utilisées pour l'aperçu.
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
