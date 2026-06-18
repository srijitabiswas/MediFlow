import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, Activity, User, Calendar, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Signup() {
  const { signup, isAuthenticated } = useApp();
  const navigate  = useNavigate();
  const routerLoc = useLocation();
  const from = routerLoc.state?.from || '/dashboard';

  const [fullName, setFullName] = useState('');
  const [age,       setAge]     = useState('');
  const [phone,     setPhone]   = useState('');
  const [password,  setPassword] = useState('');
  const [showPw,    setShowPw]  = useState(false);
  const [error,     setError]   = useState('');
  const [loading,   setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/location', { state: { from }, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (isAuthenticated) return null;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = signup({ fullName, age, phone, password });
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate('/location', { state: { from } });
    }, 400);
  }

  return (
    <div className="page-wrap max-w-md">
      <button onClick={() => navigate('/')} className="back-btn">
        <ChevronLeft size={16} /> Back to Home
      </button>

      <div className="card p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center mb-4">
            <Activity size={28} color="white" />
          </div>
          <h1 className="font-display text-2xl text-gray-900 mb-1">Create Your Account</h1>
          <p className="text-gray-500 text-sm text-center">Just a few details so we can manage your appointments</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="As per your ID"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Age</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10 digits"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 4 characters"
                className="input-field pl-11 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 bg-transparent border-0 cursor-pointer"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="text-teal-600 font-bold no-underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}