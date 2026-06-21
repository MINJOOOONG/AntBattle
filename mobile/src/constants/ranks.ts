export const RANKS = [
  { name: '브론즈 개미', minScore: 0, maxScore: 299, color: '#CD7F32' },
  { name: '실버 개미', minScore: 300, maxScore: 699, color: '#B0B0B0' },
  { name: '골드 개미', minScore: 700, maxScore: 1199, color: '#D4A843' },
  { name: '불장 개미', minScore: 1200, maxScore: 1799, color: '#D4714E' },
  { name: '상한가 개미', minScore: 1800, maxScore: 2499, color: '#8E6BA5' },
  { name: '개미왕', minScore: 2500, maxScore: Infinity, color: '#C75B5B' },
] as const;

export function getRankName(score: number): string {
  const rank = RANKS.find(r => score >= r.minScore && score <= r.maxScore);
  return rank?.name ?? '브론즈 개미';
}

export function getRankColor(score: number): string {
  const rank = RANKS.find(r => score >= r.minScore && score <= r.maxScore);
  return rank?.color ?? '#CD7F32';
}
