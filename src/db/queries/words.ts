import { getDb } from '../schema';
import type { Word } from '../../types/content';

export async function seedWords(words: Word[]): Promise<void> {
  const db = getDb();
  await db.withTransactionAsync(async () => {
    for (const w of words) {
      await db.runAsync(
        `INSERT OR IGNORE INTO words
         (id, swahili, english, audio_file, unit_id, pos, example_sw, example_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [w.id, w.swahili, w.english, w.audio_file, w.unit_id, w.pos, w.example_sw, w.example_en]
      );
    }
  });
}

export async function getWordsByUnit(unitId: number): Promise<Word[]> {
  return getDb().getAllAsync<Word>('SELECT * FROM words WHERE unit_id = ?', [unitId]);
}

export async function getWordById(id: number): Promise<Word | null> {
  return getDb().getFirstAsync<Word>('SELECT * FROM words WHERE id = ?', [id]);
}

export async function getWordsByIds(ids: number[]): Promise<Word[]> {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  return getDb().getAllAsync<Word>(
    `SELECT * FROM words WHERE id IN (${placeholders})`,
    ids
  );
}
