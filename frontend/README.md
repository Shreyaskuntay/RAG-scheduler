# RAG-scheduler — React Frontend

React + Vite frontend for the RAG-scheduler course assistant. Talks to the
existing FastAPI backend (`/status`, `/ingest`, `/ask`).

## Run locally

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on http://localhost:5173 and expects FastAPI on
http://localhost:8000. To point at a different backend:

```bash
cp .env.example .env
# edit VITE_API_URL
```

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Project structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        upload + status + clear chat
│   │   ├── ChatWindow.jsx     scrollable transcript with auto-scroll
│   │   ├── MessageBubble.jsx  single message (user / assistant / error)
│   │   ├── InputBar.jsx       controlled input + send
│   │   └── UploadModal.jsx    overlay shown while ingesting CSV
│   ├── hooks/
│   │   └── useChat.js         custom hook owning chat state
│   ├── services/
│   │   └── api.js             centralised fetch calls to FastAPI
│   ├── styles/
│   │   └── global.css         dark theme (matches original HTML)
│   ├── App.jsx                composition root
│   └── main.jsx               React entry
├── index.html
├── vite.config.js
└── package.json
```

## Why these choices

- **Vite over CRA** — faster cold start and HMR, currently the React-recommended bundler.
- **Custom `useChat` hook** — keeps `<App />` declarative and makes the chat
  logic independently testable.
- **`services/api.js`** — single place to swap the backend URL or add
  auth headers later.
- **Controlled inputs** — input value lives in React state, not in the DOM.
- **Conditional rendering for the modal** — parent decides when to mount it,
  no imperative `.show()`/`.hide()`.
