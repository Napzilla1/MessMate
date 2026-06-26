const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// @route   GET /api/chat/:hostel
// @desc    Get chat history for a hostel room
// @access  Private
router.get('/:hostel', protect, async (req, res) => {
  try {
    const messages = await Message.find({ hostel: req.params.hostel })
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Return chronologically
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
