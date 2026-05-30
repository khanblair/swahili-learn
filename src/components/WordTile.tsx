import React, { useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { textStyles } from '../theme/typography';

interface Props {
  word: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function WordTile({ word, onPress, selected = false, disabled = false }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.95);
  }

  function handlePressOut() {
    scale.value = withSpring(1);
  }

  return (
    <AnimatedTouchable
      style={[
        styles.tile,
        selected && styles.selected,
        disabled && styles.disabled,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{word}</Text>
    </AnimatedTouchable>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    tile: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border.default,
      margin: theme.spacing.xs,
    },
    selected: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    disabled: {
      opacity: 0.4,
    },
    text: {
      ...textStyles.label,
      color: theme.colors.text.primary,
    },
    selectedText: {
      color: theme.colors.text.inverse,
    },
  });
}
