/**
 * MediFlow API Service
 * All backend HTTP calls live here. Every function throws on failure so callers
 * can catch and fall back to demo mode — the app always stays functional.
 */
import axios from 'axios';
import { DOCTORS as SAMPLE_DOCTORS } from '../data/sampleData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Health check ─────────────────────────────────────────────────────────────
export async function checkHealth() {
  const { data } = await client.get('/api/health');
  return data; // { status: 'OK', dbConnected, timestamp, service }
}

// ─── Data normalization ───────────────────────────────────────────────────────
// Backend doctor schema uses different field names from the frontend.
// This bridges the gap — merging API data with clinic/distance info from
// sampleData (which isn't stored in MongoDB yet).
export function normalizeDoctorFromAPI(apiDoc) {
  // Merge clinic/distance seeds from local sample data by matching on initials or name
  const sample = SAMPLE_DOCTORS.find(
    (d) => d.initials === apiDoc.initials || d.name === apiDoc.name
  );

  return {
    id:             apiDoc._id,                                     // MongoDB ObjectId string
    name:           apiDoc.name,
    dept:           apiDoc.department,
    spec:           apiDoc.specialization,
    avgTime:        apiDoc.avgConsultationTime || 10,
    rating:         apiDoc.rating || 4.5,
    initials:       apiDoc.initials,
    status:         apiDoc.status || 'available',
    delay:          apiDoc.delayMinutes || 0,
    patientsToday:  apiDoc.totalPatientsToday || 0,
    patientsLeft:   apiDoc.patientsRemaining ?? (apiDoc.totalPatientsToday - (apiDoc.patientsSeenToday || 0)),
    // Clinic / distance — from sample data (not persisted in backend yet)
    clinicName:     sample?.clinicName,
    address:        sample?.address,
    distanceKm:     sample?.distanceKm,
    bearingDeg:     sample?.bearingDeg,
  };
}

// Normalize a queue entry from the API into the frontend shape
export function normalizeQueueEntry(entry) {
  return {
    id:       entry.id   || entry._id,
    name:     entry.patientName || 'Patient',
    position: entry.queuePosition,
    status:   entry.status === 'consulting' ? 'consulting' : 'waiting',
    apptTime: entry.scheduledTime || '—',
    token:    entry.token || '—',
  };
}

// ─── Doctors ──────────────────────────────────────────────────────────────────
export async function fetchDoctors(department = null) {
  const { data } = await client.get('/api/doctors', {
    params: department ? { department } : {},
  });
  return (data.data || []).map(normalizeDoctorFromAPI);
}

// ─── Appointments ─────────────────────────────────────────────────────────────
/**
 * Book a new appointment.
 * @param {{ patientName, patientPhone, doctorId, department, scheduledTime }} payload
 * @returns Full appointment object from API
 */
export async function createAppointment({ patientName, patientPhone, doctorId, department, scheduledTime }) {
  const { data } = await client.post('/api/appointments', {
    patientName, patientPhone, doctorId, department, scheduledTime,
  });
  return data.data;
}

export async function fetchAppointmentsByDoctor(doctorId) {
  const { data } = await client.get('/api/appointments', {
    params: { doctor: doctorId },
  });
  return data.data || [];
}

// ─── Queue ────────────────────────────────────────────────────────────────────
export async function fetchQueue(doctorId) {
  const { data } = await client.get(`/api/queue/doctor/${doctorId}`);
  return {
    doctor:  data.data?.doctor,
    entries: (data.data?.entries || []).map(normalizeQueueEntry),
    total:   data.data?.totalInQueue || 0,
  };
}

export async function completeConsultationAPI(doctorId) {
  const { data } = await client.post(`/api/queue/complete/${doctorId}`);
  return data;
}

export async function markDelayAPI(doctorId, delayMinutes) {
  const { data } = await client.post(`/api/queue/delay/${doctorId}`, { delayMinutes });
  return data;
}

export async function addEmergencyAPI(doctorId) {
  const { data } = await client.post(`/api/queue/emergency/${doctorId}`);
  return data;
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export async function fetchAdminStats() {
  const { data } = await client.get('/api/admin/stats');
  return data.data;
}

export async function fetchDoctorsOverview() {
  const { data } = await client.get('/api/admin/doctors-overview');
  return (data.data || []).map(normalizeDoctorFromAPI);
}
