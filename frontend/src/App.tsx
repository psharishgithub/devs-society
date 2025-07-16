import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import { InternalBooking } from './pages/superadmin/InternalBooking';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { DeveloperCards } from './pages/Developers'
import Footer from './components/Footer'
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import CancellationPolicy from './pages/CancellationPolicy';
import ContactUs from './pages/Contact';

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/developers';
  
  return (
    <div className="App min-h-screen bg-black text-white flex flex-col">
      <LoadingScreen />
      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/developers" element={<DeveloperCards />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/cancellation" element={<CancellationPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          
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
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/participation" element={<Participation />} />
          <Route path="/superadmin/internal-booking" element={<InternalBooking />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
