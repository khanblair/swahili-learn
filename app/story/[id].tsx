import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { AudioButton } from '../../src/components/AudioButton';
import { useAudio } from '../../src/hooks/useAudio';
import { getStoryLines, markStoryCompleted } from '../../src/db/queries/stories';
import { storyQuestions } from '../../src/content/stories';
import { textStyles } from '../../src/theme/typography';
import type { StoryLine, ComprehensionQuestion } from '../../src/types/content';

type Phase = 'reading' | 'questions' | 'done';

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const storyId = Number(id);
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // ── Reading phase ──────────────────────────────────────────────────────
  const [lines, setLines] = useState<StoryLine[]>([]);
  const [current, setCurrent] = useState(0);
  const [showEn, setShowEn] = useState<Record<number, boolean>>({});

  // ── Question phase ─────────────────────────────────────────────────────
  const questions: ComprehensionQuestion[] = storyQuestions[storyId] ?? [];
  const [phase, setPhase] = useState<Phase>('reading');
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [qFeedback, setQFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);

  const currentLine = lines[current];
  const audio = useAudio(currentLine?.audio_file ?? null);

  useEffect(() => {
    getStoryLines(storyId).then(setLines);
  }, [storyId]);

  useEffect(() => {
    if (phase === 'reading' && audio.hasAudio) audio.play();
  }, [current, phase]);

  // ── Reading navigation ─────────────────────────────────────────────────
  async function handleNext() {
    if (current + 1 >= lines.length) {
      // Finished reading — go to questions (or complete if none)
      if (questions.length > 0) {
        setPhase('questions');
      } else {
        await markStoryCompleted(storyId);
        router.back();
      }
      return;
    }
    setCurrent(c => c + 1);
  }

  // ── Question navigation ────────────────────────────────────────────────
  function handleSelectAnswer(opt: string) {
    if (qFeedback !== 'idle') return;
    setSelectedAnswer(opt);
    const correct = opt === questions[qIndex].correct;
    setQFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
  }

  async function handleNextQuestion() {
    if (qIndex + 1 >= questions.length) {
      await markStoryCompleted(storyId);
      setPhase('done');
      setTimeout(() => router.back(), 1600);
      return;
    }
    setQIndex(i => i + 1);
    setSelectedAnswer('');
    setQFeedback('idle');
  }

  // ── Render: reading ────────────────────────────────────────────────────
  if (phase === 'reading') {
    if (!lines.length) return null;
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.colors.icon.default} />
          </TouchableOpacity>
          <Text style={styles.progress}>{current + 1} / {lines.length}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.swahili}>{currentLine?.swahili}</Text>

          <TouchableOpacity onPress={() => setShowEn(s => ({ ...s, [current]: !s[current] }))}>
            <Text style={styles.hint}>
              {showEn[current] ? currentLine?.english : 'Tap to reveal translation'}
            </Text>
          </TouchableOpacity>

          <AudioButton
            onPress={audio.play}
            onPressSlow={audio.playSlow}
            isPlaying={audio.isPlaying}
            disabled={!audio.hasAudio}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextText}>
              {current + 1 >= lines.length ? (questions.length > 0 ? 'ANSWER QUESTIONS' : 'FINISH') : 'NEXT'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: comprehension questions ───────────────────────────────────
  if (phase === 'questions') {
    const q = questions[qIndex];
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.colors.icon.default} />
          </TouchableOpacity>
          <Text style={styles.progress}>
            Question {qIndex + 1} / {questions.length}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.qBody}>
          <Text style={styles.qLabel}>Comprehension</Text>
          <Text style={styles.qText}>{q.question_sw}</Text>

          <View style={styles.qOptions}>
            {q.options.map(opt => {
              let optStyle = styles.option;
              if (qFeedback !== 'idle') {
                if (opt === q.correct) optStyle = styles.optionCorrect;
                else if (opt === selectedAnswer) optStyle = styles.optionWrong;
              } else if (opt === selectedAnswer) {
                optStyle = styles.optionSelected;
              }
              return (
                <TouchableOpacity
                  key={opt}
                  style={optStyle}
                  onPress={() => handleSelectAnswer(opt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {qFeedback !== 'idle' && (
            <View style={[styles.feedbackBanner, qFeedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Ionicons
                name={qFeedback === 'correct' ? 'checkmark-circle' : 'close-circle'}
                size={22}
                color={qFeedback === 'correct' ? theme.colors.state.correct.text : theme.colors.state.wrong.text}
              />
              <Text style={[styles.feedbackText, { color: qFeedback === 'correct' ? theme.colors.state.correct.text : theme.colors.state.wrong.text }]}>
                {qFeedback === 'correct' ? 'Correct!' : `Answer: ${q.correct}`}
              </Text>
            </View>
          )}
        </ScrollView>

        {qFeedback !== 'idle' && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuestion}>
              <Text style={styles.nextText}>
                {qIndex + 1 >= questions.length ? 'FINISH' : 'NEXT QUESTION'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ── Render: done ───────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.doneBody}>
        <Ionicons name="star" size={64} color={theme.colors.gamification.xp} />
        <Text style={styles.doneTitle}>Story Complete!</Text>
        <Text style={styles.doneSub}>{score} / {questions.length} correct</Text>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg },
    progress: { ...textStyles.label, color: theme.colors.text.secondary },

    // ── Reading ──
    body: { flex: 1, padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xl },
    swahili: { ...textStyles.title, color: theme.colors.text.primary, textAlign: 'center' },
    hint: { ...textStyles.body, color: theme.colors.text.secondary, textAlign: 'center', textDecorationLine: 'underline' },

    // ── Questions ──
    qBody: { padding: theme.spacing.lg, gap: theme.spacing.lg },
    qLabel: { ...textStyles.caption, color: theme.colors.text.secondary, letterSpacing: 1 },
    qText: { ...textStyles.title, color: theme.colors.text.primary },
    qOptions: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    option: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.border.default,
    },
    optionSelected: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.brand.primary,
    },
    optionCorrect: {
      backgroundColor: theme.colors.state.correct.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.state.correct.text,
    },
    optionWrong: {
      backgroundColor: theme.colors.state.wrong.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.state.wrong.text,
    },
    optionText: { ...textStyles.body, color: theme.colors.text.primary },
    feedbackBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    feedbackCorrect: { backgroundColor: theme.colors.state.correct.background },
    feedbackWrong: { backgroundColor: theme.colors.state.wrong.background },
    feedbackText: { ...textStyles.bodyBold },

    // ── Done ──
    doneBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg },
    doneTitle: { ...textStyles.heading, color: theme.colors.text.primary },
    doneSub: { ...textStyles.body, color: theme.colors.text.secondary },

    // ── Shared footer ──
    footer: { padding: theme.spacing.lg },
    nextBtn: { backgroundColor: theme.colors.brand.primary, borderRadius: theme.radius.lg, paddingVertical: theme.spacing.md, alignItems: 'center' },
    nextText: { ...textStyles.bodyBold, color: theme.colors.text.inverse, letterSpacing: 1 },
  });
}
