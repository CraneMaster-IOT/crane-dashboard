import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowUp, ArrowDown, ArrowUpDown, Download, ChevronLeft, ChevronRight, Search } from 'lucide-react'

function SortIcon({ col, sortKey, sortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={11} color="var(--text-muted)" />
  return sortDir === 'asc'
    ? <ArrowUp size={11} color="var(--accent)" />
    : <ArrowDown size={11} color="var(--accent)" />
}

const PAGE_SIZE = 10

export default function RuntimeTable({ data }) {
  const [sortKey, setSortKey] = useState('started_at')
  const [sortDir, setSortDir] = useState('desc')
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(0)
  }

  const filtered = useMemo(() => {
    if (!data) return []
    const q = filter.toLowerCase()
    return data.filter(row =>
      !q ||
      row.orientation?.toLowerCase().includes(q) ||
      String(row.duration).includes(q) ||
      (row.started_at && format(parseISO(row.started_at), 'MMM dd HH:mm').toLowerCase().includes(q))
    )
  }, [data, filter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (sortKey === 'started_at' || sortKey === 'stopped_at') {
        av = av ? new Date(av).getTime() : 0
        bv = bv ? new Date(bv).getTime() : 0
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const exportCSV = () => {
    const headers = ['ID', 'Started At', 'Stopped At', 'Duration (s)', 'Orientation']
    const rows = sorted.map(r => [
      r.id,
      r.started_at ? format(parseISO(r.started_at), 'yyyy-MM-dd HH:mm:ss') : '',
      r.stopped_at ? format(parseISO(r.stopped_at), 'yyyy-MM-dd HH:mm:ss') : '',
      r.duration ?? '',
      r.orientation ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `motor_runtime_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const thStyle = (key) => ({
    padding: '10px 14px',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: sortKey === key ? 'var(--accent)' : 'var(--text-muted)',
    letterSpacing: '0.08em',
    textAlign: 'left',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    background: 'var(--bg-base)',
    borderBottom: '1px solid var(--border)',
  })

  const tdStyle = {
    padding: '10px 14px',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px' }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0) }}
            placeholder="Filter..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-primary)',
              width: 160,
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {sorted.length} rows
          </span>
          <button
            onClick={exportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <Download size={12} />
            CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {[
                { key: 'id', label: '#' },
                { key: 'started_at', label: 'STARTED' },
                { key: 'stopped_at', label: 'STOPPED' },
                { key: 'duration', label: 'DURATION' },
                { key: 'orientation', label: 'DIRECTION' },
              ].map(col => (
                <th key={col.key} style={thStyle(col.key)} onClick={() => handleSort(col.key)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {col.label}
                    <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                  NO DATA IN RANGE
                </td>
              </tr>
            ) : pageData.map((row, i) => (
              <tr
                key={row.id}
                style={{ background: i % 2 === 0 ? 'transparent' : '#0d1117' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#0d1117'}
              >
                <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 10 }}>
                  {row.id}
                </td>
                <td style={tdStyle}>
                  {row.started_at ? format(parseISO(row.started_at), 'MMM dd HH:mm:ss') : '—'}
                </td>
                <td style={tdStyle}>
                  {row.stopped_at ? format(parseISO(row.stopped_at), 'MMM dd HH:mm:ss') : (
                    <span style={{ color: 'var(--on-green)', fontSize: 10 }}>● RUNNING</span>
                  )}
                </td>
                <td style={{ ...tdStyle, color: 'var(--text-primary)' }}>
                  {row.duration != null ? `${row.duration}s` : '—'}
                </td>
                <td style={tdStyle}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: row.orientation === 'FWD' ? 'var(--fwd-blue)' : row.orientation === 'REV' ? 'var(--rev-amber)' : 'var(--text-muted)',
                    background: row.orientation === 'FWD' ? '#0e2535' : row.orientation === 'REV' ? '#2d1f05' : 'transparent',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}>
                    {row.orientation === 'FWD' ? '→ FWD' : row.orientation === 'REV' ? '← REV' : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '5px 8px', cursor: page === 0 ? 'not-allowed' : 'pointer',
                opacity: page === 0 ? 0.4 : 1, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '5px 8px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages - 1 ? 0.4 : 1, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
