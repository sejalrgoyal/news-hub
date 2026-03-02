import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './config/db.js';
import newsRoutes from './routes/news.js';
import geminiRoutes from './routes/gemini.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigin = process.env.CORS_ORIGIN ?? "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.use('/api/news', newsRoutes);
app.use('/api/gemini', geminiRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'NewsHub API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      topHeadlines: 'GET /api/news/top-headlines',
      everything: 'GET /api/news/everything',
      sources: 'GET /api/news/sources',
      chat: 'POST /api/gemini/chat',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
    console.log(`  - News API: /api/news/everything, /api/news/top-headlines, /api/news/sources`);
    console.log(`  - Example:  /api/news/apple-today (Apple articles today, sorted by popularity)`);
    console.log(`  - Gemini:   /api/gemini/chat`);
  });

  connectMongoDB()
    .then(() => console.log('✓ MongoDB connected'))
    .catch((err) => console.error('✗ MongoDB connection failed:', err.message));
}

start();
