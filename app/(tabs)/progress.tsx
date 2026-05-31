import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/store/useUserStore';
import { getLast7DaysXP } from '../../src/db/queries/stats';
import { textStyles } from '../../src/theme/typography';

interface DayXP { date: string; xp: number }

export default function ProgressScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const stats = useUserStore(s => s.stats);
  const [weekXP, setWeekXP] = useState<DayXP[]>([]);

  useFocusEffect(useCallback(() => {
    getLast7DaysXP().then(setWeekXP);
  }, []));

  const maxXP = Math.max(...weekXP.map(d => d.xp), 1);

  function last30Days() {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });
  }

  const last7Labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Progress</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Last 7 Days XP</Text>
          <View style={styles.chart}>
            {last7Labels.map(date => {
              const found = weekXP.find(d => d.date === date);
              const xp = found?.xp ?? 0;
              const ratio = xp / maxXP;
              const dayLabel = new Date(date).toLocaleDateString('en', { weekday: 'short' });
              return (
                <View key={date} style={styles.bar}>
                  <Text style={styles.barValue}>{xp > 0 ? xp : ''}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${Math.max(ratio * 100, 4)}%` as any }]} />
                  </View>
                  <Text style={styles.barLabel}>{dayLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>30-Day Activity</Text>
          <View style={styles.calendar}>
            {last30Days().map(date => {
              const hasActivity = weekXP.some(d => d.date === date);
              return (
                <Ionicons
                  key={date}
                  name="square"
                  size={16}
                  color={hasActivity ? theme.colors.brand.primary : theme.colors.background.input}
                  style={styles.calSquare}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.current_streak ?? 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.longest_streak ?? 0}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.total_xp ?? 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
    title: { ...textStyles.title, color: theme.colors.text.primary },
    card: { backgroundColor: theme.colors.background.card, borderRadius: theme.radius.md, padding: theme.spacing.lg, gap: theme.spacing.md },
    sectionTitle: { ...textStyles.bodyBold, color: theme.colors.text.primary },
    chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: theme.spacing.xs },
    bar: { flex: 1, alignItems: 'center', gap: 4 },
    barValue: { ...textStyles.caption, color: theme.colors.text.secondary, fontSize: 9 },
    barTrack: { flex: 1, width: '80%', justifyContent: 'flex-end', backgroundColor: theme.colors.background.input, borderRadius: theme.radius.sm },
    barFill: { backgroundColor: theme.colors.brand.primary, borderRadius: theme.radius.sm, width: '100%' },
    barLabel: { ...textStyles.caption, color: theme.colors.text.secondary },
    calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    calSquare: { margin: 1 },
    statsRow: { flexDirection: 'row', gap: theme.spacing.sm },
    statBox: { flex: 1, backgroundColor: theme.colors.background.card, borderRadius: theme.radius.md, padding: theme.spacing.md, alignItems: 'center', gap: 4 },
    statValue: { ...textStyles.heading, color: theme.colors.brand.primary },
    statLabel: { ...textStyles.caption, color: theme.colors.text.secondary },
  });
}
