import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import { DATA_DIR } from '../config/index.js';

const BCRYPT_ROUNDS = 12;

// Compared against when the username doesn't exist, so a login attempt for an
// unknown user takes as long as one with a wrong password (no username
// enumeration via response timing).
const DUMMY_PASSWORD_HASH = await bcrypt.hash('dummy-password-for-timing', BCRYPT_ROUNDS);

let db;

// Deliberately a separate file from search-index.sqlite: the search index is
// a disposable cache that can always be rebuilt from the sources, the users
// table is not.
function getUsersDb() {
  if (db) return db;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, 'users.sqlite'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      last_login_at TEXT
    );
  `);

  return db;
}

export function closeUsersDb() {
  db?.close();
  db = undefined;
}

export function userExists(username) {
  return Boolean(getUsersDb().prepare('SELECT 1 FROM users WHERE username = ?').get(username));
}

export async function createUser(username, password, { rounds = BCRYPT_ROUNDS } = {}) {
  const passwordHash = await bcrypt.hash(password, rounds);
  getUsersDb().prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
}

export function listUsers() {
  return getUsersDb()
    .prepare('SELECT username, created_at, last_login_at FROM users ORDER BY created_at DESC')
    .all();
}

export async function verifyCredentials(username, password) {
  const user = getUsersDb().prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);

  const valid = await bcrypt.compare(password, user?.password_hash ?? DUMMY_PASSWORD_HASH);
  if (!user || !valid) {
    return null;
  }

  getUsersDb()
    .prepare("UPDATE users SET last_login_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?")
    .run(user.id);

  // jsonwebtoken requires the `sub` claim to be a string.
  return { userId: String(user.id), username: user.username };
}

// MODE=demo: the public demo login shown on the login page (demo/demo).
// Bypasses the CLI's minimum password length on purpose.
export async function ensureDemoUser() {
  if (!userExists('demo')) {
    await createUser('demo', 'demo');
  }
}
