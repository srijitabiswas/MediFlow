const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── Database ─────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediflow';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected:', MONGO_URI))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ─── REST Routes ──────────────────────────────────────────────────────────────
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1; // 1 = connected
  res.json({
    status: 'OK',
    dbConnected,
    timestamp: new Date().toISOString(),
    service: 'MediFlow API',
  });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
require('./socket/queueSocket')(io);

// Attach io to app so routes can emit events
app.set('io', io);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 MediFlow server running at http://localhost:${PORT}`);
  console.log(`   Socket.io ready for real-time queue updates`);
});
