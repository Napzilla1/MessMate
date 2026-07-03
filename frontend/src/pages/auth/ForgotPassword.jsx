import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, CheckCircle2 } from 'lucide-react'
import api from '../../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgotpassword', { email })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Check your email.')
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
            Enter your email to receive a secure reset link
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ marginBottom: 8 }}>Email Sent!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
              If an account exists with {email}, we have sent a password reset link to it. 
              <br /><br />
              <b>(For demo purposes, check the backend terminal console for the link!)</b>
            </p>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              {loading ? 'Sending...' : <><Mail size={16} /> Send Reset Link</>}
            </button>
          </form>
        )}

        {!success && (
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: 'var(--accent-teal)', fontWeight: 500 }}>Back to login</Link>
          </p>
        )}
      </div>
    </div>
  )
}
