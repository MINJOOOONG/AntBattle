import React from 'react';
import Svg, { Path, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
}

/** 개미집/흙집 아이콘 — 3D 클레이 스타일 */
export default function HomeIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.85} />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>
      </Defs>
      {/* Mound body (rounded hill) */}
      <Path
        d="M 2 20 Q 2 10 12 4 Q 22 10 22 20 Z"
        fill="url(#hGrad)"
      />
      {/* Entrance hole */}
      <Ellipse cx="12" cy="18" rx="3.5" ry="3" fill="rgba(0,0,0,0.25)" />
      {/* Highlight on mound */}
      <Path
        d="M 7 12 Q 10 8 12 7"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
