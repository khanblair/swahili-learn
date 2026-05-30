import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStorage } from '../../src/utils/storage';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/store/useUserStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { getLevel, getLevelProgress, getXPToNextLevel } from '../../src/engine/xp';
import { textStyles } from '../../src/theme/typography';

const settings = createStorage('settings');
const DAILY_GOALS = [10, 20, 30];

export default function ProfileScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const stats = useUserStore(s => s.stats);

  const [name, setName] = useState(settings.getString('display_name') ?? '');
  const [dailyGoal, setDailyGoal] = useState(settings.getNumber('daily_goal') ?? 20);
  const [themeMode, setThemeMode] = useState(settings.getString('theme') ?? 'system');

  const xp = stats?.total_xp ?? 0;
  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const xpToNext = getXPToNextLevel(xp);

  function saveName(text: string) {
    setName(text);
    settings.set('display_name', text);
  }

  function selectGoal(goal: number) {
    setDailyGoal(goal);
    settings.set('daily_goal', goal);
  }

  function cycleTheme() {
    const next = themeMode === 'system' ? 'light' : themeMode === 'light' ? 'dark' : 'system';
    setThemeMode(next);
    settings.set('theme', next);
  }

  const themeIcon = themeMode === 'dark' ? 'moon' : themeMode === 'light' ? 'sunny' : 'contrast';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={saveName}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.levelRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{level.name}</Text>
            </View>
            <Text style={styles.xpText}>{xp} XP {xpToNext > 0 ? `· ${xpToNext} to next` : ''}</Text>
          </View>
          <ProgressBar progress={levelProgress} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Daily goal</Text>
          <View style={styles.goalRow}>
            {DAILY_GOALS.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.goalChip, g === dailyGoal && styles.goalChipActive]}
                onPress={() => selectGoal(g)}
              >
                <Text style={[styles.goalChipText, g === dailyGoal && styles.goalChipTextActive]}>
                  {g} XP
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme</Text>
            <TouchableOpacity onPress={cycleTheme} style={styles.settingAction}>
              <Ionicons name={themeIcon as any} size={20} color={theme.colors.brand.primary} />
              <Text style={styles.settingValue}>{themeMode}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.longest_streak ?? 0}</Text>
            <Text style={styles.statLabel}>Best streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.current_streak ?? 0}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    content: { padding: theme.spacing.lg, gap: theme.spacing.md },
    title: { ...textStyles.title, color: theme.colors.text.primary },
    card: { backgroundColor: theme.colors.background.card, borderRadius: theme.radius.md, padding: theme.spacing.lg, gap: theme.spacing.md },
    label: { ...textStyles.label, color: theme.colors.text.secondary },
    input: { ...textStyles.body, color: theme.colors.text.primary, backgroundColor: theme.colors.background.input, borderRadius: theme.radius.sm, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border.default },
    levelRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    badge: { backgroundColor: theme.colors.brand.primary, borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.md, paddingVertical: 4 },
    badgeText: { ...textStyles.label, color: theme.colors.text.inverse, fontWeight: '700' },
    xpText: { ...textStyles.label, color: theme.colors.text.secondary },
    goalRow: { flexDirection: 'row', gap: theme.spacing.sm },
    goalChip: { flex: 1, borderRadius: theme.radius.md, borderWidth: 2, borderColor: theme.colors.border.default, paddingVertical: theme.spacing.sm, alignItems: 'center' },
    goalChipActive: { borderColor: theme.colors.brand.primary, backgroundColor: theme.colors.brand.primary },
    goalChipText: { ...textStyles.label, color: theme.colors.text.secondary },
    goalChipTextActive: { color: theme.colors.text.inverse },
    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    settingLabel: { ...textStyles.body, color: theme.colors.text.primary },
    settingAction: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    settingValue: { ...textStyles.label, color: theme.colors.brand.primary, textTransform: 'capitalize' },
    statsRow: { flexDirection: 'row', gap: theme.spacing.sm },
    statBox: { flex: 1, backgroundColor: theme.colors.background.card, borderRadius: theme.radius.md, padding: theme.spacing.md, alignItems: 'center', gap: 4 },
    statValue: { ...textStyles.heading, color: theme.colors.brand.primary },
    statLabel: { ...textStyles.caption, color: theme.colors.text.secondary },
  });
}
