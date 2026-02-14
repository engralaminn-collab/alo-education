import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'alo_education.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb() {
  const conn = getDb();

  // Users table for authentication
  conn.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'student',
      phone TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Generic entity store — one table per entity, created on first access
  // We keep a registry of known entities so we can auto-create tables
  conn.exec(`
    CREATE TABLE IF NOT EXISTS _entity_registry (
      name TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  console.log('[DB] Initialized at', DB_PATH);
}

/**
 * Ensure a table exists for the given entity name.
 * Entity tables have:  id (TEXT PK), data (JSON), created_at, updated_at
 * Plus we create an index on common filter fields extracted into generated columns.
 */
export function ensureEntityTable(entityName) {
  const conn = getDb();
  const safeName = entityName.replace(/[^a-zA-Z0-9_]/g, '');

  const exists = conn.prepare(
    `SELECT 1 FROM _entity_registry WHERE name = ?`
  ).get(safeName);

  if (exists) return safeName;

  conn.exec(`
    CREATE TABLE IF NOT EXISTS "entity_${safeName}" (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL DEFAULT '{}',
      created_by TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Index by common JSON fields for fast filtering
  try {
    conn.exec(`CREATE INDEX IF NOT EXISTS "idx_${safeName}_email"
      ON "entity_${safeName}" (json_extract(data, '$.email'))`);
    conn.exec(`CREATE INDEX IF NOT EXISTS "idx_${safeName}_status"
      ON "entity_${safeName}" (json_extract(data, '$.status'))`);
    conn.exec(`CREATE INDEX IF NOT EXISTS "idx_${safeName}_student_id"
      ON "entity_${safeName}" (json_extract(data, '$.student_id'))`);
    conn.exec(`CREATE INDEX IF NOT EXISTS "idx_${safeName}_user_id"
      ON "entity_${safeName}" (json_extract(data, '$.user_id'))`);
  } catch {
    // ignore index creation errors
  }

  conn.prepare('INSERT OR IGNORE INTO _entity_registry (name) VALUES (?)').run(safeName);
  console.log(`[DB] Created entity table: entity_${safeName}`);
  return safeName;
}
