/**
 * MediFlow Socket.io Client Service
 * Manages a single shared socket connection. All components subscribe via
 * this module rather than creating their own connections.
 */
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

// ── Lifecycle ─────────────────────────────────────────────────────────────────

export function initSocket() {
  if (socket) return socket;

  socket = io(BASE_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 6000,
    autoConnect: false,
  });

  socket.on('connect',       () => console.log('[Socket] Connected to MediFlow backend'));
  socket.on('disconnect',    () => console.log('[Socket] Disconnected'));
  socket.on('connect_error', (e) => console.warn('[Socket] Connection error:', e.message));

  return socket;
}

export function connectSocket() {
  const s = initSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}

export function getSocket() {
  return socket;
}

// ── Room subscriptions ────────────────────────────────────────────────────────

/** Patient tracking a specific doctor's queue */
export function subscribeToQueue(doctorId, token = '') {
  const s = getSocket();
  if (!s) return;
  const join = () => s.emit('patient:subscribe', { doctorId, token });
  s.connected ? join() : s.once('connect', join);
}

/** Doctor viewing their own dashboard */
export function subscribeAsDoctor(doctorId) {
  const s = getSocket();
  if (!s) return;
  const join = () => s.emit('doctor:subscribe', { doctorId });
  s.connected ? join() : s.once('connect', join);
}

/** Admin panel */
export function subscribeAsAdmin() {
  const s = getSocket();
  if (!s) return;
  const join = () => s.emit('admin:subscribe');
  s.connected ? join() : s.once('connect', join);
}
