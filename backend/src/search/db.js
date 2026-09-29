import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import { DATA_DIR } from '../config/index.js';

let db;

// Lazily opened singleton: every module that needs the index (routes, sync)
// imports getDb() rather than passing a connection around.
export function getDb() {
  if (db) return db;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, 'search-index.sqlite'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      source,
      path,
      filename,
      content
    );

    CREATE TABLE IF NOT EXISTS link_index (
      source TEXT NOT NULL,
      basename TEXT NOT NULL,
      path TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS link_index_lookup ON link_index (source, basename);
  `);

  return db;
}

export function closeDb() {
  db?.close();
  db = undefined;
}
