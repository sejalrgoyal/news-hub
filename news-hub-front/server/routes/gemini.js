import express from 'express';
import { getGeminiModel } from '../config/gemini.js';

const router = express.Router();

/** GET /api/gemini/health — verify the key is configured */
router.get('/health', (_req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ ok: false, error: 'GEMINI_API_KEY is not set' });
  }
  res.json({ ok: true });
});

/** POST /api/gemini/chat — { messages: [{role, text}], articleTitle } */
router.post('/chat', async (req, res) => {
  try {
    const { messages = [], articleTitle = '' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const model = getGeminiModel();

    // Build a single prompt that includes the full conversation history
    const history = messages
      .slice(0, -1)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const latest = messages[messages.length - 1].text;

    const prompt = [
      `You are a helpful assistant for a news article titled: "${articleTitle}".`,
      `Keep answers relevant and concise (2-3 sentences).`,
      history ? `\nConversation so far:\n${history}` : '',
      `\nUser: ${latest}`,
    ]
      .filter(Boolean)
      .join('\n');

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
