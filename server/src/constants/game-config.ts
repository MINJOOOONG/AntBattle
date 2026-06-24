export const BATTLE_CONFIG = {
  /** 배틀 참가비 (양쪽 모두 차감) */
  ENTRY_FEE: 50,
} as const;

export const SCALE_CONFIG = {
  /** 개미 최소 크기 */
  MIN_SCALE: 0.75,
  /** 개미 최대 크기 */
  MAX_SCALE: 1.4,
  /** 수익률 차이 1%p당 크기 변화량 */
  SCALE_FACTOR: 0.02,
} as const;
