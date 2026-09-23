import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, CheckCircle2 } from 'lucide-react'
import api from '../../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState(1) // 1 = Email, 2 = OTP + Password
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgotpassword', { email })
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must contain at least one special character')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.put('/auth/resetpassword', { email, otp, newPassword: password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 300 + 100}px`, height: `${Math.random() * 300 + 100}px`,
            borderRadius: '50%', background: 'var(--accent-teal)', opacity: 0.03, filter: 'blur(60px)',
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: 'translate(-50%, -50%)',
          }} />
        ))}
      </div>

      <div className="auth-card fade-in">
        <div className="auth-logo" style={{ marginBottom: 32 }}>
          <div className="auth-logo-icon">🔑</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Reset Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {step === 1 ? 'Enter your email to receive a secure OTP' : `Enter the 6-digit OTP sent to ${email}`}
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ marginBottom: 8 }}>Password Reset!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
              Your password has been successfully updated. You can now login with your new password.
            </p>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Login
            </Link>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="student@iitbhu.ac.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: 8 }}>
              {loading ? 'Sending OTP...' : <><Mail size={16} /> Send OTP</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">6-Digit OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                maxLength={6}
                style={{ letterSpacing: '0.2em', fontSize: '1.2rem', textAlign: 'center' }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 8 chars, 1 special"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading || otp.length < 6} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: 8 }}>
              {loading ? 'Verifying...' : <><CheckCircle2 size={16} /> Verify & Reset</>}
            </button>
            <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              Back
            </button>
          </form>
        )}

        {!success && step === 1 && (
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: 'var(--accent-teal)', fontWeight: 500 }}>Back to login</Link>
          </p>
        )}
      </div>
    </div>
  )
}
