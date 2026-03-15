const RANGES = [
  { key: '1h',   label: '1H' },
  { key: '24h',  label: '24H' },
  { key: '7d',   label: '7D' },
  { key: '30d',  label: '30D' },
  { key: '1y',   label: '1Y' },
  { key: 'all',  label: 'ALL' },
]

export default function TimeRangeSelector({ value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--bg-base)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: 3,
      gap: 2,
    }}>
      {RANGES.map(r => {
        const active = r.key === value
        return (
          <button
            key={r.key}
            onClick={() => onChange(r.key)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              padding: '5px 12px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#000' : 'var(--text-secondary)',
              fontWeight: active ? 700 : 400,
              transition: 'all 0.15s ease',
            }}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}
