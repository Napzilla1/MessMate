import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Copy, Save, X, Check, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
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
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');

  const generateAiMenu = async (prompt) => {
    setIsGenerating(true);
    try {
      const res = await api.post('/gemini/menu', { prompt });
      if (res.data && res.data.data) {
        setAiPreview(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate menu');
    } finally {
      setIsGenerating(false);
    }
  };

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
      {/* AI Prompt Input Modal */}
      {showAiPrompt && !isGenerating && !aiPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div className="card" style={{ width: '90%', maxWidth: 500, position: 'relative', border: '1px solid rgba(20,184,166,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', background: 'linear-gradient(135deg, var(--bg-card), rgba(20,184,166,0.05))' }}>
            <button onClick={() => setShowAiPrompt(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20}/></button>
            <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem', fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              <div style={{ padding: 8, background: 'rgba(20,184,166,0.1)', borderRadius: 10 }}><Sparkles size={20} color="var(--accent-teal)" /></div>
              Ask Gemini AI
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.5 }}>
              Describe the type of 7-day menu you want. Gemini will generate a nutritionally balanced plan for your review.
            </p>
            <textarea
              className="input-field"
              autoFocus
              rows={4}
              placeholder="e.g. Healthy North Indian with a special Friday dinner and light Sunday breakfast..."
              value={aiPromptText}
              onChange={e => setAiPromptText(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', resize: 'none', marginBottom: 20 }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowAiPrompt(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowAiPrompt(false); generateAiMenu(aiPromptText); }} disabled={!aiPromptText.trim()}>
                Generate Menu <Sparkles size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Preview Modal */}
      {aiPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: 900, maxHeight: '85vh', overflowY: 'auto', position: 'relative', border: '1px solid rgba(20,184,166,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: 'var(--bg-card)' }}>
            <div style={{ position: 'sticky', top: -24, background: 'var(--bg-card)', padding: '24px 0 16px', margin: '-24px 0 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.3rem', fontFamily: 'Space Grotesk', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <Sparkles size={22} color="var(--accent-teal)" /> AI Generated Menu
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>Review suggestions below. Copy items you like into your editor.</p>
              </div>
              <button onClick={() => setAiPreview(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}><X size={16}/> Close</button>
            </div>
            
            <div style={{ display: 'grid', gap: 16 }}>
              {aiPreview.map((dayData, i) => (
                <div key={i} style={{ padding: 20, background: 'linear-gradient(to right, rgba(20,184,166,0.05), transparent)', borderRadius: 12, border: '1px solid var(--border)', borderLeft: '4px solid var(--accent-teal)' }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: 16, fontSize: '1.1rem', fontWeight: 600 }}>{dayData.day}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>🌅 Breakfast</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{dayData.breakfast?.join(', ')}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>☀️ Lunch</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{dayData.lunch?.join(', ')}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>🌙 Dinner</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{dayData.dinner?.join(', ')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div><h1>Menu Management</h1><p>Create and edit the weekly meal plan</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => setShowAiPrompt(true)} disabled={isGenerating}>
            <Sparkles size={16}/> {isGenerating ? 'Generating Menu...' : 'Auto-Generate AI Menu'}
          </button>
        </div>
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
