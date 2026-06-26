const express = require('express');
const router = express.Router();
const Hostel = require('../models/Hostel');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/hostels
// @desc    Get all hostels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const hostels = await Hostel.find({});
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/hostels
// @desc    Create a hostel
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, capacity, blocks, manager } = req.body;
    const hostel = await Hostel.create({ name, capacity, blocks, manager });
    res.status(201).json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
