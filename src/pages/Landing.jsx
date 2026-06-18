import { Clock, Zap, Navigation, Shield, CheckCircle } from 'lucide-react';
import { useRequirePatientAccess } from '../utils/useRequirePatientAccess';

const FEATURES = [
  { icon: Clock,      title: 'Live Queue Tracking',  desc: 'See your exact position in real-time. No guessing, no standing in lines.',                   color: '#0F6E56', bg: '#E1F5EE' },
  { icon: Zap,        title: 'AI Wait Prediction',   desc: 'Smart algorithms predict your wait time with up to 92% accuracy using live consultation data.', color: '#C0392B', bg: '#FDECEA' },
  { icon: Navigation, title: 'Smart Arrival Guide',  desc: 'Get notified exactly when to leave home — arrive just as your turn approaches.',              color: '#6C3483', bg: '#F5EEF8' },
  { icon: Shield,     title: 'Delay Transparency',   desc: "Always know if your doctor is running late. Your wait estimate updates automatically.",        color: '#1A5276', bg: '#EBF5FB' },
];

const HOW_IT_WORKS = [
  { n: '1', title: 'Book in 30 seconds',    desc: 'Choose department, doctor & time slot instantly — no paperwork.' },
  { n: '2', title: 'Receive your token',    desc: 'Get a queue position and live wait time estimate immediately.' },
  { n: '3', title: 'Follow AI guidance',    desc: 'The Smart Assistant tells you exactly when to leave home.' },
  { n: '4', title: 'Walk in on time',       desc: 'Arrive just as your turn approaches — no waiting room wait.' },
];

const DEPTS = [
  { icon: '🏥', name: 'General Medicine' },
  { icon: '❤️', name: 'Cardiology' },
  { icon: '✨', name: 'Dermatology' },
  { icon: '👶', name: 'Pediatrics' },
  { icon: '🦴', name: 'Orthopedics' },
];

export default function Landing() {
  // Every patient-flow CTA on this page goes through this — it forces the
  // demo role switcher to "patient" (fixing the Admin/Doctor → booking bug)
  // and redirects to Login / Location setup first if either is missing.
  const goToPatientFlow = useRequirePatientAccess();

  return (
    <div className="animate-fadeUp">
      {/* Landing is the root page — no back button needed here */}
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        className="min-h-[90vh] flex items-center justify-center px-6 py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #085041 0%, #0F6E56 45%, #1D9E75 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-28 -right-28 w-[480px] h-[480px] rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="absolute -bottom-16 -left-16 w-[300px] h-[300px] rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />

        <div className="max-w-2xl text-center relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#9FE1CB', backdropFilter: 'blur(8px)' }}
          >
            ⚕ AI-Powered Hospital Queue System
          </div>

          <h1
            className="font-display text-5xl sm:text-6xl text-white leading-[1.15] mb-5"
            style={{ letterSpacing: '-1px' }}
          >
            Know Exactly When<br />to Visit Your Doctor
          </h1>

          <p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-lg mx-auto" style={{ color: '#9FE1CB' }}>
            AI-powered queue prediction and appointment management.
            No more uncertainty, no more wasted waits.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => goToPatientFlow('/book')}
              className="px-10 py-4 rounded-2xl font-extrabold text-lg text-teal-600 transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: '#fff', boxShadow: '0 8px 28px rgba(0,0,0,0.2)' }}
            >
              📅 Book Appointment
            </button>
            <button
              onClick={() => goToPatientFlow('/queue')}
              className="px-10 py-4 rounded-2xl font-bold text-lg text-white border-2 transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}
            >
              👁 View Live Queue
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-12 justify-center mt-14 flex-wrap">
            {[['80+', 'Patients Managed'], ['15', 'Expert Doctors'], ['92%', 'AI Accuracy']].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="font-display text-4xl text-white">{v}</p>
                <p className="text-sm font-semibold mt-1" style={{ color: '#9FE1CB' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Departments strip ───────────────────────────────────────────── */}
      <section className="bg-white py-6 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 flex gap-4 justify-center flex-wrap">
          {DEPTS.map((d) => (
            <button
              key={d.name}
              onClick={() => goToPatientFlow('/book')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-50 hover:bg-teal-100 border border-teal-100 text-sm font-bold text-teal-700 cursor-pointer transition-colors"
            >
              {d.icon} {d.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="font-display text-4xl text-center text-gray-900 mb-2">Why MediFlow?</h2>
        <p className="text-center text-gray-500 text-lg mb-12">Everything you need for a stress-free hospital visit</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card-hover p-7 animate-fadeUp"
            >
              <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center mb-5" style={{ background: f.bg }}>
                <f.icon size={26} color={f.color} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-4xl text-center text-gray-900 mb-2">How It Works</h2>
          <p className="text-center text-gray-500 text-lg mb-12">From booking to visit in 4 simple steps</p>

          <div className="flex flex-col gap-4">
            {HOW_IT_WORKS.map((s, i) => (
              <div
                key={s.n}
                className="flex items-center gap-5 bg-teal-50/60 rounded-2xl p-5 border border-teal-100 animate-fadeUp"
              >
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                  {s.n}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-gray-900">{s.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1
                  ? <span className="text-gray-300 text-xl font-bold">→</span>
                  : <CheckCircle size={22} color="#0F6E56" />}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={() => goToPatientFlow('/book')} className="btn-primary text-lg px-12 py-4">
              Get Started Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-teal-700 text-teal-100 text-center py-8 text-sm">
        <p className="font-bold text-white text-base mb-1">⚕ MediFlow</p>
        <p>AI-Powered Hospital Queue Management · Built for Hackathon 2024</p>
      </footer>
    </div>
  );
}