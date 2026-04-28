// Vector store backed by HNSWLib (the same algorithm FAISS uses for
// approximate nearest neighbour). Persists to disk in two files:
//   - index.bin   : the HNSW graph itself
//   - meta.json   : the original text + metadata for each vector,
//                   indexed by the integer label HNSW returns.

import fs from 'fs';
import path from 'path';
import pkg from 'hnswlib-node';
const { HierarchicalNSW } = pkg;
import { config } from '../config/index.js';

const { dir, indexFile, metaFile } = config.vectorstore;
const { dimension } = config.embeddings;

const indexPath = path.join(dir, indexFile);
const metaPath = path.join(dir, metaFile);

let index = null;
let metadata = []; // metadata[label] = { text, source, ... }

/** Does a persisted vectorstore exist on disk? */
export function vectorstoreExists() {
  return fs.existsSync(indexPath) && fs.existsSync(metaPath);
}

/** Load the index from disk if not already in memory. */
export async function loadIndex() {
  if (index) return;
  if (!vectorstoreExists()) {
    throw new Error('Vectorstore does not exist - call buildIndex first');
  }

  index = new HierarchicalNSW('cosine', dimension);
  const raw = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  metadata = raw.metadata;
  index.readIndexSync(indexPath, raw.maxElements);
  console.log(`[vectorstore] loaded ${metadata.length} vectors from disk`);
}

/**
 * Build a fresh index from a list of { text, metadata } items
 * and their already-computed vectors. Persists to disk.
 */
export async function buildIndex(items, vectors) {
  if (items.length !== vectors.length) {
    throw new Error('items and vectors length mismatch');
  }
  fs.mkdirSync(dir, { recursive: true });

  // Generous capacity so we don't have to resize on small uploads.
  const maxElements = Math.max(items.length, 1000);
  index = new HierarchicalNSW('cosine', dimension);
  index.initIndex(maxElements);

  metadata = [];
  for (let i = 0; i < items.length; i++) {
    index.addPoint(vectors[i], i);
    metadata.push(items[i]);
  }

  index.writeIndexSync(indexPath);
  fs.writeFileSync(
    metaPath,
    JSON.stringify({ maxElements, metadata }, null, 2)
  );
  console.log(`[vectorstore] persisted ${items.length} vectors`);
}

/**
 * Find the top-k most similar items to a query vector.
 * Returns objects from metadata, with their distance attached.
 */
export async function search(queryVector, k = config.vectorstore.topK) {
  if (!index) await loadIndex();
  const { neighbors, distances } = index.searchKnn(queryVector, k);
  return neighbors.map((label, i) => ({
    ...metadata[label],
    distance: distances[i],
  }));
}
