import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { createStorage } from '../utils/storage';
import { lightTheme, darkTheme, type Theme } from '../theme';

const storage = createStorage('settings');

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState(() => storage.getString('theme'));

  useEffect(() => {
    const unsubscribe = storage.onChange('theme', (val) => {
      setOverride(val);
    });
    return unsubscribe;
  }, []);

  const isDark =
    override === 'dark' ? true
    : override === 'light' ? false
    : systemScheme === 'dark';

  return isDark ? darkTheme : lightTheme;
}
