import { describe, it, expect } from 'vitest';
import { getRankName, getAllRanks, REWARD } from '../rank';

describe('getRankName', () => {
  it('0~299점은 브론즈 개미', () => {
    expect(getRankName(0)).toBe('브론즈 개미');
    expect(getRankName(150)).toBe('브론즈 개미');
    expect(getRankName(299)).toBe('브론즈 개미');
  });

  it('300~699점은 실버 개미', () => {
    expect(getRankName(300)).toBe('실버 개미');
    expect(getRankName(500)).toBe('실버 개미');
    expect(getRankName(699)).toBe('실버 개미');
  });

  it('700~1199점은 골드 개미', () => {
    expect(getRankName(700)).toBe('골드 개미');
    expect(getRankName(1199)).toBe('골드 개미');
  });

  it('1200~1799점은 불장 개미', () => {
    expect(getRankName(1200)).toBe('불장 개미');
    expect(getRankName(1799)).toBe('불장 개미');
  });

  it('1800~2499점은 상한가 개미', () => {
    expect(getRankName(1800)).toBe('상한가 개미');
    expect(getRankName(2499)).toBe('상한가 개미');
  });

  it('2500점 이상은 개미왕', () => {
    expect(getRankName(2500)).toBe('개미왕');
    expect(getRankName(10000)).toBe('개미왕');
  });

  it('음수 점수는 브론즈 개미로 기본 처리', () => {
    expect(getRankName(-1)).toBe('브론즈 개미');
  });
});

describe('getAllRanks', () => {
  it('6개 랭크를 반환한다', () => {
    expect(getAllRanks()).toHaveLength(6);
  });

  it('점수 순서대로 정렬되어 있다', () => {
    const ranks = getAllRanks();
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i].minScore).toBeGreaterThan(ranks[i - 1].minScore);
    }
  });
});

describe('REWARD 상수', () => {
  it('승리 보상이 패배 보상보다 크다', () => {
    expect(REWARD.WIN_BEANS).toBeGreaterThan(REWARD.LOSE_BEANS);
  });

  it('승리 랭크 점수가 양수이다', () => {
    expect(REWARD.WIN_RANK_SCORE).toBeGreaterThan(0);
  });

  it('패배 랭크 점수가 음수이다', () => {
    expect(REWARD.LOSE_RANK_SCORE).toBeLessThan(0);
  });

  it('무승부 보상이 존재한다', () => {
    expect(REWARD.DRAW_BEANS).toBeGreaterThan(0);
    expect(REWARD.DRAW_RANK_SCORE).toBeGreaterThan(0);
  });

  it('가입 보너스가 존재한다', () => {
    expect(REWARD.SIGNUP_BONUS_BEANS).toBeGreaterThan(0);
  });
});
