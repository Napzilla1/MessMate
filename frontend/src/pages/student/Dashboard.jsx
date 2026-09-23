import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { TrendingUp, TrendingDown, Megaphone } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../api'

const mealColors = { breakfast: 'var(--accent-amber)', lunch: 'var(--accent-teal)', dinner: 'var(--accent-purple)' }
const mealEmoji = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' }

function getCurrentMeal() {
  const h = new Date().getHours()
  if (h >= 7 && h < 10) return 'breakfast'
  if (h >= 12 && h < 15) return 'lunch'
  return 'dinner'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, fontSize: '0.8rem' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ fontSize: '0.78rem', color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(getCurrentMeal())
  const [attendance, setAttendance] = useState({ breakfast: false, lunch: false, dinner: false })
  const [todayMenu, setTodayMenu] = useState({ breakfast: [], lunch: [], dinner: [] })
  const [weeklyData, setWeeklyData] = useState([])
  const [stats, setStats] = useState({ total: 0, rate: 0, skipped: 0, streak: 0 })
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch today's attendance
        const attRes = await api.get('/attendance/me')
        const today = new Date().toISOString().split('T')[0]
        const todayAtt = attRes.data.find(a => a.date?.startsWith(today))
        if (todayAtt) {
          setAttendance({
            breakfast: todayAtt.breakfast?.declared || false,
            lunch: todayAtt.lunch?.declared || false,
            dinner: todayAtt.dinner?.declared || false,
          })
        }

        // Build weekly chart data from last 7 records
        const sorted = [...attRes.data].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7)
        const chartData = sorted.map(a => {
          const d = new Date(a.date)
          return {
            day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
            breakfast: a.breakfast?.checkedIn ? 1 : 0,
            lunch: a.lunch?.checkedIn ? 1 : 0,
            dinner: a.dinner?.checkedIn ? 1 : 0,
          }
        })
        setWeeklyData(chartData)

        // Compute stats
        const totalCheckedIn = attRes.data.reduce((acc, a) =>
          acc + (a.breakfast?.checkedIn ? 1 : 0) + (a.lunch?.checkedIn ? 1 : 0) + (a.dinner?.checkedIn ? 1 : 0), 0)
        const possible = attRes.data.length * 3
        const rate = possible > 0 ? Math.round((totalCheckedIn / possible) * 100) : 0
        
        // Streak: count consecutive days with at least 1 check-in
        let streak = 0
        const byDay = [...attRes.data].sort((a,b) => new Date(b.date)-new Date(a.date))
        for (const a of byDay) {
          const hasAny = a.breakfast?.checkedIn || a.lunch?.checkedIn || a.dinner?.checkedIn
          if (hasAny) streak++
          else break
        }
        setStats({ total: totalCheckedIn, rate, skipped: possible - totalCheckedIn, streak })
      } catch (err) {
        console.error('Failed to fetch student dashboard data', err)
      }

      // Fetch today's menu
      try {
        const menuRes = await api.get('/menu/' + (user?.hostel || 'Limbdi Hostel'))
        if (menuRes.data && menuRes.data.length > 0) {
          const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' })
          const dayMenu = menuRes.data.find(m => m.day === currentDay) || {}
          setTodayMenu({
            breakfast: dayMenu.breakfast?.items || [],
            lunch: dayMenu.lunch?.items || [],
            dinner: dayMenu.dinner?.items || [],
          })
        }
      } catch (err) {
        console.error('Failed to fetch menu', err)
      }

      // Fetch announcements
      try {
        const annRes = await api.get('/announcements/' + encodeURIComponent(user?.hostel || 'Limbdi Hostel'))
        setAnnouncements(annRes.data)
      } catch (err) {
        console.error('Failed to fetch announcements', err)
      }

      setLoading(false)
    }
    fetchAll()
  }, [])

  const toggleMeal = async (meal) => {
    const newVal = !attendance[meal]
    setAttendance(prev => ({ ...prev, [meal]: newVal }))
    try {
      const today = new Date().toISOString().split('T')[0]
      await api.post('/attendance/declare', { date: today, meal, status: newVal })
    } catch (err) {
      console.error('Failed to save attendance', err)
      setAttendance(prev => ({ ...prev, [meal]: !newVal }))
    }
  }

  const statCards = [
    { label: 'Meals Attended', value: stats.total, icon: '🍽️', color: 'var(--accent-teal)', change: `of ${stats.total + stats.skipped}`, up: true },
    { label: 'Attendance Rate', value: `${stats.rate}%`, icon: '📊', color: 'var(--accent-purple)', change: stats.rate >= 70 ? 'Good' : 'Low', up: stats.rate >= 70 },
    { label: 'Meals Skipped', value: stats.skipped, icon: '⏭️', color: 'var(--accent-amber)', change: stats.skipped === 0 ? 'None!' : 'total', up: false },
    { label: 'Streak 🔥', value: `${stats.streak} days`, icon: '🔥', color: 'var(--accent-rose)', change: 'active', up: true },
  ]

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(139,92,246,0.08) 100%)',
        border: '1px solid rgba(20,184,166,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {user?.hostel} · Room {user?.room} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {attendance.breakfast && <span className="badge badge-amber">🌅 Breakfast Declared</span>}
          {attendance.lunch && <span className="badge badge-teal">☀️ Lunch Declared</span>}
          {attendance.dinner && <span className="badge badge-purple">🌙 Dinner Declared</span>}
          {!attendance.breakfast && !attendance.lunch && !attendance.dinner && (
            <span className="badge badge-rose">⚠️ No meals declared today</span>
          )}
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid-4 mb-24">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="stat-card" style={{ opacity: 0.5 }}>
              <div style={{ height: 60, background: 'var(--bg-glass)', borderRadius: 8 }} />
            </div>
          ))
        ) : (
          statCards.map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                <span className={`badge ${s.up ? 'badge-emerald' : 'badge-rose'}`}>
                  {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {s.change}
                </span>
              </div>
              <div className="stat-value" style={{ color: s.color, marginTop: 12 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))
        )}
      </div>

      <div className="grid-2 mb-24" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
        {/* Today's Menu */}
        <div className="card">
          <div className="chart-header">
            <div>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600 }}>Today's Menu</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 }}>
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="tabs mb-16">
            {['breakfast', 'lunch', 'dinner'].map(m => (
              <button key={m} id={`meal-tab-${m}`} className={`tab-btn ${activeTab === m ? 'active' : ''}`}
                onClick={() => setActiveTab(m)}
                style={activeTab === m ? { background: `linear-gradient(135deg, ${mealColors[m]}, ${mealColors[m]}cc)` } : {}}>
                {mealEmoji[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div>
            {(todayMenu[activeTab] || []).map((item, i) => (
              <div key={i} className="meal-item">
                <div className="meal-item-dot" style={{ background: mealColors[activeTab] }} />
                {item}
              </div>
            ))}
            {(!todayMenu[activeTab] || todayMenu[activeTab].length === 0) && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
                Menu not yet published for today
              </div>
            )}
          </div>

          <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Coming for {activeTab}?
              </span>
              <label className="toggle">
                <input type="checkbox" checked={attendance[activeTab]}
                  onChange={() => toggleMeal(activeTab)} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Weekly Chart — real data */}
        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">My Check-ins This Week</h3>
            <span className="badge badge-teal">Live</span>
          </div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-amber)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-amber)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-teal)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-teal)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0,1]} ticks={[0,1]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="breakfast" name="Breakfast" stroke="var(--accent-amber)" fill="url(#colorB)" strokeWidth={2} />
                <Area type="monotone" dataKey="lunch" name="Lunch" stroke="var(--accent-teal)" fill="url(#colorL)" strokeWidth={2} />
                <Area type="monotone" dataKey="dinner" name="Dinner" stroke="var(--accent-purple)" fill="url(#colorD)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {loading ? 'Loading your attendance...' : 'No attendance records yet. Start declaring your meals!'}
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            {[['Breakfast', 'var(--accent-amber)'], ['Lunch', 'var(--accent-teal)'], ['Dinner', 'var(--accent-purple)']].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 3, borderRadius: 2, background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Attendance Declaration */}
      <div className="card mb-24">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600 }}>Today's Attendance</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 }}>Click to declare — saved instantly to database</p>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)' }}>⏰ Cutoff: 30 mins before each meal</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {['breakfast', 'lunch', 'dinner'].map(meal => (
            <div key={meal} className={`meal-toggle-card ${attendance[meal] ? 'active' : ''}`}
              onClick={() => toggleMeal(meal)}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{mealEmoji[meal]}</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: 4 }}>{meal}</div>
              <div style={{ fontSize: '0.78rem', color: attendance[meal] ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                {attendance[meal] ? '✓ Declared' : 'Not going'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="mb-24">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 4px' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(20,184,166,0.15)', padding: 6, borderRadius: 8 }}>
              <Megaphone size={18} color="var(--accent-teal)" />
            </div>
            Hostel Noticeboard
          </h3>
          {announcements.length > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{announcements.length} Active Notices</span>
          )}
        </div>
        
        {announcements.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            No new announcements from your manager.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {announcements.map((a, i) => (
              <div key={a._id} style={{ 
                padding: '20px', 
                background: 'linear-gradient(to bottom right, var(--bg-card), rgba(20,184,166,0.03))', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border)',
                borderTop: '3px solid ' + (i === 0 ? 'var(--accent-teal)' : 'var(--border)'),
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h4 style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', paddingRight: 10 }}>
                    {a.title}
                  </h4>
                  {i === 0 && (
                    <span style={{ background: 'rgba(20,184,166,0.15)', color: 'var(--accent-teal)', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase' }}>
                      New
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', marginBottom: 16, lineHeight: 1.5 }}>
                  {a.message}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-amber)' }} />
                  {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
