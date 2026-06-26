import { TrendingDown, TrendingUp, Building2, Users, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const hostelData = [
  { name: 'Limbdi', students: 520, attendance: 88, waste: 5.2, color: '#14b8a6' },
  { name: 'Ramanujan', students: 480, attendance: 82, waste: 8.1, color: '#8b5cf6' },
  { name: 'Vivekananda', students: 440, attendance: 91, waste: 4.3, color: '#f59e0b' },
  { name: 'Gandhi', students: 390, attendance: 79, waste: 10.2, color: '#f43f5e' },
  { name: 'Tagore', students: 510, attendance: 85, waste: 6.7, color: '#3b82f6' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem' }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></div>)}
    </div>
  )
}

export default function AdminDashboard() {
  const totalStudents = hostelData.reduce((a, h) => a + h.students, 0)
  const avgAttendance = Math.round(hostelData.reduce((a, h) => a + h.attendance, 0) / hostelData.length)
  const avgWaste = (hostelData.reduce((a, h) => a + h.waste, 0) / hostelData.length).toFixed(1)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--text-primary), var(--accent-teal-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Admin Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          IIT BHU Hostel Mess System · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* System Stats */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Students', value: totalStudents, icon: '👥', color: 'var(--accent-teal)', change: '+42 this month', up: true },
          { label: 'Active Hostels', value: hostelData.length, icon: '🏠', color: 'var(--accent-purple)', change: 'All operational', up: true },
          { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: '📊', color: 'var(--accent-emerald)', change: '+3% vs last month', up: true },
          { label: 'Avg Waste Rate', value: `${avgWaste}%`, icon: '♻️', color: 'var(--accent-amber)', change: '-1.2% vs last month', up: false },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.6rem' }}>{s.icon}</div>
              <span className={`badge ${s.up ? 'badge-emerald' : 'badge-amber'}`}>
                {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {s.change}
              </span>
            </div>
            <div className="stat-value" style={{ color: s.color, marginTop: 12 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hostel Comparison */}
      <div className="grid-2 mb-24">
        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">Attendance Rate by Hostel</h3>
            <span className="badge badge-teal">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hostelData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={val => [`${val}%`, 'Attendance']} />
              <Bar dataKey="attendance" name="Attendance" radius={[0, 4, 4, 0]}>
                {hostelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">Waste Rate by Hostel (%)</h3>
            <span className="badge badge-rose">Target: &lt;5%</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hostelData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={val => [`${val}%`, 'Waste Rate']} />
              <Bar dataKey="waste" name="Waste" radius={[0, 4, 4, 0]}>
                {hostelData.map((e, i) => <Cell key={i} fill={e.waste > 8 ? 'var(--accent-rose)' : e.waste > 5 ? 'var(--accent-amber)' : 'var(--accent-emerald)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hostel Cards */}
      <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16 }}>Hostel Status</h3>
      <div className="grid-3">
        {hostelData.map((h, i) => (
          <div key={i} className="card" style={{ borderLeft: `4px solid ${h.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>{h.name} Hostel</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{h.students} students</p>
              </div>
              <span className={`badge ${h.attendance >= 85 ? 'badge-emerald' : h.attendance >= 80 ? 'badge-amber' : 'badge-rose'}`}>
                {h.attendance}% att.
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Attendance</span>
                <span style={{ color: 'var(--text-secondary)' }}>{h.attendance}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${h.attendance}%`, background: h.color }} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Waste Rate</span>
              <span style={{ color: h.waste > 8 ? 'var(--accent-rose)' : h.waste > 5 ? 'var(--accent-amber)' : 'var(--accent-emerald)', fontWeight: 600 }}>
                {h.waste}% {h.waste > 8 ? '⚠️' : h.waste > 5 ? '⚡' : '✓'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
