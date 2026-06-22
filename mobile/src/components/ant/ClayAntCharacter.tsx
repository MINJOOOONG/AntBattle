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
import { EXPRESSION_ASSETS, isExpressionKey } from '../../constants/expressionAssets';

type CharacterSize = 'small' | 'medium' | 'large' | 'hero';
type CharacterVariant = 'idle' | 'happy' | 'sad' | 'win' | 'lose';

interface ClayAntCharacterProps {
  size?: CharacterSize;
  rankScore?: number;
  variant?: CharacterVariant;
  mood?: CharacterVariant;
  equippedExpression?: string | null;
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
  equippedExpression,
}: ClayAntCharacterProps) {
  const { width: screenWidth } = useWindowDimensions();
  const imageSize =
    size === 'hero'
      ? Math.min(Math.max(screenWidth * 0.86, SIZE_MAP.hero), 380)
      : SIZE_MAP[size];
  const selectedVariant = variant ?? mood ?? 'idle';
  const expressionAsset = isExpressionKey(equippedExpression)
    ? EXPRESSION_ASSETS[equippedExpression]
    : undefined;
  const floatAnim = useRef(new Animated.Value(0)).current;
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

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, -2.5],
  });
  const scale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.99, 1.015],
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
        {expressionAsset && (
          <Image
            source={expressionAsset}
            style={styles.expressionImage}
            resizeMode="contain"
          />
        )}
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
  expressionImage: {
    height: '18%',
    left: '33%',
    position: 'absolute',
    top: '12%',
    width: '34%',
  },
});
