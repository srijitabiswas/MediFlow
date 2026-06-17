export default function QueueProgress({ total, completed, current }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-gray-700 text-sm">Daily Progress</span>
        <span className="font-black text-teal-600">{pct}%</span>
      </div>

      {/* Main progress bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0F6E56, #1D9E75)' }}
        />
      </div>

      {/* Patient dots */}
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: Math.min(total, 20) }).map((_, i) => {
          let bg = '#E5E7EB'; // future
          if (i < completed)        bg = '#9FE1CB'; // done
          if (i === completed)      bg = '#0F6E56'; // current
          return (
            <div
              key={i}
              className="w-5 h-5 rounded-full transition-colors duration-300"
              style={{ background: bg }}
              title={i < completed ? 'Completed' : i === completed ? 'Current' : 'Waiting'}
            />
          );
        })}
        {total > 20 && <span className="text-xs text-gray-400 font-bold self-center">+{total - 20}</span>}
      </div>

      <div className="flex justify-between text-xs text-gray-400 font-semibold mt-3">
        <span>✓ {completed} completed</span>
        <span>⏳ {total - completed} remaining</span>
      </div>
    </div>
  );
}
