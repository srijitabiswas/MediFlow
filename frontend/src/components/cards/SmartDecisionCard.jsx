import { Navigation } from 'lucide-react';

const STYLES = {
  success: { bg: '#DCFCE7', border: '#22C55E', text: '#166534', icon: '✅' },
  info:    { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: 'ℹ️' },
  warning: { bg: '#FEF9C3', border: '#EAB308', text: '#854D0E', icon: '⚠️' },
  danger:  { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', icon: '🚨' },
};

export default function SmartDecisionCard({ recommendation }) {
  if (!recommendation) return null;
  const s = STYLES[recommendation.type] || STYLES.info;

  return (
    <div
      className="rounded-2xl p-5 mb-5 animate-slideIn"
      style={{ background: s.bg, border: `2px solid ${s.border}` }}
    >
      <div className="flex gap-4 items-start">
        {/* Icon bubble */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: s.border + '22' }}
        >
          {s.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Label */}
          <span
            className="inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded mb-2"
            style={{ background: s.border + '22', color: s.text }}
          >
            🤖 Smart Decision Assistant
          </span>

          {/* Title */}
          <h3 className="font-black text-lg mb-1.5 leading-tight" style={{ color: s.text }}>
            {recommendation.title}
          </h3>

          {/* Message */}
          <p className="text-sm leading-relaxed mb-3" style={{ color: s.text, opacity: 0.9 }}>
            {recommendation.message}
          </p>

          {/* Action pill */}
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 border-l-4"
            style={{ background: 'rgba(255,255,255,0.72)', borderLeftColor: s.border }}
          >
            <Navigation size={15} color={s.text} />
            <span className="font-extrabold text-sm" style={{ color: s.text }}>
              {recommendation.action}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
