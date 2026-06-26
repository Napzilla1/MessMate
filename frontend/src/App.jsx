import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import api from './api'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

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
import AIInsights from './pages/manager/AIInsights'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import Hostels from './pages/admin/Hostels'
import Students from './pages/admin/Students'
import Analytics from './pages/admin/Analytics'
import Settings from './pages/admin/Settings'
import Staff from './pages/admin/Staff'

// Components
import LiveChat from './components/LiveChat'

// Auth context
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

const DEMO_USERS = {
  student: { id: 'STU001', name: 'Arjun Sharma', email: 'arjun@iitbhu.ac.in', role: 'student', hostel: 'Limbdi Hostel', room: 'A-204', avatar: 'AS' },
  manager: { id: 'MGR001', name: 'Ramesh Kumar', email: 'ramesh@iitbhu.ac.in', role: 'manager', hostel: 'Limbdi Hostel', avatar: 'RK' },
  admin: { id: 'ADM001', name: 'Dr. Priya Singh', email: 'admin@iitbhu.ac.in', role: 'admin', avatar: 'PS' },
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    // For fallback demo testing if user doesn't have DB
    if (email === 'demo') {
      setUser(DEMO_USERS[password]) // password acts as role
      return;
    }
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
  }

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
  }

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null)
  }

  if (loading) return <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>;

  const getDefaultRoute = () => {
    if (!user) return '/login'
    if (user.role === 'student') return '/student/dashboard'
    if (user.role === 'manager') return '/manager/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
      </div>
      <Routes>
        {/* Public */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to={getDefaultRoute()} />} />

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
          <Route path="ai" element={<AIInsights />} />
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
      <LiveChat />
    </AuthContext.Provider>
  )
}
