import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = {
  FWD: '#38bdf8',
  REV: '#fbbf24',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ fontSize: 12, color: d.payload.fill, marginBottom: 4 }}>{d.name}</div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{d.value}s</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(d.payload.percent * 100).toFixed(1)}%</div>
    </div>
  )
}

export default function DirectionPieChart({ data }) {
  if (!data || data.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>NO DATA</span>
    </div>
  )

  const fwd = data.filter(d => d.orientation === 'FWD').reduce((s, d) => s + d.duration, 0)
  const rev = data.filter(d => d.orientation === 'REV').reduce((s, d) => s + d.duration, 0)

  const chartData = [
    fwd > 0 ? { name: 'FWD', value: fwd, fill: COLORS.FWD } : null,
    rev > 0 ? { name: 'REV', value: rev, fill: COLORS.REV } : null,
  ].filter(Boolean)

  if (chartData.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>NO DATA</span>
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
