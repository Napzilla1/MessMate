import { useState, useEffect } from 'react'
import { ScanLine, CheckCircle2, XCircle, User, Clock, AlertTriangle } from 'lucide-react'
import api from '../../api'
import { io } from 'socket.io-client'
import { useAuth } from '../../context/AuthContext'
import { Scanner } from '@yudiel/react-qr-scanner'

const SCANNED_MOCK = [
  { id: 'STU032', name: 'Priya Patel', meal: 'Lunch', time: '12:41 PM', status: 'success', hostel: 'Block A' },
  { id: 'STU018', name: 'Rahul Singh', meal: 'Lunch', time: '12:38 PM', status: 'success', hostel: 'Block B' },
  { id: 'STU075', name: 'Anita Kumar', meal: 'Lunch', time: '12:35 PM', status: 'duplicate', hostel: 'Block A' },
  { id: 'STU091', name: 'Mohit Sharma', meal: 'Lunch', time: '12:31 PM', status: 'success', hostel: 'Block C' },
]

export default function QRScanner() {
  const { user } = useAuth()
  const [activeMeal, setActiveMeal] = useState('lunch')
  const [scans, setScans] = useState([])
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState(null)
  const [manualToken, setManualToken] = useState('')
  const [cameraError, setCameraError] = useState(null)

  const MEAL_COLORS = { breakfast: 'var(--accent-amber)', lunch: 'var(--accent-teal)', dinner: 'var(--accent-purple)' }

  // Socket.io integration for real-time updates
  useEffect(() => {
    if (!user?.hostel) return
    const socket = io('http://localhost:5000')
    socket.emit('join_hostel_room', user.hostel)
    
    socket.on('scan_success', (data) => {
      setLastScan({
        id: data.studentId,
        name: data.studentName,
        meal: data.meal.charAt(0).toUpperCase() + data.meal.slice(1),
        time: data.time,
        status: data.status
      })
      setScans(prev => [{
        id: data.studentId,
        name: data.studentName,
        meal: data.meal.charAt(0).toUpperCase() + data.meal.slice(1),
        time: data.time,
        status: data.status,
        hostel: user.hostel
      }, ...prev.slice(0, 14)])
    })

    return () => socket.disconnect()
  }, [user])

  const handleScan = async (e, overrideToken) => {
    e?.preventDefault()
    const tokenToScan = overrideToken || manualToken
    if (!tokenToScan.trim()) return
    setScanning(true)
    
    try {
      const res = await api.post('/attendance/scan', { token: tokenToScan })
      const newScan = {
        name: res.data.studentName,
        meal: activeMeal.charAt(0).toUpperCase() + activeMeal.slice(1),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: res.data.status,
      }
      setLastScan(newScan)
      setScans(s => [newScan, ...s.slice(0, 14)])
      setManualToken('')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid QR code'
      const errorScan = {
        name: err.response?.data?.studentName || 'Unknown Student',
        meal: activeMeal.charAt(0).toUpperCase() + activeMeal.slice(1),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: err.response?.data?.status || 'duplicate',
        error: errorMsg
      }
      setLastScan(errorScan)
      setScans(s => [errorScan, ...s.slice(0, 14)])
      setManualToken('')
    } finally {
      setScanning(false)
    }
  }

  const successCount = scans.filter(s => s.status === 'success').length
  const dupCount = scans.filter(s => s.status === 'duplicate').length

  return (
    <div>
      <div className="page-header">
        <div><h1>QR Scanner</h1><p>Scan student meal passes for check-in</p></div>
        <span className="live-badge"><span className="live-dot" /> Active</span>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
        {/* Scanner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Meal selector */}
          <div className="tabs">
            {['breakfast', 'lunch', 'dinner'].map(m => (
              <button key={m} id={`scanner-meal-${m}`} className={`tab-btn ${activeMeal === m ? 'active' : ''}`}
                onClick={() => setActiveMeal(m)}
                style={activeMeal === m ? { background: `linear-gradient(135deg, ${MEAL_COLORS[m]}, ${MEAL_COLORS[m]}cc)` } : {}}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Scanner display */}
          <div className="card" style={{ textAlign: 'center', padding: '20px 24px' }}>
            <div style={{
              width: 250, height: 250, margin: '0 auto 24px',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              position: 'relative',
              background: 'var(--bg-app)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {!cameraError ? (
                <Scanner 
                  onScan={(result) => {
                    if (scanning) return;
                    const token = Array.isArray(result) ? result[0].rawValue : result;
                    if (token) {
                      setManualToken(token);
                      handleScan(null, token);
                    }
                  }}
                  onError={(error) => {
                    console.error("Camera Error:", error);
                    let errMsg = error?.message || "Unknown camera error";
                    if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
                      errMsg = "Camera permission denied. Please allow camera access in your browser settings.";
                    } else if (errMsg.includes('NotFoundError') || errMsg.includes('Requested device not found')) {
                      errMsg = "No camera found on this device.";
                    } else if (!window.isSecureContext) {
                      errMsg = "Camera requires HTTPS or localhost to run.";
                    }
                    setCameraError(errMsg);
                  }}
                  styles={{ container: { width: '100%', height: '100%' } }}
                />
              ) : (
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <AlertTriangle size={32} color="var(--accent-amber)" style={{ marginBottom: 12 }} />
                  <p style={{ color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 600 }}>Camera Error</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 4 }}>{cameraError}</p>
                  <button onClick={() => setCameraError(null)} className="btn btn-secondary btn-sm" style={{ marginTop: 12, margin: '12px auto 0' }}>Try Again</button>
                </div>
              )}
            </div>

            {lastScan && (
              <div style={{
                marginBottom: 16, padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: lastScan.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${lastScan.status === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                display: 'flex', gap: 10, alignItems: 'center',
              }}>
                {lastScan.status === 'success' ? <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} /> : <XCircle size={18} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lastScan.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lastScan.status === 'success' ? 'Check-in successful' : 'Duplicate scan blocked'}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleScan} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <input 
                type="text" 
                placeholder="Paste token here..." 
                value={manualToken} 
                onChange={e => setManualToken(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="btn btn-primary" disabled={scanning || !manualToken.trim()}>
                <ScanLine size={18} /> {scanning ? 'Scanning...' : 'Scan'}
              </button>
            </form>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>In production: uses device camera</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'Space Grotesk' }}>{successCount}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Successful</div>
            </div>
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'Space Grotesk' }}>{dupCount}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Duplicates</div>
            </div>
          </div>
        </div>

        {/* Log */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Scan Log</h3>
            <span className="live-badge"><span className="live-dot" /> Live</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
            {scans.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px',
                background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                border: `1px solid ${s.status === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                animation: i === 0 ? 'fadeIn 0.4s ease' : 'none',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.status === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.status === 'success' ? <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} /> : <XCircle size={18} style={{ color: 'var(--accent-amber)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.id} · {s.hostel}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11}/> {s.time}</div>
                  <span className={`badge ${s.status === 'success' ? 'badge-emerald' : 'badge-amber'}`} style={{ marginTop: 4, fontSize: '0.65rem' }}>
                    {s.status === 'success' ? '✓ OK' : '⚠ Dup'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
