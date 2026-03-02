import express from 'express';
import cors from 'cors';
import newsRoutesModule from './routes/news.js';
import geminiRoutesModule from './routes/gemini.js';

// Unwrap default export — Netlify bundling can wrap ESM defaults as { default: router }
const newsRoutes = newsRoutesModule?.default ?? newsRoutesModule;
const geminiRoutes = geminiRoutesModule?.default ?? geminiRoutesModule;

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : null; // null = allow all (for Netlify's dynamic preview URLs)

app.use(
  cors({
    origin: allowedOrigins
      ? (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) callback(null, true);
          else callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      : true, // Allow all when ALLOWED_ORIGINS not set
  })
);
app.use(express.json());

app.use('/api/news', newsRoutes);
app.use('/api/gemini', geminiRoutes);

app.get('/api', (req, res) => {
  res.json({
    name: 'NewsHub API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      topHeadlines: 'GET /api/news/top-headlines',
      everything: 'GET /api/news/everything',
      sources: 'GET /api/news/sources',
      chat: 'POST /api/gemini/chat',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
