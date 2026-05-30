import React, { useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAudio } from '../../hooks/useAudio';
import { AudioButton } from '../AudioButton';
import { textStyles } from '../../theme/typography';
import type { Exercise } from '../../types/content';

interface Props {
  exercise: Exercise;
  typedAnswer: string;
  feedbackState: 'idle' | 'correct' | 'wrong';
  onChangeText: (text: string) => void;
}

export function ListenExercise({ exercise, typedAnswer, feedbackState, onChangeText }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const audio = useAudio(exercise.word.audio_file);

  useEffect(() => {
    if (audio.hasAudio) audio.play();
  }, [exercise.word.id]);

  const borderColor =
    feedbackState === 'correct'
      ? theme.colors.state.correct.text
      : feedbackState === 'wrong'
      ? theme.colors.state.wrong.text
      : theme.colors.border.default;

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Type what you hear</Text>

      <AudioButton
        onPress={audio.play}
        onPressSlow={audio.playSlow}
        isPlaying={audio.isPlaying}
        disabled={!audio.hasAudio}
      />

      <TextInput
        style={[styles.input, { borderColor }]}
        value={typedAnswer}
        onChangeText={onChangeText}
        placeholder="Type in Swahili…"
        placeholderTextColor={theme.colors.text.secondary}
        editable={feedbackState === 'idle'}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {feedbackState === 'wrong' && (
        <Text style={styles.hint}>Correct: {exercise.word.swahili}</Text>
      )}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
      gap: theme.spacing.xl,
      alignItems: 'center',
    },
    prompt: {
      ...textStyles.label,
      color: theme.colors.text.secondary,
      alignSelf: 'flex-start',
    },
    input: {
      width: '100%',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.radius.md,
      borderWidth: 2,
      padding: theme.spacing.md,
      ...textStyles.body,
      color: theme.colors.text.primary,
    },
    hint: {
      ...textStyles.bodyBold,
      color: theme.colors.state.wrong.text,
      alignSelf: 'flex-start',
    },
  });
}
