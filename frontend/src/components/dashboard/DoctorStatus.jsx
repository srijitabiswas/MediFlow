import { AlertTriangle, AlertCircle } from 'lucide-react';
import { DEPARTMENTS } from '../../data/sampleData';
import { statusInfo } from '../../utils/helpers';

export default function DoctorStatus({ doctor }) {
  if (!doctor) return null;
  const dept = DEPARTMENTS.find((d) => d.id === doctor.dept) || DEPARTMENTS[0];
  const st   = statusInfo(doctor.status, doctor.delay);

  return (
    <div className="card p-5 animate-slideIn">
      {/* Doctor row */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold flex-shrink-0"
          style={{ background: dept.bg, color: dept.color, border: `2px solid ${dept.color}22` }}
        >
          {doctor.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-gray-900">{doctor.name}</p>
          <p className="text-sm text-gray-500">{doctor.spec}</p>
          <span className={`mt-1 inline-block ${st.cls} text-[11px] font-bold px-2.5 py-0.5 rounded-full`}>
            {st.label}
          </span>
        </div>
        {doctor.delay > 0 && (
          <div className="text-center bg-yellow-50 rounded-xl px-3 py-2 border border-yellow-200">
            <p className="font-black text-yellow-700 text-xl leading-none">{doctor.delay}</p>
            <p className="text-[10px] text-yellow-600 font-bold">mins late</p>
          </div>
        )}
      </div>

      {/* Delay banner */}
      {doctor.delay > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 rounded-xl px-4 py-3 border border-yellow-200 mb-3">
          <AlertTriangle size={16} color="#854D0E" />
          <span className="text-sm font-bold text-yellow-800">
            Doctor is running {doctor.delay} minutes behind schedule.
          </span>
        </div>
      )}

      {/* Emergency banner */}
      {doctor.status === 'emergency' && (
        <div className="flex items-center gap-2 bg-red-50 rounded-xl px-4 py-3 border border-red-200">
          <AlertCircle size={16} color="#991B1B" />
          <span className="text-sm font-bold text-red-800">
            Emergency patient in queue. Wait times have been updated.
          </span>
        </div>
      )}
    </div>
  );
}
