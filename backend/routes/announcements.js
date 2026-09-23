const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, manager } = require('../middleware/auth');

// GET /api/announcements/:hostel
router.get('/:hostel', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({ hostel: req.params.hostel })
      .sort({ date: -1 })
      .populate('author', 'name');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/announcements
router.post('/', protect, manager, async (req, res) => {
  try {
    const { title, message, hostel } = req.body;
    const newAnnouncement = new Announcement({
      title,
      message,
      hostel: hostel || req.user.hostel,
      author: req.user._id,
    });
    const saved = await newAnnouncement.save();
    const populated = await saved.populate('author', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', protect, manager, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    // Only author or admin can delete? Let's just allow manager to delete
    await announcement.deleteOne();
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
