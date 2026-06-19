import { DEPARTMENTS } from '../../data/sampleData';

export default function DepartmentSelector({ selected, onSelect }) {
  return (
    <div>
      <h2 className="section-title mb-1">Choose Department</h2>
      <p className="section-sub mb-7">Which medical department do you need?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEPARTMENTS.map((dept) => {
          const isSelected = selected?.id === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => onSelect(dept)}
              className="text-left p-6 rounded-2xl border-2 bg-white transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
              style={{ borderColor: isSelected ? dept.color : '#E5E7EB' }}
              onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.borderColor = dept.color + '77'; }}
              onMouseOut={(e)  => { if (!isSelected) e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: dept.bg }}
              >
                {dept.icon}
              </div>

              <p className="font-extrabold text-base text-gray-900 mb-1">{dept.name}</p>
              <p className="text-sm text-gray-500 mb-3">{dept.desc}</p>
              <p className="text-xs font-bold" style={{ color: dept.color }}>
                ~{dept.avgWait} min avg wait
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
