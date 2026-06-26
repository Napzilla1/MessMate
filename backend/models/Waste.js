const mongoose = require('mongoose');

const WasteSchema = new mongoose.Schema({
  hostel: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  meal: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  preparedKg: { type: Number, required: true },
  consumedKg: { type: Number, required: true },
  wastedKg: { type: Number, required: true },
  wastePercentage: { type: Number, required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

WasteSchema.index({ hostel: 1, date: 1, meal: 1 }, { unique: true });

module.exports = mongoose.model('Waste', WasteSchema);
