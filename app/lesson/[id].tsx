import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useSessionStore } from '../../src/store/useSessionStore';
import { useUserStore } from '../../src/store/useUserStore';
import { useStreak } from '../../src/hooks/useStreak';
import { ProgressBar } from '../../src/components/ProgressBar';
import { HeartBar } from '../../src/components/HeartBar';
import { AnswerBar } from '../../src/components/AnswerBar';
import { XPBurst } from '../../src/components/XPBurst';
import { TranslateExercise } from '../../src/components/exercises/TranslateExercise';
import { ListenExercise } from '../../src/components/exercises/ListenExercise';
import { MultipleChoiceExercise } from '../../src/components/exercises/MultipleChoiceExercise';
import { MatchPairsExercise } from '../../src/components/exercises/MatchPairsExercise';
import { FillBlankExercise } from '../../src/components/exercises/FillBlankExercise';
import { RearrangeExercise } from '../../src/components/exercises/RearrangeExercise';
import { getLessonById, getLessonsByUnit, saveLessonProgress } from '../../src/db/queries/lessons';
import { getWordsByUnit } from '../../src/db/queries/words';
import { upsertCard, getCardByWordId } from '../../src/db/queries/cards';
import { buildQueue } from '../../src/engine/lessonQueue';
import { sm2, newCard, qualityFromCorrect } from '../../src/engine/sm2';
import { XP_LESSON_COMPLETE, XP_LESSON_PERFECT_BONUS } from '../../src/engine/xp';
import { textStyles } from '../../src/theme/typography';
import type { Word } from '../../src/types/content';

