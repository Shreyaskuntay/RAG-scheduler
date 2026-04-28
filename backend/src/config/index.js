// Single source of truth for environment-driven configuration.
// Importing one place beats reading process.env from everywhere.
import 'dotenv/config';
import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),

  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama2',
  },

  embeddings: {
    model: process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2',
    // all-MiniLM-L6-v2 produces 384-dim embeddings.
    dimension: 384,
  },

  vectorstore: {
    dir: path.resolve(process.env.VECTORSTORE_DIR || './vectorstore'),
    indexFile: 'index.bin',
    metaFile: 'meta.json',
    // How many nearest neighbours to retrieve per query.
    topK: 4,
  },
};
