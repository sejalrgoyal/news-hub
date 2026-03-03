import express from 'express';
import cors from 'cors';
import newsRoutesModule from './routes/news.js';
import geminiRoutesModule from './routes/gemini.js';

const newsRoutes = newsRoutesModule?.default ?? newsRoutesModule;
const geminiRoutes = geminiRoutesModule?.default ?? geminiRoutesModule;

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : null;

app.use(
  cors({
    origin: allowedOrigins
      ? (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) callback(null, true);
          else callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      : true,
  })
);
app.use(express.json());

app.use('/api/news', newsRoutes);
app.use('/api/gemini', geminiRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'NewsHub API',
    status: 'ok',
    docs: 'Use /api for endpoints. Example: GET /api/news/top-headlines?country=us&category=technology',
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'NewsHub API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      topHeadlines: 'GET /api/news/top-headlines',
      everything: 'GET /api/news/everything',
      sources: 'GET /api/news/sources',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
