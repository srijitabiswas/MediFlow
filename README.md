⚕️ MediFlow
React · Vite · Node.js · Express · MongoDB · Socket.io · TailwindCSS
 
🩺 Overview
MediFlow is an AI-powered hospital queue and appointment optimization system that removes the single biggest source of patient frustration: not knowing how long you'll wait.
 
The platform combines live queue tracking, AI-driven wait-time prediction, real-time delay transparency, and a built-in Smart Decision Assistant into one seamless patient experience — while giving doctors and hospital administrators the real-time tools to manage that queue from the other side.
 
MediFlow aims to turn raw queue data into a clear, actionable instruction for the patient — not "you are #5 in queue," but "leave for the hospital in 20 minutes" — based on live distance to nearby clinics, doctor consultation speed, and any active delays or emergencies.
 
🌐 Live Demo
Link: [https://mediflow-5zon.onrender.com/](https://mediflow-5zon.onrender.com/)

 
(Replace these with your actual deployed URLs once live — see Deployment below.)
 
✨ Key Features
🔐 Patient Accounts & Location
Sign up with full name, age, and phone number
Secure login / logout flow
Browser geolocation permission flow
Distance-based doctor & clinic discovery (1–5 km radius)
Editable profile — name, age, location
📍 Live Queue Tracking
Real-time queue position
Patients-ahead counter
Doctor status (available / consulting / delayed / emergency)
Auto-refreshing queue list with live patient tokens
Socket.io-powered real-time sync across devices
🤖 AI Wait-Time Engine
Transparent, explainable prediction formula
Live breakdown: Patients Ahead × Avg Consultation Time + Delay
AI Confidence Score (68–97%)
Same formula runs identically on frontend and backend
🧭 Smart Decision Assistant
Glow-AI's biggest analogy here — this is MediFlow's signature feature. Instead of just showing numbers, it tells the patient what to do:
 
"Leave for the hospital in 20 minutes."
"Doctor delay detected — recommended arrival time updated."
"Plenty of time — relax! No need to rush."
"Emergency case in progress — your wait has increased."
🏥 Delay & Emergency Transparency
Doctors can mark 5 / 10-minute delays in one tap
Emergency case insertion — queue reorders instantly
Every affected patient is notified the moment it happens
Recommendation card updates automatically, no refresh needed
👨‍⚕️ Doctor Dashboard
Today's full patient queue at a glance
Start / Complete Consultation — one-tap queue advancement
Mark Delay & Add Emergency Case controls
Live stats: completed, remaining, average consult time
🏛 Admin Dashboard
Hospital-wide KPIs — total appointments, active doctors, average wait
Department load breakdown across 5 departments
Live delay alerts across all doctors
All-doctors status table
💬 MediFlow Assistant Chatbot
Floating AI-style assistant capable of:
 
Explaining how to book an appointment
Interpreting queue position & tokens
Explaining doctor delays
Answering "when should I arrive?"
Rule-based, zero-latency, zero-cost — no LLM dependency
📱 Responsive Design
Optimized for:
 
Desktop
Tablet
Mobile (large tap targets, designed for elderly & first-time users)
🛠 Tech Stack
Frontend
React 18
Vite
React Router 6
Tailwind CSS
Lucide Icons
Context API (global state)
Backend
Node.js
Express.js
Socket.io
Mongoose
REST APIs
CORS
Real-Time & AI
Socket.io (live queue broadcasts)
Custom AI Wait-Time Engine (formula-based, explainable)
Browser Geolocation API + Haversine distance calculations
Database
MongoDB (Doctors, Patients, Appointments, Queue collections)
Deployment
Frontend
 
Vercel / Netlify
Backend
 
Render / Railway / Fly.io
 
Database
 
MongoDB Atlas (free tier)
 
📂 Project Structure
MediFlow
│
├── backend
│   ├── models
│   ├── routes
│   ├── socket
│   ├── seed
│   ├── utils
│   ├── .env
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── data
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   ├── public
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
🚀 Installation
Clone the repository
 
git clone https://github.com/srijitabiswas/MediFlow.git
 
cd MediFlow
Install frontend
 
cd frontend
npm install
Install backend
 
cd backend
npm install
Run frontend
 
cd frontend
npm run dev
Run backend
 
cd backend
npm run dev
Frontend
 
http://localhost:5173
Backend
 
http://localhost:5000
🔑 Environment Variables
Frontend (frontend/.env)
 
VITE_API_URL=http://localhost:5000
 
Backend (backend/.env)
 
MONGODB_URI=mongodb://localhost:27017/mediflow
 
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
 
🎯 Usage
1. Create Your Account
Open the landing page.
Click Book Appointment or Get Started Free.
If you don't have an account, click Sign Up.
Enter your full name, age, and phone number.
Allow location access when prompted — or skip to use an approximate location.
2. Book an Appointment
Choose a department (General Medicine, Cardiology, Dermatology, Pediatrics, or Orthopedics).
Choose a doctor — sorted closest to you first, with clinic name, address, and live distance shown.
Select an available time slot.
Confirm — receive your Appointment ID, Token, and AI Confidence Score.
The entire flow takes under 30 seconds.
 
3. Track Your Queue
After booking, go to Track My Queue to see:
Live queue position
Patients ahead
Doctor's current status
🧭 Smart Decision Assistant recommendation card
The recommendation updates instantly if your doctor reports a delay or an emergency is added — no refresh required.
 
4. Doctor Dashboard
Switch roles (top-right toggle) to Doctor to:
View today's queue
Start / Complete consultations
Mark a delay or add an emergency case
Watch the change reflect immediately on the patient side
 
5. Admin Dashboard
Switch roles to Admin to see hospital-wide stats, department load, and live delay alerts across every doctor.
6. Talk to MediFlow Assistant
The built-in chatbot can answer questions such as:
How do I book an appointment?
When should I arrive?
Why is my wait time changing?
What does doctor delay mean?
Can I cancel my appointment?
🧠 AI Wait Engine Pipeline
Patient Books Appointment
        │
        ▼
Queue Position Assigned
        │
        ▼
AI Wait Engine
(Patients Ahead × Avg Consult Time) + Delay
        │
        ▼
AI Confidence Score Calculated
        │
        ▼
Smart Decision Assistant
        │
        ▼
Recommendation Card Generated
        │
        ▼
Doctor Marks Delay / Emergency  ──▶  Queue Recalculated
        │
        ▼
Patient Notified in Real-Time (Socket.io)
🏗️ System Architecture
                    React Frontend
                           │
                           ▼
                    AppContext (Global State)
                           │
        ┌──────────────────┴───────────────────┐
        ▼                                      ▼
 services/api.js                       services/socket.js
  (Axios / REST)                      (Socket.io Client)
        │                                      │
        ▼                                      ▼
              Express Backend (Node.js)
                           │
        ┌──────────────────┴───────────────────┐
        ▼                                      ▼
   REST API Routes                      Socket.io Server
 (doctors / appointments /            (queue:updated,
  queue / admin)                       doctor:delay,
        │                               queue:emergency)
        ▼                                      │
                    MongoDB                     │
        (Doctors · Patients · Appointments)     │
                           │                     │
                           └─────────┬───────────┘
                                     ▼
                        Live Updates Pushed to
                         Every Connected Client
 
Live Mode vs Demo Mode: on load, the frontend runs a health check against the backend (including verifying MongoDB is actually connected, not just that the server process is up). If both are reachable, the app runs in Live mode — real bookings persisted to MongoDB, real Socket.io broadcasts. If not, it falls back instantly to local sample data with simulated queue movement — Demo mode. A badge in the navbar always shows which mode you're in. This means the app never breaks even if the backend or database happens to be down.
 
📋 Booking & Queue Workflow
Account Creation
The application requests location access only once, right after signup or login.
 
Distance Calculation
MediFlow validates and ranks doctors using:
 
Real device GPS coordinates
Haversine distance formula
Clinic-distance seeding (realistic 0.6–4.9 km spread per doctor)
Booking
The captured booking is stored for:
 
Queue Position Tracking
AI Wait Prediction
Appointment History (in Profile)
AI Analysis
MediFlow performs:
 
Queue Position Calculation
Wait-Time Prediction
Confidence Scoring
Smart Recommendation Generation
Real-Time Sync
The system combines:
 
Doctor Actions (delay / emergency / complete)
Live Queue State
Socket.io Broadcasts
to keep every patient's recommendation card accurate to the second.
 
🌟 Major Features
Patient Experience
✔ 30-Second Booking Flow
 
✔ Location-Based Doctor Discovery
 
✔ Live Queue Position Tracking
 
✔ Smart Decision Assistant
 
✔ Appointment History & Profile
 
✔ Cancel / Mark-Complete Controls
 
Doctor Tools
✔ Live Patient Queue
 
✔ One-Tap Consultation Flow
 
✔ Delay Broadcasting
 
✔ Emergency Case Insertion
 
✔ Daily Stats Dashboard
 
Admin Tools
✔ Hospital-Wide KPIs
 
✔ Department Load Monitoring
 
✔ Live Delay Alerts
 
✔ All-Doctors Status Table
 
AI & Real-Time Engine
✔ Explainable Wait-Time Formula
 
✔ AI Confidence Scoring
 
✔ Socket.io Live Broadcasts
 
✔ Automatic Live/Demo Mode Detection
 
✔ Graceful Offline Fallback
 
⚙️ Deployment
Frontend
MediFlow's frontend is optimized for deployment on Vercel.
 
Build Command
 
npm run build
Output Directory
 
dist
Environment Variables
 
VITE_API_URL=https://your-mediflow-backend.onrender.com
 
Backend
Deploy the backend separately using:
 
Render
Railway
Fly.io
VPS
Start Command
 
npm start
Don't forget to set MONGODB_URI, PORT, and FRONTEND_URL (pointing at your deployed frontend domain) as environment variables on whichever platform you choose.
 
Database
Use a free MongoDB Atlas (M0) cluster for production — local MongoDB only works for development.
 
Automatic Deployment
GitHub
   │
   ▼
Vercel (frontend) + Render (backend)
   │
   ▼
Automatic Build
   │
   ▼
Production Website
 
🔮 Future Improvements
Planned features include:
 
Real ML-based wait-time prediction (replacing the formula-based engine)
SMS / WhatsApp notifications
Real geocoding (Google Maps / Mapbox) instead of simulated clinic distances
OTP-based authentication & backend-persisted accounts
Multi-hospital / multi-branch support
Doctor photo uploads
Historical analytics dashboard for admins
Payment gateway for paid consultations
Appointment rescheduling
Push notifications
🤝 Contributing
Contributions are welcome.
 
Fork the repository.
 
Create a feature branch.
 
git checkout -b feature/my-feature
Commit your changes.
git commit -m "Added awesome feature"
Push the branch.
git push origin feature/my-feature
Open a Pull Request.
👥 Team
MediFlow was developed by:
 
Srijita Biswas
Role
 
UI/UX Design
Full-Stack Development (Frontend + Backend)
AI Wait-Time Engine Design
Product Strategy & Testing
(Add any teammates here in the same format if this becomes a team submission.)
 
📂 Repository
GitHub Repository
 
https://github.com/srijitabiswas/MediFlow
 
📜 License
This project is intended for educational, hackathon, and portfolio purposes.
 
You are free to fork and learn from the project. Please provide attribution if substantial portions are reused.
 
🙏 Acknowledgements
Special thanks to the following technologies and communities that made this project possible:
 
React
Vite
Express.js
Node.js
MongoDB
Socket.io
Tailwind CSS
Lucide Icons
⭐ Support
If you found this project useful, please consider giving it a ⭐ on GitHub.
 
It helps others discover the project and supports future development.
 
Built with ⚕️ for patients who deserve to know exactly when to walk in.
