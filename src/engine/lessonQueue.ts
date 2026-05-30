import type { Word, Exercise, ExerciseType } from '../types/content';

const EXERCISE_TYPES: ExerciseType[] = ['translate', 'listen', 'multiple_choice', 'match_pairs'];
const QUEUE_SIZE = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickType(index: number): ExerciseType {
  return EXERCISE_TYPES[index % EXERCISE_TYPES.length];
}

function buildOptions(correct: string, allWords: Word[]): string[] {
  const distractors = shuffle(
    allWords.filter(w => w.english !== correct).map(w => w.english)
  ).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

function buildPairs(words: Word[]): Array<{ left: string; right: string }> {
  return shuffle(words.slice(0, 4)).map(w => ({
    left: w.swahili,
    right: w.english,
  }));
}

export function buildQueue(words: Word[]): Exercise[] {
  if (!words.length) return [];
  const shuffled = shuffle(words);
  const queue: Exercise[] = [];

  let matchPairsAdded = false;

  for (let i = 0; i < QUEUE_SIZE; i++) {
    const word = shuffled[i % shuffled.length];
    const rawType = pickType(i);

    const type: ExerciseType =
      rawType === 'match_pairs' && (matchPairsAdded || shuffled.length < 4)
        ? 'multiple_choice'
        : rawType;

    if (type === 'match_pairs') matchPairsAdded = true;

    const exercise: Exercise = { type, word };

    if (type === 'multiple_choice') {
      exercise.options = buildOptions(word.english, shuffled);
    }
    if (type === 'match_pairs') {
      exercise.pairs = buildPairs(shuffled);
    }

    queue.push(exercise);
  }

  return queue;
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function checkListenAnswer(typed: string, correct: string): boolean {
  const a = typed.trim().toLowerCase();
  const b = correct.trim().toLowerCase();
  return levenshtein(a, b) <= 1;
}