type Phase = 'exercise' | 'hearts_depleted' | 'summary';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const session = useSessionStore();
  const { earnXP } = useUserStore();
  const { recordActivity } = useStreak();

  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<Phase>('exercise');
  const [showXP, setShowXP] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [missedWords, setMissedWords] = useState<Word[]>([]);

  // Track words user got wrong (deduplicated)
  const missedIdsRef = useRef<Set<number>>(new Set());

  // ── Load ──────────────────────────────────────────────────────────────────
  async function loadLesson() {
    const lesson = await getLessonById(Number(id));
    if (!lesson) return;
    const allWords = await getWordsByUnit(lesson.unit_id);
    const allLessons = await getLessonsByUnit(lesson.unit_id);
    const wordsPerLesson = Math.ceil(allWords.length / Math.max(allLessons.length, 1));
    const start = lesson.lesson_index * wordsPerLesson;
    const lessonWords = allWords.slice(start, start + wordsPerLesson);
    const words = lessonWords.length > 0 ? lessonWords : allWords;
    const queue = buildQueue(words);
    session.startSession(queue);
    setLoaded(true);
    setPhase('exercise');
    setCorrectCount(0);
    setTotalCount(0);
    setMissedWords([]);
    missedIdsRef.current = new Set();
    setFinishing(false);
  }

  useEffect(() => {
    loadLesson();
    return () => session.reset();
  }, [id]);

  // ── Finish (save progress, show summary) ─────────────────────────────────
  async function finishLesson(hearts: number, correct: number, total: number) {
    if (finishing) return;
    setFinishing(true);
    const perfect = hearts === 5;
    const xp = XP_LESSON_COMPLETE + (perfect ? XP_LESSON_PERFECT_BONUS : 0);
    try {
      await earnXP(xp);
      await saveLessonProgress({
        lesson_id: Number(id),
        completed: true,
        perfect,
        completed_at: Date.now(),
        xp_earned: xp,
      });
      await recordActivity();
    } catch (e) {
      console.error('[Lesson] failed to save progress:', e);
    }
    setXpEarned(xp);
    setCorrectCount(correct);
    setTotalCount(total);
    setShowXP(true);
    setTimeout(() => {
      setShowXP(false);
      setPhase('summary');
    }, 1200);
  }

  // ── Continue after each exercise ──────────────────────────────────────────
  async function handleContinue() {
    const { feedbackState, queue, currentIndex, hearts } = session;
    const exercise = queue[currentIndex];
    const correct = feedbackState === 'correct';

    // Track missed words
    if (!correct && !missedIdsRef.current.has(exercise.word.id)) {
      missedIdsRef.current.add(exercise.word.id);
      setMissedWords(prev => [...prev, exercise.word]);
    }

    const newCorrect = correctCount + (correct ? 1 : 0);
    const newTotal   = totalCount + 1;
    setCorrectCount(newCorrect);
    setTotalCount(newTotal);

    try {
      const existing = await getCardByWordId(exercise.word.id);
      const card = existing ?? newCard(exercise.word.id);
      await upsertCard(sm2(card, qualityFromCorrect(correct)));
    } catch (e) {
      console.error('[Lesson] card upsert failed:', e);
    }

    // Hearts depleted → end lesson immediately
    if (!correct && hearts - 1 <= 0) {
      session.checkAnswer(); // let it update hearts display
      setTimeout(() => setPhase('hearts_depleted'), 600);
      return;
    }

    if (currentIndex + 1 >= queue.length) {
      await finishLesson(hearts, newCorrect, newTotal);
      return;
    }
    session.nextExercise();
  }

  async function handleMatchPairsComplete() {
    const { currentIndex, queue, hearts } = session;
    const newTotal = totalCount + 1;
    const newCorrect = correctCount + 1; // match pairs counts as correct
    setCorrectCount(newCorrect);
    setTotalCount(newTotal);
    if (currentIndex + 1 >= queue.length) {
      await finishLesson(hearts, newCorrect, newTotal);
    } else {
      session.nextExercise();
    }
  }

  // ── Try again (restart lesson) ────────────────────────────────────────────
  function handleTryAgain() {
    loadLesson();
  }

  // ── Render: loading ───────────────────────────────────────────────────────
  if (!loaded || !session.queue.length) return null;

  // ── Render: hearts depleted ───────────────────────────────────────────────
  if (phase === 'hearts_depleted') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.overlay}>
          <Ionicons name="heart-dislike" size={64} color="#FF4B4B" />
          <Text style={styles.overlayTitle}>No hearts left!</Text>
          <Text style={styles.overlaySub}>
            You used all your hearts.{'\n'}Give it another shot!
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleTryAgain}>
            <Text style={styles.primaryBtnText}>TRY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => router.back()}>
            <Text style={styles.ghostBtnText}>Quit lesson</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: summary ───────────────────────────────────────────────────────
  if (phase === 'summary') {
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
    const stars = session.hearts === 5 ? 3 : session.hearts >= 3 ? 2 : 1;

    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.summaryContent}>
          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3].map(s => (
              <Ionicons
                key={s}
                name={s <= stars ? 'star' : 'star-outline'}
                size={40}
                color={s <= stars ? theme.colors.gamification.xp : theme.colors.icon.muted}
              />
            ))}
          </View>

          <Text style={styles.summaryTitle}>Lesson Complete!</Text>

          {/* Score cards */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{accuracy}%</Text>
              <Text style={styles.scoreLabel}>Accuracy</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={[styles.scoreValue, { color: theme.colors.brand.primary }]}>
                +{xpEarned}
              </Text>
              <Text style={styles.scoreLabel}>XP Earned</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{correctCount}/{totalCount}</Text>
              <Text style={styles.scoreLabel}>Correct</Text>
            </View>
          </View>

          {/* Missed words */}
          {missedWords.length > 0 && (
            <View style={styles.missedSection}>
              <Text style={styles.missedTitle}>Review these words</Text>
              {missedWords.map(w => (
                <View key={w.id} style={styles.missedRow}>
                  <Text style={styles.missedSwahili}>{w.swahili}</Text>
                  <Text style={styles.missedEnglish}>{w.english}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.summaryFooter}>
          <TouchableOpacity style={styles.ghostBtn} onPress={handleTryAgain}>
            <Text style={styles.ghostBtnText}>Practice again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>

        <XPBurst amount={xpEarned} visible={showXP} />
      </SafeAreaView>
    );
  }

  // ── Render: exercise ──────────────────────────────────────────────────────
  const exercise = session.queue[session.currentIndex];
  const progress = session.currentIndex / session.queue.length;

  function renderExercise() {
    switch (exercise.type) {
      case 'translate':
        return <TranslateExercise exercise={exercise} feedbackState={session.feedbackState} onAnswerChange={session.setAnswer} />;
      case 'listen':
        return <ListenExercise exercise={exercise} typedAnswer={session.currentAnswer as string} feedbackState={session.feedbackState} onChangeText={session.setAnswer} />;
      case 'multiple_choice':
        return <MultipleChoiceExercise exercise={exercise} selectedAnswer={session.currentAnswer as string} feedbackState={session.feedbackState} onSelect={session.setAnswer} />;
      case 'match_pairs':
        return <MatchPairsExercise exercise={exercise} onComplete={handleMatchPairsComplete} />;
      case 'fill_in_blank':
        return <FillBlankExercise exercise={exercise} selectedAnswer={session.currentAnswer as string} feedbackState={session.feedbackState} onSelect={session.setAnswer} />;
      case 'rearrange_sentence':
        return <RearrangeExercise exercise={exercise} feedbackState={session.feedbackState} onAnswerChange={session.setAnswer} />;
    }
  }

  const isArrayAnswer = exercise.type === 'translate' || exercise.type === 'rearrange_sentence';
  const canCheck = isArrayAnswer
    ? (session.currentAnswer as string[]).length > 0
    : typeof session.currentAnswer === 'string' && session.currentAnswer.length > 0;

  const correctLabel = (() => {
    switch (exercise.type) {
      case 'fill_in_blank':
      case 'listen':       return `Correct! "${exercise.word.swahili}"`;
      case 'rearrange_sentence': return `Correct! ${exercise.correctTiles?.join(' ')}`;
      default:             return `Correct! ${exercise.word.english}`;
    }
  })();
  const wrongLabel = (() => {
    switch (exercise.type) {
      case 'fill_in_blank':
      case 'listen':       return `Answer: "${exercise.word.swahili}"`;
      case 'rearrange_sentence': return `Correct order: ${exercise.correctTiles?.join(' ')}`;
      default:             return `Correct answer: ${exercise.word.english}`;
    }
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.icon.default} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} />
        </View>
        <HeartBar hearts={session.hearts} />
      </View>

      <View style={styles.body}>{renderExercise()}</View>

      {exercise.type !== 'match_pairs' && (
        <AnswerBar
          feedbackState={session.feedbackState}
          canCheck={canCheck}
          onCheck={session.checkAnswer}
          onContinue={handleContinue}
          correctLabel={correctLabel}
          wrongLabel={wrongLabel}
        />
      )}

      <XPBurst amount={XP_LESSON_COMPLETE} visible={showXP} />
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },

    // ── Exercise phase ──
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, gap: theme.spacing.md },
    progressWrap: { flex: 1 },
    body: { flex: 1 },

    // ── Hearts depleted / overlay ──
    overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.lg },
    overlayTitle: { ...textStyles.heading, color: theme.colors.text.primary, textAlign: 'center' },
    overlaySub: { ...textStyles.body, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 22 },

    // ── Summary phase ──
    summaryContent: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingBottom: 8 },
    starsRow: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.md },
    summaryTitle: { ...textStyles.heading, color: theme.colors.text.primary, textAlign: 'center' },

    scoreRow: { flexDirection: 'row', gap: theme.spacing.sm },
    scoreCard: {
      flex: 1,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      gap: 4,
    },
    scoreValue: { ...textStyles.heading, color: theme.colors.text.primary },
    scoreLabel: { ...textStyles.caption, color: theme.colors.text.secondary },

    missedSection: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    missedTitle: { ...textStyles.bodyBold, color: theme.colors.state.wrong.text, marginBottom: 4 },
    missedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    missedSwahili: { ...textStyles.bodyBold, color: theme.colors.text.primary },
    missedEnglish: { ...textStyles.body, color: theme.colors.text.secondary },

    summaryFooter: { padding: theme.spacing.lg, gap: theme.spacing.sm },

    // ── Shared buttons ──
    primaryBtn: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    primaryBtnText: { ...textStyles.bodyBold, color: theme.colors.text.inverse, letterSpacing: 1 },
    ghostBtn: {
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    ghostBtnText: { ...textStyles.bodyBold, color: theme.colors.text.secondary },
  });
}
