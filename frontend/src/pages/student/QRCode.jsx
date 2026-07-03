import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import { Download, RefreshCw, Shield, Smartphone } from 'lucide-react'

export default function StudentQR() {
  const { user } = useAuth()
  const [meal, setMeal] = useState('lunch')
  const [refreshed, setRefreshed] = useState(false)
  const [ticketToken, setTicketToken] = useState('')
  const qrRef = useRef(null)

  const MEAL_COLORS = { breakfast: '#f59e0b', lunch: '#14b8a6', dinner: '#8b5cf6' }
  const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' }

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/attendance/ticket?meal=${meal}`)
      setTicketToken(res.data.token)
    } catch (err) {
      console.error('Failed to get ticket', err)
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [meal])

  const handleRefresh = () => {
    setRefreshed(true)
    fetchTicket()
    setTimeout(() => setRefreshed(false), 1000)
  }

  const handleDownload = () => {
    const svg = document.querySelector('#qr-svg-wrapper svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `messmate-qr-${user?.id || 'student'}.svg`
    a.click()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My QR Code</h1>
          <p>Show this at the mess entrance to check in</p>
        </div>
        <span className="live-badge"><span className="live-dot" /> Valid</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* QR Display */}
        <div className="qr-container">
          {/* Meal selector */}
          <div className="tabs" style={{ width: '100%' }}>
            {['breakfast', 'lunch', 'dinner'].map(m => (
              <button key={m} id={`qr-meal-${m}`} className={`tab-btn ${meal === m ? 'active' : ''}`}
                onClick={() => setMeal(m)}
                style={meal === m ? { background: `linear-gradient(135deg, ${MEAL_COLORS[m]}, ${MEAL_COLORS[m]}cc)` } : {}}>
                {MEAL_EMOJI[m]}
              </button>
            ))}
          </div>

          {/* QR Code */}
          <div id="qr-svg-wrapper" className="qr-wrapper" style={{ border: `4px solid ${MEAL_COLORS[meal]}` }}>
            {ticketToken ? (
              <QRCodeSVG
                value={ticketToken}
                size={220}
                level="H"
                fgColor="#0a0e1a"
                bgColor="#ffffff"
                includeMargin={false}
              />
            ) : (
              <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
            )}
          </div>

          {/* Info */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{user?.name}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{user?.id} • {user?.hostel}</div>
            <div style={{ marginTop: 10 }}>
              <span className="badge" style={{ background: `${MEAL_COLORS[meal]}20`, color: MEAL_COLORS[meal], border: `1px solid ${MEAL_COLORS[meal]}40`, fontSize: '0.85rem', padding: '6px 16px' }}>
                {MEAL_EMOJI[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)} Pass
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button id="refresh-qr" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleRefresh}>
              <RefreshCw size={15} style={{ animation: refreshed ? 'spin 0.6s linear' : 'none' }} /> Refresh
            </button>
            <button id="download-qr" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleDownload}>
              <Download size={15} /> Download
            </button>
          </div>
        </div>

        {/* Instructions & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📱</div>
              <div>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 4 }}>How to use</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select your meal type above, then show this QR to the mess scanner at entry.</p>
              </div>
            </div>
            {[['Select Meal Type', 'Choose breakfast, lunch, or dinner above'], ['Show QR at Entry', 'Let the mess staff scan your QR code'], ['Get Checked In', 'Your attendance is recorded automatically'], ['One Scan Per Meal', 'Duplicate scans are blocked automatically']].map(([step, desc], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-teal)', flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{step}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <Shield size={18} style={{ color: 'var(--accent-teal)' }} />
              <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>QR Security</h4>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Your QR code is encrypted and unique to each session. It auto-expires after each meal. Never share screenshots of your QR.
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(20,184,166,0.06)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--accent-teal)' }}>
              ✓ Valid for today's {meal} only
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 12 }}>Today's Status</h4>
            {['breakfast', 'lunch', 'dinner'].map(m => (
              <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: m !== 'dinner' ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '0.85rem' }}>{MEAL_EMOJI[m]} {m.charAt(0).toUpperCase() + m.slice(1)}</span>
                <span className={`badge ${m === 'dinner' ? 'badge-teal' : m === 'breakfast' ? 'badge-emerald' : 'badge-purple'}`}>
                  {m === 'breakfast' ? '✓ Checked In' : m === 'lunch' ? '○ Declared' : '○ Declared'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
