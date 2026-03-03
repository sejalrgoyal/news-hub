import express from 'express';

const router = express.Router();

// Call Gemini REST API directly — no SDK, no version conflicts
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini API error (${res.status})`);
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

/** GET /api/gemini/health */
router.get('/health', (_req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ ok: false, error: 'GEMINI_API_KEY is not set' });
  }
  res.json({ ok: true, model: 'gemini-2.0-flash' });
});

/** POST /api/gemini/chat  —  body: { messages: [{role, text}], articleTitle } */
router.post('/chat', async (req, res) => {
  try {
    const { messages = [], articleTitle = '' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Build conversation history (all turns except the last user message)
    const history = messages
      .slice(0, -1)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const latest = messages[messages.length - 1].text;

    const prompt = [
      `You are a helpful assistant for a news article titled: "${articleTitle}".`,
      `Give clear, concise answers in 2-3 sentences. Stay relevant to the article.`,
      history ? `\nConversation so far:\n${history}` : '',
      `\nUser: ${latest}`,
    ]
      .filter(Boolean)
      .join('\n');

    const reply = await callGemini(prompt);
    res.json({ reply });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
