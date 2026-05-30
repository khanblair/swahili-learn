import { useColorScheme } from 'react-native';
import { createStorage } from '../utils/storage';
import { lightTheme, darkTheme, type Theme } from '../theme';

const storage = createStorage('settings');

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const override = storage.getString('theme');

  const isDark =
    override === 'dark' ? true
    : override === 'light' ? false
    : systemScheme === 'dark';

  return isDark ? darkTheme : lightTheme;
}
