import { Calendar, Clock, MapPin } from 'lucide-react';
import { DEPARTMENTS } from '../../data/sampleData';
import { formatWait } from '../../utils/helpers';

export default function AppointmentCard({ booking, onTrack }) {
  if (!booking) return null;
  const dept = DEPARTMENTS.find((d) => d.id === booking.dept?.id) || booking.dept || DEPARTMENTS[0];

  return (
    <div
      className="card overflow-hidden animate-scaleIn"
      style={{ border: `2px solid ${dept.color || '#0F6E56'}` }}
    >
      {/* Header strip */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: dept.color || '#0F6E56' }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Appointment ID
          </p>
          <p className="text-white font-black text-xl">{booking.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Token
          </p>
          <p className="text-white font-black text-3xl">{booking.token}</p>
        </div>
      </div>

      {/* Details grid */}
      <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4">
        {[
          ['Department',     dept.name || booking.dept],
          ['Doctor',         booking.doctor?.name],
          ['Scheduled',      booking.slot?.time],
          ['Queue Position', `#${booking.queuePosition}`],
          ['Patients Ahead', booking.patientsAhead],
          ['Est. Wait',      formatWait(booking.waitMins)],
        ].map(([l, v]) => (
          <div key={l}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{l}</p>
            <p className="font-extrabold text-gray-900 text-sm">{v}</p>
          </div>
        ))}
      </div>

      {/* AI confidence bar */}
      <div className="px-5 pb-5">
        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
          <span>🤖 AI Confidence</span>
          <span style={{ color: dept.color || '#0F6E56' }}>{booking.confidence}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${booking.confidence}%`, background: dept.color || '#0F6E56' }}
          />
        </div>
      </div>

      {onTrack && (
        <div className="px-5 pb-5">
          <button onClick={onTrack} className="btn-primary w-full text-base py-3">
            Track My Queue →
          </button>
        </div>
      )}
    </div>
  );
}
