const express = require('express');
const router = express.Router();
const path = require('path');
const { Worker } = require('worker_threads');
const { protect, manager } = require('../middleware/auth');

// @route   GET /api/reports/attendance-csv
// @desc    Generate and download CSV report using a Worker Thread
// @access  Private/Manager
router.get('/attendance-csv', protect, manager, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const hostel = req.user.hostel;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    // Spawn the worker thread
    const worker = new Worker(path.join(__dirname, '..', 'workers', 'reportWorker.js'), {
      workerData: {
        mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mess-management',
        hostel,
        startDate,
        endDate
      }
    });

    worker.on('message', (msg) => {
      if (msg.success) {
        // Set headers to trigger a file download in the browser
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="Attendance_${startDate}_to_${endDate}.csv"`);
        return res.status(200).send(msg.csv);
      } else {
        return res.status(500).json({ message: "Worker failed: " + msg.error });
      }
    });

    worker.on('error', (err) => {
      console.error('[Reports Route] Worker Error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate report" });
      }
    });

    worker.on('exit', (code) => {
      if (code !== 0 && !res.headersSent) {
        res.status(500).json({ message: `Worker exited with code ${code}` });
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
