import StatusBadge from './StatusBadge'

const s = {
  wrapper: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #1f1f1f' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: {
    textAlign: 'left', padding: '11px 14px',
    background: '#0f0f0f', color: '#777',
    fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid #1f1f1f', whiteSpace: 'nowrap',
  },
  td: { padding: '11px 14px', borderBottom: '1px solid #161616', color: '#e0e0e0', verticalAlign: 'middle' },
  empty: { textAlign: 'center', padding: '48px', color: '#555' },
  nil: { color: '#333' },
}

const COLS = [
  { key: 'first_name',   label: 'Prénom' },
  { key: 'last_name',    label: 'Nom' },
  { key: 'email',        label: 'Email' },
  { key: 'phone',        label: 'Téléphone' },
  { key: 'order_number', label: 'N° Commande' },
]

export default function DataTable({ rows, showStatus = false, showCampaign = false }) {
  if (!rows?.length) return <div style={s.empty}>Aucune donnée à afficher.</div>

  const cols = [
    ...(showCampaign ? [{ key: 'campaign_id', label: 'Campagne' }] : []),
    ...COLS,
    ...(showStatus ? [{ key: 'status', label: 'Statut' }] : []),
  ]

  return (
    <div style={s.wrapper}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>#</th>
            {cols.map(c => <th key={c.key} style={s.th}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} style={i % 2 === 1 ? { background: '#0d0d0d' } : {}}>
              <td style={{ ...s.td, color: '#444', width: '42px' }}>{i + 1}</td>
              {cols.map(c => (
                <td key={c.key} style={s.td}>
                  {c.key === 'status'
                    ? <StatusBadge status={row[c.key]} />
                    : <span style={row[c.key] ? {} : s.nil}>{row[c.key] || '—'}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
