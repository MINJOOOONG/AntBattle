import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

type CharacterSize = 'small' | 'medium' | 'large' | 'hero';
type CharacterVariant = 'idle' | 'happy' | 'sad' | 'win' | 'lose';

interface ClayAntCharacterProps {
  size?: CharacterSize;
  rankScore?: number;
  variant?: CharacterVariant;
  mood?: CharacterVariant;
}

const SIZE_MAP: Record<CharacterSize, number> = {
  small: 80,
  medium: 130,
  large: 200,
  hero: 260,
};

const MASCOT_IMAGES: Record<CharacterVariant, ImageSourcePropType> = {
  idle: require('../../../assets/mascot/ant_idle.png'),
  happy: require('../../../assets/mascot/ant_idle.png'),
  sad: require('../../../assets/mascot/ant_idle.png'),
  win: require('../../../assets/mascot/ant_idle.png'),
  lose: require('../../../assets/mascot/ant_idle.png'),
};

export default function ClayAntCharacter({
  size = 'medium',
  rankScore,
  variant,
  mood,
}: ClayAntCharacterProps) {
  const { width: screenWidth } = useWindowDimensions();
  const imageSize =
    size === 'hero'
      ? Math.min(Math.max(screenWidth * 0.86, SIZE_MAP.hero), 380)
      : SIZE_MAP[size];
  const selectedVariant = variant ?? mood ?? 'idle';
  const floatAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(0)).current;
  void rankScore;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 130,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 120,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    blink.start();
    return () => blink.stop();
  }, [blinkAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, -2.5],
  });
  const scale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.99, 1.015],
  });
  const eyeSize = imageSize * 0.072;
  const eyeTop = imageSize * 0.45;
  const eyeCoverSize = eyeSize * 1.35;
  const blinkLineScale = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  return (
    <View style={[styles.container, { width: imageSize, height: imageSize }]}>
      <Animated.View
        style={[
          styles.animatedLayer,
          {
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        <Image
          source={MASCOT_IMAGES[selectedVariant]}
          style={styles.image}
          resizeMode="contain"
        />
        <View pointerEvents="none" style={styles.faceLayer}>
          <Animated.View
            style={[
              styles.eyeCover,
              {
                left: imageSize * 0.36,
                top: eyeTop - eyeSize * 0.16,
                width: eyeCoverSize,
                height: eyeCoverSize * 0.86,
                borderRadius: eyeCoverSize / 2,
                opacity: blinkAnim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.eyeCover,
              {
                left: imageSize * 0.555,
                top: eyeTop - eyeSize * 0.16,
                width: eyeCoverSize,
                height: eyeCoverSize * 0.86,
                borderRadius: eyeCoverSize / 2,
                opacity: blinkAnim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.blinkLine,
              {
                left: imageSize * 0.382,
                top: eyeTop + eyeSize * 0.28,
                width: eyeSize * 0.78,
                transform: [{ scaleX: blinkLineScale }],
                opacity: blinkAnim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.blinkLine,
              {
                left: imageSize * 0.577,
                top: eyeTop + eyeSize * 0.28,
                width: eyeSize * 0.78,
                transform: [{ scaleX: blinkLineScale }],
                opacity: blinkAnim,
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  animatedLayer: {
    height: '100%',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  faceLayer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  eye: {
    backgroundColor: '#3C2E28',
    position: 'absolute',
  },
  eyeCover: {
    backgroundColor: '#C7AA93',
    position: 'absolute',
  },
  blinkLine: {
    backgroundColor: '#7B6256',
    borderRadius: 999,
    height: 1.5,
    position: 'absolute',
  },
});
