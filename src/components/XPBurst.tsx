import React, { useEffect, useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { textStyles } from '../theme/typography';

interface Props {
  amount: number;
  visible: boolean;
}

export function XPBurst({ amount, visible }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    if (reduceMotion) {
      opacity.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 400 }));
      return;
    }
    translateY.value = 0;
    opacity.value = 1;
    translateY.value = withTiming(-60, { duration: 800 });
    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 700 })
    );
  }, [visible, amount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Text style={styles.text}>+{amount} XP</Text>
    </Animated.View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      alignSelf: 'center',
      top: 80,
      zIndex: 100,
    },
    text: {
      ...textStyles.heading,
      color: theme.colors.gamification.xp,
    },
  });
}
