import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LocationSetup() {
  const { requestLocation, setUserLocation, hasLocation, isAuthenticated } = useApp();
  const navigate  = useNavigate();
  const routerLoc = useLocation();
  const from = routerLoc.state?.from || '/dashboard';

  const [status, setStatus] = useState('idle'); // idle | requesting | error
  const [error,  setError]  = useState('');

  // If not logged in at all, this page makes no sense — bounce to login
  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { state: { from }, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Already have location? Continue immediately.
  useEffect(() => {
    if (hasLocation) navigate(from, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLocation]);

  async function handleAllow() {
    setStatus('requesting');
    setError('');
    try {
      await requestLocation();
      navigate(from, { replace: true });
    } catch (err) {
      setStatus('error');
      setError(
        err?.code === 1
          ? 'Location permission was denied. Please allow location access in your browser settings, or continue with an approximate location.'
          : 'Could not get your location. Please check your device settings and try again.'
      );
    }
  }

  // Demo-friendly fallback so judges/testers are never blocked if their
  // browser denies geolocation — uses a sensible default city-center point.
  function handleSkip() {
    setUserLocation({ lat: 22.5726, lng: 88.3639, approximate: true }); // Kolkata city center as a neutral default
    navigate(from, { replace: true });
  }

  return (
    <div className="page-wrap max-w-md">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
          <MapPin size={32} color="#0F6E56" />
        </div>

        <h1 className="font-display text-2xl text-gray-900 mb-2">Find Doctors Near You</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          MediFlow shows you clinics and doctors within walking or short driving distance —
          not ones halfway across the country. We need your location just once to do this.
        </p>

        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex gap-3 text-left">
          <ShieldCheck size={20} color="#0F6E56" className="flex-shrink-0 mt-0.5" />
          <p className="text-xs text-teal-800 leading-relaxed">
            Your location is only used to calculate distance to nearby clinics. It is stored on
            your device for this demo and is never shared.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3 mb-4 text-left">
            {error}
          </div>
        )}

        <button
          onClick={handleAllow}
          disabled={status === 'requesting'}
          className="btn-primary w-full py-3.5 text-base mb-3 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {status === 'requesting' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Getting your location...
            </>
          ) : (
            <>📍 Allow Location Access</>
          )}
        </button>

        <button onClick={handleSkip} className="text-sm text-gray-400 font-semibold bg-transparent border-0 cursor-pointer hover:text-gray-600">
          Skip for now — use an approximate location
        </button>
      </div>
    </div>
  );
}
