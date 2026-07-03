import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, UtensilsCrossed, CalendarCheck, QrCode,
  History, User, LogOut, ChefHat, ScanLine, Users, BarChart3,
  FileText, Sparkles, Building2, Settings, UserCog, Trash2
} from 'lucide-react'

const NAV_ITEMS = {
  student: [
    { section: 'Main', items: [
      { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/student/menu', icon: UtensilsCrossed, label: 'Mess Menu' },
      { to: '/student/attendance', icon: CalendarCheck, label: 'Mark Attendance' },
      { to: '/student/qr', icon: QrCode, label: 'My QR Code' },
    ]},
    { section: 'Account', items: [
      { to: '/student/history', icon: History, label: 'Meal History' },
      { to: '/student/profile', icon: User, label: 'Profile' },
    ]},
  ],
  manager: [
    { section: 'Operations', items: [
      { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/manager/scanner', icon: ScanLine, label: 'QR Scanner', badge: 'LIVE' },
      { to: '/manager/attendance', icon: Users, label: 'Attendance' },
      { to: '/manager/waste', icon: Trash2, label: 'Waste Log' },
    ]},
    { section: 'Management', items: [
      { to: '/manager/menu', icon: ChefHat, label: 'Manage Menu' },
      { to: '/manager/reports', icon: FileText, label: 'Reports' },
      { to: '/manager/ai', icon: Sparkles, label: 'AI Insights' },
    ]},
  ],
  admin: [
    { section: 'Overview', items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ]},
    { section: 'Management', items: [
      { to: '/admin/hostels', icon: Building2, label: 'Hostels' },
      { to: '/admin/students', icon: Users, label: 'Students' },
      { to: '/admin/staff', icon: UserCog, label: 'Staff' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ]},
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const navItems = NAV_ITEMS[user.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar slide-in-left">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🍽️</div>
        <div className="sidebar-logo-text">
          <h2>MessMate</h2>
          <span>Smart Mess System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={17} />
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user.avatar}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>{user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
