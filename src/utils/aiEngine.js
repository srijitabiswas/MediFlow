// ─── AI Wait Time Engine ─────────────────────────────────────────────────────
// Formula: EstWait = (patientsAhead × avgConsultTime) + delayMinutes
export function calcWaitTime(patientsAhead, avgTime = 10, delay = 0) {
  const base       = patientsAhead * avgTime;
  const total      = base + delay;
  const confidence = Math.max(68, Math.min(97, 97 - patientsAhead * 2 - (delay > 0 ? 8 : 0)));
  return { mins: Math.max(0, Math.round(total)), confidence: Math.round(confidence) };
}

// ─── Smart Decision Assistant ─────────────────────────────────────────────────
export function getSmartRecommendation(waitMins, delayMins, patientsAhead, doctorStatus) {
  if (doctorStatus === 'emergency') return {
    type: 'danger',
    title: 'Emergency case in progress',
    message: 'An emergency patient was added. Your estimated wait has increased.',
    action: `Leave for hospital in ${Math.max(5, waitMins - 20)} minutes.`,
  };

  if (delayMins >= 15) return {
    type: 'warning',
    title: 'Significant doctor delay detected',
    message: `Doctor is running ${delayMins} min behind schedule. Arrival time updated.`,
    action: `Leave for the hospital in ${Math.max(5, waitMins - 15)} minutes.`,
  };

  if (delayMins >= 5) return {
    type: 'warning',
    title: 'Doctor running slightly late',
    message: `Doctor is ${delayMins} min behind. Minor adjustment made.`,
    action: `Leave for the hospital in ${Math.max(5, waitMins - 10)} minutes.`,
  };

  if (waitMins > 50) return {
    type: 'success',
    title: 'Plenty of time — relax!',
    message: 'Queue is moving at normal speed. No need to rush.',
    action: `Leave for the hospital in ${waitMins - 25} minutes.`,
  };

  if (waitMins > 25) return {
    type: 'info',
    title: 'Start preparing to leave',
    message: 'Your turn is approaching. Begin getting ready.',
    action: `Leave within the next ${Math.ceil(waitMins / 3)} minutes.`,
  };

  if (waitMins > 10) return {
    type: 'warning',
    title: 'Head to hospital soon!',
    message: 'You are getting close to your turn.',
    action: 'Leave for the hospital now.',
  };

  return {
    type: 'danger',
    title: 'Leave immediately!',
    message: 'You are next or nearly next in queue.',
    action: 'Head to the hospital right now!',
  };
}

// ─── Token generator ─────────────────────────────────────────────────────────
export function generateToken(dept, position) {
  const pfx = { gen: 'G', card: 'C', derm: 'D', peds: 'P', orth: 'O' }[dept] || 'X';
  return `${pfx}${String(position).padStart(2, '0')}`;
}
