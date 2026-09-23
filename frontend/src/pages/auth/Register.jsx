import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../../api'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', rollno: '', hostel: '', room: '', password: '', confirmPassword: '' })
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1 = Details, 2 = OTP
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const hostels = ['Limbdi Hostel', 'Ramanujan Hostel', 'Vivekananda Hostel', 'Gandhi Hostel', 'Tagore Hostel', 'CVR Hostel']

  const handleRegisterDetails = async (e) => {
    e.preventDefault()
    
    // Strict password validation
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      setError('Password must contain at least one special character')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'student',
        hostel: form.hostel,
        room: form.room,
        rollNo: form.rollno
      })
      setSuccessMsg(res.data.message)
      setStep(2) // Move to OTP step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start registration')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/verify-otp', {
        email: form.email,
        otp: otp
      })
      await login(form.email, form.password)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🍽️</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {step === 1 ? 'Join your hostel mess system' : `Enter the 6-digit OTP sent to ${form.email}`}
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: '0.85rem', marginBottom: 14 }}>
            {error}
          </div>
        )}
        
        {successMsg && step === 2 && (
          <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: '0.85rem', marginBottom: 14 }}>
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegisterDetails} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="reg-name" className="form-input" placeholder="Arjun Sharma" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input id="reg-roll" className="form-input" placeholder="19BCE0001" value={form.rollno}
                  onChange={e => setForm({ ...form, rollno: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Institute Email</label>
              <input id="reg-email" type="email" className="form-input" placeholder="student@iitbhu.ac.in" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Hostel</label>
                <select id="reg-hostel" className="form-select" value={form.hostel}
                  onChange={e => setForm({ ...form, hostel: e.target.value })} required>
                  <option value="">Select hostel</option>
                  {hostels.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Room No.</label>
                <input id="reg-room" className="form-input" placeholder="A-204" value={form.room}
                  onChange={e => setForm({ ...form, room: e.target.value })} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input id="reg-password" type="password" className="form-input" placeholder="Min. 8 chars, 1 special" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input id="reg-confirm" type="password" className="form-input" placeholder="Confirm password" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>

            <button id="reg-submit" type="submit" className="btn btn-primary"
              disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}>
              {loading ? 'Sending OTP...' : <>Next Step <ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">6-Digit OTP</label>
              <input id="reg-otp" type="text" className="form-input" placeholder="123456" value={otp}
                onChange={e => setOtp(e.target.value)} required maxLength={6} style={{ letterSpacing: '0.2em', fontSize: '1.2rem', textAlign: 'center' }} />
            </div>

            <button id="verify-submit" type="submit" className="btn btn-primary"
              disabled={loading || otp.length < 6} style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}>
              {loading ? 'Verifying...' : <>Verify & Create Account <CheckCircle size={16} /></>}
            </button>
            <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              <ArrowLeft size={16} /> Back
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--accent-teal)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={13} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
