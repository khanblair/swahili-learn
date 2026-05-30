import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { createStorage } from '../../src/utils/storage';
import { useTheme } from '../../src/hooks/useTheme';
import { textStyles } from '../../src/theme/typography';

const settings = createStorage('settings');
const appStorage = createStorage('app');
const GOALS = [10, 20, 30];

export default function OnboardingScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [step, setStep] = useState<'name' | 'goal'>('name');
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(20);

  function handleNameNext() {
    if (!name.trim()) return;
    settings.set('display_name', name.trim());
    setStep('goal');
  }

  function handleFinish() {
    settings.set('daily_goal', goal);
    appStorage.set('onboarded', true);
    router.replace('/(tabs)' as any);
  }

  if (step === 'name') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.hero}>Karibu!</Text>
          <Text style={styles.subtitle}>Welcome to Swahili Learn</Text>
          <Text style={styles.label}>What should we call you?</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.text.secondary}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleNameNext}
            disabled={!name.trim()}
          >
            <Text style={styles.buttonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.hero}>Set your goal</Text>
        <Text style={styles.subtitle}>How much XP do you want to earn each day?</Text>
        <View style={styles.goalRow}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.goalChip, g === goal && styles.goalChipActive]}
              onPress={() => setGoal(g)}
            >
              <Text style={[styles.goalChipText, g === goal && styles.goalChipTextActive]}>
                {g} XP
              </Text>
              <Text style={[styles.goalSub, g === goal && styles.goalChipTextActive]}>
                {g === 10 ? 'Casual' : g === 20 ? 'Regular' : 'Intense'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>START LEARNING</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    content: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center', gap: theme.spacing.xl },
    hero: { ...textStyles.hero, color: theme.colors.brand.primary },
    subtitle: { ...textStyles.heading, color: theme.colors.text.primary },
    label: { ...textStyles.label, color: theme.colors.text.secondary },
    input: { ...textStyles.body, color: theme.colors.text.primary, backgroundColor: theme.colors.background.input, borderRadius: theme.radius.md, padding: theme.spacing.md, borderWidth: 2, borderColor: theme.colors.border.focus },
    button: { backgroundColor: theme.colors.brand.primary, borderRadius: theme.radius.lg, paddingVertical: theme.spacing.md, alignItems: 'center' },
    buttonDisabled: { backgroundColor: theme.colors.background.card },
    buttonText: { ...textStyles.bodyBold, color: theme.colors.text.inverse, letterSpacing: 1 },
    goalRow: { flexDirection: 'row', gap: theme.spacing.sm },
    goalChip: { flex: 1, borderRadius: theme.radius.md, borderWidth: 2, borderColor: theme.colors.border.default, padding: theme.spacing.md, alignItems: 'center', gap: theme.spacing.xs },
    goalChipActive: { borderColor: theme.colors.brand.primary, backgroundColor: theme.colors.brand.primary },
    goalChipText: { ...textStyles.bodyBold, color: theme.colors.text.primary },
    goalChipTextActive: { color: theme.colors.text.inverse },
    goalSub: { ...textStyles.caption, color: theme.colors.text.secondary },
  });
}
