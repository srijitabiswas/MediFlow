import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { DOCTORS, generateQueue } from '../data/sampleData';
import { requestBrowserLocation, getClinicCoordinates, haversineDistance } from '../utils/distance';

const Ctx = createContext(null);

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS_USERS        = 'mediflow_users';        // { [phone]: userRecord } — all registered accounts (demo only)
const LS_SESSION       = 'mediflow_session_phone'; // phone of the currently logged-in user
const LS_APPOINTMENTS  = 'mediflow_appointments';  // { [phone]: appointment[] }

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy-mode errors — non-critical for a demo */
  }
}

export function AppProvider({ children }) {
  // ── Auth state ───────────────────────────────────────────────────────────
  const [users, setUsers]   = useState(() => readLS(LS_USERS, {}));     // { phone: { fullName, age, phone, password, location } }
  const [user, setUser]     = useState(null);                           // currently logged-in user object (no password exposed)
  const [authChecked, setAuthChecked] = useState(false);                // avoids flash-of-login on first paint

  // ── Role (Patient / Doctor / Admin demo switcher — unrelated to auth) ─────
  const [role, setRole] = useState('patient');

  // ── Live doctor + queue data (unchanged from before) ──────────────────────
  const [doctors, setDoctors] = useState(DOCTORS);
  const [queues,  setQueues]  = useState(() => {
    const q = {};
    DOCTORS.forEach((d) => { q[d.id] = generateQueue(d.id); });
    return q;
  });

  // ── Appointments — keyed per user phone so multiple demo accounts work ────
  const [appointmentsByUser, setAppointmentsByUser] = useState(() => readLS(LS_APPOINTMENTS, {}));

  // ── Toasts ──────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  // ── Restore session on first load ──────────────────────────────────────
  useEffect(() => {
    const sessionPhone = readLS(LS_SESSION, null);
    if (sessionPhone && users[sessionPhone]) {
      const { password, ...safeUser } = users[sessionPhone];
      setUser(safeUser);
    }
    setAuthChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist users / appointments whenever they change ─────────────────────
  useEffect(() => { writeLS(LS_USERS, users); }, [users]);
  useEffect(() => { writeLS(LS_APPOINTMENTS, appointmentsByUser); }, [appointmentsByUser]);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  // ── Auth actions ────────────────────────────────────────────────────────

  const signup = useCallback(({ fullName, age, phone, password }) => {
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (!fullName?.trim())        return { ok: false, error: 'Please enter your full name.' };
    if (!age || age < 1 || age > 120) return { ok: false, error: 'Please enter a valid age.' };
    if (cleanPhone.length !== 10) return { ok: false, error: 'Phone number must be exactly 10 digits.' };
    if (!password || password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };
    if (users[cleanPhone])        return { ok: false, error: 'An account with this phone number already exists. Please log in instead.' };

    const newUser = {
      fullName: fullName.trim(),
      age: Number(age),
      phone: cleanPhone,
      password, // NOTE: plaintext only acceptable for a local hackathon demo — never do this in production
      location: null,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => ({ ...prev, [cleanPhone]: newUser }));
    const { password: _pw, ...safeUser } = newUser;
    setUser(safeUser);
    writeLS(LS_SESSION, cleanPhone);
    return { ok: true };
  }, [users]);

  const login = useCallback((phone, password) => {
    const cleanPhone = String(phone).replace(/\D/g, '');
    const record = users[cleanPhone];
    if (!record)                      return { ok: false, error: 'No account found with this phone number.' };
    if (record.password !== password) return { ok: false, error: 'Incorrect password. Please try again.' };

    const { password: _pw, ...safeUser } = record;
    setUser(safeUser);
    writeLS(LS_SESSION, cleanPhone);
    return { ok: true };
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    writeLS(LS_SESSION, null);
    setRole('patient');
    addToast('You have been logged out.', 'info');
  }, [addToast]);

  const updateProfile = useCallback((patch) => {
    if (!user) return;
    setUsers((prev) => ({ ...prev, [user.phone]: { ...prev[user.phone], ...patch } }));
    setUser((prev) => ({ ...prev, ...patch }));
    addToast('Profile updated.', 'success');
  }, [user, addToast]);

  // ── Location ────────────────────────────────────────────────────────────

  const setUserLocation = useCallback((loc) => {
    if (!user) return;
    updateProfile({ location: loc });
  }, [user, updateProfile]);

  const requestLocation = useCallback(async () => {
    const loc = await requestBrowserLocation(); // throws if denied/unsupported
    setUserLocation(loc);
    return loc;
  }, [setUserLocation]);

  // ── Doctors enriched with live distance from the user's location ──────────
  const doctorsWithDistance = useMemo(() => {
    if (!user?.location) return doctors.map((d) => ({ ...d, distanceFromUserKm: null, coords: null }));
    return doctors.map((d) => {
      const coords = getClinicCoordinates(user.location.lat, user.location.lng, d.distanceKm, d.bearingDeg);
      const distanceFromUserKm = haversineDistance(user.location.lat, user.location.lng, coords.lat, coords.lng);
      return { ...d, distanceFromUserKm, coords };
    });
  }, [doctors, user?.location]);

  // ── Doctor updates (delay, status change) ─────────────────────────────────
  const updateDoctor = useCallback((docId, patch) => {
    setDoctors((prev) => prev.map((d) => (d.id === docId ? { ...d, ...patch } : d)));
  }, []);

  // ── Queue mutations ────────────────────────────────────────────────────────
  const updateQueue = useCallback((docId, updaterFn) => {
    setQueues((prev) => ({ ...prev, [docId]: updaterFn(prev[docId] || []) }));
  }, []);

  // ── Complete top consultation → advance queue ──────────────────────────────
  const completeConsultation = useCallback((docId) => {
    setQueues((prev) => {
      const q = (prev[docId] || []).filter((p) => p.status !== 'consulting');
      const updated = q.map((p, i) => ({ ...p, position: i + 1, status: i === 0 ? 'consulting' : 'waiting' }));
      return { ...prev, [docId]: updated };
    });
    setDoctors((prev) => prev.map((d) => d.id === docId ? { ...d, patientsLeft: Math.max(0, d.patientsLeft - 1) } : d));
    addToast('Consultation complete. Next patient called.', 'success');
  }, [addToast]);

  // ── Mark doctor delay ──────────────────────────────────────────────────────
  const markDelay = useCallback((docId, extraMins) => {
    setDoctors((prev) =>
      prev.map((d) => d.id === docId ? { ...d, delay: (d.delay || 0) + extraMins, status: 'delayed' } : d)
    );
    addToast(`⚠ ${extraMins} min delay marked — all patients notified.`, 'warning');
  }, [addToast]);

  // ── Add emergency patient ──────────────────────────────────────────────────
  const addEmergency = useCallback((docId) => {
    const emg = {
      id: `EMG-${Date.now()}`, name: 'Emergency Patient',
      position: 1, status: 'consulting',
      apptTime: 'NOW — URGENT', token: 'EMG',
    };
    setQueues((prev) => {
      const existing = (prev[docId] || []).map((p, i) => ({ ...p, position: i + 2, status: 'waiting' }));
      return { ...prev, [docId]: [emg, ...existing] };
    });
    setDoctors((prev) =>
      prev.map((d) => d.id === docId ? { ...d, status: 'emergency', delay: (d.delay || 0) + 15 } : d)
    );
    addToast('🚨 Emergency case added! Queue reordered. All patients notified.', 'error');
  }, [addToast]);

  // ── Appointments (per logged-in user) ──────────────────────────────────────
  const appointments = useMemo(
    () => (user ? appointmentsByUser[user.phone] || [] : []),
    [appointmentsByUser, user]
  );

  // The single most relevant "active" appointment — most recent upcoming one
  const myBooking = useMemo(
    () => appointments.find((a) => a.status === 'upcoming') || appointments[0] || null,
    [appointments]
  );

  const bookAppointment = useCallback((bookingData) => {
    if (!user) return null;
    const booking = { ...bookingData, status: 'upcoming' };
    setAppointmentsByUser((prev) => ({
      ...prev,
      [user.phone]: [booking, ...(prev[user.phone] || [])],
    }));
    return booking;
  }, [user]);

  const markAppointmentCompleted = useCallback((appointmentId) => {
    if (!user) return;
    setAppointmentsByUser((prev) => ({
      ...prev,
      [user.phone]: (prev[user.phone] || []).map((a) =>
        a.id === appointmentId ? { ...a, status: 'completed', completedAt: new Date().toISOString() } : a
      ),
    }));
    addToast('Visit marked as completed — moved to your history.', 'success');
  }, [user, addToast]);

  const cancelAppointment = useCallback((appointmentId) => {
    if (!user) return;
    setAppointmentsByUser((prev) => ({
      ...prev,
      [user.phone]: (prev[user.phone] || []).map((a) =>
        a.id === appointmentId ? { ...a, status: 'cancelled' } : a
      ),
    }));
    addToast('Appointment cancelled.', 'info');
  }, [user, addToast]);

  return (
    <Ctx.Provider value={{
      // auth
      user, isAuthenticated: !!user, authChecked,
      signup, login, logout, updateProfile,
      // location
      requestLocation, setUserLocation,
      hasLocation: !!user?.location,
      // role (demo switcher)
      role, setRole,
      // doctors / queues
      doctors: doctorsWithDistance, updateDoctor,
      queues,  updateQueue,
      // appointments
      appointments, myBooking, bookAppointment, markAppointmentCompleted, cancelAppointment,
      // toasts
      toasts,  addToast,
      // doctor-side actions
      completeConsultation,
      markDelay,
      addEmergency,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};