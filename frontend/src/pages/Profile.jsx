import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, User, Phone, Calendar, MapPin, LogOut, Settings,
  HelpCircle, ClipboardList, History, Pencil, Check, X as XIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistance } from '../utils/distance';
import { formatWait } from '../utils/helpers';

const TABS = [
  { id: 'overview', label: 'Overview',     icon: User },
  { id: 'bookings',  label: 'My Bookings',  icon: ClipboardList },
  { id: 'history',   label: 'History',      icon: History },
  { id: 'settings',  label: 'Settings',     icon: Settings },
  { id: 'help',      label: 'Help & FAQ',   icon: HelpCircle },
];

const FAQS = [
  { q: 'How do I book an appointment?', a: "Tap 'Book Now', choose a department, pick a doctor, select a time slot, and confirm. It takes under 30 seconds." },
  { q: 'How is my wait time calculated?', a: 'Our AI engine uses: (Patients Ahead × Average Consultation Time) + Doctor Delay. You can see the live breakdown on the Queue Tracking page.' },
  { q: 'Why do I need to share my location?', a: "So we only ever show you doctors and clinics that are realistically close to you — not ones an hour away." },
  { q: 'Can I cancel an appointment?', a: "Yes — go to 'My Bookings' in your profile and tap Cancel on the appointment you'd like to cancel." },
  { q: 'What happens if my doctor is delayed?', a: "You'll be notified immediately and your recommended arrival time will automatically update on the Queue Tracking page." },
  { q: 'Is my personal data safe?', a: 'Your details are stored only on this device for this demo prototype and are never shared with third parties.' },
];

export default function Profile() {
  const { user, updateProfile, logout, appointments, cancelAppointment, markAppointmentCompleted } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const history  = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled');

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="page-wrap-lg">
      <button onClick={() => navigate('/dashboard')} className="back-btn">
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-7 flex-wrap">
        <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
          {user?.fullName?.slice(0, 1).toUpperCase() || '?'}
        </div>
        <div className="flex-1">
          <h1 className="section-title">{user?.fullName || 'Your Profile'}</h1>
          <p className="section-sub">{user?.phone ? `+91 ${user.phone}` : ''}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-100 bg-red-50 text-red-600 font-bold text-sm cursor-pointer hover:bg-red-100 transition-colors"
        >
          <LogOut size={15} /> Log Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-colors flex-shrink-0 border-2"
            style={{
              borderColor: tab === t.id ? '#0F6E56' : '#E5E7EB',
              background:  tab === t.id ? '#E1F5EE' : '#fff',
              color:       tab === t.id ? '#0F6E56' : '#6B7280',
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab user={user} updateProfile={updateProfile} />}
      {tab === 'bookings' && <BookingsTab appointments={upcoming} onCancel={cancelAppointment} onComplete={markAppointmentCompleted} navigate={navigate} />}
      {tab === 'history'  && <HistoryTab appointments={history} />}
      {tab === 'settings' && <SettingsTab />}
      {tab === 'help'     && <HelpTab />}
    </div>
  );
}

// ─── Overview / Edit Details ────────────────────────────────────────────────
function OverviewTab({ user, updateProfile }) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [age, setAge] = useState(user?.age || '');

  function save() {
    updateProfile({ fullName, age: Number(age) });
    setEditing(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="font-extrabold text-gray-800">Your Details</p>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-teal-600 text-sm font-bold bg-transparent border-0 cursor-pointer">
              <Pencil size={14} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={save} className="flex items-center gap-1 text-green-600 text-sm font-bold bg-transparent border-0 cursor-pointer">
                <Check size={15} /> Save
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-gray-400 text-sm font-bold bg-transparent border-0 cursor-pointer">
                <XIcon size={15} /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Field icon={User} label="Full Name">
            {editing ? (
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
            ) : (
              <p className="font-bold text-gray-900">{user?.fullName}</p>
            )}
          </Field>

          <Field icon={Calendar} label="Age">
            {editing ? (
              <input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} className="input-field" />
            ) : (
              <p className="font-bold text-gray-900">{user?.age} years</p>
            )}
          </Field>

          <Field icon={Phone} label="Phone Number">
            <p className="font-bold text-gray-900">+91 {user?.phone}</p>
            <p className="text-xs text-gray-400 mt-0.5">Phone number cannot be changed — it's your login ID</p>
          </Field>

          <Field icon={MapPin} label="Location">
            <p className="font-bold text-gray-900">
              {user?.location ? `${user.location.lat.toFixed(3)}, ${user.location.lng.toFixed(3)}` : 'Not set'}
              {user?.location?.approximate && <span className="text-xs text-gray-400 ml-2">(approximate)</span>}
            </p>
          </Field>
        </div>
      </div>

      <div className="card p-6 bg-teal-50/40">
        <p className="font-extrabold text-gray-800 mb-3">Account Summary</p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}.
          Use the tabs above to view your upcoming bookings, past visit history, and adjust your settings.
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} color="#6B7280" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        {children}
      </div>
    </div>
  );
}

