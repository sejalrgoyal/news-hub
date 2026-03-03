import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiApp from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 10000;
const distPath = path.join(__dirname, '..', 'dist');

const server = express();

// Serve the built React app (JS, CSS, images, etc.)
server.use(express.static(distPath));

// Mount all /api/* routes from the Express app
server.use(apiApp);

// SPA fallback — any route not matched above returns index.html
server.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`NewsHub server running on port ${PORT}`);
});
