import { useCallback, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { audioMap } from '../assets/audioMap';

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
      player.remove();
    };
  }, []);

  const play = useCallback(() => {
    if (!source) return;
    player.seekTo(0);
    player.play();
  }, [player, source]);

  const playSlow = useCallback(() => {
    if (!source) return;
    player.seekTo(0);
    player.setPlaybackRate(0.6);
    player.play();
  }, [player, source]);

  return {
    play,
    playSlow,
    isPlaying: player.playing,
    hasAudio: source !== null,
  };
}
