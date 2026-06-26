import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useAuth } from '../../App'
import api from '../../api'

const FULL_MENU = {
  Mon: {
    breakfast: { items: ['Idli Sambhar', 'Coconut Chutney', 'Boiled Eggs', 'Tea / Coffee', 'Banana'], special: null },
    lunch: { items: ['Rice', 'Dal Tadka', 'Aloo Gobi', 'Chapati x4', 'Salad', 'Buttermilk'], special: null },
    dinner: { items: ['Roti x4', 'Paneer Butter Masala', 'Dal Fry', 'Jeera Rice', 'Raita', 'Ice Cream 🎉'], special: 'Ice Cream' },
  },
  Tue: {
    breakfast: { items: ['Poha', 'Bread & Butter', 'Boiled Eggs', 'Tea / Coffee', 'Apple'], special: null },
    lunch: { items: ['Rice', 'Chana Dal', 'Bhindi Fry', 'Chapati x4', 'Pickle', 'Curd'], special: null },
    dinner: { items: ['Roti x4', 'Matar Mushroom', 'Dal Makhani', 'Fried Rice', 'Papad', 'Halwa 🎉'], special: 'Halwa' },
  },
  Wed: {
    breakfast: { items: ['Upma', 'Boiled Eggs', 'Bread & Jam', 'Tea / Coffee', 'Orange'], special: null },
    lunch: { items: ['Rice', 'Rajma', 'Jeera Aloo', 'Chapati x4', 'Salad', 'Chaas'], special: 'Rajma Special' },
    dinner: { items: ['Roti x4', 'Kadai Paneer', 'Dal Tadka', 'Plain Rice', 'Raita', 'Kheer 🎉'], special: 'Kheer' },
  },
  Thu: {
    breakfast: { items: ['Paratha', 'Pickle', 'Curd', 'Tea / Coffee', 'Banana'], special: 'Paratha Day' },
    lunch: { items: ['Rice', 'Dal', 'Arbi Fry', 'Chapati x4', 'Salad', 'Buttermilk'], special: null },
    dinner: { items: ['Roti x4', 'Shahi Paneer', 'Dal Fry', 'Biryani Rice', 'Raita', 'Gulab Jamun 🎉'], special: 'Biryani' },
  },
  Fri: {
    breakfast: { items: ['Dosa & Chutney', 'Sambhar', 'Boiled Eggs', 'Tea / Coffee', 'Mango'], special: 'South Special' },
    lunch: { items: ['Rice', 'Dal', 'Mix Veg', 'Chapati x4', 'Papad', 'Curd'], special: null },
    dinner: { items: ['Roti x4', 'Aloo Palak', 'Dal Tadka', 'Plain Rice', 'Raita', 'Fruit Cream 🎉'], special: 'Fruit Cream' },
  },
  Sat: {
    breakfast: { items: ['Puri Bhaji', 'Tea / Coffee', 'Banana', 'Boiled Eggs'], special: 'Puri Special' },
    lunch: { items: ['Veg Biryani', 'Raita', 'Soya Curry', 'Chapati x4', 'Salad', 'Papad'], special: 'Biryani Sunday' },
    dinner: { items: ['Roti x4', 'Paneer Tikka Masala', 'Dal Makhani', 'Fried Rice', 'Raita', 'Rasmalai 🎉'], special: 'Special Dinner' },
  },
  Sun: {
    breakfast: { items: ['Chole Bhature', 'Tea / Coffee', 'Banana'], special: 'Sunday Special' },
    lunch: { items: ['Rice', 'Chicken Curry', 'Dal', 'Chapati x4', 'Salad', 'Sweet Lassi'], special: 'Non-Veg' },
    dinner: { items: ['Roti x4', 'Mix Veg', 'Dal Fry', 'Jeera Rice', 'Raita', 'Payasam 🎉'], special: null },
  },
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_COLORS = { breakfast: 'var(--accent-amber)', lunch: 'var(--accent-teal)', dinner: 'var(--accent-purple)' }
const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' }

export default function StudentMenu() {
  const { user } = useAuth()
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const [selectedDay, setSelectedDay] = useState(todayIdx)
  const [activeMeal, setActiveMeal] = useState('lunch')
  const [ratings, setRatings] = useState({})
  const [menus, setMenus] = useState(FULL_MENU)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`/menu/${user?.hostel || 'Limbdi Hostel'}`)
        if (res.data && res.data.length > 0) {
          // Transform array to object keyed by day
          const menuObj = {}
          res.data.forEach(m => { menuObj[m.day] = m })
          setMenus({ ...FULL_MENU, ...menuObj }) // Merge with fallback
        }
      } catch (error) {
        console.error("Failed to fetch menu", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [user])

  const dayKey = DAYS[selectedDay]
  const mealData = menus[dayKey]?.[activeMeal]

  const handleRate = (item, val) => {
    setRatings(r => ({ ...r, [`${dayKey}-${activeMeal}-${item}`]: val }))
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mess Menu</h1>
          <p>Weekly meal plan for your hostel</p>
        </div>
        <span className="badge badge-teal">🍽️ Limbdi Hostel</span>
      </div>

      {/* Day Selector */}
      <div className="card mb-24">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary btn-icon" onClick={() => setSelectedDay(d => Math.max(0, d - 1))}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {DAYS.map((day, i) => (
              <button key={day} id={`day-btn-${day}`}
                onClick={() => setSelectedDay(i)}
                style={{
                  padding: '10px 4px',
                  borderRadius: 'var(--radius-md)',
                  border: i === selectedDay ? '2px solid var(--accent-teal)' : '2px solid transparent',
                  background: i === selectedDay ? 'rgba(20,184,166,0.12)' : 'var(--bg-glass)',
                  color: i === selectedDay ? 'var(--accent-teal-light)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}>
                <span>{day}</span>
                {i === todayIdx && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-teal)' }} />}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary btn-icon" onClick={() => setSelectedDay(d => Math.min(6, d + 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Meal Type Tabs */}
      <div className="tabs mb-24" style={{ maxWidth: 360 }}>
        {['breakfast', 'lunch', 'dinner'].map(m => (
          <button key={m} id={`menu-tab-${m}`} className={`tab-btn ${activeMeal === m ? 'active' : ''}`}
            onClick={() => setActiveMeal(m)}
            style={activeMeal === m ? { background: `linear-gradient(135deg, ${MEAL_COLORS[m]}, ${MEAL_COLORS[m]}cc)` } : {}}>
            {MEAL_EMOJI[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {/* Menu Items */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div className={`meal-icon meal-icon-${activeMeal}`} style={{ fontSize: '1.5rem' }}>
              {MEAL_EMOJI[activeMeal]}
            </div>
            <div>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize' }}>
                {activeMeal} — {dayKey}
              </h3>
              {mealData?.special && (
                <span className="badge badge-amber" style={{ marginTop: 4, display: 'inline-flex' }}>
                  ⭐ Special: {mealData.special}
                </span>
              )}
            </div>
          </div>

          {mealData?.items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0', borderBottom: i < mealData.items.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: MEAL_COLORS[activeMeal], flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem' }}>{item}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleRate(item, 'up')} style={{
                  background: ratings[`${dayKey}-${activeMeal}-${item}`] === 'up' ? 'rgba(16,185,129,0.15)' : 'var(--bg-glass)',
                  border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                  color: ratings[`${dayKey}-${activeMeal}-${item}`] === 'up' ? 'var(--accent-emerald)' : 'var(--text-muted)'
                }}>
                  <ThumbsUp size={13} />
                </button>
                <button onClick={() => handleRate(item, 'down')} style={{
                  background: ratings[`${dayKey}-${activeMeal}-${item}`] === 'down' ? 'rgba(244,63,94,0.15)' : 'var(--bg-glass)',
                  border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                  color: ratings[`${dayKey}-${activeMeal}-${item}`] === 'down' ? 'var(--accent-rose)' : 'var(--text-muted)'
                }}>
                  <ThumbsDown size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Full Week Overview */}
        <div className="card">
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16, fontSize: '1rem' }}>
            📅 Full Week at a Glance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DAYS.map((day, i) => {
              const d = FULL_MENU[day]
              const specials = [d.breakfast.special, d.lunch.special, d.dinner.special].filter(Boolean)
              return (
                <div key={day}
                  onClick={() => setSelectedDay(i)}
                  style={{
                    padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: selectedDay === i ? 'rgba(20,184,166,0.1)' : 'var(--bg-glass)',
                    border: selectedDay === i ? '1px solid rgba(20,184,166,0.3)' : '1px solid var(--border)',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: i === todayIdx ? 'var(--accent-teal)' : 'var(--text-primary)', minWidth: 32 }}>
                        {day} {i === todayIdx && '(Today)'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {specials.map(s => (
                        <span key={s} className="badge badge-amber" style={{ fontSize: '0.65rem' }}>⭐ {s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {['breakfast', 'lunch', 'dinner'].map(m => (
                      <span key={m} style={{ fontSize: '0.7rem', color: MEAL_COLORS[m], background: `${MEAL_COLORS[m]}15`, padding: '2px 7px', borderRadius: 4 }}>
                        {MEAL_EMOJI[m]} {FULL_MENU[day][m].items[0]}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
