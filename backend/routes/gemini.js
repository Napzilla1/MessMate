const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { protect, manager } = require('../middleware/auth');

// @route   POST /api/gemini/menu
// @desc    Generate a 7-day menu using Gemini AI
// @access  Private/Manager
router.post('/menu', protect, manager, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured in the backend environment variables.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = 'You are an expert nutritionist and hostel mess manager in India. ' +
      'Generate a nutritionally balanced, delicious 7-day vegetarian menu (Monday to Sunday) based on this prompt: "' +
      (prompt || 'Standard North Indian hostel menu') + '". ' +
      'Return the response strictly as a JSON array of objects. Do not include markdown formatting or backticks. ' +
      'The structure MUST be exactly this: ' +
      '[{ "day": "Mon", "breakfast": ["Poha", "Tea", "Banana"], "lunch": ["Rice", "Dal Tadka", "Aloo Gobi", "Roti"], "dinner": ["Roti", "Paneer Butter Masala", "Dal", "Rice"] }] ' +
      'Generate all 7 days: Mon, Tue, Wed, Thu, Fri, Sat, Sun.';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });

    let rawJson = response.text.trim();
    // Strip markdown code fences if model returns them
    rawJson = rawJson.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    const generatedMenu = JSON.parse(rawJson);

    // We are no longer saving directly to the DB. 
    // Just return it so the manager can manually review and add it.
    res.json({ message: 'Menu successfully generated!', data: generatedMenu });
  } catch (error) {
    console.error('Gemini Menu Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate menu. ' + error.message });
  }
});

module.exports = router;
