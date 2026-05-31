import type { Word, Exercise, ExerciseType } from '../types/content';

// Cycle order: translate → fill_in_blank → listen → multiple_choice → rearrange_sentence → match_pairs
const EXERCISE_TYPES: ExerciseType[] = [
  'translate',
  'fill_in_blank',
  'listen',
  'multiple_choice',
  'rearrange_sentence',
  'match_pairs',
];
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

// ── English multiple-choice options ────────────────────────────────────────
function buildOptions(correct: string, allWords: Word[]): string[] {
  const distractors = shuffle(
    allWords.filter(w => w.english !== correct).map(w => w.english)
  ).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

// ── Swahili options (for fill_in_blank) ────────────────────────────────────
function buildSwahiliOptions(correct: string, allWords: Word[]): string[] {
  const distractors = shuffle(
    allWords.filter(w => w.swahili !== correct).map(w => w.swahili)
  ).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

// ── Word tile pool for translate exercise ──────────────────────────────────
function buildTranslateTiles(word: Word, allWords: Word[]): string[] {
  // Use only the first alternative before any ' / ' so we never include '/' as a tile
  // e.g. "Good / Fine" → "Good", "Sorry / Excuse me" → "Sorry"
  const primaryEnglish = word.english.split(' / ')[0].trim();
  const correctTokens = primaryEnglish.split(' ');
  const pool = shuffle(
    allWords
      .filter(w => w.id !== word.id)
      .flatMap(w => w.english.split(' / ')[0].trim().split(' '))
      .filter(t => !correctTokens.includes(t) && t !== '/')
  ).slice(0, Math.max(3, 6 - correctTokens.length));
  return shuffle([...correctTokens, ...pool]);
}

// ── Match pairs ────────────────────────────────────────────────────────────
function buildPairs(words: Word[]): Array<{ left: string; right: string }> {
  return shuffle(words.slice(0, 4)).map(w => ({
    left: w.swahili,
    right: w.english,
  }));
}

// ── Fill-in-blank: replace the Swahili word in its example sentence ────────
function buildFillBlankPrompt(word: Word): string {
  // Case-insensitive replacement; fallback to plain replace if \b doesn't match
  const escaped = word.swahili.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let result = word.example_sw.replace(new RegExp(`\\b${escaped}\\b`, 'i'), '_____');
  if (result === word.example_sw) {
    // Word boundary didn't match (possible in Swahili with adjacent punctuation)
    result = word.example_sw.replace(new RegExp(escaped, 'i'), '_____');
  }
  return result;
}

// ── Rearrange: shuffle words from the example sentence ────────────────────
function buildRearrangeTiles(word: Word): { tiles: string[]; correctTiles: string[] } {
  // Strip trailing punctuation so tiles are clean
  const clean = word.example_sw.replace(/[.!?,]+$/, '');
  const correctTiles = clean.split(' ').filter(Boolean);
  const tiles = shuffle([...correctTiles]);
  return { tiles, correctTiles };
}

// ── Main queue builder ─────────────────────────────────────────────────────
export function buildQueue(words: Word[]): Exercise[] {
  if (!words.length) return [];
  const shuffled = shuffle(words);
  const queue: Exercise[] = [];

  let matchPairsAdded = false;

  for (let i = 0; i < QUEUE_SIZE; i++) {
    const word = shuffled[i % shuffled.length];
    const rawType = pickType(i);

    // Resolve type substitutions
    let type: ExerciseType = rawType;

    if (type === 'match_pairs' && (matchPairsAdded || shuffled.length < 4)) {
      type = 'multiple_choice';
    }

    if (type === 'rearrange_sentence') {
      const { correctTiles } = buildRearrangeTiles(word);
      // Need at least 3 words in the sentence to make rearranging meaningful
      if (correctTiles.length < 3) type = 'multiple_choice';
    }

    if (type === 'fill_in_blank') {
      const prompt = buildFillBlankPrompt(word);
      // If the word wasn't found in the example, fall back to multiple_choice
      if (!prompt.includes('_____')) type = 'multiple_choice';
    }

    if (type === 'match_pairs') matchPairsAdded = true;

    const exercise: Exercise = { type, word };

    switch (type) {
      case 'translate':
        exercise.options = buildTranslateTiles(word, shuffled);
        break;
      case 'multiple_choice':
        exercise.options = buildOptions(word.english, shuffled);
        break;
      case 'match_pairs':
        exercise.pairs = buildPairs(shuffled);
        break;
      case 'fill_in_blank': {
        exercise.prompt = buildFillBlankPrompt(word);
        exercise.options = buildSwahiliOptions(word.swahili, shuffled);
        break;
      }
      case 'rearrange_sentence': {
        const { tiles, correctTiles } = buildRearrangeTiles(word);
        exercise.tiles = tiles;
        exercise.correctTiles = correctTiles;
        break;
      }
    }

    queue.push(exercise);
  }

  return queue;
}

// ── Levenshtein (for listen exercise fuzzy matching) ───────────────────────
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
