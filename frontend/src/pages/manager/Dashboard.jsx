import { useState, useEffect } from 'react'
import { Users, TrendingDown, Utensils, AlertTriangle, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuth } from '../../App'

const hourlyData = [
  { time: '7AM', count: 0 }, { time: '8AM', count: 245 }, { time: '9AM', count: 312 },
  { time: '10AM', count: 89 }, { time: '11AM', count: 0 }, { time: '12PM', count: 178 },
  { time: '1PM', count: 389 }, { time: '2PM', count: 156 }, { time: '3PM', count: 12 },
  { time: '7PM', count: 0 }, { time: '8PM', count: 412 }, { time: '9PM', count: 287 },
]

const mealStats = [
  { meal: 'Breakfast', declared: 420, checkedIn: 395, color: '#f59e0b' },
  { meal: 'Lunch', declared: 510, checkedIn: 0, color: '#14b8a6' },
  { meal: 'Dinner', declared: 480, checkedIn: 0, color: '#8b5cf6' },
]

const recentScans = [
  { id: 'STU032', name: 'Priya Patel', meal: 'Breakfast', time: '8:42 AM', hostel: 'Block A' },
  { id: 'STU018', name: 'Rahul Singh', meal: 'Breakfast', time: '8:39 AM', hostel: 'Block B' },
  { id: 'STU075', name: 'Anita Kumar', meal: 'Breakfast', time: '8:35 AM', hostel: 'Block A' },
  { id: 'STU091', name: 'Mohit Sharma', meal: 'Breakfast', time: '8:31 AM', hostel: 'Block C' },
  { id: 'STU044', name: 'Deepa Nair', meal: 'Breakfast', time: '8:28 AM', hostel: 'Block A' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem' }}>
      <div style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{payload[0].value} students</div>
    </div>
  )
}

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [count, setCount] = useState(395)
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--text-primary), var(--accent-teal-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Operations Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{user?.hostel} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <span className="live-badge"><span className="live-dot" /> Live</span>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Checked In Today', value: count, icon: '✅', color: 'var(--accent-emerald)', sub: 'breakfast done' },
          { label: 'Expected Lunch', value: 510, icon: '☀️', color: 'var(--accent-teal)', sub: 'declared' },
          { label: 'Expected Dinner', value: 480, icon: '🌙', color: 'var(--accent-purple)', sub: 'declared' },
          { label: 'Not Yet Scanned', value: 25, icon: '⚠️', color: 'var(--accent-amber)', sub: 'declared but absent' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-24">
        {/* Meal Breakdown */}
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>Today's Meal Breakdown</h3>
          {mealStats.map(m => (
            <div key={m.meal} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{m.meal}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {m.checkedIn > 0 ? `${m.checkedIn} / ${m.declared}` : `${m.declared} declared`}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: m.checkedIn > 0 ? `${(m.checkedIn / m.declared) * 100}%` : '100%', background: m.color }} />
              </div>
              {m.checkedIn > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{Math.round((m.checkedIn / m.declared) * 100)}% attendance rate</div>}
            </div>
          ))}
          <div style={{ padding: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.82rem', color: 'var(--accent-amber)' }}>
              <AlertTriangle size={14} /> 25 students declared breakfast but not checked in
            </div>
          </div>
        </div>

        {/* Hourly Traffic */}
        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">Hourly Check-in Traffic</h3>
            <span className="badge badge-teal">Today</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.count > 300 ? 'var(--accent-teal)' : entry.count > 100 ? 'rgba(20,184,166,0.5)' : 'rgba(20,184,166,0.2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Recent Check-ins</h3>
          <span className="live-badge"><span className="live-dot" /> Live Feed</span>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Student</th><th>ID</th><th>Block</th><th>Meal</th><th>Time</th></tr></thead>
            <tbody>
              {recentScans.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.id}</td>
                  <td>{s.hostel}</td>
                  <td><span className="badge badge-amber">{s.meal}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
