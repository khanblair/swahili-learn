import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/store/useUserStore';
import { SkillCard } from '../../src/components/SkillCard';
import { ProgressBar } from '../../src/components/ProgressBar';
import { units, type CefrLevel } from '../../src/content/units';
import { getUnitCompletionRatio } from '../../src/db/queries/lessons';
import { getCardCountDue } from '../../src/db/queries/cards';
import { getLevel } from '../../src/engine/xp';
import { textStyles } from '../../src/theme/typography';

export default function HomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const stats = useUserStore(s => s.stats);
  const todayXP = useUserStore(s => s.todayXP);
  const [unitProgress, setUnitProgress] = useState<Record<number, number>>({});
  const [dueCount, setDueCount] = useState(0);
  const dailyGoal = 20;

  useFocusEffect(useCallback(() => {
    async function loadData() {
      const progress: Record<number, number> = {};
      for (const u of units) {
        progress[u.id] = await getUnitCompletionRatio(u.id);
      }
      setUnitProgress(progress);
      setDueCount(await getCardCountDue());
      await useUserStore.getState().load();
    }
    loadData();
  }, []));

  const level = getLevel(stats?.total_xp ?? 0);
  const goalProgress = Math.min(1, todayXP / dailyGoal);

  function isUnitLocked(idx: number) {
    if (idx === 0) return false;
    return (unitProgress[units[idx - 1].id] ?? 0) < units[idx].unlockThreshold;
  }

  function handleUnitPress(unitId: number) {
    router.push({ pathname: '/unit/[id]', params: { id: unitId } } as any);
  }

  const LEVEL_LABELS: Record<CefrLevel, string> = {
    A1: 'A1 · Absolute Beginner',
    A2: 'A2 · Elementary',
    B1: 'B1 · Intermediate',
  };

  // Build a flat list of items: either a level header or a unit card
  type ListItem =
    | { kind: 'header'; level: CefrLevel }
    | { kind: 'unit'; unit: typeof units[0]; idx: number };

  const listItems: ListItem[] = [];
  let lastLevel: CefrLevel | null = null;
  units.forEach((unit, idx) => {
    if (unit.level !== lastLevel) {
      listItems.push({ kind: 'header', level: unit.level });
      lastLevel = unit.level;
    }
    listItems.push({ kind: 'unit', unit, idx });
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.row}>
          <Ionicons name="flame" size={22} color={theme.colors.gamification.streak} />
          <Text style={styles.stat}>{stats?.current_streak ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="star" size={22} color={theme.colors.gamification.xp} />
          <Text style={styles.stat}>{stats?.total_xp ?? 0} XP</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{level.name}</Text>
        </View>
      </View>

      <View style={styles.goalSection}>
        <Text style={styles.goalLabel}>Daily goal — {todayXP}/{dailyGoal} XP</Text>
        <ProgressBar progress={goalProgress} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {listItems.map((item, i) => {
          if (item.kind === 'header') {
            return (
              <View key={`header-${i}`} style={styles.levelHeader}>
                <View style={styles.levelHeaderLine} />
                <Text style={styles.levelHeaderText}>{LEVEL_LABELS[item.level]}</Text>
                <View style={styles.levelHeaderLine} />
              </View>
            );
          }
          return (
            <SkillCard
              key={item.unit.id}
              title={item.unit.title}
              icon={item.unit.icon}
              progress={unitProgress[item.unit.id] ?? 0}
              locked={isUnitLocked(item.idx)}
              onPress={() => handleUnitPress(item.unit.id)}
            />
          );
        })}
      </ScrollView>

      {dueCount > 0 && (
        <TouchableOpacity style={styles.reviewFab} onPress={() => router.push('/review' as any)}>
          <Ionicons name="book-outline" size={20} color={theme.colors.text.inverse} />
          <Text style={styles.reviewText}>Review {dueCount} cards</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    stat: { ...textStyles.bodyBold, color: theme.colors.text.primary },
    badge: { backgroundColor: theme.colors.brand.primary, borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.sm, paddingVertical: 3 },
    badgeText: { ...textStyles.caption, color: theme.colors.text.inverse, fontWeight: '700' },
    goalSection: { paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md, gap: theme.spacing.xs },
    goalLabel: { ...textStyles.label, color: theme.colors.text.secondary },
    scroll: { flex: 1 },
    scrollContent: { padding: theme.spacing.lg },
    reviewFab: { position: 'absolute', bottom: theme.spacing.xxl, alignSelf: 'center', backgroundColor: theme.colors.brand.primary, borderRadius: theme.radius.full, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
    reviewText: { ...textStyles.bodyBold, color: theme.colors.text.inverse },
    levelHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.lg, marginBottom: theme.spacing.xs },
    levelHeaderLine: { flex: 1, height: 1, backgroundColor: theme.colors.border.default },
    levelHeaderText: { ...textStyles.caption, color: theme.colors.text.secondary, letterSpacing: 1, fontWeight: '700' },
  });
}
