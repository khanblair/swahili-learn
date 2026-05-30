import AsyncStorage from '@react-native-async-storage/async-storage';

const _cache: Record<string, string> = {};

export async function loadStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    if (!keys.length) return;
    const pairs = await AsyncStorage.multiGet(keys as string[]);
    for (const [k, v] of pairs) {
      if (k !== null && v !== null) _cache[k] = v;
    }
  } catch {}
}

function nk(ns: string, key: string) {
  return `${ns}:${key}`;
}

export function createStorage(namespace: string) {
  return {
    getBoolean(key: string): boolean | undefined {
      const v = _cache[nk(namespace, key)];
      return v === undefined ? undefined : v === 'true';
    },
    getString(key: string): string | undefined {
      return _cache[nk(namespace, key)];
    },
    getNumber(key: string): number | undefined {
      const v = _cache[nk(namespace, key)];
      return v === undefined ? undefined : Number(v);
    },
    set(key: string, value: string | boolean | number): void {
      const k = nk(namespace, key);
      _cache[k] = String(value);
      AsyncStorage.setItem(k, String(value)).catch(() => {});
    },
    remove(key: string): void {
      const k = nk(namespace, key);
      delete _cache[k];
      AsyncStorage.removeItem(k).catch(() => {});
    },
  };
}
