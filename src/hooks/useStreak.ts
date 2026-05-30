import { useCallback } from 'react';
import { createStorage } from '../utils/storage';
import { useUserStore } from '../store/useUserStore';

const storage = createStorage('streak');
const KEY_DATE = 'last_active_date';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useStreak() {
  const { stats, setStreak } = useUserStore();

  const recordActivity = useCallback(async () => {
    const today = todayISO();
    const last = storage.getString(KEY_DATE);

    if (last === today) return;

    const current = stats?.current_streak ?? 0;
    const longest = stats?.longest_streak ?? 0;

    const newStreak = last === yesterdayISO() ? current + 1 : 1;
    const newLongest = Math.max(newStreak, longest);

    storage.set(KEY_DATE, today);
    await setStreak(newStreak, newLongest, today);
  }, [stats, setStreak]);

  const checkReset = useCallback(async () => {
    const last = storage.getString(KEY_DATE);
    if (!last) return;
    const today = todayISO();
    if (last !== today && last !== yesterdayISO()) {
      storage.remove(KEY_DATE);
      await setStreak(0, stats?.longest_streak ?? 0, today);
    }
  }, [stats, setStreak]);

  return { recordActivity, checkReset };
}
