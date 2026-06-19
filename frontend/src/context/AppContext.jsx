/**
 * MediFlow App Context
 * ─────────────────────────────────────────────────────────────────────────────
 * Global state for the whole app. Works in two modes:
 *
 *  LIVE mode   — backend is reachable. Doctors load from MongoDB, bookings
 *                persist to the database, queue updates arrive via Socket.io.
 *
 *  DEMO mode   — backend is offline (or not seeded yet). Everything runs on
 *                the local sample data with setInterval simulations. The UI
 *                is 100% functional; a subtle "Demo Mode" banner is shown.
 *
 * Mode detection happens once on mount (health check). All async calls wrap
 * in try/catch and degrade gracefully — the app never crashes on API failure.
 */
import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { DOCTORS as SAMPLE_DOCTORS, generateQueue } from '../data/sampleData';
import { requestBrowserLocation, getClinicCoordinates, haversineDistance } from '../utils/distance';
import {
  checkHealth,
  fetchDoctors,
  fetchQueue,
  createAppointment,
  completeConsultationAPI,
  markDelayAPI,
  addEmergencyAPI,
  normalizeQueueEntry,
} from '../services/api';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  subscribeToQueue,
  subscribeAsDoctor,
  subscribeAsAdmin,
} from '../services/socket';

const Ctx = createContext(null);

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_USERS       = 'mediflow_users';
const LS_SESSION     = 'mediflow_session_phone';
const LS_APPOINTMENTS = 'mediflow_appointments';

