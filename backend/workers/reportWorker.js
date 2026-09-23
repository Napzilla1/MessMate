const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');

/**
 * Report Generation Worker Thread
 * Prevents blocking the main Node.js event loop while parsing thousands of
 * attendance records and formatting them into a CSV string.
 */
(async () => {
  try {
    // 1. Connect to MongoDB independently
    await mongoose.connect(workerData.mongoUri);
    const Attendance = require('../models/Attendance');
    const User = require('../models/User'); // Load model so lookup works

    const { hostel, startDate, endDate } = workerData;

    // 2. MongoDB Aggregation Pipeline
    // Groups by user, sums the checkedIn status for all 3 meals, and joins User data
    const pipeline = [
      {
        $match: {
          hostel: hostel,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$user",
          breakfasts: { $sum: { $cond: ["$breakfast.checkedIn", 1, 0] } },
          lunches: { $sum: { $cond: ["$lunch.checkedIn", 1, 0] } },
          dinners: { $sum: { $cond: ["$dinner.checkedIn", 1, 0] } }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      { $sort: { "userInfo.name": 1 } } // Sort alphabetically by student name
    ];

    const results = await Attendance.aggregate(pipeline);

    // 3. Build the CSV String
    let csv = "Name,Roll No,Email,Total Breakfasts,Total Lunches,Total Dinners\n";
    
    for (const r of results) {
      // Escape strings to prevent comma parsing errors
      const name = `"${r.userInfo.name || 'N/A'}"`;
      const roll = `"${r.userInfo.rollNo || 'N/A'}"`;
      const email = `"${r.userInfo.email || 'N/A'}"`;
      
      csv += `${name},${roll},${email},${r.breakfasts},${r.lunches},${r.dinners}\n`;
    }

    // 4. Send back to the main thread
    parentPort.postMessage({ success: true, csv });

  } catch (error) {
    console.error('[Report Worker] Error:', error);
    parentPort.postMessage({ success: false, error: error.message });
  } finally {
    // Always disconnect to prevent connection leaks
    await mongoose.disconnect();
  }
})();
