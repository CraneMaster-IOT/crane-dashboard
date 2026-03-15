import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { format, parseISO, startOfDay } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--fwd-blue)' }}>{payload[0].value}s</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{Math.floor(payload[0].value / 60)}m {payload[0].value % 60}s</div>
    </div>
  )
}

export default function DailyRuntimeChart({ data }) {
  if (!data || data.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>NO DATA</span>
    </div>
  )

  // Aggregate by day
  const byDay = {}
  data.forEach(log => {
    const day = format(startOfDay(parseISO(log.started_at)), 'MMM dd')
    byDay[day] = (byDay[day] || 0) + (log.duration || 0)
  })

  const chartData = Object.entries(byDay)
    .map(([day, total]) => ({ day, total }))
    .reverse()

  const maxVal = Math.max(...chartData.map(d => d.total))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 4" />
        <XAxis
          dataKey="day"
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}s`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border)', opacity: 0.5 }} />
        <Bar dataKey="total" radius={[3, 3, 0, 0]} maxBarSize={40}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.total === maxVal ? 'var(--fwd-blue)' : '#1e3a4a'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
