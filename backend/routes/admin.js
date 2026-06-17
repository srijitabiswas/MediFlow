const router = require('express').Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// GET overall dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalDoctors,
      activeDoctors,
      totalApptsToday,
      completedToday,
      waitingCount,
      consultingCount,
      delayedDoctors,
      totalPatients,
    ] = await Promise.all([
      Doctor.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true, status: { $nin: ['offline', 'break'] } }),
      Appointment.countDocuments({ scheduledDate: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ scheduledDate: { $gte: today, $lt: tomorrow }, status: 'completed' }),
      Appointment.countDocuments({ scheduledDate: { $gte: today, $lt: tomorrow }, status: { $in: ['booked', 'waiting', 'checked_in'] } }),
      Appointment.countDocuments({ scheduledDate: { $gte: today, $lt: tomorrow }, status: 'consulting' }),
      Doctor.countDocuments({ isActive: true, delayMinutes: { $gt: 0 } }),
      Patient.countDocuments(),
    ]);

    // Average wait time
    const avgWaitResult = await Appointment.aggregate([
      { $match: { scheduledDate: { $gte: today, $lt: tomorrow }, status: { $in: ['booked', 'waiting', 'checked_in'] } } },
      { $group: { _id: null, avgWait: { $avg: '$estimatedWaitMinutes' } } },
    ]);
    const avgWait = avgWaitResult[0]?.avgWait ? Math.round(avgWaitResult[0].avgWait) : 0;

    // Per-department breakdown
    const deptBreakdown = await Appointment.aggregate([
      { $match: { scheduledDate: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: '$department', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, waiting: { $sum: { $cond: [{ $in: ['$status', ['booked', 'waiting', 'checked_in']] }, 1, 0] } } } },
    ]);

    res.json({
      success: true,
      data: {
        totalDoctors,
        activeDoctors,
        totalApptsToday,
        completedToday,
        waitingCount,
        consultingCount,
        delayedDoctors,
        totalPatients,
        avgWaitMinutes: avgWait,
        deptBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all doctors with queue sizes
router.get('/doctors-overview', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const doctors = await Doctor.find({ isActive: true }).sort({ department: 1, name: 1 });

    const overview = await Promise.all(
      doctors.map(async (doc) => {
        const queueSize = await Appointment.countDocuments({
          doctor: doc._id,
          scheduledDate: { $gte: today, $lt: tomorrow },
          status: { $in: ['booked', 'waiting', 'checked_in'] },
        });
        const completedCount = await Appointment.countDocuments({
          doctor: doc._id,
          scheduledDate: { $gte: today, $lt: tomorrow },
          status: 'completed',
        });
        return {
          ...doc.toJSON(),
          currentQueueSize: queueSize,
          completedToday: completedCount,
        };
      })
    );

    res.json({ success: true, data: overview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
