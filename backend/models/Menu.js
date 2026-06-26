const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  hostel: { type: String, required: true },
  day: { type: String, required: true, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  breakfast: {
    items: [{ type: String }],
    special: { type: String, default: null }
  },
  lunch: {
    items: [{ type: String }],
    special: { type: String, default: null }
  },
  dinner: {
    items: [{ type: String }],
    special: { type: String, default: null }
  }
}, { timestamps: true });

// Compound index to ensure one menu per day per hostel
MenuSchema.index({ hostel: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Menu', MenuSchema);
