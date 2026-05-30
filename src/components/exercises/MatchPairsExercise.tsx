import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { textStyles } from '../../theme/typography';
import type { Exercise } from '../../types/content';

interface Props {
  exercise: Exercise;
  onComplete: () => void;
}

export function MatchPairsExercise({ exercise, onComplete }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const pairs = exercise.pairs ?? [];

  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [selRight, setSelRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (matched.length === pairs.length && pairs.length > 0) {
      onComplete();
    }
  }, [matched]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  function shake() {
    shakeX.value = withSequence(
      withSpring(-8), withSpring(8), withSpring(-8), withSpring(0)
    );
  }

  function pickLeft(i: number) {
    if (matched.includes(i)) return;
    setSelLeft(i);
    setWrong([]);
    if (selRight !== null) tryMatch(i, selRight);
  }

  function pickRight(i: number) {
    if (matched.includes(i)) return;
    setSelRight(i);
    setWrong([]);
    if (selLeft !== null) tryMatch(selLeft, i);
  }

  function tryMatch(l: number, r: number) {
    if (pairs[l].right === pairs[r].right) {
      setMatched(m => [...m, l, r]);
      setSelLeft(null);
      setSelRight(null);
    } else {
      setWrong([l, r]);
      shake();
      setTimeout(() => { setSelLeft(null); setSelRight(null); setWrong([]); }, 600);
    }
  }

  function tileStyle(i: number, side: 'left' | 'right', sel: number | null) {
    if (matched.includes(i)) return styles.tileMatched;
    if (wrong.includes(i)) return styles.tileWrong;
    if (sel === i) return styles.tileSelected;
    return styles.tile;
  }

  return (
    <Animated.View style={[styles.container, shakeStyle]}>
      <Text style={styles.prompt}>Match the pairs</Text>
      <View style={styles.grid}>
        <View style={styles.col}>
          {pairs.map((p, i) => (
            <TouchableOpacity key={i} style={tileStyle(i, 'left', selLeft)} onPress={() => pickLeft(i)}>
              <Text style={styles.tileText}>{p.left}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.col}>
          {pairs.map((p, i) => (
            <TouchableOpacity key={i} style={tileStyle(i, 'right', selRight)} onPress={() => pickRight(i)}>
              <Text style={styles.tileText}>{p.right}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, padding: theme.spacing.lg },
    prompt: { ...textStyles.label, color: theme.colors.text.secondary, marginBottom: theme.spacing.xl },
    grid: { flexDirection: 'row', gap: theme.spacing.md },
    col: { flex: 1, gap: theme.spacing.sm },
    tile: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border.default,
      alignItems: 'center',
    },
    tileSelected: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.brand.primary,
      alignItems: 'center',
    },
    tileMatched: {
      backgroundColor: theme.colors.state.correct.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.state.correct.text,
      alignItems: 'center',
    },
    tileWrong: {
      backgroundColor: theme.colors.state.wrong.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.state.wrong.text,
      alignItems: 'center',
    },
    tileText: { ...textStyles.label, color: theme.colors.text.primary },
  });
}
