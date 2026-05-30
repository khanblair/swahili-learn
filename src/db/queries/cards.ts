import { getDb } from '../schema';
import type { UserCard } from '../../types/content';

export async function upsertCard(card: UserCard): Promise<void> {
  await getDb().runAsync(
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
  return getDb().getAllAsync<UserCard>(
    'SELECT * FROM user_cards WHERE next_review_ts <= ?',
    [Date.now()]
  );
}

export async function getCardByWordId(wordId: number): Promise<UserCard | null> {
  return getDb().getFirstAsync<UserCard>(
    'SELECT * FROM user_cards WHERE word_id = ?',
    [wordId]
  );
}

export async function getCardCountDue(): Promise<number> {
  const row = await getDb().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_cards WHERE next_review_ts <= ?',
    [Date.now()]
  );
  return row?.count ?? 0;
}
