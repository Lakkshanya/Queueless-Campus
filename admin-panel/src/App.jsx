import React from 'react';
import './index.css';
import LiveMonitoring from './LiveMonitoring';
import ProfileCompletion from './pages/ProfileCompletion';
import StaffDashboard from './StaffDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OTPVerify from './pages/OTPVerify';
import RoleSelection from './pages/RoleSelection';
import AdminDashboard from './AdminDashboard';
import CounterManagement from './CounterManagement';
import AnalyticsPage from './AnalyticsPage';
import ServiceManagement from './pages/ServiceManagement';
import NotificationControl from './pages/NotificationControl';
import StaffManagement from './pages/StaffManagement';
import PortalLayout from './components/PortalLayout';
import Splash from './pages/Splash';
import ProfileEdit from './pages/ProfileEdit';

const ProtectedRoute = ({ children, allowedRole = 'admin' }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#1C1917] flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;

  if (!user.profileCompleted && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<OTPVerify />} />
      <Route path="/roles" element={<RoleSelection />} />
      <Route path="/complete-profile" element={
        <ProtectedRoute allowedRole={null}>
          <ProfileCompletion />
        </ProtectedRoute>
      } />
      
      {/* Unified Portal Shell for Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="admin">
          <PortalLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="counters" element={<CounterManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="monitoring" element={<LiveMonitoring />} />
        <Route path="services" element={<ServiceManagement />} />
        <Route path="notifications" element={<NotificationControl />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="profile" element={<ProfileEdit />} />
      </Route>

      {/* Unified Portal Shell for Staff */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRole="staff">
          <PortalLayout />
        </ProtectedRoute>
      }>
        <Route index element={<StaffDashboard />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="queue" element={<StaffDashboard />} />
        <Route path="notifications" element={<NotificationControl />} />
        <Route path="profile" element={<ProfileEdit />} />
      </Route>

      <Route path="/" element={<Splash />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
