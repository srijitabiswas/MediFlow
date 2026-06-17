# MediFlow — AI-Powered Hospital Queue & Appointment System

A hackathon prototype that removes hospital waiting uncertainty with live queue tracking, AI wait-time prediction, a Smart Decision Assistant, and delay transparency.

## ✨ Core Features
- **Booking flow** — Department → Doctor → Time Slot → Confirm, in under 30 seconds
- **Live Queue Tracking** — position, patients ahead, doctor status, auto-updating every 12s
- **Smart Decision Assistant** — tells the patient exactly when to leave home
- **AI Wait Engine** — `Wait = (PatientsAhead × AvgConsultTime) + Delay`, with a simulated confidence score
- **Delay Transparency** — doctors mark delays / emergencies, all patients see updates instantly
- **Doctor Dashboard** — start/complete consultations, mark delay, add emergency case
- **Admin Dashboard** — hospital-wide KPIs, department load, delay alerts
- **MediFlow Assistant chatbot** — floating widget, rule-based responses (no LLM needed)
- **Back button on every page** for elderly/non-technical users
- 15 doctors, 80 patient names, 5 departments of realistic sample data

## 🗂 Project Structure
```
MediFlow/
├── public/
├── src/
│   ├── assets/                 (doctors / icons / images — empty, ready for real photos)
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── AppointmentBooking.jsx
│   │   ├── BookingConfirmation.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── QueueTracking.jsx
│   │   ├── DoctorDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── components/
│   │   ├── Navbar.jsx, ChatBot.jsx, Toast.jsx, BackButton.jsx
│   │   ├── cards/        (QueueCard, DoctorCard, AppointmentCard, SmartDecisionCard, StatsCard)
│   │   ├── booking/      (DepartmentSelector, DoctorSelector, TimeSlotSelector, BookingSummary)
│   │   └── dashboard/    (QueueProgress, WaitTimeWidget, DoctorStatus, NotificationPanel)
│   ├── data/sampleData.js
│   ├── context/AppContext.jsx
│   ├── utils/             (aiEngine.js, chatbotData.js, helpers.js)
│   ├── routes/AppRoutes.jsx
│   ├── App.jsx, main.jsx, index.css
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

To build for production:
```bash
npm run build
npm run preview
```

## 🧭 How to demo it
1. Land on the homepage → click **Book Appointment**
2. Pick a department, doctor, time slot → confirm → see your token + AI confidence
3. Click **Track My Queue** → watch the **Smart Decision Assistant** card
4. Switch role to **Doctor** (top-right toggle) → mark a delay or add an emergency case
5. Switch back to **Patient** → see the queue page react with an updated recommendation
6. Switch to **Admin** → see hospital-wide stats and delay alerts
7. Click the floating 💬 chatbot any time for help text

## ⚙️ Tech Stack
React 18 · React Router 6 · Tailwind CSS · Vite · lucide-react icons · Context API for state (no Redux needed for a prototype this size)

> This frontend runs entirely in **demo mode** with local sample data and simulated real-time updates (`setInterval`). A matching Node/Express/MongoDB/Socket.io backend is provided separately for a fully real-time, persisted version — see `/backend` instructions when added.