function readLS(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function writeLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota / incognito */ }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [users,    setUsers]    = useState(() => readLS(LS_USERS, {}));
  const [user,     setUser]     = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Role ──────────────────────────────────────────────────────────────────
  const [role, setRole] = useState('patient');

  // ── Backend status ────────────────────────────────────────────────────────
  const [backendOnline, setBackendOnline] = useState(false);

  // ── Doctors & queues ──────────────────────────────────────────────────────
  const [doctors, setDoctors] = useState(SAMPLE_DOCTORS);
  const [queues,  setQueues]  = useState(() => {
    const q = {};
    SAMPLE_DOCTORS.forEach((d) => { q[d.id] = generateQueue(d.id); });
    return q;
  });

  // ── Appointments (per-user, localStorage) ────────────────────────────────
  const [appointmentsByUser, setAppointmentsByUser] = useState(() => readLS(LS_APPOINTMENTS, {}));

  // ── Toasts ────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  // Ref to know whether we're in live mode without needing it in dep arrays
  const backendOnlineRef = useRef(false);
  useEffect(() => { backendOnlineRef.current = backendOnline; }, [backendOnline]);

  // ── Restore auth session on mount ─────────────────────────────────────────
  useEffect(() => {
    const phone = readLS(LS_SESSION, null);
    if (phone && users[phone]) {
      const { password: _, ...safe } = users[phone];
      setUser(safe);
    }
    setAuthChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist users + appointments ──────────────────────────────────────────
  useEffect(() => { writeLS(LS_USERS, users); }, [users]);
  useEffect(() => { writeLS(LS_APPOINTMENTS, appointmentsByUser); }, [appointmentsByUser]);

  // ── Backend connection: health check → load doctors → connect socket ──────
  useEffect(() => {
    let demoInterval = null;
    let mounted = true;

    async function init() {
      try {
        const health = await checkHealth();

        // Backend process responding is not enough — without a connected
        // database there are no real doctors/queues to serve, and routes
        // that touch MongoDB will time out. Treat that as offline so the
        // demo-mode simulation (below) correctly kicks in instead of the
        // app silently freezing in a half-live state.
        if (!health.dbConnected) throw new Error('Backend reachable but database not connected');

        if (!mounted) return;
        setBackendOnline(true);

        // Load real doctors from MongoDB
        try {
          const liveDoctors = await fetchDoctors();
          if (mounted && liveDoctors.length) {
            setDoctors(liveDoctors);

            // IMPORTANT: queues state was initialized keyed by the demo
            // numeric IDs (1–15). Live doctors use MongoDB ObjectId strings,
            // so we must fetch real queues and re-key the whole object —
            // otherwise every page would look up queues[mongoId] and find
            // nothing, even though doctors loaded correctly.
            const queueResults = await Promise.all(
              liveDoctors.map((d) =>
                fetchQueue(d.id).then((res) => [d.id, res.entries]).catch(() => [d.id, []])
              )
            );
            if (mounted) {
              const liveQueues = {};
              queueResults.forEach(([id, entries]) => { liveQueues[id] = entries; });
              setQueues(liveQueues);
            }
          }
        } catch (e) {
          console.warn('[API] Could not load doctors — keeping sample data');
        }

        // Connect socket and wire events
        const socket = connectSocket();

        socket.on('queue:updated', ({ doctorId, entries, delayMinutes, status }) => {
          if (!mounted) return;
          if (entries?.length) {
            setQueues((prev) => ({
              ...prev,
              [doctorId]: entries.map(normalizeQueueEntry),
            }));
          }
          setDoctors((prev) =>
            prev.map((d) =>
              String(d.id) === String(doctorId)
                ? { ...d, delay: delayMinutes ?? d.delay, status: status ?? d.status }
                : d
            )
          );
        });

        socket.on('doctor:delay', ({ doctorId, delayMinutes, message }) => {
          if (!mounted) return;
          setDoctors((prev) =>
            prev.map((d) =>
              String(d.id) === String(doctorId)
                ? { ...d, delay: delayMinutes, status: 'delayed' }
                : d
            )
          );
          if (message) addToast(`⚠ ${message}`, 'warning');
        });

        socket.on('queue:emergency', ({ message }) => {
          if (!mounted) return;
          if (message) addToast(`🚨 ${message}`, 'error');
        });

        socket.on('queue:newBooking', ({ doctorId }) => {
          // Quietly refresh queue for that doctor — fire and forget
          fetchQueue(doctorId)
            .then(({ entries }) => {
              if (mounted) setQueues((prev) => ({ ...prev, [doctorId]: entries }));
            })
            .catch(() => {});
        });

      } catch (err) {
        if (!mounted) return;
        console.log(`[MediFlow] Running in demo mode (${err.message || 'backend unreachable'})`);
        setBackendOnline(false);

        // Demo-mode: simulate queue movement every 12 s
        demoInterval = setInterval(() => {
          if (!mounted) return;
          setQueues((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((docId) => {
              const q = next[docId];
              if (q.length > 1) {
                const updated = q.slice(1).map((p, i) => ({
                  ...p, position: i + 1, status: i === 0 ? 'consulting' : 'waiting',
                }));
                next[docId] = updated;
              }
            });
            return next;
          });
        }, 12000);
      }
    }

    init();

    return () => {
      mounted = false;
      clearInterval(demoInterval);
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const signup = useCallback(({ fullName, age, phone, password }) => {
    const p = String(phone).replace(/\D/g, '');
    if (!fullName?.trim())             return { ok: false, error: 'Please enter your full name.' };
    if (!age || age < 1 || age > 120)  return { ok: false, error: 'Please enter a valid age.' };
    if (p.length !== 10)               return { ok: false, error: 'Phone number must be exactly 10 digits.' };
    if (!password || password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };
    if (users[p])                      return { ok: false, error: 'An account with this phone already exists.' };

    const newUser = { fullName: fullName.trim(), age: Number(age), phone: p, password, location: null, createdAt: new Date().toISOString() };
    setUsers((prev) => ({ ...prev, [p]: newUser }));
    const { password: _, ...safe } = newUser;
    setUser(safe);
    writeLS(LS_SESSION, p);
    return { ok: true };
  }, [users]);

  const login = useCallback((phone, password) => {
    const p = String(phone).replace(/\D/g, '');
    const rec = users[p];
    if (!rec)                   return { ok: false, error: 'No account found with this phone number.' };
    if (rec.password !== password) return { ok: false, error: 'Incorrect password. Please try again.' };
    const { password: _, ...safe } = rec;
    setUser(safe);
    writeLS(LS_SESSION, p);
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

  // ── Location ──────────────────────────────────────────────────────────────
  const setUserLocation = useCallback((loc) => {
    if (!user) return;
    setUsers((prev) => ({ ...prev, [user.phone]: { ...prev[user.phone], location: loc } }));
    setUser((prev) => ({ ...prev, location: loc }));
  }, [user]);

  const requestLocation = useCallback(async () => {
    const loc = await requestBrowserLocation();
    setUserLocation(loc);
    return loc;
  }, [setUserLocation]);

  // ── Doctors enriched with distance from user's location ───────────────────
  const doctorsWithDistance = useMemo(() => {
    if (!user?.location) return doctors.map((d) => ({ ...d, distanceFromUserKm: null }));
    return doctors.map((d) => {
      if (!d.distanceKm || !d.bearingDeg) return { ...d, distanceFromUserKm: null };
      const coords = getClinicCoordinates(user.location.lat, user.location.lng, d.distanceKm, d.bearingDeg);
      const distanceFromUserKm = haversineDistance(user.location.lat, user.location.lng, coords.lat, coords.lng);
      return { ...d, distanceFromUserKm };
    });
  }, [doctors, user?.location]);

  // ── Doctor state mutations ─────────────────────────────────────────────────
  const updateDoctor = useCallback((docId, patch) => {
    setDoctors((prev) => prev.map((d) => (String(d.id) === String(docId) ? { ...d, ...patch } : d)));
  }, []);

  const updateQueue = useCallback((docId, updaterFn) => {
    setQueues((prev) => ({ ...prev, [docId]: updaterFn(prev[docId] || []) }));
  }, []);

  // ── Complete consultation ──────────────────────────────────────────────────
  const completeConsultation = useCallback(async (docId) => {
    // Optimistic local update first — UI stays instant
    setQueues((prev) => {
      const q = (prev[docId] || []).filter((p) => p.status !== 'consulting');
      return { ...prev, [docId]: q.map((p, i) => ({ ...p, position: i + 1, status: i === 0 ? 'consulting' : 'waiting' })) };
    });
    setDoctors((prev) => prev.map((d) =>
      String(d.id) === String(docId) ? { ...d, patientsLeft: Math.max(0, (d.patientsLeft || 1) - 1) } : d
    ));
    addToast('Consultation complete. Next patient called.', 'success');

    // Background sync to backend
    if (backendOnlineRef.current) {
      try { await completeConsultationAPI(docId); }
      catch (e) { console.warn('[API] completeConsultation sync failed:', e.message); }
    }
  }, [addToast]);

  // ── Mark delay ────────────────────────────────────────────────────────────
  const markDelay = useCallback(async (docId, extraMins) => {
    setDoctors((prev) => prev.map((d) =>
      String(d.id) === String(docId)
        ? { ...d, delay: (d.delay || 0) + extraMins, status: 'delayed' }
        : d
    ));
    addToast(`⚠ ${extraMins} min delay marked — all patients notified.`, 'warning');

    if (backendOnlineRef.current) {
      try { await markDelayAPI(docId, extraMins); }
      catch (e) { console.warn('[API] markDelay sync failed:', e.message); }
    }
  }, [addToast]);

  // ── Add emergency ──────────────────────────────────────────────────────────
  const addEmergency = useCallback(async (docId) => {
    const emg = {
      id: `EMG-${Date.now()}`, name: 'Emergency Patient',
      position: 1, status: 'consulting',
      apptTime: 'NOW — URGENT', token: 'EMG',
    };
    setQueues((prev) => {
      const existing = (prev[docId] || []).map((p, i) => ({ ...p, position: i + 2, status: 'waiting' }));
      return { ...prev, [docId]: [emg, ...existing] };
    });
    setDoctors((prev) => prev.map((d) =>
      String(d.id) === String(docId)
        ? { ...d, status: 'emergency', delay: (d.delay || 0) + 15 }
        : d
    ));
    addToast('🚨 Emergency case added! Queue reordered.', 'error');

    if (backendOnlineRef.current) {
      try { await addEmergencyAPI(docId); }
      catch (e) { console.warn('[API] addEmergency sync failed:', e.message); }
    }
  }, [addToast]);

  // ── Appointments ──────────────────────────────────────────────────────────
  const appointments = useMemo(
    () => (user ? appointmentsByUser[user.phone] || [] : []),
    [appointmentsByUser, user]
  );

  const myBooking = useMemo(
    () => appointments.find((a) => a.status === 'upcoming') || null,
    [appointments]
  );

  const bookAppointment = useCallback(async (localBookingData) => {
    if (!user) return null;

    let booking = { ...localBookingData, status: 'upcoming' };

    // Try to book via real API — enriches with real appointmentId, token, queue position
    if (backendOnlineRef.current) {
      try {
        const apiResult = await createAppointment({
          patientName:   user.fullName,
          patientPhone:  user.phone,
          doctorId:      localBookingData.doctor.id,   // MongoDB _id when in live mode
          department:    localBookingData.dept.id,
          scheduledTime: localBookingData.slot.time,
        });

        // Merge real API data over the locally-generated data
        booking = {
          ...booking,
          id:            apiResult.appointmentId,
          token:         apiResult.token,
          queuePosition: apiResult.queuePosition,
          patientsAhead: apiResult.patientsAhead,
          waitMins:      apiResult.estimatedWaitMinutes,
          confidence:    apiResult.aiConfidence,
        };
      } catch (e) {
        console.warn('[API] createAppointment failed — using local booking data:', e.message);
      }
    }

    // Always write to localStorage (works offline + survives page refresh)
    setAppointmentsByUser((prev) => ({
      ...prev,
      [user.phone]: [booking, ...(prev[user.phone] || [])],
    }));
    return booking;
  }, [user]);

  const markAppointmentCompleted = useCallback((id) => {
    if (!user) return;
    setAppointmentsByUser((prev) => ({
      ...prev,
      [user.phone]: (prev[user.phone] || []).map((a) =>
        a.id === id ? { ...a, status: 'completed', completedAt: new Date().toISOString() } : a
      ),
    }));
    addToast('Visit marked as completed — moved to history.', 'success');
  }, [user, addToast]);

  const cancelAppointment = useCallback((id) => {
    if (!user) return;
    setAppointmentsByUser((prev) => ({
      ...prev,
      [user.phone]: (prev[user.phone] || []).map((a) =>
        a.id === id ? { ...a, status: 'cancelled' } : a
      ),
    }));
    addToast('Appointment cancelled.', 'info');
  }, [user, addToast]);

  // ── Socket room subscription helpers (called by individual pages) ──────────
  const subscribeQueueRoom = useCallback((doctorId, token) => {
    if (backendOnlineRef.current) subscribeToQueue(doctorId, token);
  }, []);

  const subscribeDoctorRoom = useCallback((doctorId) => {
    if (backendOnlineRef.current) subscribeAsDoctor(doctorId);
  }, []);

  const subscribeAdminRoom = useCallback(() => {
    if (backendOnlineRef.current) subscribeAsAdmin();
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────
  return (
    <Ctx.Provider value={{
      // auth
      user, isAuthenticated: !!user, authChecked,
      signup, login, logout, updateProfile,

      // location
      requestLocation, setUserLocation,
      hasLocation: !!user?.location,

      // role
      role, setRole,

      // backend status
      backendOnline,

      // doctors + queues
      doctors: doctorsWithDistance, updateDoctor,
      queues, updateQueue,

      // appointments
      appointments, myBooking,
      bookAppointment, markAppointmentCompleted, cancelAppointment,

      // doctor dashboard actions
      completeConsultation, markDelay, addEmergency,

      // socket room subscriptions
      subscribeQueueRoom, subscribeDoctorRoom, subscribeAdminRoom,

      // toasts
      toasts, addToast,
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
