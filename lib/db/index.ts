import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'node:path'
import * as schema from './schema'

const DB_PATH = path.join(process.cwd(), 'data', 'github-daily.db')

let _db: ReturnType<typeof createDb> | null = null

function createDb() {
  const sqlite = new Database(DB_PATH)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  return drizzle(sqlite, { schema })
}

export function getDb() {
  if (!_db) {
    _db = createDb()
  }
  return _db
}
