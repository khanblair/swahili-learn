import { getDb } from '../schema';
import type { Story, StoryLine } from '../../types/content';

export async function seedStories(stories: Story[], lines: StoryLine[]): Promise<void> {
  const db = await getDb();
  const stmtS = await db.prepareAsync(
    'INSERT OR IGNORE INTO stories (id, title, unit_id, level) VALUES (?, ?, ?, ?)'
  );
  const stmtL = await db.prepareAsync(
    `INSERT OR IGNORE INTO story_lines
     (id, story_id, line_index, swahili, english, audio_file)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  try {
    for (const s of stories) {
      await stmtS.executeAsync([s.id, s.title, s.unit_id, s.level]);
    }
    for (const l of lines) {
      await stmtL.executeAsync([
        l.id, l.story_id, l.line_index, l.swahili, l.english, l.audio_file,
      ]);
    }
  } finally {
    await stmtS.finalizeAsync();
    await stmtL.finalizeAsync();
  }
}

export async function getStoriesByUnit(unitId: number): Promise<Story[]> {
  const db = await getDb();
  return db.getAllAsync<Story>('SELECT * FROM stories WHERE unit_id = ?', unitId);
}

export async function getStoryLines(storyId: number): Promise<StoryLine[]> {
  const db = await getDb();
  return db.getAllAsync<StoryLine>(
    'SELECT * FROM story_lines WHERE story_id = ? ORDER BY line_index',
    storyId
  );
}

export async function markStoryCompleted(storyId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE stories SET completed = 1, completed_at = ? WHERE id = ?',
    Date.now(), storyId
  );
}
