import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { io } from 'socket.io-client'
import api from '../../api'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem' }}>
      <div style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{payload[0].value} check-ins</div>
    </div>
  )
}

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [recentScans, setRecentScans] = useState([])
  const [mealStats, setMealStats] = useState([
    { meal: 'Breakfast', declared: 0, checkedIn: 0, color: '#f59e0b' },
    { meal: 'Lunch', declared: 0, checkedIn: 0, color: '#14b8a6' },
    { meal: 'Dinner', declared: 0, checkedIn: 0, color: '#8b5cf6' },
  ])
  const [hourlyData, setHourlyData] = useState([])
  const [wasteToday, setWasteToday] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)

  useEffect(() => {
    const hostel = user?.hostel || 'Limbdi Hostel'
    const today = new Date().toISOString().split('T')[0]

    const fetchAll = async () => {
      try {
        // Fetch today's hostel attendance
        const attRes = await api.get(`/attendance/hostel/${encodeURIComponent(hostel)}?date=${today}`)
        const records = attRes.data || []

        // Meal stats
        const stats = [
          { meal: 'Breakfast', declared: 0, checkedIn: 0, color: '#f59e0b' },
          { meal: 'Lunch', declared: 0, checkedIn: 0, color: '#14b8a6' },
          { meal: 'Dinner', declared: 0, checkedIn: 0, color: '#8b5cf6' },
        ]
        const hourMap = {}
        const scans = []

        records.forEach(r => {
          ['breakfast', 'lunch', 'dinner'].forEach((meal, idx) => {
            if (r[meal]?.declared) stats[idx].declared++
            if (r[meal]?.checkedIn) {
              stats[idx].checkedIn++
              const t = r[meal].checkInTime
              if (t) {
                const h = new Date(t).getHours()
                const label = `${h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`
                hourMap[h] = (hourMap[h] || { time: label, count: 0 })
                hourMap[h].count++
              }
              scans.push({
                name: r.student?.name || 'Unknown',
                id: r.student?.rollNo || r.student?._id?.toString().slice(-6) || '???',
                hostel: r.hostel,
                meal: meal.charAt(0).toUpperCase() + meal.slice(1),
                time: t ? new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
              })
            }
          })
        })

        setMealStats(stats)
        setRecentScans(scans.slice(-10).reverse())
        setHourlyData(Object.values(hourMap).sort((a, b) => parseInt(a.time) - parseInt(b.time)))
        setTotalStudents(records.length)
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      }

      // Fetch today's waste
      try {
        const wasteRes = await api.get('/waste')
        const todayWaste = wasteRes.data.filter(w => w.date?.startsWith(today))
        const totalWasted = todayWaste.reduce((acc, w) => acc + (w.wasted || 0), 0)
        setWasteToday(totalWasted)
      } catch (err) { /* waste optional */ }

      setLoading(false)
    }

    fetchAll()

    // Socket.io for live scan feed
    const socket = io('http://localhost:5000')
    socket.emit('join_hostel_room', hostel)
    socket.on('scan_success', (data) => {
      setRecentScans(prev => [{
        name: data.studentName,
        id: data.studentId?.toString().slice(-6) || '???',
        hostel: hostel,
        meal: data.meal?.charAt(0).toUpperCase() + data.meal?.slice(1),
        time: data.time,
      }, ...prev.slice(0, 9)])
      setMealStats(prev => prev.map(m =>
        m.meal.toLowerCase() === data.meal ? { ...m, checkedIn: m.checkedIn + 1 } : m
      ))
    })
    return () => socket.disconnect()
  }, [user])

  const totalCheckedIn = mealStats.reduce((a, m) => a + m.checkedIn, 0)
  const totalDeclared = mealStats.reduce((a, m) => a + m.declared, 0)
  const absent = totalDeclared - totalCheckedIn

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
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="stat-card" style={{ opacity: 0.5 }}>
            <div style={{ height: 60, background: 'var(--bg-glass)', borderRadius: 8 }} />
          </div>
        )) : [
          { label: 'Checked In Today', value: totalCheckedIn, icon: '✅', color: 'var(--accent-emerald)', sub: 'via QR scan' },
          { label: 'Total Declared', value: totalDeclared, icon: '📋', color: 'var(--accent-teal)', sub: 'for today' },
          { label: 'Not Checked In', value: Math.max(0, absent), icon: '⚠️', color: 'var(--accent-amber)', sub: 'declared but absent' },
          { label: 'Waste Today', value: `${wasteToday}kg`, icon: '♻️', color: 'var(--accent-rose)', sub: 'food wasted' },
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
        {/* Meal Breakdown — live */}
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>Today's Meal Breakdown</h3>
          {mealStats.map(m => {
            const pct = m.declared > 0 ? Math.round((m.checkedIn / m.declared) * 100) : 0
            return (
              <div key={m.meal} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{m.meal}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {m.checkedIn} / {m.declared} checked in
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: m.color }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{pct}% attendance rate</div>
              </div>
            )
          })}
          {absent > 0 && (
            <div style={{ padding: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.82rem', color: 'var(--accent-amber)' }}>
                <AlertTriangle size={14} /> {absent} students declared but not checked in yet
              </div>
            </div>
          )}
        </div>

        {/* Hourly Traffic — live */}
        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">Hourly Check-in Traffic</h3>
            <span className="badge badge-teal">Today · Live</span>
          </div>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, i) => (
                    <Cell key={i} fill={entry.count > 30 ? 'var(--accent-teal)' : entry.count > 10 ? 'rgba(20,184,166,0.5)' : 'rgba(20,184,166,0.2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {loading ? 'Loading...' : 'No check-ins recorded yet today'}
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans — live via Socket.io */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Recent Check-ins</h3>
          <span className="live-badge"><span className="live-dot" /> Live Feed</span>
        </div>
        <div className="table-container">
          {recentScans.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {loading ? 'Loading...' : 'No check-ins yet today. Waiting for QR scans...'}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
