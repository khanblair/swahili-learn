import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

interface Props {
  progress: number;
}

export function ProgressBar({ progress }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 300 });
  }, [progress]);

  const animatedFill = useAnimatedStyle(() => ({
    flex: fill.value,
  }));

  const animatedRemainder = useAnimatedStyle(() => ({
    flex: 1 - fill.value,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedFill]} />
      <Animated.View style={animatedRemainder} />
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    track: {
      height: 16,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.background.card,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    fill: {
      backgroundColor: theme.colors.brand.primary,
      borderRadius: theme.radius.full,
    },
  });
}
