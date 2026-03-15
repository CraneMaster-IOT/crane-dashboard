import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, ArrowLeft, Minus, Power, Clock } from 'lucide-react'

const MOTOR_GROUPS = {
  1: { group: 'Long Travel', abbr: 'LT' },
  2: { group: 'Long Travel', abbr: 'LT' },
  3: { group: 'Cross Travel', abbr: 'CT' },
  4: { group: 'Cross Travel', abbr: 'CT' },
  5: { group: 'Hoist', abbr: 'H' },
  6: { group: 'Hoist', abbr: 'H' },
}

export default function MotorCard({ motor }) {
  const navigate = useNavigate()
  const isOn = motor.current_status === 'ON'
  const isFwd = motor.current_orientation === 'FWD'
  const isRev = motor.current_orientation === 'REV'

  const meta = MOTOR_GROUPS[motor.motor_id] || {}

  const runningSince = motor.running_since ? new Date(motor.running_since) : null
  const lastUpdated = motor.last_updated ? new Date(motor.last_updated) : null

  return (
    <div
      onClick={() => navigate(`/motor/${motor.motor_id}`)}
      className="animate-fade-in"
      style={{
        background: isOn
          ? `linear-gradient(145deg, #0d1f16, var(--bg-card))`
          : `var(--bg-card)`,
        border: `1px solid ${isOn ? '#1a3d25' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isOn ? 'var(--on-green-glow)' : 'none',
        animationDelay: `${motor.motor_id * 0.05}s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isOn ? '#2a6040' : 'var(--border-bright)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.background = isOn
          ? 'linear-gradient(145deg, #0f2a1c, #18222e)'
          : 'var(--bg-card-hover)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isOn ? '#1a3d25' : 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.background = isOn
          ? 'linear-gradient(145deg, #0d1f16, var(--bg-card))'
          : 'var(--bg-card)'
      }}
    >
      {/* Glow top edge when ON */}
      {isOn && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, var(--on-green), transparent)',
          opacity: 0.7,
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            {meta.group || 'Motor'}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {motor.motor_name}
          </div>
        </div>

        {/* Status indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: isOn ? 'var(--on-green-dim)' : 'var(--off-gray-dim)',
          border: `1px solid ${isOn ? '#1a4a2a' : 'var(--border)'}`,
          borderRadius: 4,
          padding: '4px 10px',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isOn ? 'var(--on-green)' : 'var(--off-gray)',
            boxShadow: isOn ? '0 0 6px var(--on-green)' : 'none',
            animation: isOn ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            color: isOn ? 'var(--on-green)' : 'var(--off-gray)',
            letterSpacing: '0.08em',
          }}>
            {motor.current_status}
          </span>
        </div>
      </div>

      {/* Orientation row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16,
        padding: '10px 14px',
        background: '#0a0e14',
        borderRadius: 6,
        border: '1px solid var(--border)',
      }}>
        <div style={{
          color: isFwd ? 'var(--fwd-blue)' : isRev ? 'var(--rev-amber)' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center',
        }}>
          {isFwd && <ArrowRight size={16} />}
          {isRev && <ArrowLeft size={16} />}
          {!isFwd && !isRev && <Minus size={16} />}
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: isFwd ? 'var(--fwd-blue)' : isRev ? 'var(--rev-amber)' : 'var(--text-muted)',
          letterSpacing: '0.08em',
        }}>
          {motor.current_orientation}
        </span>
        {isFwd && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            FORWARD
          </span>
        )}
        {isRev && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            REVERSE
          </span>
        )}
      </div>

      {/* Footer meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={11} color="var(--text-muted)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            {isOn && runningSince
              ? `Running ${formatDistanceToNow(runningSince, { addSuffix: false })}`
              : lastUpdated
                ? `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`
                : '—'}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          M{String(motor.motor_id).padStart(2, '0')} ›
        </span>
      </div>
    </div>
  )
}
