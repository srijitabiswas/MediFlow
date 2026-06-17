import { useState } from 'react';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'info',    icon: '📋', text: 'Your appointment has been confirmed.',            time: 'Just now' },
  { id: 2, type: 'success', icon: '✅', text: 'Queue position updated to #5.',                   time: '2 min ago' },
  { id: 3, type: 'warning', icon: '⚠️', text: 'Dr. Rahul Gupta is running 5 minutes late.',      time: '5 min ago' },
  { id: 4, type: 'info',    icon: '🤖', text: 'AI has recalculated your wait time to 38 mins.', time: '5 min ago' },
];

const TYPE_STYLE = {
  info:    'bg-blue-50   border-blue-200   text-blue-800',
  success: 'bg-green-50  border-green-200  text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error:   'bg-red-50    border-red-200    text-red-800',
};

export default function NotificationPanel({ extra = [] }) {
  const [items, setItems] = useState([...INITIAL_NOTIFICATIONS, ...extra]);

  function dismiss(id) {
    setItems((n) => n.filter((x) => x.id !== id));
  }

  if (!items.length) {
    return (
      <div className="card p-6 text-center text-gray-400 text-sm">
        🔔 No notifications right now
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <span className="font-extrabold text-gray-800">🔔 Notifications</span>
        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>

      <div className="divide-y divide-gray-50">
        {items.map((n) => (
          <div
            key={n.id}
            className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mb-1 border ${TYPE_STYLE[n.type]}`}>
                {n.type}
              </p>
              <p className="text-sm text-gray-700 font-medium">{n.text}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="bg-transparent border-0 cursor-pointer text-gray-300 hover:text-gray-500 text-base leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
