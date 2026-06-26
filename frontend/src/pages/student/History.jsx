import { useState } from 'react'
import { Check, X, Filter, Download } from 'lucide-react'

const HISTORY = [
  { date: 'Jun 25, 2026', day: 'Wed', breakfast: true, lunch: false, dinner: true },
  { date: 'Jun 24, 2026', day: 'Tue', breakfast: true, lunch: true, dinner: true },
  { date: 'Jun 23, 2026', day: 'Mon', breakfast: false, lunch: true, dinner: true },
  { date: 'Jun 22, 2026', day: 'Sun', breakfast: false, lunch: true, dinner: false },
  { date: 'Jun 21, 2026', day: 'Sat', breakfast: true, lunch: true, dinner: true },
  { date: 'Jun 20, 2026', day: 'Fri', breakfast: true, lunch: false, dinner: true },
  { date: 'Jun 19, 2026', day: 'Thu', breakfast: false, lunch: true, dinner: true },
  { date: 'Jun 18, 2026', day: 'Wed', breakfast: true, lunch: true, dinner: false },
  { date: 'Jun 17, 2026', day: 'Tue', breakfast: true, lunch: true, dinner: true },
  { date: 'Jun 16, 2026', day: 'Mon', breakfast: false, lunch: false, dinner: true },
]

export default function History() {
  const [filter, setFilter] = useState('all')

  const totalMeals = HISTORY.reduce((a, d) => a + (d.breakfast?1:0) + (d.lunch?1:0) + (d.dinner?1:0), 0)
  const possible = HISTORY.length * 3
  const rate = Math.round((totalMeals / possible) * 100)

  return (
    <div>
      <div className="page-header">
        <div><h1>Meal History</h1><p>Your past 10 days of attendance</p></div>
        <button className="btn btn-secondary"><Download size={15}/> Export CSV</button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {[['Total Meals', totalMeals, 'var(--accent-teal)', '🍽️'], ['Possible', possible, 'var(--text-secondary)', '📅'], ['Skipped', possible - totalMeals, 'var(--accent-rose)', '⏭️'], ['Attendance', `${rate}%`, 'var(--accent-purple)', '📊']].map(([l, v, c, icon]) => (
          <div key={l} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>{icon}</div>
            <div className="stat-value" style={{ color: c }}>{v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'breakfast', 'lunch', 'dinner'].map(f => (
          <button key={f} id={`hist-filter-${f}`} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Day</th>
              {(filter === 'all' || filter === 'breakfast') && <th>🌅 Breakfast</th>}
              {(filter === 'all' || filter === 'lunch') && <th>☀️ Lunch</th>}
              {(filter === 'all' || filter === 'dinner') && <th>🌙 Dinner</th>}
              <th>Meals</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((row, i) => {
              const total = (row.breakfast?1:0) + (row.lunch?1:0) + (row.dinner?1:0)
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.date}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{row.day}</td>
                  {(filter === 'all' || filter === 'breakfast') && (
                    <td><span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background: row.breakfast ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.1)', color: row.breakfast ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{row.breakfast ? <Check size={12}/> : <X size={12}/>}{row.breakfast ? 'Attended' : 'Skipped'}</span></td>
                  )}
                  {(filter === 'all' || filter === 'lunch') && (
                    <td><span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background: row.lunch ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.1)', color: row.lunch ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{row.lunch ? <Check size={12}/> : <X size={12}/>}{row.lunch ? 'Attended' : 'Skipped'}</span></td>
                  )}
                  {(filter === 'all' || filter === 'dinner') && (
                    <td><span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background: row.dinner ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.1)', color: row.dinner ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{row.dinner ? <Check size={12}/> : <X size={12}/>}{row.dinner ? 'Attended' : 'Skipped'}</span></td>
                  )}
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontWeight:700, color: total === 3 ? 'var(--accent-teal)' : total === 0 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>{total}/3</span>
                      <div className="progress-bar" style={{ width: 60 }}><div className="progress-fill progress-teal" style={{ width: `${(total/3)*100}%` }} /></div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
