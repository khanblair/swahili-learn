import { getDb } from '../schema';
import type { UserCard } from '../../types/content';

export async function upsertCard(card: UserCard): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO user_cards
       (word_id, content_type, interval, ease_factor, repetitions, next_review_ts, last_reviewed_ts)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(word_id) DO UPDATE SET
       content_type = excluded.content_type,
       interval = excluded.interval,
       ease_factor = excluded.ease_factor,
       repetitions = excluded.repetitions,
       next_review_ts = excluded.next_review_ts,
       last_reviewed_ts = excluded.last_reviewed_ts`,
    [
      card.word_id, card.content_type, card.interval,
      card.ease_factor, card.repetitions,
      card.next_review_ts, card.last_reviewed_ts,
    ]
  );
}

export async function getCardsDue(): Promise<UserCard[]> {
  const db = await getDb();
  const now = Date.now();
  return db.getAllAsync<UserCard>(
    'SELECT * FROM user_cards WHERE next_review_ts <= ?',
    now
  );
}

export async function getCardByWordId(wordId: number): Promise<UserCard | null> {
  const db = await getDb();
  return db.getFirstAsync<UserCard>(
    'SELECT * FROM user_cards WHERE word_id = ?',
    wordId
  );
}

export async function getCardCountDue(): Promise<number> {
  const db = await getDb();
  const now = Date.now();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_cards WHERE next_review_ts <= ?',
    now
  );
  return row?.count ?? 0;
}
