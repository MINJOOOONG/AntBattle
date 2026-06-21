import React from 'react';
import { View } from 'react-native';
import Svg, {
  Ellipse,
  Circle,
  Path,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { getRankColor } from '../../constants/ranks';

interface ClayAntCharacterProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  rankScore?: number;
}

const SIZE_MAP = {
  small: 48,
  medium: 80,
  large: 120,
  hero: 160,
};

// 3D clay ant colors
const C = {
  bodyLight: '#B89B78',
  bodyMid: '#A88B6A',
  bodyDark: '#7A5C3E',
  limbDark: '#8B7055',
  limbLight: '#A08060',
  eyeWhite: '#F5F0EB',
  eyePupil: '#3F3A36',
  eyeHighlight: '#FFFFFF',
  mouth: '#6B5040',
  shadow: 'rgba(80,60,40,0.22)',
};

export default function ClayAntCharacter({
  size = 'medium',
  rankScore = 0,
}: ClayAntCharacterProps) {
  const base = SIZE_MAP[size];
  // SVG viewBox is 100x130, we scale to base
  const svgW = base;
  const svgH = base * 1.35;
  const rankColor = getRankColor(rankScore);

  return (
    <View style={{ width: svgW, height: svgH, alignItems: 'center' }}>
      <Svg width={svgW} height={svgH} viewBox="0 0 100 135">
        <Defs>
          {/* Head gradient */}
          <RadialGradient id="headGrad" cx="45%" cy="38%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#C9AD8E" />
            <Stop offset="55%" stopColor={C.bodyMid} />
            <Stop offset="100%" stopColor={C.bodyDark} />
          </RadialGradient>
          {/* Thorax gradient */}
          <RadialGradient id="thoraxGrad" cx="45%" cy="35%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#BDA07A" />
            <Stop offset="60%" stopColor={C.bodyMid} />
            <Stop offset="100%" stopColor={C.bodyDark} />
          </RadialGradient>
          {/* Abdomen gradient */}
          <RadialGradient id="abdomenGrad" cx="45%" cy="35%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#C4A882" />
            <Stop offset="50%" stopColor={C.bodyLight} />
            <Stop offset="100%" stopColor={C.bodyDark} />
          </RadialGradient>
          {/* Floor shadow gradient */}
          <RadialGradient id="floorShadow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="rgba(80,60,40,0.18)" />
            <Stop offset="100%" stopColor="rgba(80,60,40,0)" />
          </RadialGradient>
          {/* Eye gradient for 3D */}
          <RadialGradient id="eyeGrad" cx="40%" cy="35%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#E8E0D8" />
          </RadialGradient>
          {/* Limb gradient */}
          <LinearGradient id="limbGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={C.limbLight} />
            <Stop offset="100%" stopColor={C.limbDark} />
          </LinearGradient>
          {/* Rank ring gradient */}
          <LinearGradient id="rankGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={rankColor} />
            <Stop offset="100%" stopColor={rankColor} stopOpacity={0.6} />
          </LinearGradient>
        </Defs>

        {/* === Floor Shadow === */}
        <Ellipse cx="50" cy="130" rx="30" ry="5" fill="url(#floorShadow)" />

        {/* === Legs (6 total, 3 per side from thorax) === */}
        {/* Left legs */}
        <Path d="M 38 68 Q 20 62 14 72" stroke="url(#limbGrad)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <Path d="M 36 73 Q 16 73 10 83" stroke="url(#limbGrad)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <Path d="M 37 78 Q 20 84 15 94" stroke="url(#limbGrad)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        {/* Right legs */}
        <Path d="M 62 68 Q 80 62 86 72" stroke="url(#limbGrad)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <Path d="M 64 73 Q 84 73 90 83" stroke="url(#limbGrad)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <Path d="M 63 78 Q 80 84 85 94" stroke="url(#limbGrad)" strokeWidth="3.2" strokeLinecap="round" fill="none" />

        {/* Leg tips (small circles at foot ends) */}
        <Circle cx="14" cy="72" r="2" fill={C.limbDark} />
        <Circle cx="10" cy="83" r="2" fill={C.limbDark} />
        <Circle cx="15" cy="94" r="2" fill={C.limbDark} />
        <Circle cx="86" cy="72" r="2" fill={C.limbDark} />
        <Circle cx="90" cy="83" r="2" fill={C.limbDark} />
        <Circle cx="85" cy="94" r="2" fill={C.limbDark} />

        {/* === Abdomen (big oval, lowest body part) === */}
        <Ellipse cx="50" cy="105" rx="22" ry="18" fill="url(#abdomenGrad)" />
        {/* Abdomen highlight */}
        <Ellipse cx="46" cy="98" rx="10" ry="7" fill="rgba(255,255,255,0.12)" />

        {/* === Thorax (small oval, middle) === */}
        <Ellipse cx="50" cy="76" rx="16" ry="12" fill="url(#thoraxGrad)" />
        {/* Thorax highlight */}
        <Ellipse cx="47" cy="72" rx="7" ry="5" fill="rgba(255,255,255,0.10)" />

        {/* === Antennae (2, curved from top of head) === */}
        <Path d="M 38 30 Q 28 10 20 6" stroke="url(#limbGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M 62 30 Q 72 10 80 6" stroke="url(#limbGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Antenna tips */}
        <Circle cx="20" cy="6" r="3.5" fill={C.bodyMid} />
        <Circle cx="80" cy="6" r="3.5" fill={C.bodyMid} />
        {/* Antenna tip highlights */}
        <Circle cx="19" cy="5" r="1.2" fill="rgba(255,255,255,0.25)" />
        <Circle cx="79" cy="5" r="1.2" fill="rgba(255,255,255,0.25)" />

        {/* === Head (circle with rank ring) === */}
        {/* Rank ring (slightly bigger behind head) */}
        <Circle cx="50" cy="42" r="22" fill="none" stroke="url(#rankGrad)" strokeWidth="2.5" />
        {/* Head */}
        <Circle cx="50" cy="42" r="20" fill="url(#headGrad)" />
        {/* Head highlight (3D shine) */}
        <Ellipse cx="44" cy="35" rx="9" ry="7" fill="rgba(255,255,255,0.15)" />

        {/* === Eyes === */}
        {/* Left eye */}
        <Ellipse cx="41" cy="40" rx="6" ry="6.5" fill="url(#eyeGrad)" />
        <Circle cx="42" cy="41" r="3.5" fill={C.eyePupil} />
        <Circle cx="40" cy="39" r="1.3" fill={C.eyeHighlight} />
        {/* Right eye */}
        <Ellipse cx="59" cy="40" rx="6" ry="6.5" fill="url(#eyeGrad)" />
        <Circle cx="60" cy="41" r="3.5" fill={C.eyePupil} />
        <Circle cx="58" cy="39" r="1.3" fill={C.eyeHighlight} />

        {/* === Mouth (small smile arc) === */}
        <Path d="M 45 50 Q 50 54 55 50" stroke={C.mouth} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </Svg>
    </View>
  );
}
