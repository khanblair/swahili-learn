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

export function TranslateExercise({ exercise, feedbackState, onAnswerChange }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const initialBank = exercise.options ?? exercise.word.english.split(' ');

  const [bank, setBank] = useState<string[]>(initialBank);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setBank(exercise.options ?? exercise.word.english.split(' '));
    setSelected([]);
    onAnswerChange([]);
  }, [exercise.word.id]);

  function pickFromBank(word: string, bankIdx: number) {
    if (feedbackState !== 'idle') return;
    const newBank = [...bank];
    newBank.splice(bankIdx, 1);
    const next = [...selected, word];
    setBank(newBank);
    setSelected(next);
    onAnswerChange(next);
  }

  function returnToBank(word: string, selIdx: number) {
    if (feedbackState !== 'idle') return;
    const newSel = [...selected];
    newSel.splice(selIdx, 1);
    setSelected(newSel);
    setBank(b => [...b, word]);
    onAnswerChange(newSel);
  }

  const answerBg =
    feedbackState === 'correct' ? theme.colors.state.correct.background
    : feedbackState === 'wrong' ? theme.colors.state.wrong.background
    : 'transparent';

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Translate this sentence</Text>
      <Text style={styles.word}>{exercise.word.swahili}</Text>

      <View style={[styles.answerRow, { backgroundColor: answerBg }]}>
        {selected.length === 0 ? (
          <Text style={styles.placeholder}>Tap words below to build your answer</Text>
        ) : (
          selected.map((w, i) => (
            <WordTile
              key={`sel-${i}-${w}`}
              word={w}
              onPress={() => returnToBank(w, i)}
              selected
              disabled={feedbackState !== 'idle'}
            />
          ))
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.bank}>
        {bank.map((w, i) => (
          <WordTile
            key={`bank-${i}-${w}`}
            word={w}
            onPress={() => pickFromBank(w, i)}
            disabled={feedbackState !== 'idle'}
          />
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
      minHeight: 60,
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border.default,
      paddingBottom: theme.spacing.md,
      paddingTop: theme.spacing.xs,
      alignItems: 'flex-start',
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.xs,
    },
    placeholder: { ...textStyles.body, color: theme.colors.text.secondary, padding: theme.spacing.sm },
    divider: { height: theme.spacing.xl },
    bank: { flexDirection: 'row', flexWrap: 'wrap' },
  });
}
