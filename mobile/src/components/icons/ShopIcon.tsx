import React from 'react';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
}

/** 천막 노점 아이콘 — 3D 클레이 스타일 */
export default function ShopIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="sRoof" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.75} />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>
        <LinearGradient id="sBase" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <Stop offset="100%" stopColor={color} stopOpacity={0.35} />
        </LinearGradient>
      </Defs>
      {/* Tent roof (wavy awning) */}
      <Path
        d="M 3 10 Q 5 6 8 10 Q 10 6 12 10 Q 14 6 16 10 Q 18 6 21 10 L 21 12 L 3 12 Z"
        fill="url(#sRoof)"
      />
      {/* Roof highlight */}
      <Path d="M 5 8 Q 7 6.5 8 8" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
      {/* Base/counter */}
      <Rect x="4" y="12" width="16" height="9" rx="2" ry="2" fill="url(#sBase)" />
      {/* Poles */}
      <Path d="M 5 12 L 5 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M 19 12 L 19 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Counter opening */}
      <Rect x="8" y="14" width="8" height="5" rx="1" fill="rgba(0,0,0,0.15)" />
    </Svg>
  );
}
