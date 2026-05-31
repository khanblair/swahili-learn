import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';

// Swahili language code. iOS falls back gracefully if the voice isn't installed.
const LANGUAGE = 'sw';
const RATE_NORMAL = 0.9;
const RATE_SLOW   = 0.55;

interface SpeechControls {
  play: () => void;
  playSlow: () => void;
  isPlaying: boolean;
  hasAudio: boolean; // always true — expo-speech works for every word
}

export function useSpeech(text: string | null): SpeechControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const textRef = useRef(text);
  textRef.current = text;

  // Stop speech when the hook unmounts or text changes
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, [text]);

  const speak = useCallback((rate: number) => {
    if (!textRef.current) return;
    Speech.stop();
    setIsPlaying(true);
    Speech.speak(textRef.current, {
      language: LANGUAGE,
      rate,
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  }, []);

  const play     = useCallback(() => speak(RATE_NORMAL), [speak]);
  const playSlow = useCallback(() => speak(RATE_SLOW),   [speak]);

  return {
    play,
    playSlow,
    isPlaying,
    hasAudio: !!text, // true whenever there's a word to speak
  };
}
