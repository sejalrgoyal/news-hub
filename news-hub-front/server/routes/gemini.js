import express from 'express';

const router = express.Router();

// Groq — free tier, OpenAI-compatible, no billing required
// Models: llama-3.3-70b-versatile, mixtral-8x7b-32768, gemma2-9b-it
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Groq API error (${res.status})`);
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

/** GET /api/gemini/health */
router.get('/health', (_req, res) => {
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ ok: false, error: 'GROQ_API_KEY is not set' });
  }
  res.json({ ok: true, provider: 'Groq', model: GROQ_MODEL });
});

/** POST /api/gemini/chat — body: { messages: [{role, text}], articleTitle } */
router.post('/chat', async (req, res) => {
  try {
    const { messages = [], articleTitle = '' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // System prompt + full conversation history in OpenAI format
    const groqMessages = [
      {
        role: 'system',
        content: `You are a helpful assistant for a news article titled: "${articleTitle}". Give clear, concise answers in 2-3 sentences. Stay relevant to the article topic.`,
      },
      ...messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    const reply = await callGroq(groqMessages);
    res.json({ reply });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
