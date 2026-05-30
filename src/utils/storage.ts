import AsyncStorage from '@react-native-async-storage/async-storage';

const _cache: Record<string, string> = {};
const _listeners = new Map<string, Set<(value: string | undefined) => void>>();

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
    onChange(key: string, callback: (value: string | undefined) => void): () => void {
      const k = nk(namespace, key);
      if (!_listeners.has(k)) {
        _listeners.set(k, new Set());
      }
      _listeners.get(k)!.add(callback);
      return () => {
        _listeners.get(k)?.delete(callback);
        if (_listeners.get(k)?.size === 0) {
          _listeners.delete(k);
        }
      };
    },
    set(key: string, value: string | boolean | number): void {
      const k = nk(namespace, key);
      const strVal = String(value);
      const prev = _cache[k];
      _cache[k] = strVal;
      AsyncStorage.setItem(k, strVal).catch(() => {});
      if (prev !== strVal) {
        _listeners.get(k)?.forEach(cb => cb(strVal));
      }
    },
    remove(key: string): void {
      const k = nk(namespace, key);
      const prev = _cache[k];
      delete _cache[k];
      AsyncStorage.removeItem(k).catch(() => {});
      if (prev !== undefined) {
        _listeners.get(k)?.forEach(cb => cb(undefined));
      }
    },
  };
}
