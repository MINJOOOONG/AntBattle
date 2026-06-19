export interface RankInfo {
  name: string;
  minScore: number;
  maxScore: number;
}

const RANKS: RankInfo[] = [
  { name: '브론즈 개미', minScore: 0, maxScore: 299 },
  { name: '실버 개미', minScore: 300, maxScore: 699 },
  { name: '골드 개미', minScore: 700, maxScore: 1199 },
  { name: '불장 개미', minScore: 1200, maxScore: 1799 },
  { name: '상한가 개미', minScore: 1800, maxScore: 2499 },
  { name: '개미왕', minScore: 2500, maxScore: Infinity },
];

export function getRankName(score: number): string {
  const rank = RANKS.find(r => score >= r.minScore && score <= r.maxScore);
  return rank?.name ?? '브론즈 개미';
}

export function getAllRanks(): RankInfo[] {
  return RANKS;
}

// 보상 상수
export const REWARD = {
  WIN_BEANS: 100,
  LOSE_BEANS: 20,
  DRAW_BEANS: 50,
  STREAK_BONUS_BEANS: 30,
  WIN_RANK_SCORE: 30,
  LOSE_RANK_SCORE: -10,
  DRAW_RANK_SCORE: 5,
  SIGNUP_BONUS_BEANS: 500,
} as const;
