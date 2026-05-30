import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useSessionStore } from '../../src/store/useSessionStore';
import { useUserStore } from '../../src/store/useUserStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { AnswerBar } from '../../src/components/AnswerBar';
import { TranslateExercise } from '../../src/components/exercises/TranslateExercise';
import { ListenExercise } from '../../src/components/exercises/ListenExercise';
import { MultipleChoiceExercise } from '../../src/components/exercises/MultipleChoiceExercise';
import { MatchPairsExercise } from '../../src/components/exercises/MatchPairsExercise';
import { getCardsDue } from '../../src/db/queries/cards';
import { getWordsByIds } from '../../src/db/queries/words';
import { upsertCard } from '../../src/db/queries/cards';
import { sm2, qualityFromCorrect } from '../../src/engine/sm2';
import { buildQueue } from '../../src/engine/lessonQueue';
import { XP_REVIEW_CORRECT } from '../../src/engine/xp';
import { textStyles } from '../../src/theme/typography';

export default function ReviewScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const session = useSessionStore();
  const { earnXP } = useUserStore();
  const [loaded, setLoaded] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    async function load() {
      const cards = await getCardsDue();
      if (!cards.length) { router.back(); return; }
      const words = await getWordsByIds(cards.map(c => c.word_id));
      const queue = buildQueue(words);
      session.startSession(queue, 99);
      setRemaining(queue.length);
      setLoaded(true);
    }
    load();
    return () => session.reset();
  }, []);

  async function handleContinue() {
    const { feedbackState, queue, currentIndex } = session;
    const exercise = queue[currentIndex];
    const correct = feedbackState === 'correct';

    const cards = await getCardsDue();
    const card = cards.find(c => c.word_id === exercise.word.id);
    if (card) {
      await upsertCard(sm2(card, qualityFromCorrect(correct)));
    }
    if (correct) await earnXP(XP_REVIEW_CORRECT);

    if (currentIndex + 1 >= queue.length) {
      router.back();
      return;
    }
    setRemaining(queue.length - currentIndex - 1);
    session.nextExercise();
  }

  if (!loaded || !session.queue.length) return null;

  const exercise = session.queue[session.currentIndex];
  const progress = session.currentIndex / session.queue.length;

  function renderExercise() {
    switch (exercise.type) {
      case 'translate': return <TranslateExercise exercise={exercise} feedbackState={session.feedbackState} onAnswerChange={session.setAnswer} />;
      case 'listen': return <ListenExercise exercise={exercise} typedAnswer={session.currentAnswer as string} feedbackState={session.feedbackState} onChangeText={session.setAnswer} />;
      case 'multiple_choice': return <MultipleChoiceExercise exercise={exercise} selectedAnswer={session.currentAnswer as string} feedbackState={session.feedbackState} onSelect={session.setAnswer} />;
      case 'match_pairs': return <MatchPairsExercise exercise={exercise} onComplete={session.nextExercise} />;
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
        <Text style={styles.count}>{remaining} left</Text>
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
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, gap: theme.spacing.md },
    progressWrap: { flex: 1 },
    count: { ...textStyles.label, color: theme.colors.text.secondary },
    body: { flex: 1 },
  });
}
