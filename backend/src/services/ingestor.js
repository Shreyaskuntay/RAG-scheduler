// Ingestor: turns a Course_schedule.csv into searchable chunks.
//
// Strategy: each CSV row becomes one chunk. We serialise the row as
// "Column: Value | Column: Value | ..." which gives the embedding model
// good signal about both field names and values. For long-text fields
// you would also want a token-based splitter, but rows in a schedule
// CSV are short enough that one-row-per-chunk works well.

import { parse } from 'csv-parse/sync';
import { embedMany } from './embeddings.js';
import { buildIndex } from './vectorStore.js';

/**
 * Convert a parsed row object into a single descriptive string.
 * e.g. { Course: "AI", Day: "Mon", Time: "10am" }
 *   => "Course: AI | Day: Mon | Time: 10am"
 */
function rowToText(row) {
  return Object.entries(row)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${String(v).trim()}`)
    .join(' | ');
}

/**
 * Parse CSV bytes, embed each row, and persist a fresh vectorstore.
 * Returns ingestion stats useful for the API response.
 */
export async function ingestCsvBuffer(buffer, sourceName = 'upload.csv') {
  const records = parse(buffer, {
    columns: true,         // first row = headers, output objects
    skip_empty_lines: true,
    trim: true,
  });

  if (records.length === 0) {
    throw new Error('CSV contained no rows');
  }

  const items = records.map((row, i) => ({
    text: rowToText(row),
    source: sourceName,
    rowIndex: i,
    raw: row,
  }));

  console.log(`[ingest] parsed ${items.length} rows from ${sourceName}`);
  console.log('[ingest] embedding rows…');

  const vectors = await embedMany(items.map((it) => it.text));
  await buildIndex(items, vectors);

  return {
    rows_ingested: items.length,
    source: sourceName,
  };
}
