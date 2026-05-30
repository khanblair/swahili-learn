import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
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
import { getLessonById } from '../../src/db/queries/lessons';
import { getWordsByUnit } from '../../src/db/queries/words';
import { upsertCard, getCardByWordId } from '../../src/db/queries/cards';
import { buildQueue } from '../../src/engine/lessonQueue';
import { sm2, newCard, qualityFromCorrect } from '../../src/engine/sm2';
import { saveLessonProgress } from '../../src/db/queries/lessons';
import { XP_LESSON_COMPLETE, XP_LESSON_PERFECT_BONUS } from '../../src/engine/xp';
import { textStyles } from '../../src/theme/typography';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const session = useSessionStore();
  const { earnXP } = useUserStore();
  const { recordActivity } = useStreak();
  const [loaded, setLoaded] = useState(false);
  const [showXP, setShowXP] = useState(false);

  useEffect(() => {
    async function load() {
      const lesson = await getLessonById(Number(id));
      if (!lesson) return;
      const words = await getWordsByUnit(lesson.unit_id);
      const queue = buildQueue(words);
      session.startSession(queue);
      setLoaded(true);
    }
    load();
    return () => session.reset();
  }, [id]);

  async function handleContinue() {
    const { feedbackState, queue, currentIndex, hearts, xpEarned } = session;
    const exercise = queue[currentIndex];
    const correct = feedbackState === 'correct';

    const existing = await getCardByWordId(exercise.word.id);
    const card = existing ?? newCard(exercise.word.id);
    const updated = sm2(card, qualityFromCorrect(correct));
    await upsertCard(updated);

    if (session.isComplete || currentIndex + 1 >= queue.length) {
      const perfect = hearts === 5;
      const xp = XP_LESSON_COMPLETE + (perfect ? XP_LESSON_PERFECT_BONUS : 0);
      await earnXP(xp);
      await saveLessonProgress({ lesson_id: Number(id), completed: true, perfect, completed_at: Date.now(), xp_earned: xp });
      await recordActivity();
      setShowXP(true);
      setTimeout(() => router.back(), 1800);
      return;
    }

    session.nextExercise();
  }

  if (!loaded || !session.queue.length) return null;

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
        return <MatchPairsExercise exercise={exercise} onComplete={session.nextExercise} />;
    }
  }

  const canCheck = exercise.type === 'translate'
    ? (session.currentAnswer as string[]).length > 0
    : typeof session.currentAnswer === 'string' && session.currentAnswer.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
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
          correctLabel={`Correct! ${exercise.word.english}`}
          wrongLabel={`Correct answer: ${exercise.word.english}`}
        />
      )}

      <XPBurst amount={2} visible={showXP} />
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, gap: theme.spacing.md },
    progressWrap: { flex: 1 },
    body: { flex: 1 },
  });
}
