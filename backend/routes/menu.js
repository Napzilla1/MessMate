const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const { protect, manager } = require('../middleware/auth');

// ─── Helper: Get Redis client ──────────────────────────────────
const getRedis = (req) => req.app.get('redisClient');

// @route   GET /api/menu/:hostel
// @desc    Get weekly menu for a hostel (Redis cached, 12hr TTL)
// @access  Public (or Private)
router.get('/:hostel', async (req, res) => {
  try {
    const redis = getRedis(req);
    const cacheKey = `menu:${req.params.hostel}`;

    // 1. Check Redis cache first
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[Menu Cache] HIT for ${req.params.hostel}`);
        return res.json(JSON.parse(cached));
      }
    }

    // 2. Cache Miss — query MongoDB
    console.log(`[Menu Cache] MISS for ${req.params.hostel}`);
    const menus = await Menu.find({ hostel: req.params.hostel });

    // 3. Store in Redis with 12-hour TTL (43200 seconds)
    if (redis) {
      await redis.setex(cacheKey, 43200, JSON.stringify(menus));
    }

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

      // Invalidate Redis cache for this hostel
      const redis = getRedis(req);
      if (redis) await redis.del(`menu:${req.params.hostel}`);

      res.json(updatedMenu);
    } else {
      const newMenu = await Menu.create({
        hostel: req.params.hostel,
        day: req.params.day,
        breakfast, lunch, dinner
      });

      // Invalidate Redis cache for this hostel
      const redis = getRedis(req);
      if (redis) await redis.del(`menu:${req.params.hostel}`);

      res.status(201).json(newMenu);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
