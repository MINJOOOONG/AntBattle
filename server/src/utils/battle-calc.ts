const MIN_SCALE = 0.75;
const MAX_SCALE = 1.4;
const SCALE_FACTOR = 0.02; // 수익률 차이 1%p당 0.02 변화

export function calculateReturnRate(startPrice: number, currentPrice: number): number {
  if (startPrice === 0) return 0;
  return ((currentPrice - startPrice) / startPrice) * 100;
}

export function calculateAntScale(myReturnRate: number, opponentReturnRate: number): number {
  const diff = myReturnRate - opponentReturnRate;
  const scale = 1.0 + diff * SCALE_FACTOR;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function periodToMs(period: string): number {
  switch (period) {
    case '1d': return 24 * 60 * 60 * 1000;
    case '3d': return 3 * 24 * 60 * 60 * 1000;
    case '1w': return 7 * 24 * 60 * 60 * 1000;
    case '1m': return 30 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}
