import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../../constants/colors';
import { getRankColor } from '../../constants/ranks';

interface AntCharacterProps {
  scale?: number;
  rankScore?: number;
  equippedHat?: string | null;
  equippedGlasses?: string | null;
  equippedExpression?: string | null;
  size?: 'small' | 'medium' | 'large';
}

const SIZE_MAP = {
  small: 48,
  medium: 80,
  large: 120,
};

export default function AntCharacter({
  scale = 1,
  rankScore = 0,
  equippedHat,
  equippedGlasses,
  equippedExpression,
  size = 'medium',
}: AntCharacterProps) {
  const baseSize = SIZE_MAP[size];
  const rankColor = getRankColor(rankScore);
  const animatedScale = useRef(new Animated.Value(scale)).current;

  useEffect(() => {
    Animated.timing(animatedScale, {
      toValue: scale,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Animated.View
      style={[
        styles.container,
        { width: baseSize, height: baseSize, transform: [{ scale: animatedScale }] },
      ]}
    >
      {equippedHat && (
        <Text style={[styles.accessory, styles.hat, { fontSize: baseSize * 0.3 }]}>
          {equippedHat}
        </Text>
      )}
      <View style={[styles.antBody, { borderColor: rankColor }]}>
        <Text style={{ fontSize: baseSize * 0.5 }}>
          {equippedExpression ?? '🐜'}
        </Text>
      </View>
      {equippedGlasses && (
        <Text style={[styles.accessory, styles.glasses, { fontSize: baseSize * 0.25 }]}>
          {equippedGlasses}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  antBody: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 999,
    padding: 4,
  },
  accessory: {
    position: 'absolute',
  },
  hat: {
    top: -4,
  },
  glasses: {
    bottom: 0,
  },
});
