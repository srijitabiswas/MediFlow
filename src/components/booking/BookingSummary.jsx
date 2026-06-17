import { DEPARTMENTS } from '../../data/sampleData';
import { formatWait } from '../../utils/helpers';

export default function BookingSummary({ dept, doctor, slot, waitMins, patientsAhead, confidence, onConfirm, loading }) {
  const deptObj = DEPARTMENTS.find((d) => d.id === dept?.id) || dept;

  const rows = [
    ['Department',     `${deptObj?.icon} ${deptObj?.name}`],
    ['Doctor',         doctor?.name],
    ['Specialization', doctor?.spec],
    ['Time Slot',      slot?.time],
    ['Avg. Consult',   `${doctor?.avgTime} min`],
    ['Patients Ahead', patientsAhead],
    ['Est. Wait',      formatWait(waitMins)],
  ];

  return (
    <div>
      <h2 className="section-title mb-1">Confirm Your Booking</h2>
      <p className="section-sub mb-6">Review your appointment details before confirming</p>

      <div className="card overflow-hidden mb-5">
        <div className="px-5 py-4" style={{ background: deptObj?.color || '#0F6E56' }}>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Booking Summary</p>
          <p className="text-white font-black text-lg">{doctor?.name}</p>
          <p className="text-white/80 text-sm">{deptObj?.name} · {slot?.time}</p>
        </div>

        <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4">
          {rows.map(([l, v]) => (
            <div key={l}>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{l}</p>
              <p className="font-bold text-gray-900 text-sm">{v}</p>
            </div>
          ))}
        </div>

        {/* AI confidence */}
        <div className="px-5 pb-5">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
            <span>🤖 AI Prediction Confidence</span>
            <span style={{ color: deptObj?.color || '#0F6E56' }}>{confidence}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${confidence}%`, background: deptObj?.color || '#0F6E56' }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading}
        className="btn-primary w-full text-base py-4 disabled:opacity-60"
      >
        {loading ? '⏳ Booking...' : '✓ Confirm Appointment'}
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        By confirming, you agree to arrive within 10 minutes of your estimated time.
      </p>
    </div>
  );
}
