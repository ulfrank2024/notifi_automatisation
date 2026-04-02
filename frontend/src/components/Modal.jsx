import useIsMobile from '../hooks/useIsMobile'

export default function Modal({ title, onClose, children, width = '600px' }) {
  const isMobile = useIsMobile()

  const cardStyle = isMobile
    ? {
        background: '#111', borderTop: '1px solid #2a2a2a',
        borderRadius: '16px 16px 0 0',
        width: '100%', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', bottom: 0, left: 0, right: 0,
      }
    : {
        background: '#111', border: '1px solid #2a2a2a', borderRadius: '14px',
        width: '100%', maxWidth: width, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
      }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={cardStyle} className="fade-in">
        {/* Handle bar mobile */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
            <div style={{ width: '36px', height: '4px', background: '#333', borderRadius: '2px' }} />
          </div>
        )}
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1f1f1f' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', color: '#666', fontSize: '18px', lineHeight: 1, padding: '2px 6px', borderRadius: '6px', border: '1px solid #222', cursor: 'pointer' }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
