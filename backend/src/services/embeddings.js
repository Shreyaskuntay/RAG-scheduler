// Embedding service - generates dense vectors from text using
// Transformers.js. The model runs locally in Node (ONNX runtime),
// so no external API key is required. This is the JS equivalent of
// using sentence-transformers in Python.

import { pipeline } from '@xenova/transformers';
import { config } from '../config/index.js';

let embedder = null;

/**
 * Lazily load the embedding model on first use.
 * The model is ~25MB and downloads to a local cache on first run.
 */
async function getEmbedder() {
  if (!embedder) {
    console.log(`[embeddings] loading model: ${config.embeddings.model}`);
    embedder = await pipeline('feature-extraction', config.embeddings.model);
    console.log('[embeddings] model loaded');
  }
  return embedder;
}

/**
 * Embed a single string into a Float32Array of length config.embeddings.dimension.
 * Mean-pooled and L2-normalised so cosine similarity == dot product.
 */
export async function embedText(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  // output.data is a Float32Array of length `dimension`.
  return Array.from(output.data);
}

/**
 * Embed many texts in sequence. We batch sequentially to keep memory
 * predictable; for production you'd want true batch inference.
 */
export async function embedMany(texts) {
  const vectors = [];
  for (const t of texts) {
    vectors.push(await embedText(t));
  }
  return vectors;
}
