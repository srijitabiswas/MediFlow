import { Routes, Route, Navigate } from 'react-router-dom';
import Landing             from '../pages/Landing';
import Login               from '../pages/Login';
import Signup              from '../pages/Signup';
import LocationSetup       from '../pages/LocationSetup';
import AppointmentBooking  from '../pages/AppointmentBooking';
import BookingConfirmation from '../pages/BookingConfirmation';
import PatientDashboard    from '../pages/PatientDashboard';
import QueueTracking       from '../pages/QueueTracking';
import Profile             from '../pages/Profile';
import DoctorDashboard     from '../pages/DoctorDashboard';
import AdminDashboard      from '../pages/AdminDashboard';
import ProtectedRoute      from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/signup"   element={<Signup />} />
      <Route path="/location" element={<LocationSetup />} />

      {/* Patient-only — requires login + location, enforced even on direct URL / back button */}
      <Route path="/book"         element={<ProtectedRoute><AppointmentBooking /></ProtectedRoute>} />
      <Route path="/confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
      <Route path="/dashboard"    element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
      <Route path="/queue"        element={<ProtectedRoute><QueueTracking /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Demo-only role views — no separate staff accounts in this prototype */}
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route path="/admin"  element={<AdminDashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
