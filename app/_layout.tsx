import React, { Suspense, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadStorage, createStorage } from '../src/utils/storage';
import { setDb, runMigrations } from '../src/db/schema';
import { seedWords } from '../src/db/queries/words';
import { seedLessons } from '../src/db/queries/lessons';
import { seedStories } from '../src/db/queries/stories';
import { allStories, allStoryLines } from '../src/content/stories';
import { useUserStore } from '../src/store/useUserStore';
// ↑ imported for getState() — not used as a hook in AppShell
import { unit01Words, unit01Lessons } from '../src/content/words/unit01';
import { unit02Words, unit02Lessons } from '../src/content/words/unit02';
import { unit03Words, unit03Lessons } from '../src/content/words/unit03';
import { unit04Words, unit04Lessons } from '../src/content/words/unit04';
import { unit05Words, unit05Lessons } from '../src/content/words/unit05';
import { unit06Words, unit06Lessons } from '../src/content/words/unit06';
import { unit07Words, unit07Lessons } from '../src/content/words/unit07';
import { unit08Words, unit08Lessons } from '../src/content/words/unit08';
import { unit09Words, unit09Lessons } from '../src/content/words/unit09';
import { unit10Words, unit10Lessons } from '../src/content/words/unit10';
import { unit11Words, unit11Lessons } from '../src/content/words/unit11';
import { unit12Words, unit12Lessons } from '../src/content/words/unit12';
import { unit13Words, unit13Lessons } from '../src/content/words/unit13';
import { unit14Words, unit14Lessons } from '../src/content/words/unit14';
import { unit15Words, unit15Lessons } from '../src/content/words/unit15';
import { unit16Words, unit16Lessons } from '../src/content/words/unit16';
import { unit17Words, unit17Lessons } from '../src/content/words/unit17';
import { unit18Words, unit18Lessons } from '../src/content/words/unit18';
import { unit19Words, unit19Lessons } from '../src/content/words/unit19';
import { unit20Words, unit20Lessons } from '../src/content/words/unit20';
import { unit21Words, unit21Lessons } from '../src/content/words/unit21';
import { unit22Words, unit22Lessons } from '../src/content/words/unit22';
import { unit23Words, unit23Lessons } from '../src/content/words/unit23';
import { unit24Words, unit24Lessons } from '../src/content/words/unit24';
import { unit25Words, unit25Lessons } from '../src/content/words/unit25';
import { unit26Words, unit26Lessons } from '../src/content/words/unit26';
import { unit27Words, unit27Lessons } from '../src/content/words/unit27';
import { unit28Words, unit28Lessons } from '../src/content/words/unit28';
import { unit29Words, unit29Lessons } from '../src/content/words/unit29';
import { unit30Words, unit30Lessons } from '../src/content/words/unit30';
import { unit31Words, unit31Lessons } from '../src/content/words/unit31';
import { unit32Words, unit32Lessons } from '../src/content/words/unit32';
import { unit33Words, unit33Lessons } from '../src/content/words/unit33';
import { unit34Words, unit34Lessons } from '../src/content/words/unit34';
import { unit35Words, unit35Lessons } from '../src/content/words/unit35';
import { unit36Words, unit36Lessons } from '../src/content/words/unit36';
import { unit37Words, unit37Lessons } from '../src/content/words/unit37';
import { unit38Words, unit38Lessons } from '../src/content/words/unit38';
import { unit39Words, unit39Lessons } from '../src/content/words/unit39';
import { unit40Words, unit40Lessons } from '../src/content/words/unit40';

const appStorage = createStorage('app');

let _userLoaded = false;

async function initDatabase(db: SQLiteDatabase) {
  setDb(db);
  await runMigrations(db);
  await loadStorage();

  // 'seeded_v4' — adds expanded topics units 31-40
  if (!appStorage.getBoolean('seeded_v4')) {
    await seedWords([
      ...unit01Words, ...unit02Words, ...unit03Words, ...unit04Words, ...unit05Words,
      ...unit06Words, ...unit07Words, ...unit08Words, ...unit09Words, ...unit10Words,
      ...unit11Words, ...unit12Words, ...unit13Words, ...unit14Words, ...unit15Words,
      ...unit16Words, ...unit17Words, ...unit18Words, ...unit19Words, ...unit20Words,
      ...unit21Words, ...unit22Words, ...unit23Words, ...unit24Words, ...unit25Words,
      ...unit26Words, ...unit27Words, ...unit28Words, ...unit29Words, ...unit30Words,
      ...unit31Words, ...unit32Words, ...unit33Words, ...unit34Words, ...unit35Words,
      ...unit36Words, ...unit37Words, ...unit38Words, ...unit39Words, ...unit40Words,
    ]);
    await seedLessons([
      ...unit01Lessons, ...unit02Lessons, ...unit03Lessons, ...unit04Lessons, ...unit05Lessons,
      ...unit06Lessons, ...unit07Lessons, ...unit08Lessons, ...unit09Lessons, ...unit10Lessons,
      ...unit11Lessons, ...unit12Lessons, ...unit13Lessons, ...unit14Lessons, ...unit15Lessons,
      ...unit16Lessons, ...unit17Lessons, ...unit18Lessons, ...unit19Lessons, ...unit20Lessons,
      ...unit21Lessons, ...unit22Lessons, ...unit23Lessons, ...unit24Lessons, ...unit25Lessons,
      ...unit26Lessons, ...unit27Lessons, ...unit28Lessons, ...unit29Lessons, ...unit30Lessons,
      ...unit31Lessons, ...unit32Lessons, ...unit33Lessons, ...unit34Lessons, ...unit35Lessons,
      ...unit36Lessons, ...unit37Lessons, ...unit38Lessons, ...unit39Lessons, ...unit40Lessons,
    ]);
    await seedStories(allStories, allStoryLines);
    appStorage.set('seeded_v4', true);
  }
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#131F24', gap: 16 }}>
      <ActivityIndicator size="large" color="#58CC02" />
      <Text style={{ color: '#9EADB6', fontSize: 13 }}>{label}</Text>
    </View>
  );
}

function AppShell() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (_userLoaded) return;
    _userLoaded = true;

    useUserStore.getState().load()
      .then(() => setReady(true))
      .catch(e => {
        console.error('AppShell init error:', e);
        setError(e?.message ?? String(e));
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!appStorage.getBoolean('onboarded')) {
      router.replace('/onboarding' as any);
    }
  }, [ready]);

  if (!ready) return <LoadingScreen label="Loading user…" />;

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#131F24', padding: 24 }}>
        <Text style={{ color: '#FF4B4B', fontSize: 13, textAlign: 'center' }}>{error}</Text>
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
        <Stack.Screen name="unit/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="story/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="quiz/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Suspense fallback={<LoadingScreen label="Opening database…" />}>
        <SQLiteProvider databaseName="swahili.db" onInit={initDatabase} useSuspense>
          <AppShell />
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}
