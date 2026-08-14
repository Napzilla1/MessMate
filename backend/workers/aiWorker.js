const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');

/**
 * AI Worker Thread
 * Runs the heuristic insight computation off the main event loop.
 * Connects to MongoDB independently and posts the result back.
 */

// Import models fresh in the worker context
let Waste, Attendance;

const init = async () => {
  await mongoose.connect(workerData.mongoUri);
  Waste = require('../models/Waste');
  Attendance = require('../models/Attendance');
};

const generateHeuristicInsight = async (prompt, hostel) => {
  const lowerPrompt = prompt.toLowerCase();

  // Handle 'waste' query
  if (lowerPrompt.includes('waste') || lowerPrompt.includes('wasted')) {
    const wastes = await Waste.find({ hostel }).sort({ date: -1 }).limit(7);
    if (wastes.length === 0) return `I don't have enough waste data for ${hostel} yet. Start logging waste to get insights!`;
    
    const avgWaste = wastes.reduce((acc, w) => acc + w.percentage, 0) / wastes.length;
    const latest = wastes[0];
    
    return `📊 Analysis for ${hostel}: Your average food waste over the last ${wastes.length} recorded days is ${avgWaste.toFixed(1)}%. Your most recent record was ${latest.percentage.toFixed(1)}% (${latest.foodWasted}kg wasted out of ${latest.foodPrepared}kg prepared). Consider adjusting preparation quantities down slightly if waste consistently exceeds 10%.`;
  }

  // Handle 'attendance' or 'students' query
  if (lowerPrompt.includes('attendance') || lowerPrompt.includes('students')) {
    const today = new Date().toISOString().split('T')[0];
    const attendances = await Attendance.find({ hostel, date: today });
    if (attendances.length === 0) return `No attendance data found for today (${today}) in ${hostel}.`;
    
    const presentCount = attendances.filter(a => a.lunch?.checkedIn || a.dinner?.checkedIn || a.breakfast?.checkedIn).length;
    const declaredCount = attendances.filter(a => a.lunch?.declared || a.dinner?.declared || a.breakfast?.declared).length;
    
    return `📈 Attendance Insight for ${hostel} today: ${presentCount} students have successfully checked in out of ${declaredCount} who declared they would come. This is a ${((presentCount/declaredCount)*100 || 0).toFixed(1)}% fulfillment rate so far today.`;
  }

  // Handle 'tomorrow' or 'forecast' query
  if (lowerPrompt.includes('tomorrow') || lowerPrompt.includes('forecast') || lowerPrompt.includes('predict')) {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];
    
    const attendances = await Attendance.find({ hostel, date: tomorrowStr });
    
    const breakfast = attendances.filter(a => a.breakfast?.declared).length;
    const lunch = attendances.filter(a => a.lunch?.declared).length;
    const dinner = attendances.filter(a => a.dinner?.declared).length;
    
    return `🔮 Forecast for Tomorrow (${tomorrowStr}) in ${hostel}:\n- Breakfast: ${breakfast} students declared\n- Lunch: ${lunch} students declared\n- Dinner: ${dinner} students declared\n\nExpected total meals: ${breakfast + lunch + dinner}. I recommend preparing a 5% buffer above these numbers.`;
  }

  // Default fallback
  return `🤔 I can help with: attendance patterns, waste analysis, and meal forecasting for ${hostel}. Try asking "How much waste recently?" or "What is tomorrow's forecast?"`;
};

// Run the worker
(async () => {
  try {
    await init();
    const result = await generateHeuristicInsight(workerData.message, workerData.hostel);
    parentPort.postMessage({ success: true, text: result });
  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message });
  } finally {
    await mongoose.disconnect();
  }
})();
