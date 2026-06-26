import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Copy, Save, X, Check } from 'lucide-react'
import { useAuth } from '../../App'
import api from '../../api'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['breakfast', 'lunch', 'dinner']
const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' }
const MEAL_COLORS = { breakfast: 'var(--accent-amber)', lunch: 'var(--accent-teal)', dinner: 'var(--accent-purple)' }

const DEFAULT_MENU = {
  Monday: { breakfast: 'Idli, Sambhar, Tea', lunch: 'Rice, Dal, Aloo Gobi, Roti', dinner: 'Roti, Paneer Masala, Dal, Rice' },
  Tuesday: { breakfast: 'Poha, Boiled Eggs, Coffee', lunch: 'Rice, Chana, Bhindi, Roti', dinner: 'Roti, Matar Mushroom, Dal, Rice' },
  Wednesday: { breakfast: 'Upma, Bread, Tea', lunch: 'Rice, Rajma, Aloo, Roti', dinner: 'Roti, Kadai Paneer, Dal, Rice' },
  Thursday: { breakfast: 'Paratha, Curd, Tea', lunch: 'Rice, Dal, Arbi, Roti', dinner: 'Roti, Shahi Paneer, Biryani' },
  Friday: { breakfast: 'Dosa, Sambhar, Coffee', lunch: 'Rice, Dal, Mix Veg, Roti', dinner: 'Roti, Aloo Palak, Dal, Rice' },
  Saturday: { breakfast: 'Puri Bhaji, Tea', lunch: 'Veg Biryani, Raita, Roti', dinner: 'Roti, Paneer Tikka, Dal, Fried Rice' },
  Sunday: { breakfast: 'Chole Bhature, Tea', lunch: 'Rice, Chicken/Paneer, Dal, Roti', dinner: 'Roti, Mix Veg, Dal, Rice' },
}

export default function MenuManagement() {
  const { user } = useAuth()
  const [menu, setMenu] = useState(DEFAULT_MENU)
  const [editing, setEditing] = useState(null) // { day, meal }
  const [editValue, setEditValue] = useState('')
  const [saved, setSaved] = useState({})
  const [selectedDay, setSelectedDay] = useState('Monday')

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`/menu/${user?.hostel || 'Limbdi Hostel'}`)
        if (res.data && res.data.length > 0) {
          const menuObj = { ...DEFAULT_MENU }
          res.data.forEach(m => {
            const dayName = DAYS.find(d => d.startsWith(m.day))
            if (dayName) {
              menuObj[dayName] = {
                breakfast: m.breakfast.items.join(', '),
                lunch: m.lunch.items.join(', '),
                dinner: m.dinner.items.join(', ')
              }
            }
          })
          setMenu(menuObj)
        }
      } catch (err) {
        console.error("Failed to fetch menu", err)
      }
    }
    fetchMenu()
  }, [user])

  const startEdit = (day, meal) => {
    setEditing({ day, meal })
    setEditValue(menu[day][meal])
  }

  const saveEdit = async () => {
    if (!editing) return
    
    // Optimistic UI update
    setMenu(m => ({ ...m, [editing.day]: { ...m[editing.day], [editing.meal]: editValue } }))
    
    // Save to DB
    try {
      const shortDay = editing.day.substring(0, 3)
      const dayData = {
        hostel: user?.hostel || 'Limbdi Hostel',
        breakfast: { items: editing.meal === 'breakfast' ? editValue.split(', ') : menu[editing.day].breakfast.split(', '), special: null },
        lunch: { items: editing.meal === 'lunch' ? editValue.split(', ') : menu[editing.day].lunch.split(', '), special: null },
        dinner: { items: editing.meal === 'dinner' ? editValue.split(', ') : menu[editing.day].dinner.split(', '), special: null },
      }
      await api.put(`/menu/${user?.hostel || 'Limbdi Hostel'}/${shortDay}`, dayData)
      
      setSaved(s => ({ ...s, [`${editing.day}-${editing.meal}`]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [`${editing.day}-${editing.meal}`]: false })), 2000)
    } catch (err) {
      console.error("Failed to update menu", err)
      alert("Failed to save menu changes")
    }
    setEditing(null)
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Menu Management</h1><p>Create and edit the weekly meal plan</p></div>
        <button className="btn btn-primary"><Plus size={15}/> Add Special Item</button>
      </div>

      {/* Day selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {DAYS.map(day => (
          <button key={day} id={`menu-day-${day}`} onClick={() => setSelectedDay(day)}
            className={`btn ${selectedDay === day ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Meal cards for selected day */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {MEALS.map(meal => {
          const key = `${selectedDay}-${meal}`
          const isEditing = editing?.day === selectedDay && editing?.meal === meal
          return (
            <div key={meal} className="card" style={{ borderTop: `3px solid ${MEAL_COLORS[meal]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem' }}>{MEAL_EMOJI[meal]}</span>
                  <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, textTransform: 'capitalize', fontSize: '0.95rem' }}>{meal}</h3>
                </div>
                {saved[key] ? (
                  <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={13}/> Saved</span>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => startEdit(selectedDay, meal)} style={{ padding: '4px 10px' }}><Edit2 size={13}/></button>
                )}
              </div>

              {isEditing ? (
                <div>
                  <textarea
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    style={{ width: '100%', minHeight: 100, background: 'var(--bg-input)', border: '1px solid var(--accent-teal)', borderRadius: 8, padding: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical', outline: 'none' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit} style={{ flex: 1, justifyContent: 'center' }}><Save size={13}/> Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)} style={{ padding: '6px 10px' }}><X size={13}/></button>
                  </div>
                </div>
              ) : (
                <div>
                  {menu[selectedDay][meal].split(', ').map((item, i) => (
                    <div key={i} className="meal-item">
                      <div className="meal-item-dot" style={{ background: MEAL_COLORS[meal] }} />
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Full week grid */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Full Week Overview</h3>
          <button className="btn btn-secondary btn-sm"><Copy size={13}/> Copy Last Week</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>🌅 Breakfast</th>
                <th>☀️ Lunch</th>
                <th>🌙 Dinner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td style={{ fontWeight: 700, color: day === selectedDay ? 'var(--accent-teal)' : 'var(--text-primary)' }}>{day}</td>
                  {MEALS.map(meal => (
                    <td key={meal} style={{ maxWidth: 180 }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {menu[day][meal]}
                      </div>
                    </td>
                  ))}
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDay(day)} style={{ padding: '4px 10px' }}>
                      <Edit2 size={12}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
