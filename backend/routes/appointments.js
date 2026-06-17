const router = require('express').Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Queue = require('../models/Queue');
const { calcWaitTime, generateToken } = require('../utils/aiEngine');

// GET appointments (filter by doctor, date, status)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const d = new Date(req.query.date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.scheduledDate = { $gte: d, $lt: next };
    }

    const appts = await Appointment.find(filter)
      .populate('patient', 'name phone age')
      .populate('doctor', 'name department specialization avgConsultationTime status delayMinutes')
      .sort({ queuePosition: 1 });

    res.json({ success: true, data: appts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST book appointment
router.post('/', async (req, res) => {
  try {
    const { patientName, patientPhone, doctorId, department, scheduledTime } = req.body;

    // Upsert patient
    let patient = await Patient.findOne({ phone: patientPhone });
    if (!patient) {
      patient = await Patient.create({ name: patientName, phone: patientPhone });
    }

    // Get doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Count existing appointments for doctor today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCount = await Appointment.countDocuments({
      doctor: doctorId,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled', 'no_show'] },
    });

    const queuePosition = existingCount + 1;
    const patientsAhead = existingCount;
    const token = generateToken(department, queuePosition);
    const { estimatedWait, confidence } = calcWaitTime(
      patientsAhead,
      doctor.avgConsultationTime,
      doctor.delayMinutes
    );

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      department,
      scheduledTime,
      queuePosition,
      patientsAhead,
      estimatedWaitMinutes: estimatedWait,
      aiConfidence: confidence,
      token,
      status: 'booked',
    });

    await appointment.populate([
      { path: 'patient', select: 'name phone' },
      { path: 'doctor', select: 'name department specialization avgConsultationTime status delayMinutes rating' },
    ]);

    // Emit new booking event
    const io = req.app.get('io');
    if (io) {
      io.emit('queue:newBooking', {
        doctorId,
        token,
        patientName,
        queuePosition,
        estimatedWait,
      });
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET single appointment
router.get('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findOne({
      $or: [{ _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }, { appointmentId: req.params.id }],
    })
      .populate('patient', 'name phone age')
      .populate('doctor', 'name department specialization avgConsultationTime status delayMinutes');

    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
