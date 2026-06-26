import { Bell, Search, Moon, Wifi } from 'lucide-react'
import { useAuth } from '../../App'
import { useState } from 'react'

const PAGE_TITLES = {
  '/student/dashboard': { title: 'Dashboard', sub: 'Good morning! Here\'s your meal overview' },
  '/student/menu': { title: 'Mess Menu', sub: 'Today\'s meals and weekly schedule' },
  '/student/attendance': { title: 'Mark Attendance', sub: 'Declare your meal preferences' },
  '/student/qr': { title: 'My QR Code', sub: 'Show this at the mess entrance' },
  '/student/history': { title: 'Meal History', sub: 'Your past attendance records' },
  '/student/profile': { title: 'Profile', sub: 'Manage your account settings' },
  '/manager/dashboard': { title: 'Manager Dashboard', sub: 'Live mess operations overview' },
  '/manager/scanner': { title: 'QR Scanner', sub: 'Scan student meal passes' },
  '/manager/attendance': { title: 'Attendance Monitor', sub: 'Track expected vs actual attendance' },
  '/manager/waste': { title: 'Food Waste Log', sub: 'Record daily food preparation data' },
  '/manager/menu': { title: 'Menu Management', sub: 'Create and edit weekly meal plans' },
  '/manager/reports': { title: 'Reports', sub: 'Download analytics and summaries' },
  '/manager/ai': { title: 'AI Insights', sub: 'Smart forecasting and recommendations' },
  '/admin/dashboard': { title: 'Admin Dashboard', sub: 'System-wide overview' },
  '/admin/hostels': { title: 'Hostel Management', sub: 'Manage all hostels' },
  '/admin/students': { title: 'Student Management', sub: 'Manage student accounts' },
  '/admin/analytics': { title: 'Analytics', sub: 'Deep dive into system metrics' },
  '/admin/settings': { title: 'Settings', sub: 'System configuration' },
  '/admin/staff': { title: 'Staff Management', sub: 'Manage mess managers and staff' },
}

export default function Topbar() {
  const { user } = useAuth()
  const [showNotif, setShowNotif] = useState(false)
  const path = window.location.pathname
  const pageInfo = PAGE_TITLES[path] || { title: 'MessMate', sub: '' }

  const notifications = [
    { id: 1, text: 'Lunch attendance cutoff in 30 min', time: '11:30 AM', type: 'warning' },
    { id: 2, text: 'Dinner forecast updated: 842 students', time: '10:00 AM', type: 'info' },
    { id: 3, text: 'New menu added for next week', time: 'Yesterday', type: 'success' },
  ]

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{pageInfo.title}</div>
        <div className="topbar-breadcrumb">{pageInfo.sub}</div>
      </div>

      <div className="topbar-right">
        <div style={{ position: 'relative' }}>
          <button
            id="notif-btn"
            className="topbar-btn"
            onClick={() => setShowNotif(!showNotif)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="notif-dot" />
          </button>

          {showNotif && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '300px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                <span className="badge badge-teal">3</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 3 }}>{n.text}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{n.time}</div>
                </div>
              ))}
              <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', cursor: 'pointer' }}>View all notifications</span>
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-glass)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '6px 12px',
          fontSize: '0.8rem', color: 'var(--text-secondary)'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} />
          {user?.hostel || 'MessMate System'}
        </div>
      </div>
    </header>
  )
}
