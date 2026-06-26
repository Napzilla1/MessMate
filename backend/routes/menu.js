const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const { protect, manager } = require('../middleware/auth');

// @route   GET /api/menu/:hostel
// @desc    Get weekly menu for a hostel
// @access  Public (or Private)
router.get('/:hostel', async (req, res) => {
  try {
    const menus = await Menu.find({ hostel: req.params.hostel });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/menu/:hostel/:day
// @desc    Update menu for a specific day
// @access  Private/Manager
router.put('/:hostel/:day', protect, manager, async (req, res) => {
  try {
    const { breakfast, lunch, dinner } = req.body;
    let menu = await Menu.findOne({ hostel: req.params.hostel, day: req.params.day });
    
    if (menu) {
      menu.breakfast = breakfast || menu.breakfast;
      menu.lunch = lunch || menu.lunch;
      menu.dinner = dinner || menu.dinner;
      const updatedMenu = await menu.save();
      res.json(updatedMenu);
    } else {
      const newMenu = await Menu.create({
        hostel: req.params.hostel,
        day: req.params.day,
        breakfast, lunch, dinner
      });
      res.status(201).json(newMenu);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
