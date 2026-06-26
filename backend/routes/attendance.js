const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Attendance = require('../models/Attendance');
const { protect, manager } = require('../middleware/auth');

// @route   GET /api/attendance/me
// @desc    Get logged in user's attendance
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user._id }).sort({ date: 1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/attendance/declare
// @desc    Declare attendance for a specific date/meal
// @access  Private
router.post('/declare', protect, async (req, res) => {
  try {
    const { date, meal, status } = req.body; // status is boolean
    let att = await Attendance.findOne({ user: req.user._id, date });
    
    if (att) {
      att[meal].declared = status;
      await att.save();
      res.json(att);
    } else {
      const newAtt = await Attendance.create({
        user: req.user._id,
        hostel: req.user.hostel,
        date,
        [meal]: { declared: status, checkedIn: false }
      });
      res.status(201).json(newAtt);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// @route   GET /api/attendance/ticket
// @desc    Generate secure QR ticket for current meal
// @access  Private
router.get('/ticket', protect, async (req, res) => {
  try {
    const meal = req.query.meal || 'lunch'; // or calculate based on time
    const date = new Date().toISOString().split('T')[0];
    
    // Create payload
    const payload = {
      studentId: req.user._id,
      name: req.user.name,
      hostel: req.user.hostel,
      meal,
      date
    };

    // Sign token (expires in 1 hour)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, payload });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// @route   POST /api/attendance/scan
// @desc    Scan QR and check-in student
// @access  Private/Manager
router.post('/scan', protect, manager, async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired QR code.' });
    }

    const { studentId, meal, date, name, hostel } = decoded;
    
    let att = await Attendance.findOne({ user: studentId, date });
    
    if (!att) {
      // Create an entry if they didn't declare
      att = await Attendance.create({
        user: studentId,
        hostel: hostel,
        date,
        [meal]: { declared: false, checkedIn: true, checkInTime: new Date() }
      });
      return res.json({ message: 'Check-in successful (No prior declaration)', studentName: name, status: 'success' });
    }
    
    if (att[meal].checkedIn) {
      return res.status(400).json({ message: 'Duplicate scan! Student already checked in.', studentName: name, status: 'duplicate' });
    }
    
    att[meal].checkedIn = true;
    att[meal].checkInTime = new Date();
    await att.save();
    
    // Emit socket event to the manager's hostel room
    const io = req.app.get('io');
    if (io) {
      io.to(hostel).emit('scan_success', {
        studentId,
        studentName: name,
        meal,
        status: 'success',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });
    }
    
    res.json({ message: 'Check-in successful', studentName: name, status: 'success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/hostel/:hostel
// @desc    Get all attendance for a hostel on a specific date
// @access  Private/Manager
router.get('/hostel/:hostel', protect, manager, async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const queryDate = date || new Date().toISOString().split('T')[0];
    
    const attendances = await Attendance.find({ hostel: req.params.hostel, date: queryDate }).populate('user', 'name room rollNo');
    
    // Transform data to match frontend expectations
    const formatted = attendances.map(a => {
      // Find which meal is currently active (simplified logic)
      const h = new Date().getHours()
      let meal = 'dinner'
      if (h >= 7 && h < 10) meal = 'breakfast'
      else if (h >= 12 && h < 15) meal = 'lunch'

      const mealData = a[meal] || { declared: false, checkedIn: false }
      
      let status = 'pending'
      if (mealData.checkedIn) status = 'success'
      else if (!mealData.declared) status = 'not-going'

      return {
        date: a.date,
        meal: meal,
        status: status,
        student: a.user
      }
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
