import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useUserStore } from '../../src/store/useUserStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { MultipleChoiceExercise } from '../../src/components/exercises/MultipleChoiceExercise';
import { getWordsByUnit } from '../../src/db/queries/words';
import { buildQueue } from '../../src/engine/lessonQueue';
import { XP_LESSON_COMPLETE } from '../../src/engine/xp';
import { textStyles } from '../../src/theme/typography';
import type { Exercise } from '../../src/types/content';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { earnXP } = useUserStore();
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      const words = await getWordsByUnit(Number(id));
      const q = buildQueue(words).filter(e => e.type === 'multiple_choice');
      setQueue(q);
    }
    load();
  }, [id]);

  function handleSelect(answer: string) {
    if (feedback !== 'idle') return;
    setSelected(answer);
    const correct = answer.toLowerCase() === queue[index].word.english.toLowerCase();
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
  }

  async function handleNext() {
    if (index + 1 >= queue.length) {
      await earnXP(XP_LESSON_COMPLETE);
      setDone(true);
      return;
    }
    setIndex(i => i + 1);
    setSelected('');
    setFeedback('idle');
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.result}>
          <Ionicons name="trophy" size={80} color={theme.colors.gamification.xp} />
          <Text style={styles.hero}>{score}/{queue.length}</Text>
          <Text style={styles.subtitle}>Quiz complete!</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
            <Text style={styles.btnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!queue.length) return null;

  const exercise = queue[index];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.icon.default} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <ProgressBar progress={index / queue.length} />
        </View>
        <Text style={styles.score}>{score}/{queue.length}</Text>
      </View>

      <MultipleChoiceExercise exercise={exercise} selectedAnswer={selected} feedbackState={feedback} onSelect={handleSelect} />

      {feedback !== 'idle' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={handleNext}>
            <Text style={styles.btnText}>{index + 1 >= queue.length ? 'FINISH' : 'NEXT'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    topBar: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, gap: theme.spacing.md },
    progressWrap: { flex: 1 },
    score: { ...textStyles.label, color: theme.colors.text.secondary },
    footer: { padding: theme.spacing.lg },
    btn: { backgroundColor: theme.colors.brand.primary, borderRadius: theme.radius.lg, paddingVertical: theme.spacing.md, alignItems: 'center' },
    btnText: { ...textStyles.bodyBold, color: theme.colors.text.inverse, letterSpacing: 1 },
    result: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xl, padding: theme.spacing.xl },
    hero: { ...textStyles.hero, color: theme.colors.text.primary },
    subtitle: { ...textStyles.heading, color: theme.colors.text.secondary },
  });
}
