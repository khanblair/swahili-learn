import { create } from 'zustand';
import { getUserStats, updateUserStats, addXP } from '../db/queries/stats';
import { getLevelIndex } from '../engine/xp';
import type { UserStats } from '../types/content';

interface UserState {
  stats: UserStats | null;
  todayXP: number;
  isLoaded: boolean;

  load: () => Promise<void>;
  earnXP: (amount: number) => Promise<void>;
  setStreak: (current: number, longest: number, date: string) => Promise<void>;
  setHearts: (hearts: number, refillTs?: number) => Promise<void>;
}

const DEFAULT_STATS: UserStats = {
  id: 1,
  total_xp: 0,
  level: 0,
  current_streak: 0,
  longest_streak: 0,
  last_active_date: null,
  hearts: 5,
  hearts_refill_ts: 0,
};

export const useUserStore = create<UserState>((set, get) => ({
  stats: null,
  todayXP: 0,
  isLoaded: false,

  load: async () => {
    const stats = await getUserStats();
    set({ stats, isLoaded: true });
  },

  earnXP: async (amount) => {
    const newTotal = await addXP(amount);
    const level = getLevelIndex(newTotal);
    await updateUserStats({ level });
    set((s) => ({
      stats: s.stats ? { ...s.stats, total_xp: newTotal, level } : null,
      todayXP: s.todayXP + amount,
    }));
  },

  setStreak: async (current, longest, date) => {
    await updateUserStats({ current_streak: current, longest_streak: longest, last_active_date: date });
    set((s) => ({
      stats: s.stats
        ? { ...s.stats, current_streak: current, longest_streak: longest, last_active_date: date }
        : null,
    }));
  },

  setHearts: async (hearts, refillTs) => {
    const update: Partial<UserStats> = { hearts };
    if (refillTs !== undefined) update.hearts_refill_ts = refillTs;
    await updateUserStats(update);
    set((s) => ({
      stats: s.stats ? { ...s.stats, hearts, ...(refillTs !== undefined ? { hearts_refill_ts: refillTs } : {}) } : null,
    }));
  },
}));
