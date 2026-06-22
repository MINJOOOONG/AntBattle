import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { EXPRESSION_ASSETS, isExpressionKey } from '../../constants/expressionAssets';

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

const ANT = {
  headLight: '#CFC4BA',
  head: '#B8AAA0',
  headShade: '#9F9188',
  bodyLight: '#B8AAA0',
  body: '#8F8178',
  bodyDark: '#736960',
  detail: '#6C625A',
  face: '#27231F',
  mouth: '#5F524B',
  blush: '#D4A9A4',
  shadow: '#9A8F86',
};

const FUR_SPECKS = [
  [20, 37, 1.8, 0.1],
  [24, 48, 1.5, 0.08],
  [26, 59, 1.6, 0.08],
  [31, 29, 1.5, 0.08],
  [34, 43, 1.2, 0.07],
  [37, 52, 1.2, 0.07],
  [40, 24, 1.1, 0.06],
  [47, 19, 1.2, 0.05],
  [53, 25, 1.1, 0.05],
  [60, 31, 1.2, 0.06],
  [66, 43, 1.4, 0.07],
  [72, 57, 1.7, 0.07],
  [77, 47, 1.5, 0.08],
  [73, 33, 1.8, 0.08],
  [38, 83, 1.3, 0.06],
  [45, 91, 1.3, 0.07],
  [53, 103, 1.6, 0.07],
  [61, 90, 1.4, 0.06],
  [66, 79, 1.2, 0.06],
  [31, 101, 1.5, 0.06],
] as const;

const EDGE_PUFFS = [
  [18, 45, 8, 12, 0.1],
  [24, 26, 9, 8, 0.1],
  [47, 15, 16, 5, 0.08],
  [74, 27, 9, 8, 0.1],
  [82, 47, 8, 12, 0.1],
  [27, 71, 10, 7, 0.09],
  [73, 71, 10, 7, 0.09],
  [33, 116, 5, 7, 0.08],
  [67, 116, 5, 7, 0.08],
] as const;

let nextGradientId = 0;

