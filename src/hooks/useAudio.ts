import { useCallback, useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { audioMap } from '../assets/audioMap';

setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

interface AudioControls {
  play: () => void;
  playSlow: () => void;
  isPlaying: boolean;
  hasAudio: boolean;
}

export function useAudio(audioFile: string | null): AudioControls {
  const source = audioFile ? (audioMap[audioFile] ?? null) : null;
  const player = useAudioPlayer(source as number | null);

  useEffect(() => {
    return () => {
      try { player.remove(); } catch {}
    };
  }, []);

  const play = useCallback(() => {
    if (!source) return;
    try { player.seekTo(0); player.play(); } catch {}
  }, [player, source]);

  const playSlow = useCallback(() => {
    if (!source) return;
    try {
      player.seekTo(0);
      player.setPlaybackRate(0.6);
      player.play();
    } catch {}
  }, [player, source]);

  return {
    play,
    playSlow,
    isPlaying: player.playing,
    hasAudio: source !== null,
  };
}
