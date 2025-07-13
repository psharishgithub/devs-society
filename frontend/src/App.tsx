import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LoadingScreen } from './components/loading-screen'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { MemberCard } from './pages/MemberCard'
import { Events } from './pages/Events'
import { EventPayment } from './pages/EventPayment'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import EventAttendance from './pages/admin/EventAttendance';
import AttendanceOverview from './pages/admin/AttendanceOverview';
import { Participation } from './pages/superadmin/Participation';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-black text-white">
          <LoadingScreen />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/portal" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/card" element={<ProtectedRoute><MemberCard /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/event-payment/:eventId" element={<ProtectedRoute><EventPayment /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/events/:eventId/attendance" element={<EventAttendance />} />
            <Route path="/admin/events/attendance" element={<AttendanceOverview />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            
            {/* Super Admin Routes */}
            <Route path="/superadmin/participation" element={<Participation />} />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
