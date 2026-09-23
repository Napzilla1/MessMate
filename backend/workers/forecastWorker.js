const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");

/**
 * Analytics Worker Thread
 * Connects to MongoDB, gathers recent hostel context, and uses Gemini AI
 * to answer the manager's questions intelligently (handling typos, complex queries, etc.)
 */

let Waste, Attendance, Menu;

const init = async () => {
  await mongoose.connect(workerData.mongoUri);
  Waste = require("../models/Waste");
  Attendance = require("../models/Attendance");
  Menu = require("../models/Menu");
};

const getHostelContext = async (hostel) => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  // 1. Get last 7 days of waste
  const wastes = await Waste.find({ hostel }).sort({ date: -1 }).limit(7);
  let wasteContext = "No recent waste data.";
  if (wastes.length > 0) {
    const avgWaste =
      wastes.reduce((acc, w) => acc + w.wastePercentage, 0) / wastes.length;
    wasteContext =
      `Last 7 days average waste: ${avgWaste.toFixed(1)}%. ` +
      `Most recent (${wastes[0].date}): ${wastes[0].wastePercentage.toFixed(1)}% (${wastes[0].wastedKg}kg out of ${wastes[0].preparedKg}kg).`;
  }

  // 2. Get today's attendance
  const todayAtt = await Attendance.find({ hostel, date: today });
  let todayContext = "No attendance data for today.";
  if (todayAtt.length > 0) {
    const present = todayAtt.filter(
      (a) =>
        a.lunch?.checkedIn || a.dinner?.checkedIn || a.breakfast?.checkedIn,
    ).length;
    const declared = todayAtt.filter(
      (a) => a.lunch?.declared || a.dinner?.declared || a.breakfast?.declared,
    ).length;
    todayContext = `Today (${today}): ${present} students checked in out of ${declared} declared (Fulfillment rate: ${((present / declared) * 100 || 0).toFixed(1)}%).`;
  }

  // 3. Get tomorrow's forecast
  const tomorrowAtt = await Attendance.find({ hostel, date: tomorrow });
  let tomorrowContext = "No RSVP data for tomorrow.";
  if (tomorrowAtt.length > 0) {
    const b = tomorrowAtt.filter((a) => a.breakfast?.declared).length;
    const l = tomorrowAtt.filter((a) => a.lunch?.declared).length;
    const d = tomorrowAtt.filter((a) => a.dinner?.declared).length;
    tomorrowContext = `Tomorrow's RSVPs (${tomorrow}): Breakfast: ${b}, Lunch: ${l}, Dinner: ${d}. Total expected meals: ${b + l + d}. Recommended buffer is 5%.`;
  }

  // 4. Get today's menu
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDayName = dayNames[new Date().getDay()];
  const todayMenu = await Menu.findOne({ hostel, day: currentDayName });
  let menuContext = "No menu configured for today.";
  if (todayMenu) {
    menuContext = `Today's Menu (${currentDayName}): Breakfast: ${todayMenu?.breakfast?.items?.join(", ") || "None"}. Lunch: ${todayMenu?.lunch?.items?.join(", ") || "None"}. Dinner: ${todayMenu?.dinner?.items?.join(", ") || "None"}.`;
  }

  return `CONTEXT FOR ${hostel}:\n- ${wasteContext}\n- ${todayContext}\n- ${tomorrowContext}\n- ${menuContext}`;
};

const generateAIInsight = async (prompt, hostel, apiKey) => {
  // If no API key is provided, gracefully fall back to a helpful message
  if (!apiKey) {
    return `⚠️ Gemini API Key is missing. I cannot process your request: "${prompt}"`;
  }

  const context = await getHostelContext(hostel);
  console.log("[Forecast Worker] Context:", context);
  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt =
    "You are the Analytics Assistant for MessMate, a hostel mess management app. " +
    "You help mess managers optimize food preparation and reduce waste. " +
    "Always base your answers strictly on the DATABASE CONTEXT provided below. " +
    "If the manager asks something not covered by the context, politely explain what data you have access to. " +
    "Keep your answers concise, friendly, and use emojis. " +
    "Do not use markdown formatting like bold or italics as the UI might not render it well. " +
    "\n\nDATABASE CONTEXT:\n" +
    context +
    "\n\nMANAGER QUESTION: " +
    prompt;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `⚠️ Sorry, I encountered an error communicating with Gemini AI: ${error.message}`;
  }
};

// Run the worker
(async () => {
  try {
    await init();
    const result = await generateAIInsight(
      workerData.message,
      workerData.hostel,
      workerData.geminiApiKey,
    );
    parentPort.postMessage({ success: true, text: result });
  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message });
  } finally {
    await mongoose.disconnect();
  }
})();
