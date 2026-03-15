import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Activity, ChevronRight, Home } from 'lucide-react'
import { usePolling } from '../hooks/usePolling'
import { fetchCurrentState } from '../lib/api'
import { format } from 'date-fns'

export default function Layout() {
  const { data: motors, lastUpdated } = usePolling(fetchCurrentState, 1000)
  const location = useLocation()
  const isMotorPage = location.pathname.startsWith('/motor/')

  const activeCount = motors ? motors.filter(m => m.current_status === 'ON').length : 0
  const totalCount = motors ? motors.length : 6

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top nav bar */}
      <header style={{
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)',
      }}>
        {/* Left: logo + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--accent), #0ea5e9)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
            }}>
              CraneOps
            </span>
          </NavLink>

          {isMotorPage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
              <ChevronRight size={14} />
              <NavLink to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Home size={12} />
                Dashboard
              </NavLink>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--text-primary)', fontSize: 12 }}>Motor Detail</span>
            </div>
          )}
        </div>

        {/* Right: live status strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: 'var(--on-green)',
              boxShadow: '0 0 8px var(--on-green)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
              LIVE
            </span>
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ color: activeCount > 0 ? 'var(--on-green)' : 'var(--off-gray)' }}>
              {activeCount}
            </span>
            <span>/</span>
            <span>{totalCount}</span>
            <span style={{ marginLeft: 2 }}>RUNNING</span>
          </div>

          {lastUpdated && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              {format(lastUpdated, 'HH:mm:ss')}
            </span>
          )}
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, padding: '28px 24px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          CRANE MOTOR MONITORING SYSTEM
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          POLLING 1s · SUPABASE
        </span>
      </footer>
    </div>
  )
}
