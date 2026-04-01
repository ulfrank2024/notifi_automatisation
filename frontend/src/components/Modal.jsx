/**
 * Composant Modal générique — overlay sombre + carte centrée
 */
export default function Modal({ title, onClose, children, width = '600px' }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#111', border: '1px solid #2a2a2a', borderRadius: '14px',
          width: '100%', maxWidth: width, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        }}
        className="fade-in"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #1f1f1f' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', color: '#666', fontSize: '18px', lineHeight: 1, padding: '2px 6px', borderRadius: '6px', border: '1px solid #222', cursor: 'pointer' }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
