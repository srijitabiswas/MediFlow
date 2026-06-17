import { Routes, Route, Navigate } from 'react-router-dom';
import Landing             from '../pages/Landing';
import AppointmentBooking  from '../pages/AppointmentBooking';
import BookingConfirmation from '../pages/BookingConfirmation';
import PatientDashboard    from '../pages/PatientDashboard';
import QueueTracking       from '../pages/QueueTracking';
import DoctorDashboard     from '../pages/DoctorDashboard';
import AdminDashboard      from '../pages/AdminDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"             element={<Landing />} />
      <Route path="/book"         element={<AppointmentBooking />} />
      <Route path="/confirmation" element={<BookingConfirmation />} />
      <Route path="/dashboard"    element={<PatientDashboard />} />
      <Route path="/queue"        element={<QueueTracking />} />
      <Route path="/doctor"       element={<DoctorDashboard />} />
      <Route path="/admin"        element={<AdminDashboard />} />
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
  );
}
