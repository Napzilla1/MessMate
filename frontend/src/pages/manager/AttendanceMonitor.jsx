import { useState, useEffect } from 'react'
import { Download, Search, Filter, Users, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import { io } from 'socket.io-client'

export default function AttendanceMonitor() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeMeal, setActiveMeal] = useState('lunch')
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const MEAL_COLORS = { breakfast: 'var(--accent-amber)', lunch: 'var(--accent-teal)', dinner: 'var(--accent-purple)' }
  const hostel = user?.hostel || 'Limbdi Hostel'

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await api.get(`/attendance/hostel/${encodeURIComponent(hostel)}?date=${today}`)
      const records = res.data || []

      const mapped = records.map(a => ({
        id: a.student?.rollNo || a.student?._id?.toString().slice(-6) || 'N/A',
        name: a.student?.name || 'Unknown Student',
        room: a.student?.room || '—',
        hostel: a.hostel,
        declared: a[activeMeal]?.declared || false,
        checkedIn: a[activeMeal]?.checkedIn || false,
        checkInTime: a[activeMeal]?.checkInTime,
        status: a[activeMeal]?.checkedIn ? 'present' : a[activeMeal]?.declared ? 'absent' : 'pending',
        meal: activeMeal,
      }))
      setAttendance(mapped)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Failed to fetch attendance', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [activeMeal, user])

  // Socket.io: update live when scan comes in
  useEffect(() => {
    const socket = io('http://localhost:5000')
    socket.emit('join_hostel_room', hostel)
    socket.on('scan_success', (data) => {
      if (data.meal === activeMeal) {
        setAttendance(prev => prev.map(s =>
          (s.id === data.studentId?.toString().slice(-6) || s.name === data.studentName)
            ? { ...s, checkedIn: true, status: 'present', checkInTime: new Date().toISOString() }
            : s
        ))
        setLastRefresh(new Date())
      }
    })
    return () => socket.disconnect()
  }, [activeMeal, hostel])

  const filtered = attendance.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchFilter
  })

  const present = attendance.filter(s => s.status === 'present').length
  const absent = attendance.filter(s => s.status === 'absent').length
  const pending = attendance.filter(s => s.status === 'pending').length

  const StatusBadge = ({ status }) => {
    if (status === 'present') return <span className="badge badge-emerald"><CheckCircle2 size={11} /> Present</span>
    if (status === 'absent') return <span className="badge badge-rose"><XCircle size={11} /> Absent</span>
    return <span className="badge badge-amber"><AlertCircle size={11} /> Not Declared</span>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Attendance Monitor</h1>
          <p>Live data from MongoDB · Last updated {lastRefresh.toLocaleTimeString('en-IN')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchAttendance}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary"><Download size={15} /> Export</button>
        </div>
      </div>

      {/* Meal selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['breakfast', 'lunch', 'dinner'].map(m => (
          <button key={m} id={`attn-meal-${m}`}
            className={`btn ${activeMeal === m ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMeal(m)}
            style={activeMeal === m ? { background: `linear-gradient(135deg, ${MEAL_COLORS[m]}, ${MEAL_COLORS[m]}cc)` } : {}}
          >
            {m === 'breakfast' ? '🌅' : m === 'lunch' ? '☀️' : '🌙'} {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
        <span className="live-badge" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          <span className="live-dot" /> Live
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Students', value: attendance.length, icon: <Users size={18} />, color: 'var(--text-primary)' },
          { label: 'Present', value: present, icon: <CheckCircle2 size={18} />, color: 'var(--accent-emerald)' },
          { label: 'Declared Absent', value: absent, icon: <XCircle size={18} />, color: 'var(--accent-rose)' },
          { label: 'Not Declared', value: pending, icon: <AlertCircle size={18} />, color: 'var(--accent-amber)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ color: s.color, marginBottom: 10 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text" className="form-input"
              placeholder="Search by name or ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40, background: 'var(--bg-app)' }}
            />
          </div>
          {['all', 'present', 'absent', 'pending'].map(f => (
            <button key={f}
              className={`btn btn-sm ${filterStatus === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(f)}
              style={{ textTransform: 'capitalize' }}
            >{f}</button>
          ))}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Student</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID / Room</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Check-in Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading live data...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                {attendance.length === 0 ? 'No attendance declarations found for today' : 'No results match your filter'}
              </td></tr>
            ) : (
              filtered.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {s.id} · {s.room}
                  </td>
                  <td style={{ padding: '14px 20px' }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {s.checkInTime
                      ? new Date(s.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
