import { usePolling } from '../hooks/usePolling'
import { fetchCurrentState, fetchTotalRuntime } from '../lib/api'
import MotorCard from '../components/MotorCard'
import { Activity, Power, Clock, Zap } from 'lucide-react'
import { format } from 'date-fns'

function StatBox({ label, value, sub, icon: Icon, accent }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}>
      <div style={{
        width: 40, height: 40,
        borderRadius: 8,
        background: `${accent}18`,
        border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} color={accent} />
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          {value}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: motors, loading, error, lastUpdated } = usePolling(fetchCurrentState, 1000)
  const { data: runtimes } = usePolling(fetchTotalRuntime, 5000)

  const activeCount = motors ? motors.filter(m => m.current_status === 'ON').length : 0
  const totalRuntime = runtimes ? runtimes.reduce((acc, r) => acc + r.total_runtime_seconds, 0) : 0
  const topMotor = runtimes ? [...runtimes].sort((a, b) => b.total_runtime_seconds - a.total_runtime_seconds)[0] : null

  const GROUPS = [
    { label: 'Long Travel', ids: [1, 2] },
    { label: 'Cross Travel', ids: [3, 4] },
    { label: 'Hoist', ids: [5, 6] },
  ]

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)', fontSize: 14 }}>CONNECTION ERROR</div>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>{error.message}</div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            OVERHEAD CRANE SYSTEM
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Motor Overview
          </h1>
        </div>

        {lastUpdated && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            textAlign: 'right',
          }}>
            <div>LAST SYNC</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
              {format(lastUpdated, 'HH:mm:ss')}
            </div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 32,
      }}>
        <StatBox
          label="MOTORS RUNNING"
          value={loading ? '—' : `${activeCount} / 6`}
          accent="var(--on-green)"
          icon={Power}
        />
        <StatBox
          label="TOTAL RUNTIME"
          value={totalRuntime > 0 ? `${Math.floor(totalRuntime / 60)}m` : '—'}
          sub={totalRuntime > 0 ? `${totalRuntime}s total` : undefined}
          accent="var(--fwd-blue)"
          icon={Clock}
        />
        <StatBox
          label="MOST ACTIVE"
          value={topMotor ? topMotor.motor_name : '—'}
          sub={topMotor ? `${topMotor.total_runtime_seconds}s runtime` : undefined}
          accent="var(--rev-amber)"
          icon={Zap}
        />
        <StatBox
          label="SYSTEM STATUS"
          value={error ? 'ERROR' : 'ONLINE'}
          accent={error ? 'var(--danger)' : 'var(--on-green)'}
          icon={Activity}
        />
      </div>

      {/* Motor groups */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {GROUPS.map(g => (
            <div key={g.label}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
                {g.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {g.ids.map(id => (
                  <div key={id} style={{
                    height: 156, background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                    animation: 'pulse-dot 1.5s ease-in-out infinite',
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {GROUPS.map(group => {
            const groupMotors = motors.filter(m => group.ids.includes(m.motor_id))
            const groupActive = groupMotors.filter(m => m.current_status === 'ON').length
            return (
              <div key={group.label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {group.label}
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: groupActive > 0 ? 'var(--on-green)' : 'var(--text-muted)',
                  }}>
                    {groupActive}/{groupMotors.length} ON
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 14,
                }}>
                  {groupMotors.map(motor => (
                    <MotorCard key={motor.motor_id} motor={motor} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
