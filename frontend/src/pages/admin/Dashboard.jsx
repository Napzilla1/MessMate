import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../../api'

const HOSTEL_COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#f43f5e', '#3b82f6', '#10b981']

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
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [hostels, setHostels] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, hostelsRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/hostels'),
        ])
        setUsers(usersRes.data || [])
        setHostels(hostelsRes.data || [])
      } catch (err) {
        console.error('Failed to load admin dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const students = users.filter(u => u.role === 'student')
  const managers = users.filter(u => u.role === 'manager')

  // Group students by hostel for chart
  const hostelStudentMap = {}
  students.forEach(s => {
    if (s.hostel) hostelStudentMap[s.hostel] = (hostelStudentMap[s.hostel] || 0) + 1
  })
  const hostelChartData = Object.entries(hostelStudentMap).map(([name, count], i) => ({
    name: name.replace(' Hostel', ''),
    students: count,
    color: HOSTEL_COLORS[i % HOSTEL_COLORS.length]
  }))

  // Recent registrations (last 5)
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)

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

      {/* Live System Stats */}
      <div className="grid-4 mb-24">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="stat-card" style={{ opacity: 0.5 }}>
            <div style={{ height: 60, background: 'var(--bg-glass)', borderRadius: 8 }} />
          </div>
        )) : [
          { label: 'Total Students', value: students.length, icon: '👥', color: 'var(--accent-teal)', change: 'registered', up: true },
          { label: 'Mess Managers', value: managers.length, icon: '👨‍🍳', color: 'var(--accent-amber)', change: 'active', up: true },
          { label: 'Active Hostels', value: Math.max(hostelChartData.length, hostels.length), icon: '🏠', color: 'var(--accent-purple)', change: 'operational', up: true },
          { label: 'Total Users', value: users.length, icon: '📊', color: 'var(--accent-emerald)', change: 'in system', up: true },
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

      <div className="grid-2 mb-24">
        {/* Students per Hostel Chart */}
        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">Students per Hostel</h3>
            <span className="badge badge-teal">Live</span>
          </div>
          {hostelChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hostelChartData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="students" name="Students" radius={[4, 4, 0, 0]}>
                  {hostelChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {loading ? 'Loading...' : 'No student registrations yet'}
            </div>
          )}
        </div>

        {/* Hostel breakdown table */}
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16 }}>Hostel Breakdown</h3>
          {hostelChartData.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30, fontSize: '0.85rem' }}>
              {loading ? 'Loading...' : 'No students registered yet'}
            </div>
          ) : (
            hostelChartData.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < hostelChartData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: h.color }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{h.name}</span>
                </div>
                <span className="badge" style={{ background: `${h.color}20`, color: h.color, border: `1px solid ${h.color}40` }}>
                  {h.students} students
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Recently Registered Students</h3>
          <span className="badge badge-teal">Live from DB</span>
        </div>
        <div className="table-container">
          {recentStudents.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {loading ? 'Loading...' : 'No student registrations yet'}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>Email</th><th>Hostel</th><th>Room</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#fff', flexShrink: 0 }}>
                        {s.name?.charAt(0)}
                      </div>
                      {s.name}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{s.email}</td>
                    <td>{s.hostel || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.room || '—'}</td>
                    <td><span className="badge badge-emerald">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
