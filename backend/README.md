# RAG-scheduler — Node.js Backend

Node.js + Express implementation of the RAG (Retrieval-Augmented Generation)
backend for the course schedule assistant. Replaces the previous FastAPI
implementation while preserving the exact same REST contract, so the React
frontend works unchanged.

## Stack

| Concern | Choice | Why |
|---|---|---|
| HTTP framework | **Express** | Most familiar Node web framework; small surface, easy to reason about |
| File uploads | **Multer** | Standard middleware for `multipart/form-data` |
| CSV parsing | **csv-parse** | Battle-tested, sync API for small files |
| Embeddings | **Transformers.js** (`Xenova/all-MiniLM-L6-v2`) | Runs locally in Node via ONNX, no API key |
| Vector store | **HNSWLib** | Same algorithm FAISS uses; persists to disk |
| LLM | **Ollama** (HTTP) | Same local LLM you were using before |

## Run locally

```bash
cd backend
cp .env.example .env       # adjust if you want a different port/model
npm install
npm run dev                # starts on http://localhost:8000 with --watch
```

You also need Ollama running:

```bash
ollama serve
ollama pull llama2
```

## REST API

Identical contract to the original FastAPI version.

### `GET /status`
```json
{ "vectorstore_exists": true, "message": "Vectorstore is loaded - chat is ready" }
```

### `POST /ingest` — `multipart/form-data` with field `file`
```json
{ "message": "Ingest complete", "rows_ingested": 42, "source": "Course_schedule.csv" }
```

### `POST /ask` — JSON body
```json
{ "query": "When is my AI class?" }
```
Response:
```json
{
  "response": "Your AI class is on Monday at 10am.",
  "source_documents": [
    { "page_content": "Course: AI | Day: Mon | Time: 10am", "metadata": { "source": "Course_schedule.csv", "rowIndex": 3 } }
  ]
}
```

## Project structure

```
backend/
├── src/
│   ├── server.js              Express bootstrap (CORS, JSON, error handler)
│   ├── routes/
│   │   └── api.js             /status, /ingest, /ask
│   ├── services/
│   │   ├── embeddings.js      Transformers.js wrapper (local embeddings)
│   │   ├── vectorStore.js     HNSWLib wrapper (persisted to disk)
│   │   ├── ingestor.js        CSV → chunks → vectors → index
│   │   └── ragChain.js        embed → search → prompt → Ollama
│   └── config/
│       └── index.js           env-driven config, single source of truth
├── vectorstore/               built at runtime (gitignored)
├── package.json
└── .env.example
```

## Why this shape

- **Routes vs services** — routes only handle HTTP concerns (parsing,
  status codes). Business logic lives in `services/`. Keeps each file
  small and unit-testable.
- **One config module** — every env var read happens in `src/config/index.js`.
  Swapping models or ports is one-file change.
- **Lazy embedder load** — `getEmbedder()` only loads the model on first use
  so server startup stays fast.
- **Centralized error handler** — any thrown error in a route ends up at
  the Express error middleware, returning a clean JSON response.
- **Same endpoint contract** as the previous FastAPI version — the React
  frontend is untouched.
