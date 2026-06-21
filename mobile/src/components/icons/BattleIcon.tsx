import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
}

/** 나뭇가지 검 교차 아이콘 — 3D 클레이 스타일 */
export default function BattleIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="bGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.8} />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>
      </Defs>
      {/* Left branch sword */}
      <Path
        d="M 5 19 Q 8 16 12 12 Q 14 10 16 5"
        stroke="url(#bGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right branch sword */}
      <Path
        d="M 19 19 Q 16 16 12 12 Q 10 10 8 5"
        stroke="url(#bGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Twig nubs on left sword */}
      <Path d="M 9 15 L 7.5 13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M 14 8 L 15.5 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Twig nubs on right sword */}
      <Path d="M 15 15 L 16.5 13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M 10 8 L 8.5 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Center clash dot */}
      <Circle cx="12" cy="12" r="1.8" fill={color} />
      {/* Highlight */}
      <Circle cx="11.5" cy="11.5" r="0.7" fill="rgba(255,255,255,0.4)" />
    </Svg>
  );
}
