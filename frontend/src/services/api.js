// Centralized API service.
// Keeping every backend call in one module makes the app easier to test,
// easier to swap base URLs (local vs deployed), and easier to talk through
// in an interview ("here's where the frontend touches the backend").

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Check whether a vectorstore already exists on the backend.
 * Used on app load to decide whether the chat is immediately enabled
 * or whether the user must first upload a CSV.
 */
export async function getStatus() {
  const res = await fetch(`${API_URL}/status`);
  if (!res.ok) throw new Error(`Status check failed: HTTP ${res.status}`);
  return res.json(); // { vectorstore_exists: boolean, message: string }
}

/**
 * Upload a CSV file to the /ingest endpoint.
 * The backend processes the CSV and builds the vectorstore.
 */
export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/ingest`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed (HTTP ${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Send a question to the RAG pipeline and return the answer.
 */
export async function askQuestion(query) {
  const res = await fetch(`${API_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ask failed (HTTP ${res.status}): ${text}`);
  }
  return res.json(); // { response: string, source_documents: [...] }
}
