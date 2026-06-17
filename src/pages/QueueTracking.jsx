import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, RefreshCw, Phone, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS, DOCTORS } from '../data/sampleData';
import { calcWaitTime, getSmartRecommendation } from '../utils/aiEngine';
import { formatWait } from '../utils/helpers';
import SmartDecisionCard from '../components/cards/SmartDecisionCard';
import QueueCard from '../components/cards/QueueCard';
import DoctorStatus from '../components/dashboard/DoctorStatus';

export default function QueueTracking() {
  const { myBooking, doctors, queues, updateQueue, addToast } = useApp();
  const navigate = useNavigate();

  const [selectedDocId, setSelectedDocId] = useState(myBooking?.doctor?.id || DOCTORS[0].id);

  const selDoc   = doctors.find((d) => d.id === selectedDocId) || doctors[0];
  const myQueue  = queues[selectedDocId] || [];

  // Use real booking data if tracking the booked doctor, else demo numbers
  const myEntry = myBooking && myBooking.doctor?.id === selectedDocId
    ? { pos: myBooking.queuePosition, ahead: myBooking.patientsAhead }
    : { pos: 5, ahead: 4 };

  const { mins: waitMins, confidence } = calcWaitTime(myEntry.ahead, selDoc.avgTime, selDoc.delay);
  const recommendation = getSmartRecommendation(waitMins, selDoc.delay, myEntry.ahead, selDoc.status);

  // Simulate queue movement every 12s for the selected doctor
  useEffect(() => {
    const t = setInterval(() => {
      updateQueue(selectedDocId, (prevQueue) => {
        if (prevQueue.length <= 1) return prevQueue;
        const next = prevQueue.slice(1).map((p, i) => ({
          ...p, position: i + 1, status: i === 0 ? 'consulting' : 'waiting',
        }));
        addToast('Queue updated — a consultation just completed.', 'info');
        return next;
      });
    }, 12000);
    return () => clearInterval(t);
  }, [selectedDocId, updateQueue, addToast]);

  function manualRefresh() {
    addToast('Queue refreshed!', 'info');
  }

  return (
    <div className="page-wrap-lg">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="back-btn">
        <ChevronLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="section-title">Live Queue Tracker</h1>
          <p className="section-sub">Real-time updates · AI-powered estimates</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 rounded-full px-3.5 py-2 border border-green-100">
          <span className="w-2 h-2 rounded-full bg-green-500 live-ring" />
          <span className="text-xs font-bold text-green-700">Live · Auto-updating</span>
        </div>
      </div>

      {/* Doctor tabs */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2">
        {doctors.slice(0, 8).map((doc) => {
          const dept = DEPARTMENTS.find((d) => d.id === doc.dept);
          const active = selectedDocId === doc.id;
          return (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 cursor-pointer transition-all flex-shrink-0 whitespace-nowrap"
              style={{ borderColor: active ? dept?.color : '#E5E7EB', background: active ? dept?.bg : '#fff' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold"
                style={{ background: dept?.bg, color: dept?.color }}
              >
                {doc.initials}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800">{doc.name.split(' ').slice(0, 2).join(' ')}</p>
                <p className="text-[10px] text-gray-500">{(queues[doc.id] || []).length} waiting</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Main column ────────────────────────────────────────────── */}
        <div>
          <SmartDecisionCard recommendation={recommendation} />

          <div className="mb-6">
            <QueueCard
              position={myEntry.pos}
              patientsAhead={myEntry.ahead}
              waitMins={waitMins}
              confidence={confidence}
            />
          </div>

          <div className="mb-6">
            <DoctorStatus doctor={selDoc} />
          </div>

          {/* Queue list */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
              <span className="font-extrabold text-gray-800">Current Queue</span>
              <span className="text-xs font-bold text-gray-500">{myQueue.length} patients</span>
            </div>
            {myQueue.length === 0 ? (
              <div className="p-10 text-center text-gray-400">Queue is empty</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {myQueue.map((p) => (
                  <div
                    key={p.id}
                    className="px-5 py-3.5 flex items-center gap-3.5 transition-colors"
                    style={{ background: p.status === 'consulting' ? '#E1F5EE' : '#fff' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0"
                      style={{ background: p.status === 'consulting' ? '#0F6E56' : '#F3F4F6', color: p.status === 'consulting' ? '#fff' : '#6B7280' }}
                    >
                      {p.position}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">Token: {p.token} · {p.apptTime}</p>
                    </div>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: p.status === 'consulting' ? '#0F6E56' : '#F3F4F6', color: p.status === 'consulting' ? '#fff' : '#9CA3AF' }}
                    >
                      {p.status === 'consulting' ? 'In Consultation' : 'Waiting'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* AI Engine breakdown */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🤖</span>
              <span className="font-extrabold text-gray-800">AI Wait Engine</span>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-500 font-mono mb-3">
              Wait = (Ahead × AvgTime) + Delay
            </div>
            {[
              ['Patients Ahead', myEntry.ahead],
              ['× Avg Consult', `${selDoc.avgTime} min`],
              ['+ Doctor Delay', `${selDoc.delay || 0} min`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">{l}</span>
                <span className="font-bold text-gray-800">{v}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 mt-1 border-t-2 border-teal-50">
              <span className="font-extrabold text-gray-800 text-sm">= Estimated Wait</span>
              <span className="font-black text-teal-600">{waitMins} min</span>
            </div>
            <div className="bg-teal-50 rounded-lg px-3 py-2.5 flex justify-between items-center mt-3">
              <span className="text-teal-700 font-bold text-sm">🎯 Confidence</span>
              <span className="text-teal-700 font-black text-sm">{confidence}%</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card p-5">
            <p className="font-extrabold text-gray-800 mb-3.5">Quick Actions</p>
            {[
              { icon: Bell,      label: 'Set Arrival Alert', action: () => addToast("Alert set! You'll be notified 15 min before your turn.", 'success') },
              { icon: RefreshCw, label: 'Refresh Queue',     action: manualRefresh },
              { icon: Phone,     label: 'Call Reception',    action: () => addToast('Opening hospital reception...', 'info') },
              { icon: Share2,    label: 'Share Position',    action: () => addToast('Queue position link copied!', 'success') },
            ].map((a) => (
              <button
                key={a.label}
                onClick={a.action}
                className="flex items-center gap-2.5 w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-teal-50 text-gray-700 font-bold text-sm mb-2.5 transition-colors cursor-pointer text-left"
              >
                <a.icon size={15} /> {a.label}
              </button>
            ))}
          </div>

          {/* Dept load */}
          <div className="card p-5">
            <p className="font-extrabold text-gray-800 mb-3.5">Department Load</p>
            {DEPARTMENTS.map((d) => {
              const total = doctors.filter((x) => x.dept === d.id).reduce((s, x) => s + x.patientsLeft, 0);
              return (
                <div key={d.id} className="mb-3">
                  <div className="flex justify-between mb-1.5 text-sm">
                    <span className="font-semibold text-gray-600">{d.name}</span>
                    <span className="font-extrabold" style={{ color: d.color }}>{total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (total / 30) * 100)}%`, background: d.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
