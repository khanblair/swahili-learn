import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface Props {
  onPress: () => void;
  onPressSlow?: () => void;
  isPlaying?: boolean;
  disabled?: boolean;
}

export function AudioButton({ onPress, onPressSlow, isPlaying = false, disabled = false }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.button, styles.primary, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled || isPlaying}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isPlaying ? 'volume-high' : 'volume-high-outline'}
          size={28}
          color={theme.colors.text.inverse}
        />
      </TouchableOpacity>

      {onPressSlow && (
        <TouchableOpacity
          style={[styles.button, styles.secondary, disabled && styles.disabled]}
          onPress={onPressSlow}
          disabled={disabled || isPlaying}
          activeOpacity={0.7}
        >
          <Ionicons name="hourglass-outline" size={22} color={theme.colors.brand.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    button: {
      width: 64,
      height: 64,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: {
      backgroundColor: theme.colors.brand.primary,
    },
    secondary: {
      backgroundColor: theme.colors.background.card,
      borderWidth: 2,
      borderColor: theme.colors.brand.primary,
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
