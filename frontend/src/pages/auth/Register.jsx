import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import api from '../../api'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', rollno: '', hostel: '', room: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const hostels = ['Limbdi Hostel', 'Ramanujan Hostel', 'Vivekananda Hostel', 'Gandhi Hostel', 'Tagore Hostel', 'CVR Hostel']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'student',
        hostel: form.hostel,
        room: form.room,
        rollNo: form.rollno
      })
      await login(form.email, form.password)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🍽️</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Join your hostel mess system</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
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
            <input id="reg-email" type="email" className="form-input" placeholder="arjun@iitbhu.ac.in" value={form.email}
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

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min. 8 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary"
            disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}>
            {loading ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

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
