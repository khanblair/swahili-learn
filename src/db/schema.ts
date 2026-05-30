import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('swahili.db');
  await _db.execAsync('PRAGMA journal_mode = WAL;');
  return _db;
}

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY,
      swahili TEXT NOT NULL,
      english TEXT NOT NULL,
      audio_file TEXT NOT NULL,
      unit_id INTEGER NOT NULL,
      pos TEXT NOT NULL,
      example_sw TEXT NOT NULL,
      example_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_cards (
      word_id INTEGER PRIMARY KEY,
      content_type TEXT NOT NULL DEFAULT 'word',
      interval INTEGER NOT NULL DEFAULT 1,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      repetitions INTEGER NOT NULL DEFAULT 0,
      next_review_ts INTEGER NOT NULL DEFAULT 0,
      last_reviewed_ts INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY,
      unit_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      lesson_index INTEGER NOT NULL,
      exercise_count INTEGER NOT NULL DEFAULT 10
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      lesson_id INTEGER PRIMARY KEY,
      completed INTEGER NOT NULL DEFAULT 0,
      perfect INTEGER NOT NULL DEFAULT 0,
      completed_at INTEGER,
      xp_earned INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY DEFAULT 1,
      total_xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 0,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT,
      hearts INTEGER NOT NULL DEFAULT 5,
      hearts_refill_ts INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      unit_id INTEGER NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS story_lines (
      id INTEGER PRIMARY KEY,
      story_id INTEGER NOT NULL,
      line_index INTEGER NOT NULL,
      swahili TEXT NOT NULL,
      english TEXT NOT NULL,
      audio_file TEXT NOT NULL
    );
  `);
}
