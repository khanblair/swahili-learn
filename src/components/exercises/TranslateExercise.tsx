import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { WordTile } from '../WordTile';
import { textStyles } from '../../theme/typography';
import type { Exercise } from '../../types/content';

interface Props {
  exercise: Exercise;
  feedbackState: 'idle' | 'correct' | 'wrong';
  onAnswerChange: (words: string[]) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TranslateExercise({ exercise, feedbackState, onAnswerChange }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const englishWords = useMemo(
    () => shuffle(exercise.word.english.split(' ')),
    [exercise.word.id]
  );

  const [bank, setBank] = useState(englishWords);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const words = shuffle(exercise.word.english.split(' '));
    setBank(words);
    setSelected([]);
    onAnswerChange([]);
  }, [exercise.word.id]);

  function pickWord(word: string, fromBank: boolean) {
    if (feedbackState !== 'idle') return;
    if (fromBank) {
      setBank(b => b.filter((_, i) => i !== b.indexOf(word)));
      const next = [...selected, word];
      setSelected(next);
      onAnswerChange(next);
    } else {
      setSelected(s => s.filter((_, i) => i !== s.indexOf(word)));
      setBank(b => [...b, word]);
      const next = selected.filter((_, i) => i !== selected.indexOf(word));
      onAnswerChange(next);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Translate this sentence</Text>
      <Text style={styles.word}>{exercise.word.swahili}</Text>

      <View style={styles.answerRow}>
        {selected.length === 0 && (
          <Text style={styles.placeholder}>Tap words below</Text>
        )}
        {selected.map((w, i) => (
          <WordTile key={`sel-${i}`} word={w} onPress={() => pickWord(w, false)} selected />
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.bank}>
        {bank.map((w, i) => (
          <WordTile key={`bank-${i}`} word={w} onPress={() => pickWord(w, true)} />
        ))}
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, padding: theme.spacing.lg },
    prompt: { ...textStyles.label, color: theme.colors.text.secondary, marginBottom: theme.spacing.sm },
    word: { ...textStyles.title, color: theme.colors.text.primary, marginBottom: theme.spacing.xl },
    answerRow: {
      minHeight: 52,
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border.default,
      paddingBottom: theme.spacing.md,
      alignItems: 'flex-start',
    },
    placeholder: { ...textStyles.body, color: theme.colors.text.secondary },
    divider: { height: theme.spacing.lg },
    bank: { flexDirection: 'row', flexWrap: 'wrap' },
  });
}
