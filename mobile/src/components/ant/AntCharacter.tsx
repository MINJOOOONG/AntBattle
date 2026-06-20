import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  const displaySize = baseSize * scale;
  const rankColor = getRankColor(rankScore);

  return (
    <View style={[styles.container, { width: displaySize, height: displaySize }]}>
      {equippedHat && (
        <Text style={[styles.accessory, styles.hat, { fontSize: displaySize * 0.3 }]}>
          {equippedHat}
        </Text>
      )}
      <View style={[styles.antBody, { borderColor: rankColor }]}>
        <Text style={{ fontSize: displaySize * 0.5 }}>
          {equippedExpression ?? '🐜'}
        </Text>
      </View>
      {equippedGlasses && (
        <Text style={[styles.accessory, styles.glasses, { fontSize: displaySize * 0.25 }]}>
          {equippedGlasses}
        </Text>
      )}
    </View>
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
