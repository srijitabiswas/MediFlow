/**
 * StatsCard – metric summary card with icon, value, and label.
 * Props: icon (emoji or component), value, label, color, bg
 */
export default function StatsCard({ icon, value, label, color = '#0F6E56', bg = '#E1F5EE', sub }) {
  return (
    <div className="card p-5 flex flex-col gap-3 animate-fadeUp">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: bg }}
      >
        {typeof icon === 'string' ? icon : <span style={{ color }}>{icon}</span>}
      </div>
      <div>
        <div className="text-2xl font-black" style={{ color }}>{value}</div>
        <div className="text-sm text-gray-500 font-semibold mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
