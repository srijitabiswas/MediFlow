/**
 * MediFlow Socket.io Event Handler
 * Manages real-time queue updates, doctor status changes, and notifications
 */
module.exports = function (io) {
  const connectedClients = new Map(); // socketId -> { role, doctorId, patientToken }

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // ─── Join Rooms ─────────────────────────────────────────────────────────

    // Patient subscribes to a specific doctor's queue
    socket.on('patient:subscribe', ({ doctorId, token }) => {
      socket.join(`queue:${doctorId}`);
      connectedClients.set(socket.id, { role: 'patient', doctorId, token });
      console.log(`[Socket] Patient (token: ${token}) subscribed to queue:${doctorId}`);
      socket.emit('patient:subscribed', { message: 'You are now tracking the live queue.', doctorId });
    });

    // Doctor subscribes to their own queue room
    socket.on('doctor:subscribe', ({ doctorId }) => {
      socket.join(`doctor:${doctorId}`);
      connectedClients.set(socket.id, { role: 'doctor', doctorId });
      console.log(`[Socket] Doctor subscribed: ${doctorId}`);
      socket.emit('doctor:subscribed', { message: 'Dashboard connected.', doctorId });
    });

    // Admin subscribes to all events
    socket.on('admin:subscribe', () => {
      socket.join('admin');
      connectedClients.set(socket.id, { role: 'admin' });
      console.log(`[Socket] Admin connected`);
      socket.emit('admin:subscribed', { message: 'Admin panel connected.' });
    });

    // ─── Queue Events ────────────────────────────────────────────────────────

    // Ping/pong for connection health
    socket.on('ping', () => socket.emit('pong', { ts: Date.now() }));

    // ─── Disconnect ──────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      connectedClients.delete(socket.id);
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  // Broadcast helpers (called from routes via io.emit)
  // These are global events — all clients will receive them and filter client-side

  return io;
};
