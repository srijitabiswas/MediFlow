const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: {
      type: String,
      required: true,
      enum: ['gen', 'card', 'derm', 'peds', 'orth'],
    },
    specialization: { type: String, required: true },
    avgConsultationTime: { type: Number, default: 10, min: 1 }, // minutes
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    initials: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'consulting', 'delayed', 'emergency', 'break', 'offline'],
      default: 'available',
    },
    delayMinutes: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    patientsSeenToday: { type: Number, default: 0 },
    totalPatientsToday: { type: Number, default: 0 },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    photo: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

// Virtual: patients remaining
DoctorSchema.virtual('patientsRemaining').get(function () {
  return Math.max(0, this.totalPatientsToday - this.patientsSeenToday);
});

DoctorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
