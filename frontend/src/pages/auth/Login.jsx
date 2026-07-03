import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowRight, GraduationCap, ChefHat, Shield } from 'lucide-react'

const ROLES = [
  { key: 'student', label: 'Student', icon: <GraduationCap size={20} />, color: 'var(--accent-teal)', hint: 'Login with your student credentials' },
  { key: 'manager', label: 'Manager', icon: <ChefHat size={20} />, color: 'var(--accent-amber)', hint: 'Login with your mess manager credentials' },
  { key: 'admin', label: 'Admin', icon: <Shield size={20} />, color: 'var(--accent-purple)', hint: 'Login with your admin credentials' },
]

export default function Login() {
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activeRole = ROLES.find(r => r.key === selectedRole)

  const handleRoleChange = (key) => {
    setSelectedRole(key)
    setError('')
    setEmail('')
    setPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials or database connection failed.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 300 + 100}px`,
            height: `${Math.random() * 300 + 100}px`,
            borderRadius: '50%',
            background: i % 2 === 0 ? 'var(--accent-teal)' : 'var(--accent-purple)',
            opacity: 0.03,
            filter: 'blur(60px)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: 'translate(-50%, -50%)',
          }} />
        ))}
      </div>

      <div className="auth-card fade-in">
        {/* Logo */}
        <div className="auth-logo" style={{ marginBottom: 24 }}>
          <div className="auth-logo-icon">🍽️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>MessMate</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Smart Hostel Mess Management
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24,
          background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)',
          padding: 6, border: '1px solid var(--border)'
        }}>
          {ROLES.map(role => (
            <button
              key={role.key}
              id={`login-role-${role.key}`}
              type="button"
              onClick={() => handleRoleChange(role.key)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer',
                background: selectedRole === role.key
                  ? `linear-gradient(135deg, ${role.color}, ${role.color}cc)`
                  : 'transparent',
                color: selectedRole === role.key ? '#fff' : 'var(--text-muted)',
                fontSize: '0.82rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.3s ease',
                boxShadow: selectedRole === role.key ? `0 4px 15px ${role.color}40` : 'none',
              }}
            >
              {role.icon} {role.label}
            </button>
          ))}
        </div>

        {/* Role hint */}
        <div style={{
          padding: '10px 14px', marginBottom: 16,
          background: `${activeRole.color}10`,
          border: `1px solid ${activeRole.color}30`,
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem', color: activeRole.color,
          textAlign: 'center'
        }}>
          {activeRole.hint}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@iitbhu.ac.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', cursor: 'pointer', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%', justifyContent: 'center', padding: '13px',
              fontSize: '0.95rem', marginTop: 4,
              background: `linear-gradient(135deg, ${activeRole.color}, ${activeRole.color}cc)`,
              boxShadow: `0 4px 15px ${activeRole.color}30`
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Logging in...
              </span>
            ) : (
              <>Sign In as {activeRole.label} <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          New student?{' '}
          <Link to="/register" style={{ color: 'var(--accent-teal)', fontWeight: 500 }}>Create account</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

