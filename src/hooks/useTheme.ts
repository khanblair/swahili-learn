import { useColorScheme } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import { lightTheme, darkTheme, type Theme } from '../theme';

const storage = createMMKV({ id: 'settings' });

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const override = storage.getString('theme');

  const isDark =
    override === 'dark' ? true
    : override === 'light' ? false
    : systemScheme === 'dark';

  return isDark ? darkTheme : lightTheme;
}
