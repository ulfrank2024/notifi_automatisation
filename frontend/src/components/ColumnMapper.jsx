/**
 * Mapping Intelligent
 * Lie les colonnes du fichier importé aux champs de l'application.
 */
const APP_FIELDS = [
  { key: 'email',        label: 'Email',           required: true },
  { key: 'phone',        label: 'Téléphone',        required: false },
  { key: 'order_number', label: 'Numéro de commande', required: false },
]

const styles = {
  container: { marginTop: '32px' },
  title: { color: '#d4a017', fontWeight: 600, fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px 16px', alignItems: 'center' },
  label: { color: '#ffffff', fontSize: '0.875rem', fontWeight: 500 },
  required: { color: '#ef4444', marginLeft: '4px' },
  arrow: { color: '#d4a017', fontWeight: 700 },
  select: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '8px 12px',
    fontSize: '0.875rem',
    width: '100%',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23b0b0b0' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
  },
  btn: {
    marginTop: '24px',
    background: 'linear-gradient(135deg, #d4a017, #8b6914)',
    color: '#000',
    fontWeight: 700,
    fontSize: '0.95rem',
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    width: '100%',
  },
}

export default function ColumnMapper({ columns, mapping, onChange, onConfirm, loading }) {
  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.title}>
        <span>⚙️</span> Mapping des colonnes
      </div>

      <div style={styles.grid}>
        <div style={{ color: '#666', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Champ Application</div>
        <div />
        <div style={{ color: '#666', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Colonne dans votre fichier</div>

        {APP_FIELDS.map(({ key, label, required }) => (
          <>
            <div key={`lbl-${key}`} style={styles.label}>
              {label}{required && <span style={styles.required}>*</span>}
            </div>
            <div key={`arr-${key}`} style={styles.arrow}>→</div>
            <select
              key={`sel-${key}`}
              style={styles.select}
              value={mapping[key] || ''}
              onChange={(e) => onChange({ ...mapping, [key]: e.target.value })}
            >
              <option value="">-- Ignorer --</option>
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </>
        ))}
      </div>

      <button
        style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span className="spinner" /> Importation…
          </span>
        ) : '✅ Confirmer et importer'}
      </button>
    </div>
  )
}
