const router = require('express').Router();
const Doctor = require('../models/Doctor');

// GET all doctors (optionally filter by dept)
router.get('/', async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.department) filter.department = req.query.department;
    const doctors = await Doctor.find(filter).sort({ name: 1 });
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update doctor status (e.g., mark delay)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, delayMinutes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (delayMinutes !== undefined) update.delayMinutes = delayMinutes;

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('doctor:statusUpdated', {
        doctorId: doctor._id,
        status: doctor.status,
        delayMinutes: doctor.delayMinutes,
        name: doctor.name,
      });
    }

    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create doctor (admin)
router.post('/', async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
