import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { format, parseISO } from 'date-fns'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
    }}>
      <div style={{ color: d.orientation === 'FWD' ? 'var(--fwd-blue)' : 'var(--rev-amber)', marginBottom: 4, fontWeight: 700 }}>
        {d.orientation}
      </div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>
        Start: {d.started_at ? format(parseISO(d.started_at), 'MMM dd HH:mm:ss') : '—'}
      </div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>
        End: {d.stopped_at ? format(parseISO(d.stopped_at), 'HH:mm:ss') : 'Running'}
      </div>
      <div style={{ color: 'var(--text-primary)', marginTop: 4 }}>
        Duration: {d.duration}s
      </div>
    </div>
  )
}

export default function RuntimeTimelineChart({ data }) {
  if (!data || data.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>NO DATA</span>
    </div>
  )

  // Show last 20 sessions, oldest first
  const chartData = [...data].reverse().slice(-20)

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 4" />
        <XAxis
          dataKey="started_at"
          tickFormatter={v => v ? format(parseISO(v), 'HH:mm') : ''}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}s`}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border)', opacity: 0.4 }} />
        <Bar dataKey="duration" radius={[3, 3, 0, 0]} maxBarSize={32}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.orientation === 'FWD' ? 'var(--fwd-blue)' : 'var(--rev-amber)'}
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
