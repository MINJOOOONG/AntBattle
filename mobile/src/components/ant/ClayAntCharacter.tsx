/**
 * ClayAntCharacter — 레이어 기반 개미 마스코트 컴포넌트
 *
 * 모든 파츠 PNG는 동일한 투명 캔버스(같은 width × height) 위에 그려져야 합니다.
 * 각 PNG는 완성 개미 이미지와 동일한 좌표 기준을 공유하며,
 * absoluteFillObject로 겹치기만 하면 자연스럽게 하나의 개미가 됩니다.
 *
 * ────────────────────────────────────────────
 * Asset Export 가이드 (Figma / Photoshop 등)
 * ────────────────────────────────────────────
 * 1. 완성 개미 이미지를 기준 Frame으로 둔다.
 * 2. Frame 크기를 고정한다 (예: 1254×1254 또는 원하는 크기).
 * 3. body_torso.png — 몸통만 보이게 하고 같은 Frame에서 export.
 * 4. body_arms.png  — 팔만 보이게 하고 같은 Frame에서 export.
 * 5. body_legs.png  — 다리만 보이게 하고 같은 Frame에서 export.
 * 6. face_*.png     — 표정만 보이게 하고 같은 Frame에서 export.
 * 7. 절대 crop/trim 하지 않는다.
 * 8. 모든 PNG의 width/height가 완전히 같아야 한다.
 * 9. 상점 아이템(hat/glasses/clothes/accessory)도 같은 방식으로 추가 가능.
 *
 * ⚠️  현재 body 파츠는 1254×1254, expression 파츠는 1920×1920으로
 *     캔버스 크기가 다릅니다. 모든 파츠를 동일한 캔버스로 다시 export해야
 *     top/left 보정 없이 완벽하게 정렬됩니다.
 * ────────────────────────────────────────────
 *
 * 렌더 순서:
 *   1) body_legs   (가장 뒤)
 *   2) body_torso
 *   3) body_arms
 *   4) face expression
 *   5) equipped items (clothes → glasses → hat → accessory)
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';
import { EXPRESSION_ASSETS, isExpressionKey, type ExpressionKey } from '../../constants/expressionAssets';

// ── Body part assets ──
const bodySources = {
  legs: require('../../../assets/mascot/body_legs.png'),
  torso: require('../../../assets/mascot/body_torso.png'),
  arms: require('../../../assets/mascot/body_arms.png'),
};

// ── Types ──
export type AntExpression = ExpressionKey;

export interface EquippedItems {
  hat?: ImageSourcePropType;
  glasses?: ImageSourcePropType;
  clothes?: ImageSourcePropType;
  accessory?: ImageSourcePropType;
}

// 하위 호환: 문자열 size를 숫자로 변환
const SIZE_MAP: Record<string, number> = {
  small: 78,
  medium: 128,
  large: 190,
  hero: 238,
};

function resolveSize(size: number | string): number {
  if (typeof size === 'number') return size;
  return SIZE_MAP[size] ?? 260;
}

interface ClayAntCharacterProps {
  /** 렌더링 크기 (px 숫자 또는 'small'|'medium'|'large'|'hero') */
  size?: number | string;
  /** 표정 키. 기본값 'face_blank' */
  expression?: AntExpression;
  /** 장착된 아이템 이미지 소스 */
  equippedItems?: EquippedItems;
  /** 부유 애니메이션 활성화 (기본 true) */
  animated?: boolean;

  // ── 하위 호환 props (기존 코드 지원) ──
  rankScore?: number;
  variant?: string;
  mood?: string;
  equippedExpression?: string | null;
}

export default function ClayAntCharacter({
  size = 'medium',
  expression,
  equippedItems,
  animated = true,
  equippedExpression,
}: ClayAntCharacterProps) {
  const resolvedSize = resolveSize(size);
  const characterHeight = resolvedSize * 1.76;

  // 하위 호환: equippedExpression prop이 있으면 expression으로 변환
  const resolvedExpression: AntExpression =
    expression ??
    (isExpressionKey(equippedExpression) ? equippedExpression : 'face_blank');

  const faceSource = EXPRESSION_ASSETS[resolvedExpression] ?? EXPRESSION_ASSETS.face_blank;

  // ── 부유 애니메이션 ──
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
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
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim, animated]);

  const translateY = animated
    ? floatAnim.interpolate({ inputRange: [0, 1], outputRange: [1.5, -2.5] })
    : 0;
  const scale = animated
    ? floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0.99, 1.015] })
    : 1;

  return (
    <View style={[styles.container, { width: resolvedSize, height: characterHeight }]}>
      <Animated.View
        style={[
          styles.layerContainer,
          { transform: [{ translateY }, { scale }] },
        ]}
      >
        <Image source={bodySources.legs} style={[styles.layer, styles.legsLayer]} resizeMode="stretch" />
        <Image source={bodySources.arms} style={[styles.layer, styles.armsLayer]} resizeMode="stretch" />
        <Image source={bodySources.torso} style={[styles.layer, styles.torsoLayer]} resizeMode="stretch" />
        {faceSource && (
          <Image source={faceSource} style={[styles.layer, styles.faceLayer]} resizeMode="contain" />
        )}
        {/* 5) 장착 아이템 */}
        {equippedItems?.clothes && (
          <Image source={equippedItems.clothes} style={styles.itemLayer} resizeMode="contain" />
        )}
        {equippedItems?.glasses && (
          <Image source={equippedItems.glasses} style={styles.itemLayer} resizeMode="contain" />
        )}
        {equippedItems?.hat && (
          <Image source={equippedItems.hat} style={styles.itemLayer} resizeMode="contain" />
        )}
        {equippedItems?.accessory && (
          <Image source={equippedItems.accessory} style={styles.itemLayer} resizeMode="contain" />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  layerContainer: {
    width: '100%',
    height: '100%',
  },
  layer: {
    position: 'absolute',
  },
  legsLayer: {
    height: '56%',
    left: '7%',
    top: '46%',
    width: '86%',
    zIndex: 1,
  },
  armsLayer: {
    height: '54%',
    left: '4%',
    top: '31%',
    width: '92%',
    zIndex: 2,
  },
  torsoLayer: {
    height: '58%',
    left: '7%',
    top: '26%',
    width: '86%',
    zIndex: 3,
  },
  faceLayer: {
    height: '45%',
    left: '10%',
    top: '0%',
    width: '80%',
    zIndex: 4,
  },
  itemLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
  },
});
