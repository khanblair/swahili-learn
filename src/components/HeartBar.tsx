import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface Props {
  hearts: number;
  max?: number;
}

export function HeartBar({ hearts, max = 5 }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      {Array.from({ length: max }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < hearts ? 'heart' : 'heart-outline'}
          size={22}
          color={i < hearts ? '#FF4B4B' : theme.colors.icon.muted}
          style={styles.icon}
        />
      ))}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    icon: {
      marginHorizontal: 1,
    },
  });
}
