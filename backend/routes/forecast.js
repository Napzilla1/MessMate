const express = require('express');
const router = express.Router();
const path = require('path');
const { Worker } = require('worker_threads');
const { protect, manager } = require('../middleware/auth');

// @route   POST /api/forecast/chat
// @desc    Get AI-driven insights based on database metrics
// @access  Private/Manager
router.post('/chat', protect, manager, async (req, res) => {
  try {
    const { message } = req.body;
    const hostel = req.user.hostel || 'Limbdi Hostel';
    
    if (!message) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Spawn a worker thread so the main event loop is never blocked
    const worker = new Worker(
      path.join(__dirname, '..', 'workers', 'forecastWorker.js'),
      {
        workerData: {
          message,
          hostel,
          mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mess-management',
          geminiApiKey: process.env.GEMINI_API_KEY,
        },
      }
    );

    worker.on('message', (result) => {
      if (result.success) {
        res.json({ text: result.text });
      } else {
        res.status(500).json({ message: result.error });
      }
    });

    worker.on('error', (err) => {
      console.error('[Forecast Worker] Error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Forecast processing failed: ' + err.message });
      }
    });

    worker.on('exit', (code) => {
      if (code !== 0 && !res.headersSent) {
        res.status(500).json({ message: `Forecast worker exited with code ${code}` });
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

