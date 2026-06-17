# MediFlow Backend — Express + MongoDB + Socket.io

Real REST API and real-time engine behind MediFlow. This is fully independent from the frontend's demo mode — the frontend works standalone with sample data, and this backend is a complete, production-style API you can wire it up to.

## 🧱 Stack
Node.js · Express · MongoDB (Mongoose) · Socket.io

## 📁 Structure
```
backend/
├── models/         Doctor, Patient, Appointment, Queue (Mongoose schemas)
├── routes/          doctors, appointments, queue, admin (REST endpoints)
├── socket/          queueSocket.js — Socket.io room & event handling
├── seed/            seed.js — generates 15 doctors, 80 patients, realistic appointments
├── utils/           aiEngine.js — wait-time formula + Smart Decision logic (mirrors frontend)
├── server.js        Express + Socket.io entry point
└── .env.example
```

## ⚙️ Setup

### 1. Get a MongoDB connection
Pick ONE:
- **Local MongoDB** — install from mongodb.com/try/download/community, then it runs on `mongodb://localhost:27017`
- **MongoDB Atlas (free, no install)** — create a free cluster at mongodb.com/cloud/atlas, get your connection string (recommended if you don't want to install anything before tomorrow's submission)

### 2. Configure environment
```bash
cd backend
cp .env.example .env
```
Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/mediflow
# or for Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mediflow
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Install & seed
```bash
npm install
npm run seed
```
You should see:
```
✅ MongoDB connected
👨‍⚕️  Seeded 15 doctors
👥  Seeded 80 patients
📋  Seeded ~90 appointments
```

### 4. Run
```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```
Server runs at **http://localhost:5000**. Health check: `GET /api/health`

## 📡 API Reference

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors` | List all doctors (`?department=card` to filter) |
| GET | `/api/doctors/:id` | Get one doctor |
| PATCH | `/api/doctors/:id/status` | Update status/delay manually |
| POST | `/api/doctors` | Create a doctor (admin) |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments` | List appointments (`?doctor=`, `?status=`, `?date=`) |
| POST | `/api/appointments` | Book a new appointment — runs the AI wait engine and returns token + queue position |
| GET | `/api/appointments/:id` | Get one appointment (by Mongo `_id` or `appointmentId`) |

### Queue (real-time core)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/queue/doctor/:doctorId` | Live queue snapshot for a doctor |
| POST | `/api/queue/complete/:doctorId` | Complete current consultation → advances queue, emits `queue:updated` |
| POST | `/api/queue/delay/:doctorId` | Mark a delay `{ "delayMinutes": 10 }` → emits `doctor:delay` + `queue:updated` |
| POST | `/api/queue/emergency/:doctorId` | Insert an emergency patient at the front → emits `queue:emergency` + `queue:updated` |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Hospital-wide KPIs (appointments, avg wait, delays, dept breakdown) |
| GET | `/api/admin/doctors-overview` | All doctors with live queue size + completed count |

## 🔌 Socket.io Events

**Client emits:**
- `patient:subscribe { doctorId, token }` — join a doctor's queue room
- `doctor:subscribe { doctorId }` — doctor dashboard joins their own room
- `admin:subscribe` — admin joins the admin room

**Server emits (broadcast to all):**
- `queue:updated` — `{ doctorId, doctorName, entries, delayMinutes, status }`
- `doctor:delay` — `{ doctorId, doctorName, delayMinutes, message }`
- `queue:emergency` — `{ doctorId, doctorName, message }`
- `queue:newBooking` — fired when a new appointment is booked

## 🤖 AI Wait Engine (`utils/aiEngine.js`)
```
EstimatedWait = (PatientsAhead × AvgConsultationTime) + DelayMinutes
Confidence    = 97 − (PatientsAhead × 2) − (8 if delayed else 0), clamped to [68, 97]
```
This exact formula is mirrored in the frontend (`src/utils/aiEngine.js`) so both stay consistent even without the backend running.

## ⚠️ Notes for tomorrow's submission
- This sandbox couldn't run a live MongoDB instance to fully integration-test (no DB binary available here), but every route file has been syntax-checked, the Express server boot-tested, Socket.io initialization verified, and the queue logic manually re-reviewed for correctness (including a fixed bug where an emergency case could leave two patients simultaneously marked "consulting").
- **Test this yourself before presenting**: run `npm run seed` then hit `GET /api/doctors` — if you see a JSON list of 15 doctors, you're good.
- The frontend currently runs in **self-contained demo mode** (no network calls) — it does NOT require this backend to work and demo perfectly. Wiring them together is a safe next step but not required for submission.
