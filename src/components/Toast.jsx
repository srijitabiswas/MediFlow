import { useApp } from '../context/AppContext';

const STYLE = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error:   'bg-red-50   border-red-400   text-red-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  info:    'bg-blue-50  border-blue-400  text-blue-800',
};

export default function Toast() {
  const { toasts } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${STYLE[t.type] || STYLE.info} border-2 rounded-2xl px-5 py-3 text-sm font-bold text-center shadow-lg animate-fadeUp`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
