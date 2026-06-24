import { describe, it, expect } from 'vitest';
import { calculateReturnRate, calculateAntScale, periodToMs } from '../battle-calc';

describe('calculateReturnRate', () => {
  it('시작가 대비 수익률을 퍼센트로 반환한다', () => {
    expect(calculateReturnRate(100, 110)).toBe(10);
    expect(calculateReturnRate(100, 90)).toBe(-10);
    expect(calculateReturnRate(100, 100)).toBe(0);
  });

  it('소수점 수익률을 정확히 계산한다', () => {
    expect(calculateReturnRate(200, 205)).toBe(2.5);
    expect(calculateReturnRate(1000, 1001)).toBeCloseTo(0.1);
  });

  it('시작가가 0이면 0을 반환한다', () => {
    expect(calculateReturnRate(0, 100)).toBe(0);
    expect(calculateReturnRate(0, 0)).toBe(0);
  });

  it('큰 수익률도 처리한다', () => {
    expect(calculateReturnRate(100, 300)).toBe(200);
    expect(calculateReturnRate(100, 1)).toBe(-99);
  });
});

describe('calculateAntScale', () => {
  it('수익률이 같으면 1.0을 반환한다', () => {
    expect(calculateAntScale(10, 10)).toBe(1.0);
    expect(calculateAntScale(0, 0)).toBe(1.0);
    expect(calculateAntScale(-5, -5)).toBe(1.0);
  });

  it('내 수익률이 높으면 1.0보다 크다', () => {
    const scale = calculateAntScale(10, 5);
    expect(scale).toBeGreaterThan(1.0);
    // diff=5, scale=1.0+5*0.02=1.10
    expect(scale).toBe(1.10);
  });

  it('내 수익률이 낮으면 1.0보다 작다', () => {
    const scale = calculateAntScale(5, 10);
    expect(scale).toBeLessThan(1.0);
    // diff=-5, scale=1.0+(-5)*0.02=0.90
    expect(scale).toBe(0.90);
  });

  it('MAX_SCALE(1.4)을 초과하지 않는다', () => {
    // diff=50이면 scale=1.0+50*0.02=2.0 → 1.4로 클램프
    expect(calculateAntScale(60, 10)).toBe(1.4);
  });

  it('MIN_SCALE(0.75)보다 작아지지 않는다', () => {
    // diff=-50이면 scale=1.0+(-50)*0.02=0.0 → 0.75로 클램프
    expect(calculateAntScale(10, 60)).toBe(0.75);
  });

  it('경계값에서 정확한 값을 반환한다', () => {
    // diff=20 → scale=1.0+20*0.02=1.4 (정확히 MAX)
    expect(calculateAntScale(20, 0)).toBe(1.4);
    // diff=-12.5 → scale=1.0+(-12.5)*0.02=0.75 (정확히 MIN)
    expect(calculateAntScale(0, 12.5)).toBe(0.75);
  });
});

describe('periodToMs', () => {
  it('1d를 24시간(ms)으로 변환한다', () => {
    expect(periodToMs('1d')).toBe(86_400_000);
  });

  it('3d를 72시간(ms)으로 변환한다', () => {
    expect(periodToMs('3d')).toBe(259_200_000);
  });

  it('1w를 7일(ms)로 변환한다', () => {
    expect(periodToMs('1w')).toBe(604_800_000);
  });

  it('1m을 30일(ms)로 변환한다', () => {
    expect(periodToMs('1m')).toBe(2_592_000_000);
  });

  it('알 수 없는 기간은 에러를 던진다', () => {
    expect(() => periodToMs('invalid')).toThrow('유효하지 않은 배틀 기간입니다');
    expect(() => periodToMs('')).toThrow('유효하지 않은 배틀 기간입니다');
  });
});
