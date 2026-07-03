import { useState, useEffect } from 'react'
import { Search, Filter, Download, MoreHorizontal, UserCheck, UserX } from 'lucide-react'
import api from '../../api'

export default function Students() {
  const [students, setStudents] = useState([])
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users')
        if (res.data) setStudents(res.data.filter(u => u.role === 'student'))
      } catch (err) { console.error(err) }
    }
    fetchUsers()
  }, [])

  return (
    <div>
      <div className="page-header">
        <div><h1>Students Directory</h1><p>Manage all registered students</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary"><Filter size={16}/> Filter</button>
          <button className="btn btn-primary"><Download size={16}/> Export CSV</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="form-input" placeholder="Search by name, roll no, or email..." style={{ paddingLeft: 44, background: 'var(--bg-app)' }} />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Student Info</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Roll Number</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Hostel & Room</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' }}>{s.avatar || s.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>{s.rollNo || 'N/A'}</td>
                <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>{s.hostel || 'N/A'}<br/><span style={{ color: 'var(--text-muted)' }}>{s.room || 'N/A'}</span></td>
                <td style={{ padding: '16px 24px' }}><span className="badge badge-emerald">Active</span></td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreHorizontal size={18}/></button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="5" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
