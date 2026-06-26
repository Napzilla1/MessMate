const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  blocks: { type: Number, default: 1 },
  status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentStudents: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Hostel', HostelSchema);
