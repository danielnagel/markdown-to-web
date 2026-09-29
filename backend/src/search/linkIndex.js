import { getDb } from './db.js';

export function upsertLink(source, basename, filePath) {
  const db = getDb();
  db.prepare('DELETE FROM link_index WHERE source = ? AND path = ?').run(source, filePath);
  db.prepare('INSERT INTO link_index (source, basename, path) VALUES (?, ?, ?)').run(source, basename, filePath);
}

export function removeLink(source, filePath) {
  getDb().prepare('DELETE FROM link_index WHERE source = ? AND path = ?').run(source, filePath);
}

export function clearSourceLinks(source) {
  getDb().prepare('DELETE FROM link_index WHERE source = ?').run(source);
}

// v1 policy for a basename that exists more than once in a source: return
// every match (ordered for determinism) and let the caller take the first
// one and log a warning (see wikilinks.js) - a real disambiguation UI is out
// of scope for v1.
export function resolveLink(source, basename) {
  return getDb()
    .prepare('SELECT path FROM link_index WHERE source = ? AND basename = ? ORDER BY path')
    .all(source, basename);
}
