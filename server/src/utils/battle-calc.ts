import { SCALE_CONFIG } from '../constants/game-config';

const { MIN_SCALE, MAX_SCALE, SCALE_FACTOR } = SCALE_CONFIG;

export function calculateReturnRate(startPrice: number, currentPrice: number): number {
  if (startPrice === 0) return 0;
  return ((currentPrice - startPrice) / startPrice) * 100;
}

export function calculateAntScale(myReturnRate: number, opponentReturnRate: number): number {
  const diff = myReturnRate - opponentReturnRate;
  const scale = 1.0 + diff * SCALE_FACTOR;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export type BattlePeriodValue = '1d' | '3d' | '1w' | '1m';

const PERIOD_MS: Record<BattlePeriodValue, number> = {
  '1d': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000,
};

export function periodToMs(period: string): number {
  const ms = PERIOD_MS[period as BattlePeriodValue];
  if (ms === undefined) {
    throw new Error(`유효하지 않은 배틀 기간입니다: ${period}`);
  }
  return ms;
}
