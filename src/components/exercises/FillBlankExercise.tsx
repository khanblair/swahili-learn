import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { textStyles } from '../../theme/typography';
import type { Exercise } from '../../types/content';

interface Props {
  exercise: Exercise;
  selectedAnswer: string;
  feedbackState: 'idle' | 'correct' | 'wrong';
  onSelect: (answer: string) => void;
}

export function FillBlankExercise({ exercise, selectedAnswer, feedbackState, onSelect }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Render sentence: split on _____ to show prefix / suffix around the blank
  const sentence = exercise.prompt ?? exercise.word.example_sw;
  const [before, after] = sentence.includes('_____')
    ? sentence.split('_____')
    : [sentence, ''];

  function optionStyle(option: string) {
    if (feedbackState === 'idle') {
      return option === selectedAnswer ? styles.optionSelected : styles.option;
    }
    if (option === exercise.word.swahili) return styles.optionCorrect;
    if (option === selectedAnswer && feedbackState === 'wrong') return styles.optionWrong;
    return styles.option;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Fill in the blank</Text>
      <Text style={styles.hint}>{exercise.word.example_en}</Text>

      {/* Sentence with live fill-in */}
      <View style={styles.sentenceRow}>
        {before ? <Text style={styles.sentenceText}>{before.trimEnd()} </Text> : null}

        <View style={[
          styles.blank,
          selectedAnswer ? styles.blankFilled : null,
          feedbackState === 'correct' ? styles.blankCorrect : null,
          feedbackState === 'wrong' && selectedAnswer === exercise.word.swahili ? styles.blankCorrect : null,
          feedbackState === 'wrong' && selectedAnswer !== exercise.word.swahili ? styles.blankWrong : null,
        ]}>
          <Text style={[
            styles.blankText,
            selectedAnswer ? styles.blankTextFilled : null,
          ]}>
            {selectedAnswer || '  ?  '}
          </Text>
        </View>

        {after ? <Text style={styles.sentenceText}> {after.trimStart()}</Text> : null}
      </View>

      {/* Options */}
      <View style={styles.grid}>
        {(exercise.options ?? []).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={optionStyle(opt)}
            onPress={() => feedbackState === 'idle' && onSelect(opt)}
            activeOpacity={0.8}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
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
      gap: theme.spacing.lg,
    },
    prompt: {
      ...textStyles.label,
      color: theme.colors.text.secondary,
    },
    hint: {
      ...textStyles.body,
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
    sentenceRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      gap: 2,
    },
    sentenceText: {
      ...textStyles.title,
      color: theme.colors.text.primary,
      lineHeight: 36,
    },
    blank: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.brand.primary,
      minWidth: 64,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      alignItems: 'center',
    },
    blankFilled: {
      borderBottomColor: theme.colors.brand.primary,
    },
    blankCorrect: {
      borderBottomColor: theme.colors.state.correct.text,
    },
    blankWrong: {
      borderBottomColor: theme.colors.state.wrong.text,
    },
    blankText: {
      ...textStyles.title,
      color: theme.colors.text.secondary,
    },
    blankTextFilled: {
      color: theme.colors.brand.primary,
    },
    grid: {
      gap: theme.spacing.sm,
    },
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
    optionText: {
      ...textStyles.body,
      color: theme.colors.text.primary,
    },
  });
}
