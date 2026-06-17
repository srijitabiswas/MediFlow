import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calcWaitTime, getSmartRecommendation } from '../utils/aiEngine';
import { formatWait, formatDate } from '../utils/helpers';
import SmartDecisionCard from '../components/cards/SmartDecisionCard';
import StatsCard from '../components/cards/StatsCard';
import NotificationPanel from '../components/dashboard/NotificationPanel';

export default function PatientDashboard() {
  const { myBooking, doctors } = useApp();
  const navigate = useNavigate();

  // Find live doctor data matching the booking (falls back gracefully)
  const liveDoctor = myBooking ? doctors.find((d) => d.id === myBooking.doctor?.id) || myBooking.doctor : null;

  const patientsAhead = myBooking ? myBooking.patientsAhead : 0;
  const { mins: waitMins, confidence } = liveDoctor
    ? calcWaitTime(patientsAhead, liveDoctor.avgTime, liveDoctor.delay)
    : { mins: 0, confidence: 90 };

  const recommendation = liveDoctor
    ? getSmartRecommendation(waitMins, liveDoctor.delay, patientsAhead, liveDoctor.status)
    : null;

  return (
    <div className="page-wrap-lg">
      {/* Back button */}
      <button onClick={() => navigate('/')} className="back-btn">
        <ChevronLeft size={16} /> Back to Home
      </button>

      {/* Header */}
      <div className="mb-7">
        <h1 className="section-title">Patient Dashboard</h1>
        <p className="section-sub">{formatDate()}</p>
      </div>

      {!myBooking ? (
        /* ── Empty state ─────────────────────────────────────────── */
        <div className="card p-10 text-center max-w-md mx-auto">
          <p className="text-5xl mb-4">🗓️</p>
          <p className="font-extrabold text-gray-800 text-lg mb-2">No active appointment</p>
          <p className="text-gray-500 text-sm mb-6">Book your first appointment to see live queue tracking and AI wait predictions here.</p>
          <button onClick={() => navigate('/book')} className="btn-primary">
            + Book an Appointment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ── Main column ─────────────────────────────────────────── */}
          <div>
            {/* Smart Decision Assistant */}
            <SmartDecisionCard recommendation={recommendation} />

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatsCard icon={<MapPin size={20} />}  value={`#${myBooking.queuePosition}`}      label="Queue Position" color="#0F6E56" bg="#E1F5EE" />
              <StatsCard icon={<Calendar size={20} />} value={patientsAhead}                       label="Patients Ahead" color="#C0392B" bg="#FDECEA" />
              <StatsCard icon={<Clock size={20} />}     value={formatWait(waitMins)}                label="Est. Wait"      color="#6C3483" bg="#F5EEF8" />
              <StatsCard icon="🎯"                       value={`${confidence}%`}                    label="AI Confidence"  color="#1A5276" bg="#EBF5FB" />
            </div>

            {/* Appointment summary */}
            <div className="card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-extrabold text-gray-800">Your Appointment</p>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                  {myBooking.id}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0"
                  style={{ background: myBooking.dept?.bg, color: myBooking.dept?.color }}
                >
                  {myBooking.doctor?.initials}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{myBooking.doctor?.name}</p>
                  <p className="text-sm text-gray-500">{myBooking.dept?.icon} {myBooking.dept?.name} · {myBooking.slot?.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black" style={{ color: myBooking.dept?.color }}>{myBooking.token}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Token</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/queue')}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
            >
              View Live Queue Tracking <ArrowRight size={18} />
            </button>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <NotificationPanel />
          </div>
        </div>
      )}
    </div>
  );
}
