const router = require('express').Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { calcWaitTime } = require('../utils/aiEngine');

// Helper: recalculate and update all wait times for a doctor's queue
async function recalculateQueue(doctorId, io) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeAppts = await Appointment.find({
    doctor: doctorId,
    scheduledDate: { $gte: today, $lt: tomorrow },
    status: { $in: ['booked', 'checked_in', 'waiting', 'consulting'] },
  })
    .sort({ queuePosition: 1 })
    .populate('patient', 'name');

  const updates = activeAppts.map((appt, idx) => {
    const pAhead = idx;
    const { estimatedWait, confidence } = calcWaitTime(pAhead, doctor.avgConsultationTime, doctor.delayMinutes);
    return {
      id: appt._id,
      appointmentId: appt.appointmentId,
      patientName: appt.patient?.name,
      token: appt.token,
      queuePosition: idx + 1,
      patientsAhead: pAhead,
      estimatedWaitMinutes: estimatedWait,
      aiConfidence: confidence,
      status: appt.status,
    };
  });

  // Bulk update positions
  for (const [i, appt] of activeAppts.entries()) {
    const pAhead = i;
    const { estimatedWait } = calcWaitTime(pAhead, doctor.avgConsultationTime, doctor.delayMinutes);
    await Appointment.findByIdAndUpdate(appt._id, {
      queuePosition: i + 1,
      patientsAhead: pAhead,
      estimatedWaitMinutes: estimatedWait,
    });
  }

  // Broadcast updated queue to all clients
  if (io) {
    io.emit('queue:updated', {
      doctorId,
      doctorName: doctor.name,
      entries: updates,
      delayMinutes: doctor.delayMinutes,
      status: doctor.status,
    });
  }

  return updates;
}

// GET live queue for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appts = await Appointment.find({
      doctor: req.params.doctorId,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['booked', 'checked_in', 'waiting', 'consulting'] },
    })
      .sort({ queuePosition: 1 })
      .populate('patient', 'name phone');

    const entries = appts.map((a) => ({
      id: a._id,
      appointmentId: a.appointmentId,
      patientName: a.patient?.name,
      token: a.token,
      queuePosition: a.queuePosition,
      patientsAhead: a.patientsAhead,
      estimatedWaitMinutes: a.estimatedWaitMinutes,
      aiConfidence: a.aiConfidence,
      status: a.status,
    }));

    res.json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          status: doctor.status,
          delayMinutes: doctor.delayMinutes,
          avgConsultationTime: doctor.avgConsultationTime,
        },
        entries,
        totalInQueue: entries.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Doctor completes consultation (advances queue)
router.post('/complete/:doctorId', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find the currently-consulting appointment
    const current = await Appointment.findOne({
      doctor: req.params.doctorId,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: 'consulting',
    });

    if (current) {
      current.status = 'completed';
      current.consultationEndedAt = new Date();
      if (current.consultationStartedAt) {
        current.actualWaitMinutes = Math.round(
          (current.consultationEndedAt - current.consultationStartedAt) / 60000
        );
      }
      await current.save();
    }

    // Set next patient to consulting
    const next = await Appointment.findOne({
      doctor: req.params.doctorId,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['booked', 'waiting', 'checked_in'] },
      queuePosition: 1,
    });

    if (next) {
      next.status = 'consulting';
      next.consultationStartedAt = new Date();
      await next.save();
    }

    await Doctor.findByIdAndUpdate(req.params.doctorId, { $inc: { patientsSeenToday: 1 } });

    const io = req.app.get('io');
    const entries = await recalculateQueue(req.params.doctorId, io);

    res.json({ success: true, message: 'Consultation completed', data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Doctor marks delay
router.post('/delay/:doctorId', async (req, res) => {
  try {
    const delayMinutes = Number(req.body.delayMinutes);
    if (!Number.isFinite(delayMinutes) || delayMinutes <= 0) {
      return res.status(400).json({ success: false, message: 'delayMinutes must be a positive number' });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.doctorId,
      { $inc: { delayMinutes }, status: 'delayed' },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const io = req.app.get('io');
    if (io) {
      io.emit('doctor:delay', {
        doctorId: doctor._id,
        doctorName: doctor.name,
        delayMinutes: doctor.delayMinutes,
        message: `Dr. ${doctor.name} is now running ${doctor.delayMinutes} minutes behind schedule.`,
      });
    }

    const entries = await recalculateQueue(req.params.doctorId, io);
    res.json({ success: true, data: { doctor, entries } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Add emergency patient
router.post('/emergency/:doctorId', async (req, res) => {
  try {
    const { patientName = 'Emergency Patient' } = req.body;
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // If a patient is currently being consulted, pause them back to "waiting" —
    // the emergency case takes priority and will be seen first. Without this,
    // we'd end up with two appointments simultaneously marked "consulting".
    const currentlyConsulting = await Appointment.findOne({
      doctor: req.params.doctorId,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: 'consulting',
    });
    if (currentlyConsulting) {
      currentlyConsulting.status = 'waiting';
      await currentlyConsulting.save();
    }

    // Reuse or create the emergency patient record
    let emgPatient = await Patient.findOne({ name: patientName, phone: '0000000000' });
    if (!emgPatient) emgPatient = await Patient.create({ name: patientName, phone: '0000000000' });

    // Insert at the very front of the queue (position 0 sorts before everyone else)
    await Appointment.create({
      patient: emgPatient._id,
      doctor: req.params.doctorId,
      department: doctor.department,
      scheduledTime: 'NOW',
      scheduledDate: today,
      queuePosition: 0,
      patientsAhead: 0,
      estimatedWaitMinutes: 0,
      token: `EMG-${Date.now().toString().slice(-4)}`,
      status: 'consulting',
      isEmergency: true,
      consultationStartedAt: new Date(),
    });

    await Doctor.findByIdAndUpdate(req.params.doctorId, {
      status: 'emergency',
      $inc: { delayMinutes: 15 },
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('queue:emergency', {
        doctorId: req.params.doctorId,
        doctorName: doctor.name,
        message: `Emergency patient added to Dr. ${doctor.name}'s queue. All wait times updated.`,
      });
    }

    const entries = await recalculateQueue(req.params.doctorId, io);
    res.json({ success: true, message: 'Emergency patient added', data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
