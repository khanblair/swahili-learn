import type { UserCard } from '../types/content';

const MIN_EASE = 1.3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function sm2(card: UserCard, quality: number): UserCard {
  let { interval, ease_factor, repetitions } = card;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    ease_factor = ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    if (ease_factor < MIN_EASE) ease_factor = MIN_EASE;
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  return {
    ...card,
    interval,
    ease_factor,
    repetitions,
    next_review_ts: Date.now() + interval * ONE_DAY_MS,
    last_reviewed_ts: Date.now(),
  };
}

export function qualityFromCorrect(correct: boolean): number {
  return correct ? 5 : 1;
}

export function newCard(wordId: number): UserCard {
  return {
    word_id: wordId,
    content_type: 'word',
    interval: 1,
    ease_factor: 2.5,
    repetitions: 0,
    next_review_ts: 0,
    last_reviewed_ts: 0,
  };
}
