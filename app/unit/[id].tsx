import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { getLessonsByUnit, getLessonProgress } from '../../src/db/queries/lessons';
import { getUnitCompletionRatio } from '../../src/db/queries/lessons';
import { getStoriesByUnit } from '../../src/db/queries/stories';
import { units } from '../../src/content/units';
import { textStyles } from '../../src/theme/typography';
import type { Lesson, LessonProgress, Story } from '../../src/types/content';

interface LessonWithProgress extends Lesson {
  progress: LessonProgress | null;
}

export default function UnitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const unit = units.find(u => u.id === Number(id));

  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [completion, setCompletion] = useState(0);
  const [stories, setStories] = useState<Story[]>([]);

  useFocusEffect(useCallback(() => {
    async function load() {
      const ls = await getLessonsByUnit(Number(id));
      const withProgress = await Promise.all(
        ls.map(async l => ({ ...l, progress: await getLessonProgress(l.id) }))
      );
      setLessons(withProgress);
      setCompletion(await getUnitCompletionRatio(Number(id)));
      setStories(await getStoriesByUnit(Number(id)));
    }
    load();
  }, [id]));

  const storyUnlocked = completion >= 0.7;
  const story = stories[0];
  const quizUnlocked = story ? (story.completed === 1) : false;
  const completedCount = lessons.filter(l => l.progress?.completed).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.icon.default} />
        </TouchableOpacity>
        <Text style={styles.title}>{unit?.title ?? 'Unit'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{completedCount}/{lessons.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>LESSONS</Text>

        {lessons.map((lesson, idx) => {
          const done = !!lesson.progress?.completed;
          const perfect = !!lesson.progress?.perfect;
          const prevDone = idx === 0 || !!lessons[idx - 1].progress?.completed;
          const locked = !prevDone;

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[styles.lessonRow, locked && styles.locked]}
              disabled={locked}
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } } as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.lessonIcon, done && styles.lessonIconDone]}>
                <Ionicons
                  name={locked ? 'lock-closed' : done ? 'checkmark' : 'play'}
                  size={18}
                  color={done ? theme.colors.text.inverse : locked ? theme.colors.icon.muted : theme.colors.brand.primary}
                />
              </View>
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonTitle, locked && styles.mutedText]}>{lesson.title}</Text>
                <Text style={styles.lessonSub}>{lesson.exercise_count} exercises{perfect ? '  ★ Perfect' : ''}</Text>
              </View>
              {done && (
                <Ionicons name="checkmark-circle" size={22} color={theme.colors.brand.primary} />
              )}
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>STORY</Text>

        <TouchableOpacity
          style={[styles.lessonRow, !storyUnlocked && styles.locked]}
          disabled={!storyUnlocked || !story}
          onPress={() => story && router.push({ pathname: '/story/[id]', params: { id: story.id } } as any)}
          activeOpacity={0.75}
        >
          <View style={[styles.lessonIcon, story?.completed === 1 && styles.lessonIconDone]}>
            <Ionicons
              name={!storyUnlocked ? 'lock-closed' : story?.completed === 1 ? 'book' : 'book-outline'}
              size={18}
              color={!storyUnlocked ? theme.colors.icon.muted : story?.completed === 1 ? theme.colors.text.inverse : theme.colors.brand.primary}
            />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonTitle, !storyUnlocked && styles.mutedText]}>
              {story ? story.title : 'Story'}
            </Text>
            <Text style={styles.lessonSub}>
              {!storyUnlocked ? `Unlocks at 70% completion (${Math.round(completion * 100)}% now)` : story?.completed === 1 ? 'Completed' : 'Read the story'}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>UNIT QUIZ</Text>

        <TouchableOpacity
          style={[styles.lessonRow, !quizUnlocked && styles.locked]}
          disabled={!quizUnlocked}
          onPress={() => router.push({ pathname: '/quiz/[id]', params: { id } } as any)}
          activeOpacity={0.75}
        >
          <View style={[styles.lessonIcon, quizUnlocked && styles.quizIcon]}>
            <Ionicons
              name={quizUnlocked ? 'trophy' : 'lock-closed'}
              size={18}
              color={quizUnlocked ? theme.colors.text.inverse : theme.colors.icon.muted}
            />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonTitle, !quizUnlocked && styles.mutedText]}>Unit Quiz</Text>
            <Text style={styles.lessonSub}>
              {!quizUnlocked ? 'Complete the story to unlock' : 'Test everything you learned'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    header: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, gap: theme.spacing.md },
    title: { ...textStyles.heading, color: theme.colors.text.primary, flex: 1 },
    badge: { backgroundColor: theme.colors.background.card, borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.sm, paddingVertical: 3 },
    badgeText: { ...textStyles.caption, color: theme.colors.text.secondary },
    content: { padding: theme.spacing.lg, gap: theme.spacing.sm },
    sectionLabel: { ...textStyles.caption, color: theme.colors.text.secondary, letterSpacing: 1, marginBottom: theme.spacing.xs },
    lessonRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background.card, borderRadius: theme.radius.md, padding: theme.spacing.md, gap: theme.spacing.md },
    locked: { opacity: 0.45 },
    lessonIcon: { width: 40, height: 40, borderRadius: theme.radius.full, backgroundColor: theme.colors.background.input, alignItems: 'center', justifyContent: 'center' },
    lessonIconDone: { backgroundColor: theme.colors.brand.primary },
    quizIcon: { backgroundColor: theme.colors.gamification.xp },
    lessonInfo: { flex: 1 },
    lessonTitle: { ...textStyles.bodyBold, color: theme.colors.text.primary },
    lessonSub: { ...textStyles.caption, color: theme.colors.text.secondary, marginTop: 2 },
    mutedText: { color: theme.colors.text.secondary },
  });
}
