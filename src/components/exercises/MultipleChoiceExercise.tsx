import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { textStyles } from '../../theme/typography';
import type { Exercise } from '../../types/content';

interface Props {
  exercise: Exercise;
  selectedAnswer: string;
  feedbackState: 'idle' | 'correct' | 'wrong';
  onSelect: (answer: string) => void;
}

export function MultipleChoiceExercise({ exercise, selectedAnswer, feedbackState, onSelect }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  function optionStyle(option: string) {
    if (feedbackState === 'idle') {
      return option === selectedAnswer ? styles.optionSelected : styles.option;
    }
    if (option === exercise.word.english) return styles.optionCorrect;
    if (option === selectedAnswer && feedbackState === 'wrong') return styles.optionWrong;
    return styles.option;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>What does this mean?</Text>
      <Text style={styles.word}>{exercise.word.swahili}</Text>
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
    word: {
      ...textStyles.title,
      color: theme.colors.text.primary,
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
