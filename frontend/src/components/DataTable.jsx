import StatusBadge from './StatusBadge'

const styles = {
  wrapper: { overflowX: 'auto', marginTop: '24px', borderRadius: '12px', border: '1px solid #2a2a2a' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    background: '#111111',
    color: '#b0b0b0',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #2a2a2a',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #1a1a1a',
    color: '#ffffff',
    verticalAlign: 'middle',
  },
  trHover: { background: '#1a1a1a' },
  empty: { textAlign: 'center', padding: '48px', color: '#666666' },
}

export default function DataTable({ rows, showStatus = false }) {
  if (!rows || rows.length === 0) {
    return <div style={styles.empty}>Aucune donnée à afficher.</div>
  }

  // Colonnes à afficher : email, phone, order_number + status si demandé
  const cols = ['email', 'phone', 'order_number', ...(showStatus ? ['status'] : [])]
  const colLabels = { email: 'Email', phone: 'Téléphone', order_number: 'N° Commande', status: 'Statut' }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            {cols.map((c) => <th key={c} style={styles.th}>{colLabels[c]}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id || i}
              style={i % 2 === 0 ? {} : { background: '#0f0f0f' }}
            >
              <td style={{ ...styles.td, color: '#666', width: '48px' }}>{i + 1}</td>
              {cols.map((c) => (
                <td key={c} style={styles.td}>
                  {c === 'status'
                    ? <StatusBadge status={row[c]} />
                    : <span style={{ color: row[c] ? '#fff' : '#444' }}>{row[c] || '—'}</span>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
