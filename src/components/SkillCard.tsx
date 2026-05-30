import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { textStyles } from '../theme/typography';

interface Props {
  title: string;
  icon: string;
  progress: number;
  locked: boolean;
  onPress: () => void;
}

export function SkillCard({ title, icon, progress, locked, onPress }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const pct = Math.round(progress * 100);

  return (
    <TouchableOpacity
      style={[styles.card, locked && styles.locked]}
      onPress={onPress}
      disabled={locked}
      activeOpacity={0.75}
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name={locked ? 'lock-closed' : (icon as any)}
          size={32}
          color={locked ? theme.colors.icon.muted : theme.colors.brand.primary}
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, locked && styles.lockedText]}>{title}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
        </View>
      </View>

      {!locked && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.icon.muted} />
      )}
    </TouchableOpacity>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    locked: {
      opacity: 0.5,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.background.screen,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    title: {
      ...textStyles.bodyBold,
      color: theme.colors.text.primary,
    },
    lockedText: {
      color: theme.colors.text.secondary,
    },
    progressTrack: {
      height: 8,
      backgroundColor: theme.colors.background.screen,
      borderRadius: theme.radius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.radius.full,
    },
  });
}
