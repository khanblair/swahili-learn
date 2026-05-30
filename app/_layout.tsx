import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createMMKV } from 'react-native-mmkv';
import { getDb, runMigrations } from '../src/db/schema';
import { seedWords } from '../src/db/queries/words';
import { seedLessons } from '../src/db/queries/lessons';
import { useUserStore } from '../src/store/useUserStore';
import { unit01Words, unit01Lessons } from '../src/content/words/unit01';
import { unit02Words, unit02Lessons } from '../src/content/words/unit02';
import { unit03Words, unit03Lessons } from '../src/content/words/unit03';

const storage = createMMKV({ id: 'app' });

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const load = useUserStore(s => s.load);

  useEffect(() => {
    async function init() {
      const db = await getDb();
      await runMigrations(db);

      if (!storage.getBoolean('seeded')) {
        await seedWords([...unit01Words, ...unit02Words, ...unit03Words]);
        await seedLessons([...unit01Lessons, ...unit02Lessons, ...unit03Lessons]);
        storage.set('seeded', true);
      }

      await load();
      setReady(true);

      if (!storage.getBoolean('onboarded')) {
        router.replace('/onboarding' as any);
      }
    }
    init();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#131F24' }}>
        <ActivityIndicator size="large" color="#58CC02" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="review/index" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="story/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="quiz/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
