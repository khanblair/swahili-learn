import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { WordTile } from '../WordTile';
import { textStyles } from '../../theme/typography';
import type { Exercise } from '../../types/content';

interface Props {
  exercise: Exercise;
  feedbackState: 'idle' | 'correct' | 'wrong';
  onAnswerChange: (tiles: string[]) => void;
}

export function RearrangeExercise({ exercise, feedbackState, onAnswerChange }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const initialBank = exercise.tiles ?? [];

  const [bank, setBank] = useState<string[]>(initialBank);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setBank(exercise.tiles ?? []);
    setSelected([]);
    onAnswerChange([]);
  }, [exercise.word.id]);

  function pickFromBank(tile: string, idx: number) {
    if (feedbackState !== 'idle') return;
    const newBank = [...bank];
    newBank.splice(idx, 1);
    const next = [...selected, tile];
    setBank(newBank);
    setSelected(next);
    onAnswerChange(next);
  }

  function returnToBank(tile: string, idx: number) {
    if (feedbackState !== 'idle') return;
    const newSel = [...selected];
    newSel.splice(idx, 1);
    setSelected(newSel);
    setBank(b => [...b, tile]);
    onAnswerChange(newSel);
  }

  const answerBg =
    feedbackState === 'correct' ? theme.colors.state.correct.background
    : feedbackState === 'wrong'   ? theme.colors.state.wrong.background
    : 'transparent';

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Arrange into a Swahili sentence</Text>
      <Text style={styles.hint}>{exercise.word.example_en}</Text>

      {/* Answer area */}
      <View style={[styles.answerRow, { backgroundColor: answerBg }]}>
        {selected.length === 0 ? (
          <Text style={styles.placeholder}>Tap words below to build the sentence</Text>
        ) : (
          selected.map((tile, i) => (
            <WordTile
              key={`sel-${i}-${tile}`}
              word={tile}
              onPress={() => returnToBank(tile, i)}
              selected
              disabled={feedbackState !== 'idle'}
            />
          ))
        )}
      </View>

      <View style={styles.divider} />

      {/* Word bank */}
      <View style={styles.bank}>
        {bank.map((tile, i) => (
          <WordTile
            key={`bank-${i}-${tile}`}
            word={tile}
            onPress={() => pickFromBank(tile, i)}
            disabled={feedbackState !== 'idle'}
          />
        ))}
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    prompt: {
      ...textStyles.label,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    hint: {
      ...textStyles.body,
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
      marginBottom: theme.spacing.xl,
    },
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
    placeholder: {
      ...textStyles.body,
      color: theme.colors.text.secondary,
      padding: theme.spacing.sm,
    },
    divider: {
      height: theme.spacing.xl,
    },
    bank: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  });
}
