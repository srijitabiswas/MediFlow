import { createContext, useContext, useState, useCallback } from 'react';
import { DOCTORS, generateQueue } from '../data/sampleData';

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [role,      setRole]      = useState('patient');          // 'patient' | 'doctor' | 'admin'
  const [myBooking, setMyBooking] = useState(null);               // confirmed booking object
  const [doctors,   setDoctors]   = useState(DOCTORS);            // live doctor list (mutated on delays, etc.)
  const [queues,    setQueues]    = useState(() => {              // { [doctorId]: QueueEntry[] }
    const q = {};
    DOCTORS.forEach((d) => { q[d.id] = generateQueue(d.id); });
    return q;
  });
  const [toasts, setToasts] = useState([]);                       // notification toasts

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

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

  return (
    <Ctx.Provider value={{
      role, setRole,
      myBooking, setMyBooking,
      doctors, updateDoctor,
      queues,  updateQueue,
      toasts,  addToast,
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
