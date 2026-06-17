const mongoose = require('mongoose');

const QueueEntrySchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patientName: { type: String },
  token: { type: String },
  position: { type: Number },
  status: {
    type: String,
    enum: ['waiting', 'consulting', 'completed', 'called'],
    default: 'waiting',
  },
  estimatedWait: { type: Number, default: 0 },
  isEmergency: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
});

const QueueSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    entries: [QueueEntrySchema],
    currentPosition: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Get active (non-completed) entries sorted by position
QueueSchema.methods.getActiveEntries = function () {
  return this.entries
    .filter((e) => e.status !== 'completed')
    .sort((a, b) => a.position - b.position);
};

module.exports = mongoose.model('Queue', QueueSchema);
