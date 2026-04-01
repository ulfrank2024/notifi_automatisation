const STATUS_CONFIG = {
  pending:     { label: 'En attente',  color: '#3b82f6', bg: '#0d1f3c', dot: '🔵' },
  in_progress: { label: 'En cours',    color: '#f59e0b', bg: '#2d1f00', dot: '🟡' },
  sent:        { label: 'Envoyé',      color: '#22c55e', bg: '#0d2b1a', dot: '🟢' },
  error:       { label: 'Erreur',      color: '#ef4444', bg: '#2d0d0d', dot: '🔴' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.color}33`,
      borderRadius: '20px',
      padding: '2px 10px',
      fontSize: '0.78rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: '10px' }}>{cfg.dot}</span>
      {cfg.label}
    </span>
  )
}
