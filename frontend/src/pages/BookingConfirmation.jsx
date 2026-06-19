import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PartyPopper } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AppointmentCard from '../components/cards/AppointmentCard';

export default function BookingConfirmation() {
  const { myBooking, setRole } = useApp();
  const navigate = useNavigate();

  useEffect(() => { setRole('patient'); }, [setRole]);

  // Guard: no booking yet → send back to booking flow
  if (!myBooking) {
    return (
      <div className="page-wrap max-w-lg text-center">
        <button onClick={() => navigate('/')} className="back-btn mx-auto">
          <ChevronLeft size={16} /> Back to Home
        </button>
        <div className="card p-10 mt-6">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-extrabold text-gray-800 text-lg mb-2">No booking found</p>
          <p className="text-gray-500 text-sm mb-6">You haven't booked an appointment yet.</p>
          <button onClick={() => navigate('/book')} className="btn-primary">
            Book an Appointment →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap max-w-lg">
      {/* Back button */}
      <button onClick={() => navigate('/book')} className="back-btn">
        <ChevronLeft size={16} /> Book Another
      </button>

      {/* Success header */}
      <div className="text-center mb-7 animate-scaleIn">
        <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
          <PartyPopper size={38} color="#0F6E56" />
        </div>
        <h1 className="font-display text-3xl text-gray-900 mb-1.5">Booking Confirmed!</h1>
        <p className="text-gray-500">Your appointment is registered successfully</p>
      </div>

      {/* Appointment card */}
      <AppointmentCard booking={myBooking} />

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button onClick={() => navigate('/queue')} className="btn-primary flex-1 text-base py-3.5">
          Track My Queue →
        </button>
        <button onClick={() => navigate('/profile')} className="btn-outline text-base py-3.5">
          My Bookings
        </button>
      </div>

      {/* Tip */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 flex gap-2">
        <span>💡</span>
        <span>Tip: Use the chatbot (bottom-right) anytime if you have questions about your queue or wait time.</span>
      </div>
    </div>
  );
}
