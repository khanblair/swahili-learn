import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { AudioButton } from '../../src/components/AudioButton';
import { useAudio } from '../../src/hooks/useAudio';
import { getStoryLines, markStoryCompleted } from '../../src/db/queries/stories';
import { textStyles } from '../../src/theme/typography';
import type { StoryLine } from '../../src/types/content';

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [lines, setLines] = useState<StoryLine[]>([]);
  const [current, setCurrent] = useState(0);
  const [showEn, setShowEn] = useState<Record<number, boolean>>({});

  const currentLine = lines[current];
  const audio = useAudio(currentLine?.audio_file ?? null);

  useEffect(() => {
    getStoryLines(Number(id)).then(setLines);
  }, [id]);

  useEffect(() => {
    if (audio.hasAudio) audio.play();
  }, [current]);

  async function handleNext() {
    if (current + 1 >= lines.length) {
      await markStoryCompleted(Number(id));
      router.back();
      return;
    }
    setCurrent(c => c + 1);
  }

  if (!lines.length) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.icon.default} />
        </TouchableOpacity>
        <Text style={styles.progress}>{current + 1} / {lines.length}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.swahili}>{currentLine?.swahili}</Text>

        <TouchableOpacity onPress={() => setShowEn(s => ({ ...s, [current]: !s[current] }))}>
          <Text style={styles.hint}>
            {showEn[current] ? currentLine?.english : 'Tap to reveal translation'}
          </Text>
        </TouchableOpacity>

        <AudioButton
          onPress={audio.play}
          onPressSlow={audio.playSlow}
          isPlaying={audio.isPlaying}
          disabled={!audio.hasAudio}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>{current + 1 >= lines.length ? 'FINISH' : 'NEXT'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg },
    progress: { ...textStyles.label, color: theme.colors.text.secondary },
    body: { flex: 1, padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xl },
    swahili: { ...textStyles.title, color: theme.colors.text.primary, textAlign: 'center' },
    hint: { ...textStyles.body, color: theme.colors.text.secondary, textAlign: 'center', textDecorationLine: 'underline' },
    footer: { padding: theme.spacing.lg },
    nextBtn: { backgroundColor: theme.colors.brand.primary, borderRadius: theme.radius.lg, paddingVertical: theme.spacing.md, alignItems: 'center' },
    nextText: { ...textStyles.bodyBold, color: theme.colors.text.inverse, letterSpacing: 1 },
  });
}
