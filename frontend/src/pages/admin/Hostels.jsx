import { useState, useEffect } from 'react'
import { Plus, Users, Building2, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import api from '../../api'

export default function Hostels() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get('/hostels')
        if (res.data && res.data.length > 0) setHostels(res.data)
        else setHostels([{ _id: '1', name: 'Limbdi Hostel', blocks: 2, capacity: 400, currentStudents: 385, status: 'active' }])
      } catch (err) {
        setHostels([{ _id: '1', name: 'Limbdi Hostel', blocks: 2, capacity: 400, currentStudents: 385, status: 'active' }])
      } finally { setLoading(false) }
    }
    fetchHostels()
  }, [])

  return (
    <div>
      <div className="page-header">
        <div><h1>Hostels Management</h1><p>Manage hostel buildings and capacities</p></div>
        <button className="btn btn-primary"><Plus size={16}/> Add Hostel</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {hostels.map(h => (
          <div key={h._id || h.name} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)' }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>{h.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{h.blocks} Blocks</div>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreVertical size={18}/></button>
            </div>

            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Capacity</div>
                <div style={{ fontWeight: 600 }}>{h.capacity}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Occupied</div>
                <div style={{ fontWeight: 600 }}>{h.currentStudents || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
                <div className={`badge ${h.status === 'active' ? 'badge-emerald' : 'badge-amber'}`}>{h.status}</div>
              </div>
            </div>

            <div style={{ height: 6, background: 'var(--bg-glass)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${((h.currentStudents||0)/h.capacity)*100}%`, background: 'var(--accent-teal)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
              {Math.round(((h.currentStudents||0)/h.capacity)*100)}% Occupied
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
