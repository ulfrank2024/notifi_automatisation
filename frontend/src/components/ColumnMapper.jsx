const APP_FIELDS = [
  { key: 'first_name',   label: 'Prénom',              required: false },
  { key: 'last_name',    label: 'Nom',                 required: false },
  { key: 'email',        label: 'Email',               required: true  },
  { key: 'phone',        label: 'Téléphone',           required: false },
  { key: 'order_number', label: 'Numéro de commande',  required: false },
]

const s = {
  container: { marginTop: '28px' },
  title: { color: '#d4a017', fontWeight: 600, fontSize: '0.95rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: '10px 12px', alignItems: 'center' },
  colHeader: { color: '#555', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' },
  label: { color: '#e0e0e0', fontSize: '0.875rem', fontWeight: 500 },
  required: { color: '#ef4444', marginLeft: '3px' },
  arrow: { color: '#d4a017', fontWeight: 700, textAlign: 'center' },
  select: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px',
    color: '#fff', padding: '9px 32px 9px 12px', fontSize: '0.875rem',
    width: '100%', cursor: 'pointer', outline: 'none', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  },
  btn: {
    marginTop: '24px', width: '100%',
    background: 'linear-gradient(135deg, #d4a017, #8b6914)',
    color: '#000', fontWeight: 700, fontSize: '0.95rem',
    padding: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  },
}

export default function ColumnMapper({ columns, mapping, onChange, onConfirm, loading }) {
  return (
    <div style={s.container} className="fade-in">
      <div style={s.title}>⚙️ Mapping des colonnes</div>

      <div style={s.grid}>
        <div style={s.colHeader}>Champ Application</div>
        <div />
        <div style={s.colHeader}>Colonne dans votre fichier</div>

        {APP_FIELDS.map(({ key, label, required }) => (
          <div key={key} style={{ display: 'contents' }}>
            <div style={s.label}>{label}{required && <span style={s.required}>*</span>}</div>
            <div style={s.arrow}>→</div>
            <select
              style={s.select}
              value={mapping[key] || ''}
              onChange={(e) => onChange({ ...mapping, [key]: e.target.value })}
            >
              <option value="">-- Ignorer --</option>
              {columns.map((col) => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={onConfirm} disabled={loading}>
        {loading
          ? <><span className="spinner" /> Importation…</>
          : '✅ Confirmer et importer'}
      </button>
    </div>
  )
}
