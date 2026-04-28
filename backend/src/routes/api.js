// Express router exposing the three endpoints the React frontend uses.
// Contract is identical to the original FastAPI app, so the frontend
// works unchanged after swapping backends.

import express from 'express';
import multer from 'multer';
import { vectorstoreExists } from '../services/vectorStore.js';
import { ingestCsvBuffer } from '../services/ingestor.js';
import { ask } from '../services/ragChain.js';

const router = express.Router();

// Multer keeps uploads in memory - fine for small CSVs. For large
// uploads we'd switch to disk storage with a size cap.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/** GET / - simple service descriptor. */
router.get('/', (_req, res) => {
  res.json({
    service: 'rag-scheduler',
    endpoints: ['/status', '/ingest', '/ask'],
  });
});

/** GET /status - does a vectorstore already exist on disk? */
router.get('/status', (_req, res) => {
  const exists = vectorstoreExists();
  res.json({
    vectorstore_exists: exists,
    message: exists
      ? 'Vectorstore is loaded - chat is ready'
      : 'No vectorstore yet - upload a CSV to start',
  });
});

/** POST /ingest - upload a CSV and (re)build the vectorstore. */
router.post('/ingest', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided in field "file"' });
    }
    const result = await ingestCsvBuffer(req.file.buffer, req.file.originalname);
    res.json({
      message: 'Ingest complete',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/** POST /ask - answer a question with retrieval-augmented generation. */
router.post('/ask', async (req, res, next) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Body must include a string "query"' });
    }
    if (!vectorstoreExists()) {
      return res.status(409).json({
        error: 'No vectorstore yet - upload a CSV via /ingest first',
      });
    }
    const result = await ask(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
