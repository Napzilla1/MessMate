import { useState } from 'react'
import { useAuth } from '../../App'
import { TrendingUp, TrendingDown, Users, Utensils, CheckCircle2, Clock, Bell, ChevronRight, Star } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const weeklyData = [
  { day: 'Mon', breakfast: 120, lunch: 95, dinner: 145 },
  { day: 'Tue', breakfast: 134, lunch: 102, dinner: 138 },
  { day: 'Wed', breakfast: 110, lunch: 88, dinner: 152 },
  { day: 'Thu', breakfast: 125, lunch: 110, dinner: 142 },
  { day: 'Fri', breakfast: 98, lunch: 75, dinner: 160 },
  { day: 'Sat', breakfast: 85, lunch: 130, dinner: 148 },
  { day: 'Sun', breakfast: 70, lunch: 140, dinner: 155 },
]

const todayMenu = {
  breakfast: ['Poha', 'Boiled Eggs', 'Bread & Butter', 'Tea / Coffee', 'Banana'],
  lunch: ['Rice', 'Dal Tadka', 'Aloo Gobi', 'Chapati', 'Salad', 'Buttermilk'],
  dinner: ['Roti', 'Paneer Butter Masala', 'Dal Fry', 'Jeera Rice', 'Raita', 'Gulab Jamun 🎉'],
}

const mealColors = { breakfast: 'var(--accent-amber)', lunch: 'var(--accent-teal)', dinner: 'var(--accent-purple)' }
const mealEmoji = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' }

function getCurrentMeal() {
  const h = new Date().getHours()
  if (h >= 7 && h < 10) return 'breakfast'
  if (h >= 12 && h < 15) return 'lunch'
  if (h >= 19 && h < 22) return 'dinner'
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
  const [attendance, setAttendance] = useState({ breakfast: true, lunch: false, dinner: true })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const stats = [
    { label: 'Meals This Month', value: 64, change: '+4', up: true, icon: '🍽️', color: 'var(--accent-teal)' },
    { label: 'Attendance Rate', value: '87%', change: '+3%', up: true, icon: '📊', color: 'var(--accent-purple)' },
    { label: 'Meals Skipped', value: 9, change: '-2', up: false, icon: '⏭️', color: 'var(--accent-amber)' },
    { label: 'Streak 🔥', value: '5 days', change: 'active', up: true, icon: '🔥', color: 'var(--accent-rose)' },
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {user?.hostel} · Room {user?.room} · Today is {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-teal">✅ Dinner Declared</span>
          <span className="badge badge-amber">⏰ Lunch Cutoff: 11:30 AM</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {stats.map((s, i) => (
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
        ))}
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

          {/* Meal Tabs */}
          <div className="tabs mb-16">
            {['breakfast', 'lunch', 'dinner'].map(m => (
              <button key={m} id={`meal-tab-${m}`} className={`tab-btn ${activeTab === m ? 'active' : ''}`}
                onClick={() => setActiveTab(m)}
                style={activeTab === m ? { background: `linear-gradient(135deg, ${mealColors[m]}, ${mealColors[m]}cc)` } : {}}>
                {mealEmoji[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div>
            {todayMenu[activeTab].map((item, i) => (
              <div key={i} className="meal-item">
                <div className="meal-item-dot" style={{ background: mealColors[activeTab] }} />
                {item}
              </div>
            ))}
          </div>

          {/* Attendance toggle for active meal */}
          <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Coming for {activeTab}?
              </span>
              <label className="toggle">
                <input type="checkbox" checked={attendance[activeTab]}
                  onChange={e => setAttendance({ ...attendance, [activeTab]: e.target.checked })} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">My Attendance This Week</h3>
            <span className="badge badge-teal">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorBreakfast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-amber)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-amber)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLunch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-teal)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-teal)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDinner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="breakfast" name="Breakfast" stroke="var(--accent-amber)" fill="url(#colorBreakfast)" strokeWidth={2} />
              <Area type="monotone" dataKey="lunch" name="Lunch" stroke="var(--accent-teal)" fill="url(#colorLunch)" strokeWidth={2} />
              <Area type="monotone" dataKey="dinner" name="Dinner" stroke="var(--accent-purple)" fill="url(#colorDinner)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
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

      {/* Quick Attendance Declaration */}
      <div className="card mb-24">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600 }}>Today's Attendance</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 }}>Toggle your meals for today</p>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)' }}>⏰ Cutoff: 30 mins before each meal</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {['breakfast', 'lunch', 'dinner'].map(meal => (
            <div key={meal} className={`meal-toggle-card ${attendance[meal] ? 'active' : ''}`}
              onClick={() => setAttendance({ ...attendance, [meal]: !attendance[meal] })}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{mealEmoji[meal]}</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: 4 }}>{meal}</div>
              <div style={{ fontSize: '0.78rem', color: attendance[meal] ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                {attendance[meal] ? '✓ Coming' : 'Not going'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming meals notice */}
      <div className="card">
        <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
          🔔 Notifications
        </h3>
        {[
          { text: 'Special dinner tonight: Gulab Jamun added to menu!', time: '2 hrs ago', color: 'var(--accent-teal)' },
          { text: 'Reminder: Mark tomorrow\'s breakfast attendance', time: '5 hrs ago', color: 'var(--accent-amber)' },
          { text: 'Mess holiday on Sunday — no lunch service', time: 'Yesterday', color: 'var(--accent-rose)' },
        ].map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 3, borderRadius: 3, background: n.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 3 }}>{n.text}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
