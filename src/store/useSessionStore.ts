import { create } from 'zustand';
import type { Exercise } from '../types/content';
import { checkListenAnswer } from '../engine/lessonQueue';

type FeedbackState = 'idle' | 'correct' | 'wrong';

interface SessionState {
  queue: Exercise[];
  currentIndex: number;
  hearts: number;
  currentAnswer: string | string[];
  feedbackState: FeedbackState;
  isComplete: boolean;
  xpEarned: number;

  startSession: (queue: Exercise[], hearts?: number) => void;
  setAnswer: (answer: string | string[]) => void;
  checkAnswer: () => void;
  nextExercise: () => void;
  loseHeart: () => void;
  reset: () => void;
}

const DEFAULT_HEARTS = 5;

export const useSessionStore = create<SessionState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  hearts: DEFAULT_HEARTS,
  currentAnswer: '',
  feedbackState: 'idle',
  isComplete: false,
  xpEarned: 0,

  startSession: (queue, hearts = DEFAULT_HEARTS) =>
    set({ queue, currentIndex: 0, hearts, currentAnswer: '', feedbackState: 'idle', isComplete: false, xpEarned: 0 }),

  setAnswer: (answer) => set({ currentAnswer: answer }),

  checkAnswer: () => {
    const { queue, currentIndex, currentAnswer } = get();
    const exercise = queue[currentIndex];
    if (!exercise) return;

    let correct = false;
    if (exercise.type === 'translate') {
      const selected = (currentAnswer as string[]).join(' ').toLowerCase();
      const expected = exercise.word.english.toLowerCase();
      correct = selected === expected;
    } else if (exercise.type === 'listen') {
      correct = checkListenAnswer(currentAnswer as string, exercise.word.swahili);
    } else if (exercise.type === 'multiple_choice') {
      correct = (currentAnswer as string).toLowerCase() === exercise.word.english.toLowerCase();
    } else if (exercise.type === 'fill_in_blank') {
      correct = (currentAnswer as string).toLowerCase() === exercise.word.swahili.toLowerCase();
    } else if (exercise.type === 'rearrange_sentence') {
      const given = (currentAnswer as string[]).join(' ').toLowerCase().trim();
      const expected = (exercise.correctTiles ?? []).join(' ').toLowerCase().trim();
      correct = given === expected;
    }

    set((s) => ({
      feedbackState: correct ? 'correct' : 'wrong',
      hearts: correct ? s.hearts : Math.max(0, s.hearts - 1),
      xpEarned: correct ? s.xpEarned + 2 : s.xpEarned,
    }));
  },

  nextExercise: () => {
    const { currentIndex, queue } = get();
    const next = currentIndex + 1;
    if (next >= queue.length) {
      set({ isComplete: true, feedbackState: 'idle' });
    } else {
      set({ currentIndex: next, feedbackState: 'idle', currentAnswer: '' });
    }
  },

  loseHeart: () => set((s) => ({ hearts: Math.max(0, s.hearts - 1) })),

  reset: () =>
    set({ queue: [], currentIndex: 0, hearts: DEFAULT_HEARTS, currentAnswer: '', feedbackState: 'idle', isComplete: false, xpEarned: 0 }),
}));
