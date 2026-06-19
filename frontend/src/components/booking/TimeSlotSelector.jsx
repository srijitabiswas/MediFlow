import { Clock } from 'lucide-react';
import { DEPARTMENTS } from '../../data/sampleData';

export default function TimeSlotSelector({ doctor, slots, selected, onSelect }) {
  const dept = DEPARTMENTS.find((d) => d.id === doctor?.dept) || DEPARTMENTS[0];

  return (
    <div>
      <h2 className="section-title mb-1">Select Time Slot</h2>
      <p className="section-sub mb-5">Available times for <span className="font-bold text-gray-800">{doctor?.name}</span></p>

      {/* Doctor summary chip */}
      <div
        className="flex items-center gap-3 rounded-xl p-3.5 mb-6 border"
        style={{ background: dept.bg, borderColor: dept.border }}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold flex-shrink-0"
          style={{ background: '#fff', color: dept.color, border: `2px solid ${dept.color}22` }}
        >
          {doctor?.initials}
        </div>
        <div>
          <p className="font-extrabold text-sm text-gray-900">{doctor?.name}</p>
          <p className="text-xs text-gray-600">{doctor?.spec} · {doctor?.avgTime} min avg consultation</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs font-bold" style={{ color: dept.color }}>
          <Clock size={12} /> {doctor?.avgTime} min
        </div>
      </div>

      {/* Slot grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {slots.map((slot) => {
          const isSelected = selected?.time === slot.time;
          return (
            <button
              key={slot.time}
              onClick={() => slot.available && onSelect(slot)}
              disabled={!slot.available}
              className="py-3 px-2 rounded-xl text-sm font-bold transition-all duration-150 border-2"
              style={{
                borderColor:  isSelected ? dept.color : slot.available ? '#E5E7EB' : '#F3F4F6',
                background:   isSelected ? dept.bg    : slot.available ? '#fff'    : '#F9FAFB',
                color:        isSelected ? dept.color : slot.available ? '#1C1917' : '#D1D5DB',
                cursor:       slot.available ? 'pointer' : 'not-allowed',
                textDecoration: !slot.available ? 'line-through' : 'none',
              }}
            >
              {slot.time}
              {!slot.available && (
                <span className="block text-[9px] font-medium text-gray-400 mt-0.5">Booked</span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold border"
          style={{ background: dept.bg, borderColor: dept.border, color: dept.color }}
        >
          ✓ Selected: <span className="font-black">{selected.time}</span>
        </div>
      )}
    </div>
  );
}
