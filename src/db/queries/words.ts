import { getDb } from '../schema';
import type { Word } from '../../types/content';

export async function seedWords(words: Word[]): Promise<void> {
  const db = await getDb();
  const stmt = await db.prepareAsync(
    `INSERT OR IGNORE INTO words
     (id, swahili, english, audio_file, unit_id, pos, example_sw, example_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  try {
    for (const w of words) {
      await stmt.executeAsync([
        w.id, w.swahili, w.english, w.audio_file,
        w.unit_id, w.pos, w.example_sw, w.example_en,
      ]);
    }
  } finally {
    await stmt.finalizeAsync();
  }
}

export async function getWordsByUnit(unitId: number): Promise<Word[]> {
  const db = await getDb();
  return db.getAllAsync<Word>('SELECT * FROM words WHERE unit_id = ?', unitId);
}

export async function getWordById(id: number): Promise<Word | null> {
  const db = await getDb();
  return db.getFirstAsync<Word>('SELECT * FROM words WHERE id = ?', id);
}

export async function getWordsByIds(ids: number[]): Promise<Word[]> {
  if (!ids.length) return [];
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  return db.getAllAsync<Word>(
    `SELECT * FROM words WHERE id IN (${placeholders})`,
    ids
  );
}
