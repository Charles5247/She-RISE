import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// SQLite standing in for Supabase/PostgreSQL (see schema.sql header note).
// A single file DB lives in .data/sherise.db (gitignored, created on first run).

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "sherise.db");

declare global {
  var __sheriseDb: Database.Database | undefined;
}

function createDb(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  const schema = fs.readFileSync(path.join(process.cwd(), "src/lib/schema.sql"), "utf-8");
  db.exec(schema);
  return db;
}

export function getDb(): Database.Database {
  if (!global.__sheriseDb) {
    global.__sheriseDb = createDb();
  }
  return global.__sheriseDb;
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
