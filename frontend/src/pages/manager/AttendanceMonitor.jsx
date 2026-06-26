import { useState, useEffect } from 'react'
import { Download, Search, Filter, Users, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../App'
import api from '../../api'

const MOCK_ATTENDANCE = [
  { id: 'STU001', name: 'Arjun Sharma', hostel: 'Block A', room: 'A-204', declared: true, checkedIn: true, meal: 'Lunch', status: 'present' },
  { id: 'STU002', name: 'Priya Patel', hostel: 'Block A', room: 'A-101', declared: true, checkedIn: true, meal: 'Lunch', status: 'present' },
  { id: 'STU003', name: 'Rahul Singh', hostel: 'Block B', room: 'B-305', declared: true, checkedIn: false, meal: 'Lunch', status: 'absent' },
  { id: 'STU004', name: 'Anita Kumar', hostel: 'Block B', room: 'B-201', declared: false, checkedIn: false, meal: '', status: 'pending' },
  { id: 'STU005', name: 'Mohit Sharma', hostel: 'Block C', room: 'C-408', declared: true, checkedIn: true, meal: 'Lunch', status: 'present' },
  { id: 'STU006', name: 'Deepa Nair', hostel: 'Block A', room: 'A-302', declared: false, checkedIn: false, meal: '', status: 'pending' },
  { id: 'STU007', name: 'Arun Verma', hostel: 'Block C', room: 'C-110', declared: true, checkedIn: false, meal: 'Lunch', status: 'absent' },
  { id: 'STU008', name: 'Sunita Rao', hostel: 'Block B', room: 'B-403', declared: true, checkedIn: true, meal: 'Lunch', status: 'present' },
  { id: 'STU009', name: 'Kiran Das', hostel: 'Block A', room: 'A-205', declared: true, checkedIn: true, meal: 'Lunch', status: 'present' },
  { id: 'STU010', name: 'Amit Joshi', hostel: 'Block C', room: 'C-207', declared: false, checkedIn: false, meal: '', status: 'pending' },
]

export default function AttendanceMonitor() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeMeal, setActiveMeal] = useState('lunch')
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  
  const MEAL_COLORS = { breakfast: 'var(--accent-amber)', lunch: 'var(--accent-teal)', dinner: 'var(--accent-purple)' }

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get(`/attendance/hostel/${user?.hostel || 'Limbdi Hostel'}?date=${new Date().toISOString().split('T')[0]}`)
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(a => ({
            id: a.student?.rollNo || a.student?._id || 'Unknown',
            name: a.student?.name || 'Unknown Student',
            room: a.student?.room || 'Unknown Room',
            status: a.status === 'success' ? 'present' : a.status === 'not-going' ? 'absent' : 'pending',
            meal: a.meal || 'lunch',
            declared: a.status !== 'not-going'
          }))
          setAttendance(mapped)
        } else {
          setAttendance(MOCK_ATTENDANCE)
        }
      } catch (err) {
        console.error("Failed to fetch attendance logs", err)
        setAttendance(MOCK_ATTENDANCE)
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [user])

  const filtered = attendance.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
    if (filterStatus === 'declared') return matchSearch && s.declared
    if (filterStatus === 'checkedIn') return matchSearch && s.status === 'present'
    if (filterStatus === 'absent') return matchSearch && s.status === 'absent'
    if (filterStatus === 'notDeclared') return matchSearch && !s.declared
    return matchSearch
  })

  const checkedIn = MOCK_STUDENTS.filter(s => s.checkedIn).length
  const absent = MOCK_STUDENTS.filter(s => s.declared && !s.checkedIn).length

  return (
    <div>
      <div className="page-header">
        <div><h1>Attendance Monitor</h1><p>Track expected vs actual meal attendance</p></div>
        <button className="btn btn-secondary"><Download size={15}/> Export CSV</button>
      </div>

      {/* Summary */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Students', value: MOCK_STUDENTS.length, color: 'var(--text-primary)', icon: '👥' },
          { label: 'Declared', value: declared, color: 'var(--accent-teal)', icon: '📋' },
          { label: 'Checked In', value: checkedIn, color: 'var(--accent-emerald)', icon: '✅' },
          { label: 'No-Show', value: absent, color: 'var(--accent-rose)', icon: '⚠️' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Meal tabs */}
      <div className="tabs mb-24" style={{ maxWidth: 360 }}>
        {['breakfast', 'lunch', 'dinner'].map(m => (
          <button key={m} id={`attn-mon-${m}`} className={`tab-btn ${activeMeal === m ? 'active' : ''}`}
            onClick={() => setActiveMeal(m)}
            style={activeMeal === m ? { background: `linear-gradient(135deg, ${MEAL_COLORS[m]}, ${MEAL_COLORS[m]}cc)` } : {}}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input id="attn-search" className="form-input" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['all', 'All'], ['declared', 'Declared'], ['checkedIn', 'Checked In'], ['absent', 'No-Show'], ['notDeclared', 'Not Declared']].map(([val, label]) => (
            <button key={val} id={`filter-${val}`} onClick={() => setFilterStatus(val)} className={`btn btn-sm ${filterStatus === val ? 'btn-primary' : 'btn-secondary'}`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Student</th><th>ID</th><th>Hostel</th><th>Room</th><th>Declared</th><th>Checked In</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.id}</td>
                <td>{s.hostel}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.room}</td>
                <td>
                  {s.declared ? <span className="badge badge-teal"><CheckCircle2 size={11}/> Yes</span>
                    : <span className="badge badge-rose"><XCircle size={11}/> No</span>}
                </td>
                <td>
                  {s.checkedIn ? <span className="badge badge-emerald"><CheckCircle2 size={11}/> Yes</span>
                    : <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>—</span>}
                </td>
                <td>
                  {s.checkedIn ? (
                    <span className="badge badge-emerald">✓ Present</span>
                  ) : s.declared ? (
                    <span className="badge badge-rose"><AlertCircle size={11}/> No-Show</span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: '0.72rem' }}>Not Declared</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
