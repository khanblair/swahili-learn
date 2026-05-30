import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { textStyles } from '../theme/typography';

type FeedbackState = 'idle' | 'correct' | 'wrong';

interface Props {
  feedbackState: FeedbackState;
  canCheck: boolean;
  onCheck: () => void;
  onContinue: () => void;
  correctLabel?: string;
  wrongLabel?: string;
}

export function AnswerBar({ feedbackState, canCheck, onCheck, onContinue, correctLabel, wrongLabel }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (feedbackState === 'idle') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, !canCheck && styles.buttonDisabled]}
          onPress={onCheck}
          disabled={!canCheck}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>CHECK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCorrect = feedbackState === 'correct';
  const bg = isCorrect ? theme.colors.state.correct.background : theme.colors.state.wrong.background;
  const textColor = isCorrect ? theme.colors.state.correct.text : theme.colors.state.wrong.text;
  const label = isCorrect
    ? (correctLabel ?? 'Correct!')
    : (wrongLabel ?? 'Incorrect');

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.feedback, { color: textColor }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isCorrect ? theme.colors.brand.primary : '#FF4B4B' }]}
        onPress={onContinue}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    button: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: theme.colors.background.card,
    },
    buttonText: {
      ...textStyles.bodyBold,
      color: theme.colors.text.inverse,
      letterSpacing: 1,
    },
    feedback: {
      ...textStyles.bodyBold,
    },
  });
}
