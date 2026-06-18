import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Centralizes what should happen whenever the user clicks any "patient flow"
 * CTA (Book Now, Book Appointment, View Live Queue, Get Started Free, etc.):
 *
 *   1. Force the demo role switcher to "patient" — fixes the bug where
 *      clicking these buttons while viewing the Doctor/Admin dashboard left
 *      the app thinking the user was still in Doctor/Admin mode.
 *   2. If not logged in → send to /login, remembering where they wanted to go.
 *   3. If logged in but location hasn't been granted yet → send to /location.
 *   4. Otherwise → go straight to the destination.
 */
export function useRequirePatientAccess() {
  const navigate = useNavigate();
  const { setRole, isAuthenticated, hasLocation } = useApp();

  return function goTo(destination) {
    setRole('patient');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: destination } });
      return;
    }
    if (!hasLocation) {
      navigate('/location', { state: { from: destination } });
      return;
    }
    navigate(destination);
  };
}