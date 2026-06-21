import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { getRankColor } from '../../constants/ranks';

interface AntCharacterProps {
  scale?: number;
  rankScore?: number;
  equippedHat?: string | null;
  equippedGlasses?: string | null;
  equippedExpression?: string | null;
  size?: 'small' | 'medium' | 'large' | 'hero';
}

const SIZE_MAP = {
  small: 48,
  medium: 80,
  large: 120,
  hero: 160,
};

// 클레이 개미 색상
const ANT = {
  head: '#C4B5A5',
  body: '#B8A896',
  limb: '#A89888',
  antenna: '#8B7D6B',
  eye: '#3F3A36',
  mouth: '#A08E7C',
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

  const head = baseSize * 0.55;
  const body = baseSize * 0.34;
  const eye = Math.max(3, head * 0.13);
  const antennaH = head * 0.28;
  const antennaW = Math.max(2, head * 0.045);
  const ball = Math.max(4, head * 0.1);
  const limb = Math.max(4, body * 0.2);

  return (
    <Animated.View
      style={[
        styles.outer,
        { width: baseSize, height: baseSize * 1.1, transform: [{ scale: animatedScale }] },
      ]}
    >
      {/* 장착 모자 */}
      {equippedHat && (
        <Text style={{ fontSize: head * 0.35, position: 'absolute', top: 0, zIndex: 10 }}>
          {equippedHat}
        </Text>
      )}

      {/* 더듬이 */}
      <View style={styles.antennaeRow}>
        {/* 왼쪽 */}
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.ball, { width: ball, height: ball }]} />
          <View style={[styles.stem, { height: antennaH, width: antennaW, transform: [{ rotate: '-12deg' }] }]} />
        </View>
        <View style={{ width: head * 0.3 }} />
        {/* 오른쪽 */}
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.ball, { width: ball, height: ball }]} />
          <View style={[styles.stem, { height: antennaH, width: antennaW, transform: [{ rotate: '12deg' }] }]} />
        </View>
      </View>

      {/* 머리 */}
      <View
        style={[
          styles.head,
          {
            width: head,
            height: head,
            borderRadius: head / 2,
            borderColor: rankColor,
          },
        ]}
      >
        {/* 눈 */}
        <View style={styles.eyeRow}>
          <View style={[styles.eye, { width: eye, height: eye, borderRadius: eye / 2 }]} />
          <View style={{ width: eye * 1.5 }} />
          <View style={[styles.eye, { width: eye, height: eye, borderRadius: eye / 2 }]} />
        </View>
        {/* 표정 */}
        {equippedExpression ? (
          <Text style={{ fontSize: head * 0.2, marginTop: 1 }}>{equippedExpression}</Text>
        ) : (
          <View
            style={{
              width: head * 0.2,
              height: head * 0.1,
              backgroundColor: ANT.mouth,
              borderBottomLeftRadius: head * 0.1,
              borderBottomRightRadius: head * 0.1,
              marginTop: 2,
            }}
          />
        )}
        {/* 장착 안경 */}
        {equippedGlasses && (
          <Text style={{ position: 'absolute', top: head * 0.22, fontSize: head * 0.26 }}>
            {equippedGlasses}
          </Text>
        )}
      </View>

      {/* 몸통 + 팔 */}
      <View style={{ alignItems: 'center', marginTop: -body * 0.06 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* 왼팔 */}
          <View style={[styles.limbCircle, { width: limb, height: limb, borderRadius: limb / 2, marginRight: -limb * 0.15 }]} />
          {/* 몸통 */}
          <View
            style={{
              width: body,
              height: body * 0.72,
              borderRadius: body * 0.36,
              backgroundColor: ANT.body,
            }}
          />
          {/* 오른팔 */}
          <View style={[styles.limbCircle, { width: limb, height: limb, borderRadius: limb / 2, marginLeft: -limb * 0.15 }]} />
        </View>
      </View>

      {/* 다리 */}
      <View style={styles.legRow}>
        <View style={[styles.limbCircle, { width: limb, height: limb, borderRadius: limb / 2 }]} />
        <View style={{ width: body * 0.25 }} />
        <View style={[styles.limbCircle, { width: limb, height: limb, borderRadius: limb / 2 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  antennaeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: -1,
  },
  ball: {
    backgroundColor: ANT.antenna,
    borderRadius: 999,
  },
  stem: {
    backgroundColor: ANT.antenna,
    borderRadius: 2,
  },
  head: {
    backgroundColor: ANT.head,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    zIndex: 2,
  },
  eyeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eye: {
    backgroundColor: ANT.eye,
  },
  limbCircle: {
    backgroundColor: ANT.limb,
  },
  legRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -1,
  },
});
