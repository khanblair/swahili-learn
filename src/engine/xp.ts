export const XP_LESSON_COMPLETE = 10;
export const XP_LESSON_PERFECT_BONUS = 5;
export const XP_REVIEW_CORRECT = 2;

interface Level {
  name: string;
  minXP: number;
  maxXP: number;
}

const LEVELS: Level[] = [
  { name: 'Beginner', minXP: 0, maxXP: 99 },
  { name: 'Learner', minXP: 100, maxXP: 299 },
  { name: 'Explorer', minXP: 300, maxXP: 699 },
  { name: 'Fluent', minXP: 700, maxXP: 999 },
  { name: 'Master', minXP: 1000, maxXP: Infinity },
];

export function getLevel(xp: number): Level {
  return LEVELS.findLast(l => xp >= l.minXP) ?? LEVELS[0];
}

export function getLevelIndex(xp: number): number {
  return LEVELS.findLastIndex(l => xp >= l.minXP) ?? 0;
}

export function getXPToNextLevel(xp: number): number {
  const levelIdx = getLevelIndex(xp);
  if (levelIdx >= LEVELS.length - 1) return 0;
  return LEVELS[levelIdx + 1].minXP - xp;
}

export function getLevelProgress(xp: number): number {
  const level = getLevel(xp);
  if (level.maxXP === Infinity) return 1;
  const range = level.maxXP - level.minXP + 1;
  return (xp - level.minXP) / range;
}
