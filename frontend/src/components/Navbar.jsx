import { useNavigate } from 'react-router-dom';
import { Activity, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRequirePatientAccess } from '../utils/useRequirePatientAccess';

const ROLES = ['patient', 'doctor', 'admin'];
const ROLE_DEST = { patient: '/', doctor: '/doctor', admin: '/admin' };

export default function Navbar() {
  const { role, setRole, isAuthenticated, user, backendOnline } = useApp();
  const navigate = useNavigate();
  const goToPatientFlow = useRequirePatientAccess();

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
        <span
          className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{
            background: backendOnline ? '#DCFCE7' : '#FEF9C3',
            color:      backendOnline ? '#166534' : '#854D0E',
          }}
          title={backendOnline ? 'Connected to live backend' : 'Backend offline — running on local sample data'}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: backendOnline ? '#22C55E' : '#EAB308' }}
          />
          {backendOnline ? 'Live' : 'Demo Mode'}
        </span>
      </button>

      <div className="flex items-center gap-3">
        {/* Role switcher (demo only — doesn't require login to view Doctor/Admin dashboards) */}
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

        {/* Context CTA — routes through auth/location checks so it always lands in the right place */}
        {role === 'patient' && (
          <button onClick={() => goToPatientFlow('/book')} className="btn-primary text-sm px-4 py-2">
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

        {/* Auth area */}
        {isAuthenticated ? (
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-teal-100 bg-teal-50 hover:bg-teal-100 cursor-pointer transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.fullName?.slice(0, 1).toUpperCase() || <User size={13} />}
            </span>
            <span className="text-xs font-bold text-teal-700 hidden sm:inline">{user?.fullName?.split(' ')[0]}</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl text-sm font-bold text-teal-700 border-2 border-teal-100 bg-white hover:bg-teal-50 cursor-pointer transition-colors"
          >
            Log In
          </button>
        )}
      </div>
    </nav>
  );
}
