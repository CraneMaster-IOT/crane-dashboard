import { useParams, useNavigate } from 'react-router-dom'
import { useState, useCallback, useMemo } from 'react'
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns'
import { usePolling } from '../hooks/usePolling'
import { fetchCurrentState, fetchRuntimeLog } from '../lib/api'
import TimeRangeSelector from '../components/TimeRangeSelector'
import RuntimeTimelineChart from '../components/RuntimeTimelineChart'
import DirectionPieChart from '../components/DirectionPieChart'
import DailyRuntimeChart from '../components/DailyRuntimeChart'
import RuntimeTable from '../components/RuntimeTable'
import { ArrowLeft, Power, RotateCcw, Clock, Hash, Activity, TrendingUp } from 'lucide-react'

const MOTOR_NAMES = {
  1: 'LT1', 2: 'LT2',
  3: 'CT Left', 4: 'CT Right',
  5: 'Hoist1', 6: 'Hoist2',
}

const MOTOR_GROUPS = {
  1: 'Long Travel', 2: 'Long Travel',
  3: 'Cross Travel', 4: 'Cross Travel',
  5: 'Hoist', 6: 'Hoist',
}

function StatCard({ icon: Icon, label, value, sub, accent = 'var(--accent)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon size={13} color={accent} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

function SectionCard({ title, children, rightSlot }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {title}
        </span>
        {rightSlot}
      </div>
      <div style={{ padding: '18px' }}>
        {children}
      </div>
    </div>
  )
}

export default function MotorPage() {
  const { id } = useParams()
  const motorId = parseInt(id)
  const navigate = useNavigate()
  const [range, setRange] = useState('7d')

  const fetchState = useCallback(() => fetchCurrentState(), [])
  const { data: allMotors } = usePolling(fetchState, 1000)

  const fetchLog = useCallback(() => fetchRuntimeLog(motorId, range), [motorId, range])
  const { data: logData, loading: logLoading } = usePolling(fetchLog, 5000, [motorId, range])

  const motor = allMotors ? allMotors.find(m => m.motor_id === motorId) : null
  const isOn = motor?.current_status === 'ON'

  // Derived stats
  const stats = useMemo(() => {
    if (!logData) return {}
    const todayLogs = logData.filter(l => l.started_at && isToday(parseISO(l.started_at)))
    const weekLogs  = logData.filter(l => l.started_at && isThisWeek(parseISO(l.started_at)))
    const monthLogs = logData.filter(l => l.started_at && isThisMonth(parseISO(l.started_at)))

    const sum = arr => arr.reduce((s, l) => s + (l.duration || 0), 0)
    const avg = arr => arr.length ? Math.round(sum(arr) / arr.length) : 0

    return {
      today:   sum(todayLogs),
      week:    sum(weekLogs),
      month:   sum(monthLogs),
      count:   logData.length,
      avgDur:  avg(logData),
      total:   sum(logData),
    }
  }, [logData])

  const motorName = MOTOR_NAMES[motorId] || `Motor ${motorId}`
  const motorGroup = MOTOR_GROUPS[motorId] || 'Motor'

  if (!allMotors) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{
        width: 20, height: 20, border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)', marginBottom: 16,
            padding: 0, transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={13} />
          BACK TO DASHBOARD
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 6 }}>
              {motorGroup} · M{String(motorId).padStart(2, '0')}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1,
              marginBottom: 12,
            }}>
              {motorName}
            </h1>

            {/* Live status badge */}
            {motor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: isOn ? 'var(--on-green-dim)' : '#1a202c',
                  border: `1px solid ${isOn ? '#1a4a2a' : 'var(--border)'}`,
                  borderRadius: 5, padding: '6px 14px',
                  boxShadow: isOn ? 'var(--on-green-glow)' : 'none',
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: isOn ? 'var(--on-green)' : 'var(--off-gray)',
                    boxShadow: isOn ? '0 0 6px var(--on-green)' : 'none',
                    animation: isOn ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                    color: isOn ? 'var(--on-green)' : 'var(--off-gray)',
                    letterSpacing: '0.08em',
                  }}>
                    {motor.current_status}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: motor.current_orientation === 'FWD' ? 'var(--fwd-blue)'
                       : motor.current_orientation === 'REV' ? 'var(--rev-amber)'
                       : 'var(--text-muted)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 5, padding: '6px 14px',
                }}>
                  {motor.current_orientation === 'FWD' ? '→ FORWARD'
                   : motor.current_orientation === 'REV' ? '← REVERSE'
                   : '— IDLE'}
                </div>
                {motor.running_since && (
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--text-muted)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 5, padding: '6px 14px',
                  }}>
                    Since {format(parseISO(motor.running_since), 'HH:mm:ss')}
                  </div>
                )}
              </div>
            )}
          </div>

          <TimeRangeSelector value={range} onChange={v => { setRange(v) }} />
        </div>
      </div>

      {/* Quick stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        <StatCard icon={Clock}     label="TODAY"      value={stats.today != null ? `${stats.today}s` : '—'}   sub={stats.today ? `${Math.floor(stats.today / 60)}m ${stats.today % 60}s` : undefined} accent="var(--on-green)" />
        <StatCard icon={TrendingUp} label="THIS WEEK"  value={stats.week  != null ? `${stats.week}s`  : '—'}   sub={stats.week  ? `${Math.floor(stats.week  / 60)}m` : undefined} accent="var(--fwd-blue)" />
        <StatCard icon={Activity}  label="THIS MONTH" value={stats.month != null ? `${stats.month}s` : '—'}   sub={stats.month ? `${Math.floor(stats.month / 60)}m` : undefined} accent="var(--rev-amber)" />
        <StatCard icon={Hash}      label="RUNS"        value={stats.count != null ? stats.count        : '—'}   sub="in selected range" />
        <StatCard icon={RotateCcw} label="AVG DURATION" value={stats.avgDur != null ? `${stats.avgDur}s` : '—'} sub="per run" />
        <StatCard icon={Power}     label="TOTAL"       value={stats.total  != null ? `${stats.total}s`  : '—'}  sub={stats.total ? `${Math.floor(stats.total / 60)}m` : undefined} accent="var(--text-secondary)" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <SectionCard title="Runtime Timeline — Last 20 Runs">
          {logLoading
            ? <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            : <RuntimeTimelineChart data={logData} />
          }
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--fwd-blue)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>FWD</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--rev-amber)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>REV</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Direction Distribution">
          {logLoading
            ? <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            : <DirectionPieChart data={logData} />
          }
        </SectionCard>
      </div>

      {/* Daily runtime */}
      <div style={{ marginBottom: 16 }}>
        <SectionCard title="Daily Runtime">
          {logLoading
            ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            : <DailyRuntimeChart data={logData} />
          }
        </SectionCard>
      </div>

      {/* Runtime table */}
      <SectionCard
        title="Run History"
        rightSlot={
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            {logData ? logData.length : 0} RECORDS
          </span>
        }
      >
        {logLoading
          ? <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          : <RuntimeTable data={logData} />
        }
      </SectionCard>
    </div>
  )
}