// ─── My Bookings (upcoming) ──────────────────────────────────────────────────
function BookingsTab({ appointments, onCancel, onComplete, navigate }) {
  if (appointments.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-5xl mb-4">🗓️</p>
        <p className="font-extrabold text-gray-800 mb-2">No upcoming appointments</p>
        <p className="text-gray-500 text-sm mb-6">Book a new appointment to see it here.</p>
        <button onClick={() => navigate('/book')} className="btn-primary">+ Book an Appointment</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {appointments.map((a) => (
        <div key={a.id} className="card p-5 flex items-center gap-4 flex-wrap">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold flex-shrink-0"
            style={{ background: a.dept?.bg, color: a.dept?.color }}
          >
            {a.doctor?.initials}
          </div>
          <div className="flex-1 min-w-[180px]">
            <p className="font-bold text-gray-900">{a.doctor?.name}</p>
            <p className="text-sm text-gray-500">{a.dept?.icon} {a.dept?.name} · {a.slot?.time}</p>
            {a.clinicName && (
              <p className="text-xs text-gray-400 mt-0.5">
                {a.clinicName} · {a.address}
                {a.distanceKm != null && <span className="text-teal-600 font-bold"> · {formatDistance(a.distanceKm)} away</span>}
              </p>
            )}
          </div>
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: a.dept?.color }}>{a.token}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Token</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/queue')} className="btn-outline text-xs px-3 py-2">Track</button>
            <button onClick={() => onComplete(a.id)} className="text-xs px-3 py-2 rounded-xl border-2 border-green-100 bg-green-50 text-green-700 font-bold cursor-pointer">
              Mark Done
            </button>
            <button onClick={() => onCancel(a.id)} className="text-xs px-3 py-2 rounded-xl border-2 border-red-100 bg-red-50 text-red-600 font-bold cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── History (completed / cancelled) ─────────────────────────────────────────
function HistoryTab({ appointments }) {
  if (appointments.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-5xl mb-4">📜</p>
        <p className="font-extrabold text-gray-800 mb-2">No history yet</p>
        <p className="text-gray-500 text-sm">Completed and cancelled appointments will appear here.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="divide-y divide-gray-50">
        {appointments.map((a) => (
          <div key={a.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0"
              style={{ background: a.dept?.bg, color: a.dept?.color }}
            >
              {a.doctor?.initials}
            </div>
            <div className="flex-1 min-w-[180px]">
              <p className="font-bold text-gray-800 text-sm">{a.doctor?.name}</p>
              <p className="text-xs text-gray-400">{a.dept?.name} · {a.slot?.time} · Wait was {formatWait(a.waitMins)}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.status === 'completed' ? 'badge-green' : 'badge-red'}`}>
              {a.status === 'completed' ? '✓ Completed' : '✕ Cancelled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────
function SettingsTab() {
  const [notifs, setNotifs] = useState({ delay: true, queue: true, marketing: false });

  return (
    <div className="card p-6 max-w-xl">
      <p className="font-extrabold text-gray-800 mb-5">Notification Preferences</p>
      <div className="flex flex-col gap-4">
        {[
          ['delay',      'Notify me about doctor delays'],
          ['queue',      'Notify me when my queue position changes'],
          ['marketing',  'Send me occasional updates about MediFlow'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-semibold text-gray-700">{label}</span>
            <input
              type="checkbox"
              checked={notifs[key]}
              onChange={() => setNotifs((p) => ({ ...p, [key]: !p[key] }))}
              className="w-5 h-5 accent-teal-600 cursor-pointer"
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-6">Note: these preferences are for demo purposes — no real notifications are sent.</p>
    </div>
  );
}

// ─── Help & FAQ ───────────────────────────────────────────────────────────────
function HelpTab() {
  const [open, setOpen] = useState(null);
  return (
    <div className="max-w-2xl">
      <div className="card overflow-hidden mb-5">
        {FAQS.map((f, i) => (
          <div key={f.q} className={i < FAQS.length - 1 ? 'border-b border-gray-50' : ''}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-5 py-4 flex justify-between items-center bg-transparent border-0 cursor-pointer"
            >
              <span className="font-bold text-gray-800 text-sm">{f.q}</span>
              <span className="text-gray-400 text-lg">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{f.a}</div>}
          </div>
        ))}
      </div>
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 text-sm text-teal-800">
        Still need help? Use the floating 💬 chatbot in the bottom-right corner any time for instant answers.
      </div>
    </div>
  );
}
