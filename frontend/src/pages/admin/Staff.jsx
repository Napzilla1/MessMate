import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import api from '../../api'

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager', hostel: '' })
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users')
        if (res.data) setStaff(res.data.filter(u => u.role !== 'student'))
      } catch (err) { console.error(err) }
    }
    fetchUsers()
  }, [])

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/staff', form);
      setStaff([...staff, res.data]);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'manager', hostel: '' });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Staff & Managers</h1><p>System administrators and hostel managers</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16}/> Add Staff</button>
      </div>
      <div className="card">
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {staff.map(s => (
            <li key={s._id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{s.name}</strong> - {s.role} ({s.email})
            </li>
          ))}
        </ul>
      </div>
      
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 400, maxWidth: '90%' }}>
            <h3 style={{ marginBottom: 20 }}>Add Staff</h3>
            <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" placeholder="Name" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <input type="email" placeholder="Email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              <input type="password" placeholder="Password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              {form.role === 'manager' && (
                <input type="text" placeholder="Hostel ID" className="input" value={form.hostel} onChange={e => setForm({...form, hostel: e.target.value})} />
              )}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
