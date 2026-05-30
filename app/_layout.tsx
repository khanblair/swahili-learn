import React, { Suspense, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { loadStorage, createStorage } from '../src/utils/storage';
import { setDb, runMigrations } from '../src/db/schema';
import { seedWords } from '../src/db/queries/words';
import { seedLessons } from '../src/db/queries/lessons';
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

const appStorage = createStorage('app');

let _userLoaded = false;

async function initDatabase(db: SQLiteDatabase) {
  setDb(db);
  await runMigrations(db);
  await loadStorage();

  if (!appStorage.getBoolean('seeded')) {
    await seedWords([
      ...unit01Words, ...unit02Words, ...unit03Words, ...unit04Words, ...unit05Words,
      ...unit06Words, ...unit07Words, ...unit08Words, ...unit09Words, ...unit10Words,
      ...unit11Words, ...unit12Words, ...unit13Words, ...unit14Words, ...unit15Words,
      ...unit16Words, ...unit17Words, ...unit18Words, ...unit19Words, ...unit20Words,
    ]);
    await seedLessons([
      ...unit01Lessons, ...unit02Lessons, ...unit03Lessons, ...unit04Lessons, ...unit05Lessons,
      ...unit06Lessons, ...unit07Lessons, ...unit08Lessons, ...unit09Lessons, ...unit10Lessons,
      ...unit11Lessons, ...unit12Lessons, ...unit13Lessons, ...unit14Lessons, ...unit15Lessons,
      ...unit16Lessons, ...unit17Lessons, ...unit18Lessons, ...unit19Lessons, ...unit20Lessons,
    ]);
    appStorage.set('seeded', true);
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
    <Suspense fallback={<LoadingScreen label="Opening database…" />}>
      <SQLiteProvider databaseName="swahili.db" onInit={initDatabase} useSuspense>
        <AppShell />
      </SQLiteProvider>
    </Suspense>
  );
}
