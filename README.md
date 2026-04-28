# 📚 RAG-Scheduler

An AI-powered course schedule assistant. Upload your timetable as a CSV and ask
questions about it in natural language ("When is my AI class?", "What do I have
on Tuesday afternoon?"). Answers are generated with **Retrieval-Augmented
Generation** — the system retrieves the most relevant rows from your schedule
and feeds them to a local LLM as context.

> Built end-to-end as a learning project covering modern frontend, Node.js
> backend development, REST API design, and applied LLM workflows.

---

## 🧱 Stack

| Layer        | Technology                                      | Why                                                      |
| ------------ | ----------------------------------------------- | -------------------------------------------------------- |
| Frontend     | **React** + **Vite**                            | Component-based UI, fast dev server, modern tooling      |
| Styling      | Plain CSS with custom properties                | Lightweight, no extra build step, easy to theme          |
| Backend      | **Node.js** + **Express**                       | Familiar HTTP framework, small surface, easy async/await |
| Embeddings   | **Transformers.js** (`Xenova/all-MiniLM-L6-v2`) | Runs locally in Node via ONNX — no API key needed        |
| Vector store | **HNSWLib**                                     | Same algorithm FAISS uses; fast nearest-neighbour search |
| LLM          | **Ollama** (local, e.g. `llama2`)               | Runs on your machine; no cloud calls, no token costs     |
| File uploads | **Multer**                                      | Standard middleware for `multipart/form-data`            |
| CSV parsing  | **csv-parse**                                   | Battle-tested, sync API                                  |

---

## 🗂️ Project structure

```
RAG-scheduler/
├── frontend/                 React + Vite app
│   ├── src/
│   │   ├── components/       Sidebar, ChatWindow, MessageBubble, InputBar, UploadModal
│   │   ├── hooks/            useChat — custom hook owning chat state
│   │   ├── services/         api.js — centralized backend calls
│   │   ├── styles/           global.css
│   │   ├── App.jsx           composition root
│   │   └── main.jsx          React entry
│   └── package.json
│
├── backend/                  Node.js + Express server
│   ├── src/
│   │   ├── routes/api.js     /status, /ingest, /ask
│   │   ├── services/
│   │   │   ├── embeddings.js Transformers.js wrapper
│   │   │   ├── vectorStore.js HNSWLib wrapper, persists to disk
│   │   │   ├── ingestor.js   CSV → chunks → vectors → index
│   │   │   └── ragChain.js   embed → search → prompt → Ollama
│   │   ├── config/index.js   env-driven config
│   │   └── server.js         Express bootstrap
│   └── package.json
│
├── data/
│   └── Course_schedule.csv   sample input
│
└── README.md
```

---

## 🚀 Run it locally

### Prerequisites

- Node.js ≥ 18
- [Ollama](https://ollama.com) installed locally with a model pulled:
  ```bash
  ollama pull llama2
  ```

### 1. Start Ollama (Terminal 1)

```bash
ollama serve
```

### 2. Start the backend (Terminal 2)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on **http://localhost:8000**.

> First request to `/ingest` downloads the embedding model (~25 MB) into a
> local cache. Subsequent runs are instant.

### 3. Start the frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173** and auto-opens in your browser.

### 4. Use it

1. Click **📤 Upload CSV** and select `data/Course_schedule.csv`
2. Wait for ingestion to complete
3. Ask anything: _"When is my AI class?"_, _"What's on Friday?"_

---

## 🔌 REST API

| Method | Endpoint  | Purpose                                                        |
| ------ | --------- | -------------------------------------------------------------- |
| `GET`  | `/status` | Returns whether a vectorstore exists on disk                   |
| `POST` | `/ingest` | Accepts a CSV upload, builds & persists the vectorstore        |
| `POST` | `/ask`    | Accepts `{ "query": "..." }`, returns the answer + source rows |

Example:

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "When is my AI class?"}'
```

```json
{
  "response": "Your AI class is on Monday at 10am.",
  "source_documents": [
    {
      "page_content": "Course: AI | Day: Mon | Time: 10am",
      "metadata": { "source": "Course_schedule.csv", "rowIndex": 3 }
    }
  ]
}
```

---

## 🧠 How RAG works here

```
                              ┌───────────────────────────┐
   "When is my AI class?" ───▶│ embed query (MiniLM L6)   │
                              └────────────┬──────────────┘
                                           │ 384-dim vector
                                           ▼
                              ┌───────────────────────────┐
                              │ HNSWLib top-k search      │
                              └────────────┬──────────────┘
                                           │ k most similar rows
                                           ▼
                              ┌───────────────────────────┐
                              │ build prompt with context │
                              └────────────┬──────────────┘
                                           │
                                           ▼
                              ┌───────────────────────────┐
                              │ Ollama (llama2) generates │
                              └────────────┬──────────────┘
                                           │
                                           ▼
                                       answer
```

Each CSV row is embedded once at ingest time. At query time, the user's
question is embedded with the same model, the vector store returns the most
similar rows by cosine distance, and those rows are injected into a prompt
that constrains the LLM to answer from context — drastically reducing
hallucination.

---

## 🧭 Design decisions

- **React + Vite over plain HTML.** The original prototype was vanilla
  HTML/CSS/JS. Migrated to React for component reuse, declarative state, and
  cleaner separation of concerns.
- **Custom `useChat` hook** instead of stuffing chat state into `App`. Keeps
  the composition root readable and the chat logic independently testable.
- **Service layer (`services/api.js`, `services/ragChain.js`)** so the routes
  and components stay thin — easy to swap implementations behind the same
  interface.
- **Express over Fastify/Koa.** Most familiar Node framework, easiest for
  someone new to the codebase to navigate.
- **Local embeddings (Transformers.js) over OpenAI.** No API key, no per-call
  cost, no privacy concerns about uploading schedules to a third party.
- **HNSWLib over a SQL DB** for vector search. Purpose-built for ANN search
  over high-dimensional vectors — orders of magnitude faster than scanning a
  table for cosine similarity.
- **Same REST contract as the original FastAPI version.** Backend was
  rewritten in Node.js without touching the frontend — possible only because
  the API was well-defined upfront.

---

## 🛣️ Possible next steps

- Stream LLM responses (`stream: true` from Ollama) for token-by-token UI
- Add chat history persistence (SQLite or DuckDB)
- Move from CSV-only to PDF/Notion/Google Calendar ingestion
- Authentication and per-user vectorstores
- Deploy: Vercel (frontend) + Fly.io (backend with Ollama)