import { getDb } from './db.js';

export function indexFile(source, filePath, filename, content) {
  const db = getDb();
  db.prepare('DELETE FROM search_index WHERE source = ? AND path = ?').run(source, filePath);
  db.prepare('INSERT INTO search_index (source, path, filename, content) VALUES (?, ?, ?, ?)').run(
    source,
    filePath,
    filename,
    content,
  );
}

export function removeFile(source, filePath) {
  getDb().prepare('DELETE FROM search_index WHERE source = ? AND path = ?').run(source, filePath);
}

export function clearSource(source) {
  getDb().prepare('DELETE FROM search_index WHERE source = ?').run(source);
}

// FTS5 special characters (quotes, *, -, ...) in raw user input would
// otherwise be interpreted as query syntax and can throw a syntax error;
// wrapping the whole query as one quoted phrase treats it as literal text
// instead, which is simple and safe (if less flexible than a real query
// parser) for v1.
function sanitizeQuery(q) {
  return `"${q.replace(/"/g, '""')}"`;
}

// Match markers are control characters, not HTML tags: snippet() splices
// them into a raw substring of the indexed file content, which the frontend
// must never render as HTML (a note could itself contain "<script>" as
// plain text) - see frontend/src/lib/snippet.js, which turns these markers
// into styled spans via text interpolation instead of v-html.
export const SNIPPET_MATCH_START = '';
export const SNIPPET_MATCH_END = '';

export function search(source, query) {
  const db = getDb();
  return db
    .prepare(
      `SELECT path, filename, snippet(search_index, 3, ?, ?, '…', 20) AS snippet
       FROM search_index
       WHERE source = ? AND search_index MATCH ?
       ORDER BY rank
       LIMIT 50`,
    )
    .all(SNIPPET_MATCH_START, SNIPPET_MATCH_END, source, sanitizeQuery(query));
}
