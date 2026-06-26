import { useState, useEffect } from 'react'
import { Plus, TrendingDown, Save, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../../App'
import api from '../../api'

const HISTORY = [
  { date: 'Jun 19', prepared: 180, consumed: 168, wasted: 12, pct: 6.7 },
  { date: 'Jun 20', prepared: 165, consumed: 148, wasted: 17, pct: 10.3 },
  { date: 'Jun 21', prepared: 190, consumed: 185, wasted: 5, pct: 2.6 },
  { date: 'Jun 22', prepared: 175, consumed: 155, wasted: 20, pct: 11.4 },
  { date: 'Jun 23', prepared: 185, consumed: 172, wasted: 13, pct: 7.0 },
  { date: 'Jun 24', prepared: 170, consumed: 165, wasted: 5, pct: 2.9 },
  { date: 'Jun 25', prepared: 0, consumed: 0, wasted: 0, pct: 0 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>{p.name}: <b>{p.value} kg</b></div>
      ))}
    </div>
  )
}

export default function WasteLog() {
  const { user } = useAuth()
  const [form, setForm] = useState({ meal: 'lunch', prepared: '', consumed: '', wasted: '' })
  const [log, setLog] = useState([])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/waste/${user?.hostel || 'Limbdi Hostel'}`)
        if (res.data && res.data.length > 0) {
          // Format date for chart
          const formatted = res.data.reverse().map(d => ({
            ...d,
            date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            prepared: d.preparedKg,
            consumed: d.consumedKg,
            wasted: d.wastedKg,
            pct: d.wastePercentage
          }))
          setLog(formatted)
        } else {
          setLog(HISTORY.slice(0, 6)) // Fallback if no data
        }
      } catch (error) {
        console.error("Failed to fetch waste logs", error)
        setLog(HISTORY.slice(0, 6))
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [user])

  const autoCalc = (val) => {
    if (form.prepared && val) {
      setForm(f => ({ ...f, consumed: val, wasted: Math.max(0, parseFloat(f.prepared) - parseFloat(val) || 0).toFixed(1) }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/waste', {
        date: new Date().toISOString().split('T')[0],
        meal: form.meal,
        preparedKg: parseFloat(form.prepared),
        consumedKg: parseFloat(form.consumed)
      })
      
      const newEntry = {
        date: new Date(res.data.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        prepared: res.data.preparedKg,
        consumed: res.data.consumedKg,
        wasted: res.data.wastedKg,
        pct: res.data.wastePercentage
      }
      setLog(prev => [...prev, newEntry])
      setForm({ meal: 'lunch', prepared: '', consumed: '', wasted: '' })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Failed to save waste log", error)
      alert("Failed to save waste log")
    }
  }

  const avgWaste = Math.round(log.reduce((a, d) => a + d.pct, 0) / log.length * 10) / 10
  const totalWasted = log.reduce((a, d) => a + d.wasted, 0)

  return (
    <div>
      <div className="page-header">
        <div><h1>Food Waste Log</h1><p>Record daily food preparation and consumption data</p></div>
        <span className="badge badge-rose"><AlertTriangle size={12}/> Avg Waste: {avgWaste}%</span>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
        {/* Log Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>Add Today's Entry</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Meal</label>
                <select id="waste-meal" className="form-select" value={form.meal} onChange={e => setForm({ ...form, meal: e.target.value })}>
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Food Prepared (kg)</label>
                <input id="waste-prepared" type="number" step="0.1" className="form-input" placeholder="e.g. 180" value={form.prepared}
                  onChange={e => setForm({ ...form, prepared: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Food Consumed (kg)</label>
                <input id="waste-consumed" type="number" step="0.1" className="form-input" placeholder="e.g. 168" value={form.consumed}
                  onChange={e => { setForm({ ...form, consumed: e.target.value, wasted: Math.max(0, parseFloat(form.prepared || 0) - parseFloat(e.target.value || 0)).toFixed(1) }) }} required />
              </div>
              <div className="form-group">
                <label className="form-label">Food Wasted (kg) <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>auto-calculated</span></label>
                <input id="waste-wasted" type="number" step="0.1" className="form-input" placeholder="Auto" value={form.wasted}
                  onChange={e => setForm({ ...form, wasted: e.target.value })} style={{ color: 'var(--accent-rose)' }} />
              </div>

              {form.prepared && form.consumed && (
                <div style={{ padding: '12px 16px', background: parseFloat(form.wasted) / parseFloat(form.prepared) > 0.1 ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', border: `1px solid ${parseFloat(form.wasted) / parseFloat(form.prepared) > 0.1 ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: parseFloat(form.wasted) / parseFloat(form.prepared) > 0.1 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    Waste Rate: {(parseFloat(form.wasted || 0) / parseFloat(form.prepared || 1) * 100).toFixed(1)}%
                    {parseFloat(form.wasted) / parseFloat(form.prepared) > 0.1 ? ' ⚠️ High' : ' ✓ Good'}
                  </div>
                </div>
              )}

              <button id="save-waste" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {saved ? '✓ Saved!' : <><Save size={15}/> Log Entry</>}
              </button>
            </form>
          </div>

          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-rose)', fontFamily: 'Space Grotesk' }}>{totalWasted} kg</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>Total Wasted (week)</div>
            </div>
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'Space Grotesk' }}>{avgWaste}%</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>Avg Waste Rate</div>
            </div>
          </div>
        </div>

        {/* Chart + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="chart-wrapper">
            <div className="chart-header">
              <h3 className="chart-title">Waste Trend — Last 6 Days</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={log} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="prepared" name="Prepared" stroke="var(--accent-teal)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent-teal)' }} />
                <Line type="monotone" dataKey="consumed" name="Consumed" stroke="var(--accent-emerald)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent-emerald)' }} />
                <Line type="monotone" dataKey="wasted" name="Wasted" stroke="var(--accent-rose)" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3, fill: 'var(--accent-rose)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="table-container">
            <table>
              <thead><tr><th>Date</th><th>Prepared</th><th>Consumed</th><th>Wasted</th><th>Waste %</th></tr></thead>
              <tbody>
                {log.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{row.date}</td>
                    <td>{row.prepared} kg</td>
                    <td>{row.consumed} kg</td>
                    <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{row.wasted} kg</td>
                    <td>
                      <span className={`badge ${row.pct > 10 ? 'badge-rose' : row.pct > 5 ? 'badge-amber' : 'badge-emerald'}`}>
                        {row.pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
