export default function BulkActionBar({ count, onDelete, onClear, deleting }) {
  if (count === 0) return null
  return (
    <div
      className="bulk-bar"
      style={{
        position: 'fixed', bottom: '72px', left: '50%', transform: 'translateX(-50%)',
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.8)', zIndex: 100,
        animation: 'fadeIn 0.2s ease', whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: '#d4a017', fontWeight: 700, fontSize: '0.875rem' }}>
        {count} sélectionné{count > 1 ? 's' : ''}
      </span>
      <div style={{ width: '1px', height: '18px', background: '#2a2a2a' }} />
      <button
        onClick={onDelete} disabled={deleting}
        style={{ background: deleting ? '#2a1010' : '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 700, fontSize: '0.82rem', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}
      >
        {deleting ? 'Suppression…' : `🗑️ Supprimer (${count})`}
      </button>
      <button
        onClick={onClear}
        style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: '8px', padding: '7px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  )
}
