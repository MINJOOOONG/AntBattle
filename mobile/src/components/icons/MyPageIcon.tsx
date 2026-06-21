import React from 'react';
import Svg, { Circle, Ellipse, Path, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
}

/** 개미 얼굴 아이콘 — 3D 클레이 스타일 */
export default function MyPageIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="mHead" cx="45%" cy="40%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={0.7} />
          <Stop offset="100%" stopColor={color} />
        </RadialGradient>
        <LinearGradient id="mAnt" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.8} />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>
      </Defs>
      {/* Antennae */}
      <Path d="M 9 7 Q 6 2 4 1" stroke="url(#mAnt)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M 15 7 Q 18 2 20 1" stroke="url(#mAnt)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Antenna tips */}
      <Circle cx="4" cy="1" r="1.5" fill={color} />
      <Circle cx="20" cy="1" r="1.5" fill={color} />
      {/* Head */}
      <Circle cx="12" cy="14" r="9" fill="url(#mHead)" />
      {/* Head highlight */}
      <Ellipse cx="10" cy="11" rx="4" ry="3" fill="rgba(255,255,255,0.18)" />
      {/* Eyes */}
      <Ellipse cx="9" cy="13" rx="2.2" ry="2.4" fill="rgba(255,255,255,0.9)" />
      <Circle cx="9.3" cy="13.3" r="1.3" fill="#3F3A36" />
      <Circle cx="8.6" cy="12.6" r="0.5" fill="#FFFFFF" />
      <Ellipse cx="15" cy="13" rx="2.2" ry="2.4" fill="rgba(255,255,255,0.9)" />
      <Circle cx="15.3" cy="13.3" r="1.3" fill="#3F3A36" />
      <Circle cx="14.6" cy="12.6" r="0.5" fill="#FFFFFF" />
      {/* Smile */}
      <Path d="M 10 17 Q 12 19 14 17" stroke="#6B5040" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}
