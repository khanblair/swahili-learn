import { getDb } from '../schema';
import type { UserStats } from '../../types/content';

export const DEFAULT_STATS: UserStats = {
  id: 1, total_xp: 0, level: 0, current_streak: 0, longest_streak: 0,
  last_active_date: null, hearts: 5, hearts_refill_ts: 0,
};

export async function getUserStats(): Promise<UserStats> {
  const db = getDb();
  const row = await db.getFirstAsync<UserStats>('SELECT * FROM user_stats WHERE id = 1');
  if (row) return row;
  await db.runAsync(
    `INSERT OR IGNORE INTO user_stats
       (id, total_xp, level, current_streak, longest_streak, last_active_date, hearts, hearts_refill_ts)
     VALUES (1, 0, 0, 0, 0, NULL, 5, 0)`
  );
  const created = await db.getFirstAsync<UserStats>('SELECT * FROM user_stats WHERE id = 1');
  return created ?? { ...DEFAULT_STATS };
}

export async function updateUserStats(stats: Partial<UserStats>): Promise<void> {
  const keys = Object.keys(stats).filter(k => k !== 'id');
  if (!keys.length) return;
  const fields = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (stats as Record<string, unknown>)[k]) as (string | number | null)[];
  await getDb().runAsync(`UPDATE user_stats SET ${fields} WHERE id = 1`, values);
}

export async function addXP(amount: number): Promise<number> {
  const db = getDb();
  const row = await db.getFirstAsync<{ total_xp: number }>(
    'SELECT total_xp FROM user_stats WHERE id = 1'
  );
  const newXP = (row?.total_xp ?? 0) + amount;
  await db.runAsync('UPDATE user_stats SET total_xp = ? WHERE id = 1', [newXP]);
  return newXP;
}

export async function getLast7DaysXP(): Promise<{ date: string; xp: number }[]> {
  return getDb().getAllAsync<{ date: string; xp: number }>(
    `SELECT DATE(completed_at / 1000, 'unixepoch') as date, SUM(xp_earned) as xp
     FROM lesson_progress
     WHERE completed_at >= ?
     GROUP BY date
     ORDER BY date`,
    [Date.now() - 7 * 24 * 60 * 60 * 1000]
  );
}
