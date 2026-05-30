import { getDb } from '../schema';
import type { Story, StoryLine } from '../../types/content';

export async function seedStories(stories: Story[], lines: StoryLine[]): Promise<void> {
  const db = getDb();
  await db.withTransactionAsync(async () => {
    for (const s of stories) {
      await db.runAsync(
        'INSERT OR IGNORE INTO stories (id, title, unit_id, level) VALUES (?, ?, ?, ?)',
        [s.id, s.title, s.unit_id, s.level]
      );
    }
    for (const l of lines) {
      await db.runAsync(
        `INSERT OR IGNORE INTO story_lines
         (id, story_id, line_index, swahili, english, audio_file)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [l.id, l.story_id, l.line_index, l.swahili, l.english, l.audio_file]
      );
    }
  });
}

export async function getStoriesByUnit(unitId: number): Promise<Story[]> {
  return getDb().getAllAsync<Story>('SELECT * FROM stories WHERE unit_id = ?', [unitId]);
}

export async function getStoryLines(storyId: number): Promise<StoryLine[]> {
  return getDb().getAllAsync<StoryLine>(
    'SELECT * FROM story_lines WHERE story_id = ? ORDER BY line_index',
    [storyId]
  );
}

export async function markStoryCompleted(storyId: number): Promise<void> {
  await getDb().runAsync(
    'UPDATE stories SET completed = 1, completed_at = ? WHERE id = ?',
    [Date.now(), storyId]
  );
}
