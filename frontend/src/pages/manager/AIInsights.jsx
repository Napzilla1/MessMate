import { useState } from 'react'
import { Sparkles, Send, TrendingDown, TrendingUp, AlertTriangle, Lightbulb, Brain } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../api'

const forecastData = [
  { day: 'Mon', actual: 482, forecast: 478 },
  { day: 'Tue', actual: 510, forecast: 505 },
  { day: 'Wed', actual: 467, forecast: 480 },
  { day: 'Thu', actual: 498, forecast: 502 },
  { day: 'Fri', actual: 455, forecast: 460 },
  { day: 'Sat', actual: 530, forecast: 525 },
  { day: 'Sun (tomorrow)', actual: null, forecast: 545 },
]

const INITIAL_MESSAGES = [
  { role: 'ai', text: 'Hello! I\'m your AI Mess Assistant 🤖 I can help you analyze attendance patterns, predict food waste, and optimize meal preparation based on your live database! Try asking "What is the forecast for tomorrow?" or "Show me recent waste analysis".' },
]

export default function AIInsights() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(m => [...m, userMsg])
    const prompt = input
    setInput('')
    setLoading(true)
    
    try {
      const res = await api.post('/ai/chat', { message: prompt })
      setMessages(m => [...m, { role: 'ai', text: res.data.text }])
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: 'Sorry, I am having trouble connecting to the database right now.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  const quickQuestions = ['How much waste on Mondays?', 'Forecast for tomorrow?', 'Rice recommendation?', 'Which hostel has most no-shows?']

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map(p => <div key={p.dataKey} style={{ color: p.color }}>{p.name}: <b>{p.value ?? 'Forecast'}</b></div>)}
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>AI Insights</h1><p>Smart forecasting, recommendations, and analytics</p></div>
        <span className="badge badge-purple"><Brain size={12}/> Powered by AI</span>
      </div>

      {/* Insight Cards */}
      <div className="grid-3 mb-24">
        {[
          { icon: <TrendingDown size={20} style={{ color: 'var(--accent-rose)' }} />, title: 'Monday Lunch Wastage', value: '38% higher', desc: 'Reduce prep by 15kg next Monday', color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.08)' },
          { icon: <TrendingUp size={20} style={{ color: 'var(--accent-teal)' }} />, title: 'Tomorrow\'s Forecast', value: '545 students', desc: 'For Sunday lunch (high confidence)', color: 'var(--accent-teal)', bg: 'rgba(20,184,166,0.08)' },
          { icon: <AlertTriangle size={20} style={{ color: 'var(--accent-amber)' }} />, title: 'Exam Week Alert', value: 'Jun 28-Jul 4', desc: 'Expect 22% lower attendance', color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.08)' },
        ].map((c, i) => (
          <div key={i} className="card" style={{ background: c.bg, border: `1px solid ${c.color}25` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>{c.title}</div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: c.color, fontSize: '1rem' }}>{c.value}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-24">
        {/* AI Chat */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.9rem' }}>Mess AI Assistant</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>● Online</div>
            </div>
          </div>

          <div className="ai-chat-messages" style={{ padding: '16px', height: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role === 'user' ? 'user-message' : ''}`} style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Sparkles size={13} style={{ color: '#fff' }} />
                  </div>
                )}
                <div className={msg.role === 'user' ? 'user-bubble' : 'ai-bubble'} style={{ maxWidth: '80%', lineHeight: 1.5, fontSize: '0.85rem' }}>{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={13} style={{ color: '#fff' }} /></div>
                <div className="ai-bubble"><span style={{ display: 'flex', gap: 4 }}>{[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-teal)', animation: `bounce 1s ${i * 0.2}s infinite` }} />)}</span></div>
              </div>
            )}
          </div>

          {/* Quick questions */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {quickQuestions.map(q => (
              <button key={q} onClick={() => { setInput(q); setTimeout(() => sendMessage(), 0) }}
                style={{ padding: '5px 10px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-secondary)', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {q}
              </button>
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input id="ai-chat-input" className="form-input" placeholder="Ask about waste, forecast, recommendations..." value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={handleKey} style={{ flex: 1 }} />
            <button id="ai-send" className="btn btn-primary btn-icon" onClick={sendMessage} disabled={!input.trim() || loading}>
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Forecast Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="chart-wrapper">
            <div className="chart-header">
              <h3 className="chart-title">Attendance Forecast vs Actual</h3>
              <span className="badge badge-purple">AI Predicted</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={forecastData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-teal)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-teal)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[400, 600]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="actual" name="Actual" stroke="var(--accent-teal)" fill="url(#colorActual)" strokeWidth={2} connectNulls={false} />
                <Area type="monotone" dataKey="forecast" name="Forecast" stroke="var(--accent-purple)" fill="url(#colorForecast)" strokeWidth={2} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Food Recommendations */}
          <div className="card">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
              <Lightbulb size={18} style={{ color: 'var(--accent-amber)' }} />
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Tomorrow's Prep Recommendation</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { item: '🍚 Rice', qty: '165 kg', note: '-12% vs avg' },
                { item: '🫘 Dal', qty: '75 kg', note: 'Normal' },
                { item: '🌾 Roti', qty: '3,800 pcs', note: '+5% (Sunday)' },
                { item: '🥗 Sabzi', qty: '90 kg', note: 'Normal' },
              ].map((r, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-glass)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.item}</div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--accent-teal)', fontSize: '1rem' }}>{r.qty}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`}</style>
    </div>
  )
}
