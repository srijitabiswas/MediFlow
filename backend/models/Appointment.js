const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    department: { type: String, required: true },
    scheduledTime: { type: String, required: true }, // "10:30 AM"
    scheduledDate: { type: Date, default: Date.now },
    token: { type: String },

    // Queue info
    queuePosition: { type: Number },
    patientsAhead: { type: Number, default: 0 },
    estimatedWaitMinutes: { type: Number, default: 0 },
    aiConfidence: { type: Number, default: 90 },

    // Status lifecycle
    status: {
      type: String,
      enum: ['booked', 'checked_in', 'waiting', 'consulting', 'completed', 'cancelled', 'no_show'],
      default: 'booked',
    },

    // Timestamps
    checkedInAt: { type: Date },
    consultationStartedAt: { type: Date },
    consultationEndedAt: { type: Date },
    actualWaitMinutes: { type: Number },

    notes: { type: String },
    isEmergency: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate appointmentId
AppointmentSchema.pre('save', function (next) {
  if (!this.appointmentId) {
    const ts = Date.now().toString().slice(-6);
    const rand = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    this.appointmentId = `APT-${ts}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
