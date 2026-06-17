import { MapPin, Users, Clock, Zap } from 'lucide-react';
import { formatWait } from '../../utils/helpers';

export default function QueueCard({ position, patientsAhead, waitMins, confidence }) {
  const stats = [
    { icon: MapPin,  label: 'Your Position',   value: `#${position}`,           color: '#0F6E56' },
    { icon: Users,   label: 'Patients Ahead',   value: patientsAhead,            color: '#C0392B' },
    { icon: Clock,   label: 'Est. Wait Time',   value: formatWait(waitMins),     color: '#6C3483' },
    { icon: Zap,     label: 'AI Confidence',    value: `${confidence}%`,         color: '#1A5276' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeUp">
      {stats.map((s) => (
        <div
          key={s.label}
          className="card p-4 flex flex-col items-center text-center gap-2"
        >
          <s.icon size={22} color={s.color} />
          <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
          <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
