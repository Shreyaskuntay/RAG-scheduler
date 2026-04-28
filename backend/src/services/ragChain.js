// The RAG chain: question -> embed -> retrieve top-k chunks ->
// build a prompt with those chunks as context -> call the LLM ->
// return the answer + the source chunks used.
//
// This is the JS equivalent of LangChain's RetrievalQA chain, written
// out by hand for clarity (and because the dependency surface is much
// smaller).

import { config } from '../config/index.js';
import { embedText } from './embeddings.js';
import { search } from './vectorStore.js';

/**
 * Build the prompt sent to the LLM. Keeping it explicit (rather than
 * hidden in a chain abstraction) makes it easy to tweak in interview-
 * style follow-ups: "what if the model hallucinates?", etc.
 */
function buildPrompt(question, contextChunks) {
  const context = contextChunks
    .map((c, i) => `[${i + 1}] ${c.text}`)
    .join('\n');

  return `You are a helpful assistant answering questions about a course schedule.
Use ONLY the context below to answer. If the answer is not in the context,
say you don't know.

Context:
${context}

Question: ${question}

Answer:`;
}

/**
 * Call the local Ollama server's /api/generate endpoint.
 * We use stream:false so we get a single JSON response - simpler for
 * a synchronous REST API. Streaming would be a nice future upgrade.
 */
async function callOllama(prompt) {
  const res = await fetch(`${config.ollama.url}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.ollama.model,
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Ollama request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.response ?? '';
}

/**
 * Answer a user question using retrieval-augmented generation.
 * Returns { response, source_documents } - same shape the React
 * frontend already expects.
 */
export async function ask(question) {
  const queryVector = await embedText(question);
  const chunks = await search(queryVector, config.vectorstore.topK);
  const prompt = buildPrompt(question, chunks);
  const response = await callOllama(prompt);

  return {
    response: response.trim(),
    source_documents: chunks.map((c) => ({
      page_content: c.text,
      metadata: { source: c.source, rowIndex: c.rowIndex },
    })),
  };
}
