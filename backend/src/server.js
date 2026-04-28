// Express server bootstrap. Kept deliberately small - all real work
// lives in services/ and routes/. This file just wires middleware in
// the right order and starts listening.

import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/api.js';

const app = express();

// Middleware order matters:
//   1. CORS first so preflight requests succeed even if a later
//      middleware throws.
//   2. JSON parser so req.body is populated for POST endpoints.
app.use(cors({ origin: '*' })); // tighten in production
app.use(express.json({ limit: '1mb' }));

// Tiny request log - very handy when demoing live.
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use('/', apiRouter);

// Centralized error handler - any next(err) ends up here.
// Must take 4 args for Express to recognise it as an error handler.
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`🚀 RAG-scheduler API listening on http://localhost:${config.port}`);
  console.log(`   Ollama:     ${config.ollama.url} (${config.ollama.model})`);
  console.log(`   Embeddings: ${config.embeddings.model}`);
});
