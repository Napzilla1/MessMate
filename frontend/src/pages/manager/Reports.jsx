import { useState } from 'react'
import { Download, FileText, Calendar, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const weeklyAttendance = [
  { day: 'Mon', breakfast: 420, lunch: 510, dinner: 485 },
  { day: 'Tue', breakfast: 395, lunch: 530, dinner: 470 },
  { day: 'Wed', breakfast: 410, lunch: 495, dinner: 502 },
  { day: 'Thu', breakfast: 430, lunch: 520, dinner: 488 },
  { day: 'Fri', breakfast: 380, lunch: 475, dinner: 515 },
  { day: 'Sat', breakfast: 340, lunch: 555, dinner: 490 },
  { day: 'Sun', breakfast: 290, lunch: 580, dinner: 478 },
]

const wasteByMeal = [
  { name: 'Breakfast', value: 28, color: '#f59e0b' },
  { name: 'Lunch', value: 45, color: '#14b8a6' },
  { name: 'Dinner', value: 38, color: '#8b5cf6' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></div>)}
    </div>
  )
}

export default function Reports() {
  const [dateFrom, setDateFrom] = useState('2026-06-19')
  const [dateTo, setDateTo] = useState('2026-06-25')
  const [reportType, setReportType] = useState('attendance')

  return (
    <div>
      <div className="page-header">
        <div><h1>Reports</h1><p>Download analytics and summaries</p></div>
        <button className="btn btn-primary"><Download size={15}/> Export PDF</button>
      </div>

      {/* Filters */}
      <div className="card mb-24">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">From Date</label>
            <input id="report-from" type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">To Date</label>
            <input id="report-to" type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Report Type</label>
            <select id="report-type" className="form-select" value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="attendance">Attendance Report</option>
              <option value="waste">Waste Report</option>
              <option value="combined">Combined Report</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ paddingBottom: 12, paddingTop: 12 }}>Generate Report</button>
        </div>
      </div>

      {/* Quick download cards */}
      <div className="grid-3 mb-24">
        {[
          { title: 'Daily Attendance', desc: 'Today\'s meal-wise attendance breakdown', icon: '📋', color: 'var(--accent-teal)' },
          { title: 'Weekly Waste Report', desc: 'Food waste data for last 7 days', icon: '📉', color: 'var(--accent-rose)' },
          { title: 'Monthly Summary', desc: 'Full June 2026 analytics', icon: '📊', color: 'var(--accent-purple)' },
        ].map((r, i) => (
          <div key={i} className="card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.8rem' }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 4 }}>{r.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{r.desc}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm"><Download size={12}/> CSV</button>
                  <button className="btn btn-secondary btn-sm"><FileText size={12}/> PDF</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2 mb-24">
        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">Weekly Attendance by Meal</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyAttendance} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="breakfast" name="Breakfast" fill="#f59e0b" radius={[2,2,0,0]} />
              <Bar dataKey="lunch" name="Lunch" fill="#14b8a6" radius={[2,2,0,0]} />
              <Bar dataKey="dinner" name="Dinner" fill="#8b5cf6" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">Waste Distribution by Meal</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={wasteByMeal} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {wasteByMeal.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val) => [`${val} kg`, 'Wasted']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {wasteByMeal.map(w => (
                <div key={w.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: w.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{w.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{w.value} kg wasted</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: '10px', background: 'var(--bg-glass)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Total: <strong style={{ color: 'var(--accent-rose)' }}>111 kg</strong> wasted this week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="card">
        <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>Period Summary: Jun 19 – Jun 25</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { label: 'Total Meals Served', value: '15,847', color: 'var(--accent-teal)' },
            { label: 'Avg Daily Attendance', value: '482', color: 'var(--accent-purple)' },
            { label: 'Total Food Wasted', value: '111 kg', color: 'var(--accent-rose)' },
            { label: 'Avg Waste Rate', value: '6.2%', color: 'var(--accent-amber)' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
