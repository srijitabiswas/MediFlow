import { Zap, RefreshCw } from 'lucide-react';
import { formatWait } from '../../utils/helpers';

export default function WaitTimeWidget({ waitMins, confidence, patientsAhead, avgTime, delay, onRefresh }) {
  return (
    <div
      className="card p-6 text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #1D9E75 100%)' }}
    >
      {/* Decorative circle */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />

      <p className="text-teal-100 text-sm font-bold mb-1 relative z-10">Estimated Wait Time</p>
      <p className="text-white font-black mb-1 relative z-10" style={{ fontSize: 52 }}>
        {waitMins}
      </p>
      <p className="text-teal-100 font-bold relative z-10">minutes</p>

      {/* Formula breakdown */}
      <div
        className="rounded-xl p-3 mt-5 text-left relative z-10"
        style={{ background: 'rgba(255,255,255,0.12)' }}
      >
        <p className="text-[10px] text-teal-100 font-bold uppercase tracking-widest mb-2">🤖 AI Calculation</p>
        <div className="space-y-1 text-xs">
          {[
            ['Patients Ahead', `${patientsAhead}`],
            ['× Avg Consult',  `${avgTime} min`],
            ['+ Doctor Delay', `${delay || 0} min`],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-teal-100">
              <span>{l}</span><span className="font-bold">{v}</span>
            </div>
          ))}
          <div className="flex justify-between text-white font-black border-t border-white/20 pt-1 mt-1">
            <span>= Total Wait</span><span>{waitMins} min</span>
          </div>
        </div>
      </div>

      {/* Confidence + refresh */}
      <div className="flex items-center justify-between mt-4 relative z-10">
        <div className="flex items-center gap-1.5">
          <Zap size={14} color="#9FE1CB" />
          <span className="text-teal-100 text-xs font-bold">AI Confidence</span>
          <span className="text-white font-black text-sm">{confidence}%</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={11} /> Refresh
          </button>
        )}
      </div>
    </div>
  );
}
