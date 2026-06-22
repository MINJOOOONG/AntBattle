import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export function useBGM() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;

    async function start() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/bgm.mp3'),
        { isLooping: true, volume: 0.4 }
      );

      if (!mounted) {
        sound.unloadAsync();
        return;
      }

      soundRef.current = sound;
      await sound.playAsync();
    }

    start().catch(() => {});

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);
}
