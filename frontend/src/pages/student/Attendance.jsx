import { useState, useEffect } from 'react'
import { Check, X, Clock, Save } from 'lucide-react'
import api from '../../api'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' }
const MEAL_COLORS = { breakfast: 'var(--accent-amber)', lunch: 'var(--accent-teal)', dinner: 'var(--accent-purple)' }
const CUTOFFS = { breakfast: '7:30 AM', lunch: '11:30 AM', dinner: '6:30 PM' }

function getNextDays() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      full: d,
      isToday: i === 0,
    })
  }
  return days
}

export default function Attendance() {
  const days = getNextDays()
  const [selectedDay, setSelectedDay] = useState(0)
  const [attendance, setAttendance] = useState(() => {
    const init = {}
    days.forEach((d, i) => { init[i] = { breakfast: false, lunch: false, dinner: false } })
    return init
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/me')
        const records = res.data || []
        
        setAttendance(prev => {
          const next = { ...prev }
          days.forEach((d, i) => {
            const dateStr = d.full.toISOString().split('T')[0]
            const record = records.find(r => r.date?.startsWith(dateStr))
            if (record) {
              next[i] = {
                breakfast: record.breakfast?.declared || false,
                lunch: record.lunch?.declared || false,
                dinner: record.dinner?.declared || false,
              }
            }
          })
          return next
        })
      } catch (err) {
        console.error('Failed to fetch attendance', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggle = (dayIdx, meal) => {
    setAttendance(a => ({ ...a, [dayIdx]: { ...a[dayIdx], [meal]: !a[dayIdx][meal] } }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      const promises = []
      for (let i = 0; i < days.length; i++) {
        const d = days[i].full.toISOString().split('T')[0]
        const meals = ['breakfast', 'lunch', 'dinner']
        for (const meal of meals) {
          promises.push(api.post('/attendance/declare', {
            date: d,
            meal: meal,
            status: attendance[i][meal]
          }))
        }
      }
      await Promise.all(promises)
      setSaved(true)
      showToast('Attendance saved for all 7 days!')
      setTimeout(() => setSaved(false), 2500)
    } catch (error) {
      console.error("Failed to save attendance", error)
      showToast('Failed to save attendance', 'error')
    }
  }

  const countSelected = Object.values(attendance).reduce((acc, d) => acc + (d.breakfast ? 1 : 0) + (d.lunch ? 1 : 0) + (d.dinner ? 1 : 0), 0)

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          padding: '14px 20px', borderRadius: 12,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(20,184,166,0.95)',
          color: '#fff', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          animation: 'slideIn 0.3s ease',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Mark Attendance</h1>
          <p>Declare your meals for the next 7 days</p>
        </div>
        <button id="save-attendance" className="btn btn-primary" onClick={handleSave}>
          {saved ? <><Check size={16}/> Saved!</> : <><Save size={16}/> Save All</>}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading your schedule...</div>
      ) : (
        <>
          {/* Summary banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(139,92,246,0.08))',
            border: '1px solid rgba(20,184,166,0.2)', borderRadius: 'var(--radius-lg)',
            padding: '20px 24px', marginBottom: 24, display: 'flex', gap: 32, flexWrap: 'wrap'
          }}>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--accent-teal)' }}>{countSelected}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Meals Selected</div></div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--accent-purple)' }}>{21 - countSelected}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Meals Skipped</div></div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--accent-amber)' }}>7</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Days Covered</div></div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <span className="badge badge-amber"><Clock size={11}/> Cutoffs apply per meal</span>
            </div>
          </div>

          {/* Day selector tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            {days.map((d, i) => (
              <button key={i} id={`attn-day-${i}`} onClick={() => setSelectedDay(i)}
                style={{
                  padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                  background: selectedDay === i ? 'linear-gradient(135deg, var(--accent-teal), var(--accent-teal-dark))' : 'var(--bg-glass)',
                  color: selectedDay === i ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem', fontWeight: 600, flexShrink: 0,
                  boxShadow: selectedDay === i ? '0 4px 15px var(--accent-teal-glow)' : 'none',
                  transition: 'all 0.2s',
                }}>
                <div>{d.label}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{d.date}</div>
              </button>
            ))}
          </div>

          {/* Meal cards for selected day */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
            {['breakfast', 'lunch', 'dinner'].map(meal => {
              const isOn = attendance[selectedDay]?.[meal]
              return (
                <div key={meal} style={{
                  background: isOn ? `linear-gradient(135deg, ${MEAL_COLORS[meal]}15, ${MEAL_COLORS[meal]}08)` : 'var(--bg-glass)',
                  border: `2px solid ${isOn ? MEAL_COLORS[meal] : 'var(--border)'}`,
                  borderRadius: 'var(--radius-xl)', padding: '28px 20px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.3s',
                  boxShadow: isOn ? `0 0 25px ${MEAL_COLORS[meal]}30` : 'none',
                }} onClick={() => toggle(selectedDay, meal)}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{MEAL_EMOJI[meal]}</div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize', marginBottom: 6 }}>{meal}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>Cutoff: {CUTOFFS[meal]}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px',
                    borderRadius: 999, fontWeight: 600, fontSize: '0.85rem',
                    background: isOn ? MEAL_COLORS[meal] : 'rgba(255,255,255,0.05)',
                    color: isOn ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.3s',
                  }}>
                    {isOn ? <><Check size={14}/> Coming</> : <><X size={14}/> Not Going</>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Week overview grid */}
          <div className="card">
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>📅 Week Overview</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Day</th>
                    {['🌅 Breakfast', '☀️ Lunch', '🌙 Dinner'].map(m => (
                      <th key={m} style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((d, i) => (
                    <tr key={i} style={{ background: i === selectedDay ? 'rgba(20,184,166,0.05)' : 'transparent', cursor: 'pointer' }}
                      onClick={() => setSelectedDay(i)}>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, color: d.isToday ? 'var(--accent-teal)' : 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                        {d.label} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>{d.date}</span>
                      </td>
                      {['breakfast', 'lunch', 'dinner'].map(meal => (
                        <td key={meal} style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}
                          onClick={e => { e.stopPropagation(); toggle(i, meal) }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
                            background: attendance[i]?.[meal] ? `${MEAL_COLORS[meal]}20` : 'var(--bg-glass)',
                            border: `1px solid ${attendance[i]?.[meal] ? MEAL_COLORS[meal] : 'var(--border)'}`,
                            color: attendance[i]?.[meal] ? MEAL_COLORS[meal] : 'var(--text-muted)',
                            transition: 'all 0.2s',
                          }}>
                            {attendance[i]?.[meal] ? <Check size={13}/> : <X size={13}/>}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
