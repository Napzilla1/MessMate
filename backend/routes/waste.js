const express = require('express');
const router = express.Router();
const Waste = require('../models/Waste');
const { protect, manager } = require('../middleware/auth');

// @route   GET /api/waste/:hostel
// @desc    Get waste logs for a hostel
// @access  Private/Manager
router.get('/:hostel', protect, manager, async (req, res) => {
  try {
    const logs = await Waste.find({ hostel: req.params.hostel }).sort({ date: -1 }).limit(30);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/waste
// @desc    Add a waste log entry
// @access  Private/Manager
router.post('/', protect, manager, async (req, res) => {
  try {
    const { date, meal, preparedKg, consumedKg } = req.body;
    
    const wastedKg = Math.max(0, preparedKg - consumedKg);
    const wastePercentage = (wastedKg / preparedKg) * 100;

    const log = await Waste.create({
      hostel: req.user.hostel,
      date,
      meal,
      preparedKg,
      consumedKg,
      wastedKg,
      wastePercentage,
      recordedBy: req.user._id
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
