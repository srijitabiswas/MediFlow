import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateSlots } from '../data/sampleData';
import { calcWaitTime, generateToken } from '../utils/aiEngine';
import { generateApptId } from '../utils/helpers';
import DepartmentSelector from '../components/booking/DepartmentSelector';
import DoctorSelector     from '../components/booking/DoctorSelector';
import TimeSlotSelector   from '../components/booking/TimeSlotSelector';
import BookingSummary     from '../components/booking/BookingSummary';

const STEP_LABELS = ['Department', 'Doctor', 'Time Slot', 'Confirm'];

export default function AppointmentBooking() {
  const { setRole, bookAppointment, addToast } = useApp();
  const navigate = useNavigate();

  // Safety net: this page is only ever meant for patients. If it was reached
  // while role was still "doctor"/"admin" (e.g. via browser back button),
  // force it back to "patient" so the Navbar/UI stays in sync.
  useEffect(() => { setRole('patient'); }, [setRole]);

  const [step,    setStep]    = useState(1);
  const [dept,    setDept]    = useState(null);
  const [doctor,  setDoctor]  = useState(null);
  const [slot,    setSlot]    = useState(null);
  const [slots]               = useState(generateSlots);
  const [loading, setLoading] = useState(false);

  // Derived wait estimate
  const patientsAhead = doctor ? doctor.patientsLeft : 0;
  const { mins: waitMins, confidence } = doctor
    ? calcWaitTime(patientsAhead, doctor.avgTime, doctor.delay)
    : { mins: 0, confidence: 90 };

  // ── Step navigation ───────────────────────────────────────────────────
  function goBack() {
    if (step === 1) navigate('/');
    else setStep((s) => s - 1);
  }

  function selectDept(d)   { setDept(d); setDoctor(null); setSlot(null); setStep(2); }
  function selectDoctor(d) { setDoctor(d); setSlot(null); setStep(3); }
  function selectSlot(s)   { setSlot(s); setStep(4); }

  // ── Confirm booking ───────────────────────────────────────────────────
  async function handleConfirm() {
    setLoading(true);
    const token = generateToken(dept.id, patientsAhead + 1);
    const localBooking = {
      id:            generateApptId(),
      dept,
      doctor,
      slot,
      clinicName:    doctor.clinicName,
      address:       doctor.address,
      distanceKm:    doctor.distanceFromUserKm,
      patientsAhead,
      queuePosition: patientsAhead + 1,
      waitMins,
      confidence,
      token,
      bookedAt:      new Date().toISOString(),
    };

    try {
      // bookAppointment tries the real API first (live mode) and always
      // falls back to this local data if the backend is offline or errors —
      // so this never actually throws in practice, but we guard anyway.
      await bookAppointment(localBooking);
      addToast('🎉 Appointment confirmed!', 'success');
      navigate('/confirmation');
    } catch (err) {
      console.error('Booking failed unexpectedly:', err);
      addToast('Something went wrong confirming your booking. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Back label per step ───────────────────────────────────────────────
  const backLabels = ['Back to Home', 'Back to Departments', 'Back to Doctors', 'Back to Time Slots'];

  return (
    <div className="page-wrap max-w-3xl">
      {/* ── Back button ──────────────────────────────────────────────── */}
      <button onClick={goBack} className="back-btn">
        <ChevronLeft size={16} />
        {backLabels[step - 1]}
      </button>

      {/* ── Progress stepper ─────────────────────────────────────────── */}
      <div className="flex items-center mb-8 gap-0">
        {STEP_LABELS.map((label, i) => {
          const num     = i + 1;
          const done    = num < step;
          const current = num === step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm transition-all duration-300"
                  style={{
                    background: done || current ? '#0F6E56' : '#E5E7EB',
                    color:      done || current ? '#fff'    : '#9CA3AF',
                  }}
                >
                  {done ? <Check size={16} /> : num}
                </div>
                <span
                  className="text-[11px] font-bold whitespace-nowrap"
                  style={{ color: current ? '#0F6E56' : '#9CA3AF' }}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mb-5 mx-1 transition-all duration-300"
                  style={{ background: done ? '#0F6E56' : '#E5E7EB' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step content ─────────────────────────────────────────────── */}
      <div className="animate-fadeUp">
        {step === 1 && <DepartmentSelector selected={dept} onSelect={selectDept} />}
        {step === 2 && <DoctorSelector dept={dept} selected={doctor} onSelect={selectDoctor} />}
        {step === 3 && (
          <TimeSlotSelector
            doctor={doctor}
            slots={slots}
            selected={slot}
            onSelect={selectSlot}
          />
        )}
        {step === 4 && (
          <BookingSummary
            dept={dept}
            doctor={doctor}
            slot={slot}
            waitMins={waitMins}
            patientsAhead={patientsAhead}
            confidence={confidence}
            onConfirm={handleConfirm}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
