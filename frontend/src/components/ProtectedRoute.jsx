import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Wrap any patient-only page with this. It enforces, in order:
 *   1. Must be logged in → else redirect to /login (remembers intended page)
 *   2. Must have granted location → else redirect to /location
 *
 * This catches navigation paths the click-handler-level checks in
 * useRequirePatientAccess can't — e.g. the browser Back button, a page
 * refresh, or someone pasting a URL directly into the address bar.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, hasLocation, authChecked } = useApp();
  const location = useLocation();

  // Avoid a flash-redirect before we've finished reading localStorage on first load
  if (!authChecked) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!hasLocation) {
    return <Navigate to="/location" state={{ from: location.pathname }} replace />;
  }
  return children;
}
