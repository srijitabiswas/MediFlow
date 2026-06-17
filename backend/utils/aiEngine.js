/**
 * MediFlow AI Wait Time Engine
 * Formula: EstimatedWait = (PatientsAhead × AvgConsultTime) + DelayFactor
 * Confidence degrades as queue length and uncertainty increase
 */

function calcWaitTime(patientsAhead, avgConsultationTime = 10, delayMinutes = 0) {
  const base = patientsAhead * avgConsultationTime;
  const total = base + delayMinutes;

  // Confidence: starts high, degrades with longer queues and delays
  const queuePenalty = patientsAhead * 2;
  const delayPenalty = delayMinutes > 0 ? 8 : 0;
  const confidence = Math.max(68, Math.min(97, 97 - queuePenalty - delayPenalty));

  return {
    estimatedWait: Math.max(0, Math.round(total)),
    confidence: Math.round(confidence),
  };
}

function generateToken(department, position) {
  const prefix = {
    gen: 'G',
    card: 'C',
    derm: 'D',
    peds: 'P',
    orth: 'O',
  }[department] || 'X';
  return `${prefix}${String(position).padStart(2, '0')}`;
}

/**
 * Smart Decision Assistant logic
 * Returns a recommendation based on wait time, delay, and queue status
 */
function getSmartRecommendation(waitMins, delayMins, patientsAhead, doctorStatus) {
  if (doctorStatus === 'emergency') {
    return {
      type: 'danger',
      title: 'Emergency case in progress',
      message: 'An emergency patient was added to the queue. Your estimated wait has increased.',
      action: `Recommended: Leave for the hospital in ${Math.max(5, waitMins - 20)} minutes.`,
      leaveInMinutes: Math.max(5, waitMins - 20),
    };
  }

  if (delayMins >= 15) {
    return {
      type: 'warning',
      title: 'Significant doctor delay detected',
      message: `Doctor is running ${delayMins} minutes behind schedule. Your arrival recommendation has been updated.`,
      action: `Leave for the hospital in ${Math.max(5, waitMins - 15)} minutes.`,
      leaveInMinutes: Math.max(5, waitMins - 15),
    };
  }

  if (delayMins >= 5) {
    return {
      type: 'warning',
      title: 'Doctor running slightly late',
      message: `Doctor is ${delayMins} minutes behind schedule. Minor adjustment to your recommended arrival.`,
      action: `Leave for the hospital in ${Math.max(5, waitMins - 10)} minutes.`,
      leaveInMinutes: Math.max(5, waitMins - 10),
    };
  }

  if (waitMins > 50) {
    return {
      type: 'success',
      title: 'Plenty of time — relax!',
      message: 'Queue is moving at normal speed. No need to rush.',
      action: `Leave for the hospital in ${waitMins - 25} minutes.`,
      leaveInMinutes: waitMins - 25,
    };
  }

  if (waitMins > 25) {
    return {
      type: 'info',
      title: 'Start preparing to leave',
      message: 'Your turn is approaching. Begin getting ready.',
      action: `Leave within the next ${Math.ceil(waitMins / 3)} minutes.`,
      leaveInMinutes: Math.ceil(waitMins / 3),
    };
  }

  if (waitMins > 10) {
    return {
      type: 'warning',
      title: 'Head to hospital soon!',
      message: 'You are getting close to your turn.',
      action: 'Leave for the hospital now.',
      leaveInMinutes: 0,
    };
  }

  return {
    type: 'danger',
    title: 'Leave immediately!',
    message: 'You are next or very nearly next in queue.',
    action: 'Head to the hospital right now!',
    leaveInMinutes: 0,
  };
}

module.exports = { calcWaitTime, generateToken, getSmartRecommendation };
