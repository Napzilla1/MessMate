import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Layouts
import StudentLayout from './layouts/StudentLayout'
import ManagerLayout from './layouts/ManagerLayout'
import AdminLayout from './layouts/AdminLayout'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentMenu from './pages/student/Menu'
import StudentAttendance from './pages/student/Attendance'
import StudentQR from './pages/student/QRCode'
import StudentHistory from './pages/student/History'
import StudentProfile from './pages/student/Profile'

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard'
import MenuManagement from './pages/manager/MenuManagement'
import QRScanner from './pages/manager/QRScanner'
import AttendanceMonitor from './pages/manager/AttendanceMonitor'
import WasteLog from './pages/manager/WasteLog'
import Reports from './pages/manager/Reports'
import Forecasting from './pages/manager/Forecasting'
import Announcements from './pages/manager/Announcements'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import Hostels from './pages/admin/Hostels'
import Students from './pages/admin/Students'
import Analytics from './pages/admin/Analytics'
import Settings from './pages/admin/Settings'
import Staff from './pages/admin/Staff'




import { useSelector, useDispatch } from 'react-redux'
import { initAuthFromStorage, fetchProfileThunk } from './store/authSlice'

export default function App() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector(state => state.auth)

  useEffect(() => {
    // 1. Initialize auth from localStorage sync
    dispatch(initAuthFromStorage())
    
    // 2. If token exists and not expired, fetch fresh profile from backend
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
          dispatch(fetchProfileThunk())
        }
      } catch (e) {
        // invalid token format
      }
    }
  }, [dispatch])

  if (loading) return <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-secondary)'}}>Loading...</div>;

  const getDefaultRoute = () => {
    if (!user) return '/login'
    if (user.role === 'student') return '/student/dashboard'
    if (user.role === 'manager') return '/manager/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
      </div>
      <Routes>
        {/* Public */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to={getDefaultRoute()} />} />

        {/* Student */}
        <Route path="/student" element={user?.role === 'student' ? <StudentLayout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="menu" element={<StudentMenu />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="qr" element={<StudentQR />} />
          <Route path="history" element={<StudentHistory />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Manager */}
        <Route path="/manager" element={user?.role === 'manager' ? <ManagerLayout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="scanner" element={<QRScanner />} />
          <Route path="attendance" element={<AttendanceMonitor />} />
          <Route path="waste" element={<WasteLog />} />
          <Route path="reports" element={<Reports />} />
          <Route path="forecast" element={<Forecasting />} />
          <Route path="announcements" element={<Announcements />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="hostels" element={<Hostels />} />
          <Route path="students" element={<Students />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="staff" element={<Staff />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to={user ? getDefaultRoute() : '/login'} />} />
      </Routes>
    </>
  )
}

