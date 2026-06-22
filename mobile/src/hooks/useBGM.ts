import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bgmSource = require('../../assets/bgm.mp3');

/** 전역 BGM 상태 (여러 컴포넌트에서 공유) */
let globalPlaying = true;
let globalToggle: (() => void) | null = null;

export function useBGM() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(globalPlaying);

  const toggle = useCallback(() => {
    if (Platform.OS === 'web') {
      const audio = webAudioRef.current;
      if (!audio) return;
      if (audio.paused) {
        audio.play().catch(() => {});
        setIsPlaying(true);
        globalPlaying = true;
      } else {
        audio.pause();
        setIsPlaying(false);
        globalPlaying = false;
      }
    } else {
      const sound = soundRef.current;
      if (!sound) return;
      if (globalPlaying) {
        sound.pauseAsync();
        setIsPlaying(false);
        globalPlaying = false;
      } else {
        sound.playAsync();
        setIsPlaying(true);
        globalPlaying = true;
      }
    }
  }, []);

  useEffect(() => {
    globalToggle = toggle;
    return () => {
      globalToggle = null;
    };
  }, [toggle]);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS === 'web') {
      const audio = new window.Audio(bgmSource);
      audio.loop = true;
      audio.volume = 0.4;
      webAudioRef.current = audio;

      const tryPlay = () => {
        if (globalPlaying) {
          audio.play().catch(() => {});
        }
      };

      tryPlay();
      const handler = () => {
        tryPlay();
        document.removeEventListener('click', handler);
        document.removeEventListener('pointerdown', handler);
        document.removeEventListener('touchstart', handler);
        document.removeEventListener('keydown', handler);
      };
      document.addEventListener('click', handler);
      document.addEventListener('pointerdown', handler);
      document.addEventListener('touchstart', handler);
      document.addEventListener('keydown', handler);

      return () => {
        mounted = false;
        document.removeEventListener('click', handler);
        document.removeEventListener('pointerdown', handler);
        document.removeEventListener('touchstart', handler);
        document.removeEventListener('keydown', handler);
        audio.pause();
        audio.src = '';
        webAudioRef.current = null;
      };
    }

    async function start() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(bgmSource, {
        isLooping: true,
        volume: 0.4,
      });

      if (!mounted) {
        sound.unloadAsync();
        return;
      }

      soundRef.current = sound;
      if (globalPlaying) {
        await sound.playAsync();
      }
    }

    start().catch(() => {});

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  return { isPlaying, toggle };
}

/** 다른 컴포넌트에서 토글만 사용할 때 */
export function useBGMControl() {
  const [isPlaying, setIsPlaying] = useState(globalPlaying);

  const toggle = useCallback(() => {
    if (globalToggle) {
      globalToggle();
      setIsPlaying(!globalPlaying);
    }
  }, []);

  return { isPlaying, toggle };
}
