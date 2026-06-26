import { useState } from 'react'
import { useAuth } from '../../App'
import { Save, Bell, Shield, User } from 'lucide-react'

export default function StudentProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', hostel: user?.hostel || '', room: user?.room || '', phone: '+91 9876543210' })
  const [notif, setNotif] = useState({ email: true, push: true, cutoffReminder: true, menuUpdate: false, weeklyReport: true })
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
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
          {/* Notifications */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Bell size={18} style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Notification Preferences</h3>
            </div>
            {[['email', 'Email Notifications', 'Receive meal reminders via email'], ['push', 'Push Notifications', 'Browser & mobile push alerts'], ['cutoffReminder', 'Cutoff Reminders', '30 min before attendance cutoff'], ['menuUpdate', 'Menu Updates', 'When the menu is changed'], ['weeklyReport', 'Weekly Report', 'Summary every Sunday']].map(([key, label, desc]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notif[key]} onChange={e => setNotif({ ...notif, [key]: e.target.checked })} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>

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
