export const COLORS = {
  // Primary Palette
  blush: '#CFC0BB',
  sky: '#B2BCC5',
  stone: '#979178',
  clay: '#987455',

  // Neutral
  background: '#F8F5F1',
  surface: '#FFFFFF',
  surfaceSoft: '#F1ECE8',
  textPrimary: '#3F3A36',
  textSecondary: '#7C746D',
  borderSoft: '#E5DDD7',

  // 수익률 (부드러운 톤, 한국 주식 관습 유지)
  gainRed: '#C75B5B',
  lossBlue: '#5B7FB5',
  neutral: '#7C746D',

  // UI
  border: '#E5DDD7',
  disabled: '#C9C1BA',
  danger: '#C75B5B',
  success: '#6B9E6B',

  // Rank
  rankBronze: '#CD7F32',
  rankSilver: '#B0B0B0',
  rankGold: '#D4A843',
  rankFire: '#D4714E',
  rankLimit: '#8E6BA5',
  rankKing: '#C75B5B',

  // Legacy aliases (기존 코드 호환)
  primary: '#987455',
  secondary: '#CFC0BB',
  lossBue: '#5B7FB5',
} as const;

/** 홈 화면 전용 슬레이트 팔레트 */
export const HOME_COLORS = {
  bg: '#f2f3f5',
  surface: '#ffffff',
  textPrimary: '#2c2f38',
  textSecondary: '#545967',
  textMuted: '#7f838e',
  border: '#babdc5',
  bubbleBg: '#ffffff',
  beanBg: '#2c2f38',
  beanText: '#ffffff',
  warmAccent: '#987455',
} as const;
