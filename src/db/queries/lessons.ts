import { getDb } from '../schema';
import type { Lesson, LessonProgress } from '../../types/content';

export async function seedLessons(lessons: Lesson[]): Promise<void> {
  const db = getDb();
  await db.withTransactionAsync(async () => {
    for (const l of lessons) {
      await db.runAsync(
        `INSERT OR IGNORE INTO lessons (id, unit_id, title, lesson_index, exercise_count)
         VALUES (?, ?, ?, ?, ?)`,
        [l.id, l.unit_id, l.title, l.lesson_index, l.exercise_count]
      );
    }
  });
}

export async function getLessonById(id: number): Promise<Lesson | null> {
  return getDb().getFirstAsync<Lesson>('SELECT * FROM lessons WHERE id = ?', [id]);
}

export async function getLessonsByUnit(unitId: number): Promise<Lesson[]> {
  return getDb().getAllAsync<Lesson>(
    'SELECT * FROM lessons WHERE unit_id = ? ORDER BY lesson_index',
    [unitId]
  );
}

export async function getLessonProgress(lessonId: number): Promise<LessonProgress | null> {
  return getDb().getFirstAsync<LessonProgress>(
    'SELECT * FROM lesson_progress WHERE lesson_id = ?',
    [lessonId]
  );
}

export async function saveLessonProgress(progress: LessonProgress): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO lesson_progress (lesson_id, completed, perfect, completed_at, xp_earned)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(lesson_id) DO UPDATE SET
       completed = excluded.completed,
       perfect = excluded.perfect,
       completed_at = excluded.completed_at,
       xp_earned = excluded.xp_earned`,
    [
      progress.lesson_id,
      progress.completed ? 1 : 0,
      progress.perfect ? 1 : 0,
      progress.completed_at ?? null,
      progress.xp_earned,
    ]
  );
}

export async function getUnitCompletionRatio(unitId: number): Promise<number> {
  const db = getDb();
  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM lessons WHERE unit_id = ?', [unitId]
  );
  const done = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM lesson_progress lp
     JOIN lessons l ON l.id = lp.lesson_id
     WHERE l.unit_id = ? AND lp.completed = 1`, [unitId]
  );
  const t = total?.count ?? 0;
  const d = done?.count ?? 0;
  return t === 0 ? 0 : d / t;
}
