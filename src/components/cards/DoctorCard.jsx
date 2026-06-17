import { Clock, Users } from 'lucide-react';
import { DEPARTMENTS } from '../../data/sampleData';
import { statusInfo } from '../../utils/helpers';

export default function DoctorCard({ doctor, selected, onClick }) {
  const dept = DEPARTMENTS.find((d) => d.id === doctor.dept) || DEPARTMENTS[0];
  const st   = statusInfo(doctor.status, doctor.delay);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 rounded-2xl border-2 bg-white transition-all duration-200 flex items-center gap-4 cursor-pointer hover:shadow-md"
      style={{ borderColor: selected ? dept.color : '#E5E7EB' }}
      onMouseOver={(e) => { if (!selected) e.currentTarget.style.borderColor = dept.color + '88'; }}
      onMouseOut={(e)  => { if (!selected) e.currentTarget.style.borderColor = '#E5E7EB'; }}
    >
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0"
        style={{ background: dept.bg, color: dept.color, border: `2px solid ${dept.color}22` }}
      >
        {doctor.initials}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + badge */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-extrabold text-base text-gray-900">{doctor.name}</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
        </div>

        <p className="text-sm text-gray-500 mb-2">{doctor.spec}</p>

        <div className="flex gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} /> Avg. {doctor.avgTime} min
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span style={{ color: '#F59E0B', fontSize: 13 }}>★</span>
            <span className="font-bold text-yellow-800">{doctor.rating}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} /> {doctor.patientsLeft} waiting
          </span>
        </div>
      </div>

      <span className="text-gray-300 text-xl font-bold flex-shrink-0">›</span>
    </button>
  );
}
