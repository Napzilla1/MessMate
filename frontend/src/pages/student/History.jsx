import { useState, useEffect } from 'react'
import { Check, X, Download } from 'lucide-react'
import api from '../../api'

export default function History() {
  const [history, setHistory] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/attendance/me')
        // Sort descending by date
        const sorted = [...res.data].sort((a, b) => new Date(b.date) - new Date(a.date))
        setHistory(sorted)
      } catch (err) {
        console.error('Failed to fetch history', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const totalMeals = history.reduce((a, d) =>
    a + (d.breakfast?.checkedIn ? 1 : 0) + (d.lunch?.checkedIn ? 1 : 0) + (d.dinner?.checkedIn ? 1 : 0), 0)
  const possible = history.length * 3
  const rate = possible > 0 ? Math.round((totalMeals / possible) * 100) : 0

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return {
      display: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      day: d.toLocaleDateString('en-US', { weekday: 'short' })
    }
  }

  const MealBadge = ({ checked }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
      background: checked ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.1)',
      color: checked ? 'var(--accent-emerald)' : 'var(--accent-rose)'
    }}>
      {checked ? <Check size={12} /> : <X size={12} />}
      {checked ? 'Attended' : 'Skipped'}
    </span>
  )

  return (
    <div>
      <div className="page-header">
        <div><h1>Meal History</h1><p>Your complete attendance record from the database</p></div>
        <button className="btn btn-secondary"><Download size={15} /> Export CSV</button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {[
          ['Total Attended', totalMeals, 'var(--accent-teal)', '🍽️'],
          ['Total Possible', possible, 'var(--text-secondary)', '📅'],
          ['Skipped', possible - totalMeals, 'var(--accent-rose)', '⏭️'],
          ['Attendance Rate', `${rate}%`, 'var(--accent-purple)', '📊']
        ].map(([l, v, c, icon]) => (
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
          <button key={f} id={`hist-filter-${f}`}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading your history...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No attendance records yet. Start declaring your meals!
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Day</th>
                {(filter === 'all' || filter === 'breakfast') && <th>🌅 Breakfast</th>}
                {(filter === 'all' || filter === 'lunch') && <th>☀️ Lunch</th>}
                {(filter === 'all' || filter === 'dinner') && <th>🌙 Dinner</th>}
                <th>Check-ins</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => {
                const { display, day } = formatDate(row.date)
                const bChecked = row.breakfast?.checkedIn
                const lChecked = row.lunch?.checkedIn
                const dChecked = row.dinner?.checkedIn
                const total = (bChecked ? 1 : 0) + (lChecked ? 1 : 0) + (dChecked ? 1 : 0)
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{display}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{day}</td>
                    {(filter === 'all' || filter === 'breakfast') && <td><MealBadge checked={bChecked} /></td>}
                    {(filter === 'all' || filter === 'lunch') && <td><MealBadge checked={lChecked} /></td>}
                    {(filter === 'all' || filter === 'dinner') && <td><MealBadge checked={dChecked} /></td>}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: total === 3 ? 'var(--accent-teal)' : total === 0 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>{total}/3</span>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill progress-teal" style={{ width: `${(total / 3) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
