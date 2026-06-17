import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Clock, AlertTriangle, Siren, PlayCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS } from '../data/sampleData';
import { statusInfo } from '../utils/helpers';

export default function DoctorDashboard() {
  const { doctors, queues, updateQueue, completeConsultation, markDelay, addEmergency, addToast } = useApp();
  const navigate = useNavigate();

  const [activeId, setActiveId] = useState(doctors[0].id);

  const activeDoc = doctors.find((d) => d.id === activeId) || doctors[0];
  const queue     = queues[activeId] || [];
  const consulting = queue.find((p) => p.status === 'consulting');
  const waiting     = queue.filter((p) => p.status === 'waiting');
  const dept        = DEPARTMENTS.find((d) => d.id === activeDoc.dept) || DEPARTMENTS[0];
  const st          = statusInfo(activeDoc.status, activeDoc.delay);

  function startNext() {
    updateQueue(activeId, (q) => q.map((p, i) => ({ ...p, status: i === 0 ? 'consulting' : 'waiting' })));
    addToast(`Called ${waiting[0]?.name || 'next patient'} for consultation.`, 'success');
  }

  return (
    <div className="page-wrap-lg">
      {/* Back button */}
      <button onClick={() => navigate('/')} className="back-btn">
        <ChevronLeft size={16} /> Back to Home
      </button>

      <div className="mb-6">
        <h1 className="section-title">Doctor Dashboard</h1>
        <p className="section-sub">Manage your patient queue in real-time</p>
      </div>

      {/* Doctor tabs */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2">
        {doctors.map((doc) => {
          const d = DEPARTMENTS.find((x) => x.id === doc.dept);
          const active = activeId === doc.id;
          return (
            <button
              key={doc.id}
              onClick={() => setActiveId(doc.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 cursor-pointer transition-all flex-shrink-0 whitespace-nowrap"
              style={{ borderColor: active ? d?.color : '#E5E7EB', background: active ? d?.bg : '#fff' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold"
                style={{ background: d?.bg, color: d?.color }}
              >
                {doc.initials}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800">{doc.name}</p>
                <span className={`text-[10px] font-bold ${statusInfo(doc.status, doc.delay).cls} px-1.5 py-0.5 rounded-full`}>
                  {statusInfo(doc.status, doc.delay).label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Main column ────────────────────────────────────────────── */}
        <div>
          {/* Current patient */}
          {consulting ? (
            <div className="rounded-2xl p-6 border-2 mb-6" style={{ background: '#E1F5EE', borderColor: '#0F6E56' }}>
              <p className="text-[11px] font-extrabold uppercase tracking-widest mb-3.5" style={{ color: '#0F6E56' }}>
                🩺 Currently Consulting
              </p>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {consulting.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-xl text-gray-900">{consulting.name}</p>
                  <p className="text-sm font-bold text-teal-700">Token: {consulting.token} · {consulting.apptTime}</p>
                </div>
              </div>
              <button
                onClick={() => completeConsultation(activeId)}
                className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Complete Consultation — Call Next Patient
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-8 border-2 border-dashed border-gray-200 mb-6 text-center bg-gray-50">
              <p className="text-4xl mb-3">⏳</p>
              <p className="text-gray-400 font-semibold mb-4">No active consultation</p>
              {waiting.length > 0 && (
                <button onClick={startNext} className="btn-primary flex items-center gap-2 mx-auto">
                  <PlayCircle size={16} /> Call Next Patient ({waiting[0]?.name})
                </button>
              )}
            </div>
          )}

          {/* Waiting list */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
              <span className="font-extrabold text-gray-800">Today's Queue</span>
              <span className="text-xs font-bold text-gray-500">
                {waiting.length} waiting · {activeDoc.patientsToday - activeDoc.patientsLeft} done
              </span>
            </div>
            {waiting.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <p className="text-4xl mb-2">🎉</p>
                Queue cleared for today!
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {waiting.map((p, i) => (
                  <div key={p.id} className="px-5 py-3.5 flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-extrabold text-sm text-gray-500 flex-shrink-0">
                      {p.position}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">Token: {p.token} · Appt: {p.apptTime}</p>
                    </div>
                    {i === 0 && !consulting && (
                      <button onClick={startNext} className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold border-0 cursor-pointer">
                        Start →
                      </button>
                    )}
                    {i === 0 && consulting && <span className="text-xs text-gray-400 font-semibold">Next up</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Queue actions */}
          <div className="card p-5">
            <p className="font-extrabold text-gray-800 mb-3.5">⚡ Queue Actions</p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => markDelay(activeId, 5)}
                className="p-3.5 rounded-xl border-2 text-left font-bold text-sm cursor-pointer transition-colors"
                style={{ borderColor: '#FDE68A', background: '#FEFCE8', color: '#854D0E' }}
              >
                <Clock size={14} className="inline mr-1.5" /> Mark Running 5 Mins Late
              </button>
              <button
                onClick={() => markDelay(activeId, 10)}
                className="p-3.5 rounded-xl border-2 text-left font-bold text-sm cursor-pointer transition-colors"
                style={{ borderColor: '#FCD34D', background: '#FEF3C7', color: '#92400E' }}
              >
                <AlertTriangle size={14} className="inline mr-1.5" /> Mark Running 10 Mins Late
              </button>
              <button
                onClick={() => addEmergency(activeId)}
                className="p-3.5 rounded-xl border-2 text-left font-bold text-sm cursor-pointer transition-colors"
                style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#991B1B' }}
              >
                <Siren size={14} className="inline mr-1.5" /> Add Emergency Case
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="card p-5">
            <p className="font-extrabold text-gray-800 mb-3.5">📊 Today's Stats</p>
            {[
              ['Total Scheduled', activeDoc.patientsToday, '#1C1917'],
              ['Completed',       activeDoc.patientsToday - activeDoc.patientsLeft, '#166534'],
              ['Remaining',       activeDoc.patientsLeft, '#D85A30'],
              ['Avg Consult',     `${activeDoc.avgTime} min`, '#6C3483'],
              ['Current Delay',   activeDoc.delay ? `${activeDoc.delay} min` : 'On schedule ✓', activeDoc.delay ? '#854D0E' : '#166534'],
            ].map(([l, v, c]) => (
              <div key={l} className="flex justify-between items-center py-2.5 border-b border-gray-50 text-sm">
                <span className="text-gray-500">{l}</span>
                <span className="font-extrabold" style={{ color: c }}>{v}</span>
              </div>
            ))}
            <div className="mt-3.5">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Daily Progress</span>
                <span>{Math.round(((activeDoc.patientsToday - activeDoc.patientsLeft) / activeDoc.patientsToday) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((activeDoc.patientsToday - activeDoc.patientsLeft) / activeDoc.patientsToday) * 100}%`,
                    background: 'linear-gradient(90deg, #0F6E56, #1D9E75)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="rounded-2xl p-5 border" style={{ background: dept.bg, borderColor: dept.border }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold flex-shrink-0"
                style={{ background: '#fff', color: dept.color }}
              >
                {activeDoc.initials}
              </div>
              <div>
                <p className="font-extrabold text-sm text-gray-900">{activeDoc.name}</p>
                <p className="text-xs text-teal-700 font-semibold">{activeDoc.spec}</p>
                <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span style={{ color: '#F59E0B' }}>★</span>
              <span className="font-bold">{activeDoc.rating}</span>
              <span className="ml-1">{dept.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
