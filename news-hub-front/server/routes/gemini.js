import express from 'express';
import { getGeminiModel } from '../config/gemini.js';

const router = express.Router();

/**
 * GET /api/gemini/health
 * Quick check — returns 200 if GEMINI_API_KEY is set, 503 otherwise.
 */
router.get('/health', (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ ok: false, error: 'GEMINI_API_KEY is not set in environment variables' });
  }
  res.json({ ok: true, message: 'Gemini API key is configured' });
});

/**
 * POST /api/gemini/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const model = getGeminiModel();
    const { prompt = 'Say "Hello! Gemini is connected." in one short sentence.' } = req.body;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ success: true, reply: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
