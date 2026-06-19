import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Users, Stethoscope, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS } from '../data/sampleData';
import { statusInfo, formatDate } from '../utils/helpers';
import StatsCard from '../components/cards/StatsCard';

export default function AdminDashboard() {
  const { doctors, setRole, backendOnline, subscribeAdminRoom } = useApp();
  const navigate = useNavigate();

  useEffect(() => { setRole('admin'); }, [setRole]);
  useEffect(() => { subscribeAdminRoom(); }, [subscribeAdminRoom]);

  // NOTE: all KPIs below are derived client-side from the live `doctors`
  // array (already kept in sync via Socket.io when the backend is online),
  // rather than calling /api/admin/stats separately — same numbers, one
  // less round trip, and it keeps working seamlessly in demo mode too.
  const totalAppts   = doctors.reduce((s, d) => s + (d.patientsToday || 0), 0);
  const totalWaiting = doctors.reduce((s, d) => s + (d.patientsLeft || 0), 0);
  const activeDocs   = doctors.filter((d) => d.status !== 'delayed' && d.status !== 'emergency').length;
  const delayedDocs  = doctors.filter((d) => d.delay > 0);
  const avgWait      = Math.round(doctors.reduce((s, d) => s + (d.avgTime || 0) * (d.patientsLeft || 0), 0) / Math.max(doctors.length, 1));

  const deptStats = DEPARTMENTS.map((dept) => {
    const dd = doctors.filter((d) => d.dept === dept.id);
    return {
      ...dept,
      total:   dd.reduce((s, d) => s + d.patientsToday, 0),
      waiting: dd.reduce((s, d) => s + d.patientsLeft, 0),
      avgT:    Math.round(dd.reduce((s, d) => s + d.avgTime, 0) / Math.max(dd.length, 1)),
    };
  });

  return (
    <div className="page-wrap-lg">
      {/* Back button */}
      <button onClick={() => navigate('/')} className="back-btn">
        <ChevronLeft size={16} /> Back to Home
      </button>

      <div className="mb-7 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-sub">Hospital-wide overview · {formatDate()}</p>
        </div>
        <div
          className="flex items-center gap-2 rounded-full px-3.5 py-2 border"
          style={{ background: backendOnline ? '#DCFCE7' : '#FEF9C3', borderColor: backendOnline ? '#BBF7D0' : '#FDE68A' }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: backendOnline ? '#22C55E' : '#EAB308' }} />
          <span className="text-xs font-bold" style={{ color: backendOnline ? '#166534' : '#854D0E' }}>
            {backendOnline ? 'Live · Synced to server' : 'Demo Mode'}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-7">
        <StatsCard icon={<Calendar size={20} />}     value={totalAppts}        label="Today's Appointments" color="#0F6E56" bg="#E1F5EE" />
        <StatsCard icon={<Users size={20} />}        value={totalWaiting}      label="Currently Waiting"    color="#6C3483" bg="#F5EEF8" />
        <StatsCard icon={<Stethoscope size={20} />}  value={activeDocs}        label="Active Doctors"       color="#1A5276" bg="#EBF5FB" />
        <StatsCard icon={<Clock size={20} />}        value={`${avgWait} min`}  label="Avg Wait Time"        color="#C0392B" bg="#FDECEA" />
        <StatsCard icon={<AlertTriangle size={20} />} value={delayedDocs.length} label="Delayed Doctors"     color="#9A7D0A" bg="#FEFBD8" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Department overview */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 font-extrabold text-gray-800">
            📊 Department Overview
          </div>
          <div className="divide-y divide-gray-50">
            {deptStats.map((d) => (
              <div key={d.id} className="px-5 py-3.5 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: d.bg }}>
                  {d.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800 mb-1">{d.name}</p>
                  <div className="flex gap-3 mb-2 flex-wrap">
                    <span className="text-xs text-gray-500">📋 {d.total} today</span>
                    <span className="text-xs text-gray-500">⏳ {d.waiting} waiting</span>
                    <span className="text-xs text-gray-500">⏱ {d.avgT}m avg</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (d.waiting / 25) * 100)}%`, background: d.color }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-black" style={{ color: d.color }}>{d.waiting}</p>
                  <p className="text-[10px] text-gray-400">in queue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All doctors */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 font-extrabold text-gray-800">
            👨‍⚕️ All Doctors Status
          </div>
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {doctors.map((doc) => {
              const dept = DEPARTMENTS.find((d) => d.id === doc.dept);
              const st   = statusInfo(doc.status, doc.delay);
              return (
                <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs flex-shrink-0"
                    style={{ background: dept?.bg, color: dept?.color }}
                  >
                    {doc.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">{dept?.name} · {doc.patientsLeft} waiting</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 ${st.cls}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delay alerts */}
      {delayedDocs.length > 0 && (
        <div className="rounded-2xl p-5 border-2" style={{ background: '#FEF9C3', borderColor: '#EAB308' }}>
          <div className="flex items-center gap-2 mb-3.5">
            <AlertTriangle size={20} color="#854D0E" />
            <span className="font-extrabold" style={{ color: '#854D0E' }}>
              Active Delay Alerts — {delayedDocs.length} doctor{delayedDocs.length > 1 ? 's' : ''} behind schedule
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {delayedDocs.map((doc) => {
              const dept = DEPARTMENTS.find((d) => d.id === doc.dept);
              return (
                <div key={doc.id} className="bg-white rounded-xl px-4 py-2.5 border border-yellow-200 flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs flex-shrink-0"
                    style={{ background: dept?.bg, color: dept?.color }}
                  >
                    {doc.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{doc.name}</p>
                    <p className="text-xs font-semibold text-yellow-700">⏰ {doc.delay} min delay · {doc.patientsLeft} waiting</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
