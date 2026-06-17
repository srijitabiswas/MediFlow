import { useNavigate, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ROLES = ['patient', 'doctor', 'admin'];

const ROLE_DEST = { patient: '/', doctor: '/doctor', admin: '/admin' };

export default function Navbar() {
  const { role, setRole } = useApp();
  const navigate          = useNavigate();

  function handleRole(r) {
    setRole(r);
    navigate(ROLE_DEST[r]);
  }

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between gap-3 px-5 h-16 border-b border-teal-50"
      style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 12px rgba(15,110,86,0.08)' }}
    >
      {/* Logo */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
          <Activity size={20} color="white" />
        </div>
        <span className="font-black text-xl text-teal-600 tracking-tight">MediFlow</span>
      </button>

      <div className="flex items-center gap-3">
        {/* Role switcher */}
        <div className="flex bg-teal-50 rounded-xl p-1 gap-0.5 border border-teal-100">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => handleRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border-0 cursor-pointer transition-all duration-200 ${
                role === r ? 'bg-teal-600 text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Context CTA */}
        {role === 'patient' && (
          <button onClick={() => navigate('/book')} className="btn-primary text-sm px-4 py-2">
            + Book Now
          </button>
        )}
        {role === 'doctor' && (
          <button
            onClick={() => navigate('/doctor')}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
            style={{ background: '#1A5276' }}
          >
            My Dashboard
          </button>
        )}
        {role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
            style={{ background: '#6C3483' }}
          >
            Admin Panel
          </button>
        )}
      </div>
    </nav>
  );
}
