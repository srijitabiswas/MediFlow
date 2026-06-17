import { DEPARTMENTS, DOCTORS } from '../data/sampleData';

// ─── Format wait time ─────────────────────────────────────────────────────────
export function formatWait(mins) {
  if (mins <= 0) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
}

// ─── Format 12-hour time string ──────────────────────────────────────────────
export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ─── Format date ─────────────────────────────────────────────────────────────
export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Short date ──────────────────────────────────────────────────────────────
export function shortDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Generate unique appointment ID ──────────────────────────────────────────
export function generateApptId() {
  const ts   = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `APT-${ts}-${rand}`;
}

// ─── Get department object by id ──────────────────────────────────────────────
export function getDept(deptId) {
  return DEPARTMENTS.find((d) => d.id === deptId) || DEPARTMENTS[0];
}

// ─── Get doctor object by id ─────────────────────────────────────────────────
export function getDoctor(docId) {
  return DOCTORS.find((d) => d.id === docId);
}

// ─── Status label + badge class ──────────────────────────────────────────────
export function statusInfo(status, delay = 0) {
  const MAP = {
    available:  { label: 'Available',        cls: 'badge-green'  },
    consulting: { label: 'In Consultation',  cls: 'badge-blue'   },
    delayed:    { label: `${delay} min late`, cls: 'badge-yellow' },
    emergency:  { label: 'Emergency!',       cls: 'badge-red'    },
    break:      { label: 'On Break',         cls: 'badge-yellow' },
  };
  return MAP[status] || MAP.available;
}

// ─── Star string ─────────────────────────────────────────────────────────────
export function starString(rating) {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}
