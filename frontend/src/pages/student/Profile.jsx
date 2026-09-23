import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Save, Bell, Shield, User, X } from 'lucide-react'
import api from '../../api'

export default function StudentProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', hostel: user?.hostel || '', room: user?.room || '', phone: user?.phone || '+91 9876543210' })
  const [saved, setSaved] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')

  const handleSave = async () => {
    try {
      const res = await api.put('/auth/profile', form);
      if (res.data.requiresOtp) {
        setShowOtp(true);
      } else {
        setSaved(true); 
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving profile');
    }
  }

  const handleVerifyOtp = async () => {
    try {
      await api.put('/auth/profile/verify', { otp });
      setShowOtp(false);
      setSaved(true); 
      setTimeout(() => setSaved(false), 2000);
      window.location.reload(); // Reload to fetch fresh user data
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid OTP');
    }
  }

  return (
    <div>
      {/* OTP Modal */}
      {showOtp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, position: 'relative' }}>
            <button onClick={() => setShowOtp(false)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20}/></button>
            <h3 style={{ marginBottom: 10 }}>Verify Identity</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>We sent an OTP to your current email to authorize these sensitive changes.</p>
            <input type="text" className="form-input" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} style={{ marginBottom: 15, textAlign: 'center', letterSpacing: 5, fontSize: '1.2rem' }} />
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleVerifyOtp}>Verify & Save</button>
          </div>
        </div>
      )}
      <div className="page-header"><div><h1>My Profile</h1><p>Manage your account and preferences</p></div></div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Profile Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{user?.avatar}</div>
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user?.email}</p>
                <span className="badge badge-teal" style={{ marginTop: 6 }}>Student</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['Full Name', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel']].map(([label, field, type]) => (
                <div key={field} className="form-group">
                  <label className="form-label">{label}</label>
                  <input id={`profile-${field}`} type={type} className="form-input" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Hostel</label>
                  <input id="profile-hostel" className="form-input" value={form.hostel} onChange={e => setForm({ ...form, hostel: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Room</label>
                  <input id="profile-room" className="form-input" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
                </div>
              </div>
            </div>
            <button id="save-profile" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }} onClick={handleSave}>
              {saved ? '✓ Saved!' : <><Save size={15}/> Save Changes</>}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Security */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Shield size={18} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Security</h3>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" placeholder="••••••••" />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="••••••••" />
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Change Password</button>
          </div>
        </div>
      </div>
    </div>
  )
}
