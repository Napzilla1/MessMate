const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostel: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  breakfast: {
    declared: { type: Boolean, default: true },
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date }
  },
  lunch: {
    declared: { type: Boolean, default: true },
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date }
  },
  dinner: {
    declared: { type: Boolean, default: true },
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date }
  }
}, { timestamps: true });

AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