export default function AntCharacter({
  scale = 1,
  rankScore,
  equippedHat,
  equippedGlasses,
  equippedExpression,
  size = 'medium',
}: AntCharacterProps) {
  const baseSize = SIZE_MAP[size];
  const animatedScale = useRef(new Animated.Value(scale)).current;
  const gradientId = useRef(nextGradientId++).current;
  void rankScore;

  useEffect(() => {
    Animated.timing(animatedScale, {
      toValue: scale,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [animatedScale, scale]);

  const svgW = baseSize;
  const svgH = baseSize * 1.28;
  const accessorySize = Math.max(14, baseSize * 0.24);
  const headGradient = `cottonHead${gradientId}`;
  const bodyGradient = `cottonBody${gradientId}`;
  const shadowGradient = `cottonShadow${gradientId}`;
  const expressionAsset = isExpressionKey(equippedExpression)
    ? EXPRESSION_ASSETS[equippedExpression]
    : undefined;

  return (
    <Animated.View
      style={[
        styles.outer,
        {
          width: svgW,
          height: svgH,
          transform: [{ scale: animatedScale }],
        },
      ]}
    >
      {equippedHat && (
        <Text style={[styles.hat, { fontSize: accessorySize }]}>{equippedHat}</Text>
      )}

      <Svg width={svgW} height={svgH} viewBox="0 0 100 128">
        <Defs>
          <RadialGradient id={headGradient} cx="43%" cy="36%" rx="58%" ry="58%">
            <Stop offset="0%" stopColor={ANT.headLight} />
            <Stop offset="62%" stopColor={ANT.head} />
            <Stop offset="100%" stopColor={ANT.headShade} />
          </RadialGradient>
          <RadialGradient id={bodyGradient} cx="39%" cy="20%" rx="62%" ry="74%">
            <Stop offset="0%" stopColor={ANT.bodyLight} />
            <Stop offset="48%" stopColor={ANT.body} />
            <Stop offset="100%" stopColor={ANT.bodyDark} />
          </RadialGradient>
          <RadialGradient id={shadowGradient} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={ANT.shadow} stopOpacity={0.18} />
            <Stop offset="100%" stopColor={ANT.shadow} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Ellipse cx="50" cy="121" rx="25" ry="4.5" fill={`url(#${shadowGradient})`} />

        <Path
          d="M 37 31 C 34 17 29 12 22 10"
          stroke={ANT.detail}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
          opacity={0.58}
        />
        <Path
          d="M 63 31 C 66 17 71 12 78 10"
          stroke={ANT.detail}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
          opacity={0.58}
        />
        <Circle cx="22" cy="10" r="6.3" fill={ANT.headShade} opacity={0.2} />
        <Circle cx="78" cy="10" r="6.3" fill={ANT.headShade} opacity={0.2} />
        <Circle cx="22" cy="10" r="4.9" fill={ANT.headShade} opacity={0.76} />
        <Circle cx="78" cy="10" r="4.9" fill={ANT.headShade} opacity={0.76} />

        <Ellipse cx="35" cy="88" rx="7.4" ry="10" fill={ANT.headLight} opacity={0.36} />
        <Ellipse cx="65" cy="88" rx="7.4" ry="10" fill={ANT.headLight} opacity={0.36} />
        <Ellipse cx="50" cy="95" rx="21" ry="28" fill={`url(#${bodyGradient})`} />
        <Ellipse cx="50" cy="77" rx="22" ry="8" fill={ANT.bodyDark} opacity={0.12} />
        <Ellipse cx="34" cy="116" rx="5.6" ry="8" fill={ANT.bodyDark} opacity={0.48} />
        <Ellipse cx="66" cy="116" rx="5.6" ry="8" fill={ANT.bodyDark} opacity={0.48} />

        <G opacity={0.48}>
          <Ellipse cx="50" cy="50" rx="38" ry="35" fill={ANT.headLight} opacity={0.3} />
          <Ellipse cx="50" cy="51" rx="36" ry="34" fill={ANT.head} opacity={0.38} />
          {EDGE_PUFFS.map(([cx, cy, rx, ry, opacity], index) => (
            <Ellipse
              key={`puff-${index}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={ANT.headLight}
              opacity={opacity}
            />
          ))}
        </G>
        <Ellipse cx="50" cy="51" rx="34.5" ry="32.5" fill={`url(#${headGradient})`} />

        <Ellipse cx="36" cy="61" rx="7.6" ry="4.4" fill={ANT.blush} opacity={0.18} />
        <Ellipse cx="64" cy="61" rx="7.6" ry="4.4" fill={ANT.blush} opacity={0.18} />
        <Circle cx="41.6" cy="55.2" r="4.1" fill={ANT.face} opacity={0.94} />
        <Circle cx="58.4" cy="55.2" r="4.1" fill={ANT.face} opacity={0.94} />

        {equippedExpression ? null : (
          <Path
            d="M 45.8 63 C 48.1 66.2 51.9 66.2 54.2 63"
            stroke={ANT.mouth}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            opacity={0.82}
          />
        )}

        <G>
          {FUR_SPECKS.map(([cx, cy, r, opacity], index) => (
            <Circle
              key={`light-${index}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="#FFFFFF"
              opacity={opacity}
            />
          ))}
          {FUR_SPECKS.map(([cx, cy, r, opacity], index) => (
            <Circle
              key={`dark-${index}`}
              cx={100 - cx}
              cy={cy + 1}
              r={r * 0.85}
              fill={ANT.bodyDark}
              opacity={opacity * 0.58}
            />
          ))}
        </G>
      </Svg>

      {expressionAsset && (
        <Image
          source={expressionAsset}
          style={styles.expressionImage}
          resizeMode="contain"
        />
      )}
      {equippedExpression && !isExpressionKey(equippedExpression) && (
        <Text style={[styles.expression, { fontSize: baseSize * 0.14 }]}>
          {equippedExpression}
        </Text>
      )}
      {equippedGlasses && (
        <Text style={[styles.glasses, { fontSize: baseSize * 0.24 }]}>
          {equippedGlasses}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  hat: {
    position: 'absolute',
    top: -4,
    zIndex: 3,
  },
  glasses: {
    position: 'absolute',
    top: '35%',
    zIndex: 3,
  },
  expression: {
    color: ANT.mouth,
    fontWeight: '700',
    position: 'absolute',
    top: '48%',
    zIndex: 3,
  },
  expressionImage: {
    height: '26%',
    left: '31%',
    position: 'absolute',
    top: '32%',
    width: '38%',
    zIndex: 3,
  },
});
