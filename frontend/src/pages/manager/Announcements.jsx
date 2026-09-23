import { useState, useEffect } from 'react'
import { Megaphone, Trash2, Plus, Clock, Info, Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'

export default function Announcements() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const hostel = user?.hostel || 'Limbdi Hostel'

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const res = await api.get('/announcements/' + encodeURIComponent(hostel))
      setAnnouncements(res.data)
    } catch (err) {
      console.error('Failed to fetch announcements', err)
      setError('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [hostel])

  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      const res = await api.post('/announcements', {
        title: form.title,
        message: form.message,
        hostel
      })
      setAnnouncements([res.data, ...announcements])
      setForm({ title: '', message: '' })
      setShowCreateModal(false) // Close modal on success
    } catch (err) {
      console.error('Failed to post announcement', err)
      setError('Failed to post announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement? It will be removed from all student dashboards instantly.')) return
    try {
      await api.delete('/announcements/' + id)
      setAnnouncements(announcements.filter(a => a._id !== id))
    } catch (err) {
      console.error('Failed to delete announcement', err)
      alert('Failed to delete announcement')
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      
      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div className="card" style={{ width: '90%', maxWidth: 550, position: 'relative', border: '1px solid rgba(20,184,166,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', background: 'var(--bg-card)' }}>
            <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20}/></button>
            <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem', fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              <div style={{ padding: 8, background: 'rgba(20,184,166,0.1)', borderRadius: 10 }}><Megaphone size={20} color="var(--accent-teal)" /></div>
              Publish New Notice
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="input-label" style={{ marginBottom: 8, display: 'block', fontSize: '0.9rem' }}>Announcement Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Special Friday Dinner Menu"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: 12, fontSize: '0.95rem' }}
                  required
                />
              </div>
              
              <div>
                <label className="input-label" style={{ marginBottom: 8, display: 'block', fontSize: '0.9rem' }}>Message Details</label>
                <textarea
                  className="input-field"
                  placeholder="Write the full details here. This will be instantly visible on all student dashboards..."
                  rows={6}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: 12, fontSize: '0.95rem', resize: 'vertical' }}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submitting} 
                  style={{ 
                    padding: '0 24px', 
                    borderRadius: 8,
                    display: 'flex', gap: 10, alignItems: 'center',
                    background: submitting ? 'var(--bg-glass)' : 'linear-gradient(135deg, var(--accent-teal), #059669)'
                  }}
                >
                  {submitting ? 'Publishing...' : (
                    <>Publish Instantly <Send size={18} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(139,92,246,0.05) 100%)',
        border: '1px solid rgba(20,184,166,0.15)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 32px',
        marginBottom: 32,
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Megaphone size={28} color="var(--accent-teal)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Hostel Announcements
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Broadcast real-time messages to all {hostel} students.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ background: 'var(--text-primary)', color: 'var(--bg-app)', padding: '12px 24px', borderRadius: 30 }}
        >
          <Plus size={18} /> Create Notice
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', marginBottom: 24, border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Info size={18} /> {error}
        </div>
      )}

      {/* ANNOUNCEMENTS FEED */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '0 4px' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 600 }}>Live Feed</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-glass)', padding: '4px 12px', borderRadius: 20 }}>
            {announcements.length} {announcements.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border)' }}>
              Loading feed...
            </div>
          ) : announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border)' }}>
              <Megaphone size={40} color="var(--border)" style={{ marginBottom: 16, opacity: 0.5 }} />
              <p>No active announcements.</p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-secondary" style={{ marginTop: 16, margin: '16px auto 0' }}>
                Create First Notice
              </button>
            </div>
          ) : (
            announcements.map((a) => (
              <div 
                key={a._id} 
                style={{ 
                  padding: 24, 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 16,
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(20,184,166,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h4 style={{ fontWeight: 600, fontSize: '1.15rem', color: 'var(--text-primary)', paddingRight: 32 }}>
                    {a.title}
                  </h4>
                  
                  <button
                    onClick={() => handleDelete(a._id)}
                    style={{ 
                      background: 'rgba(244,63,94,0.1)', 
                      border: 'none', 
                      color: 'var(--accent-rose)', 
                      cursor: 'pointer', 
                      width: 32, height: 32, 
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'absolute', top: 20, right: 20,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
                    title="Delete this notice"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.95rem', 
                  marginBottom: 20, 
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5
                }}>
                  {a.message}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 20, 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: 16
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: 20 }}>
                    <Clock size={12} color="var(--accent-amber)" />
                    {new Date(a.date).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 700 }}>
                      {a.author?.name ? a.author.name.charAt(0) : 'M'}
                    </div>
                    {a.author?.name || 'Manager'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
