import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import api from '../../api'

export default function Staff() {
  const [staff, setStaff] = useState([])
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users')
        if (res.data) setStaff(res.data.filter(u => u.role !== 'student'))
      } catch (err) { console.error(err) }
    }
    fetchUsers()
  }, [])

  return (
    <div>
      <div className="page-header">
        <div><h1>Staff & Managers</h1><p>System administrators and hostel managers</p></div>
        <button className="btn btn-primary"><Plus size={16}/> Add Staff</button>
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
    </div>
  )
}
