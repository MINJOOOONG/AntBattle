/**
 * Prisma User select 상수 — 용도별로 분리하여 중복 제거.
 */

/** 전체 프로필용 (user.controller, friend.service) — passwordHash 제외 */
export const FULL_USER_SELECT = {
  id: true,
  email: true,
  nickname: true,
  handle: true,
  rankScore: true,
  winCount: true,
  loseCount: true,
  drawCount: true,
  currentWinStreak: true,
  bestWinStreak: true,
  battleTickets: true,
  equippedHatId: true,
  equippedGlassesId: true,
  equippedExpressionId: true,
  equippedOutfitId: true,
  equippedBackgroundId: true,
  equippedTitleId: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** 랭킹/공개 프로필용 (ranking.service) — email, tickets, timestamps 제외 */
export const RANKING_USER_SELECT = {
  id: true,
  nickname: true,
  handle: true,
  rankScore: true,
  winCount: true,
  loseCount: true,
  drawCount: true,
  currentWinStreak: true,
  bestWinStreak: true,
  equippedHatId: true,
  equippedGlassesId: true,
  equippedExpressionId: true,
  equippedOutfitId: true,
  equippedBackgroundId: true,
  equippedTitleId: true,
} as const;

/** 장착 정보만 (inventory.service) */
export const EQUIPPED_USER_SELECT = {
  id: true,
  equippedHatId: true,
  equippedGlassesId: true,
  equippedExpressionId: true,
  equippedOutfitId: true,
  equippedBackgroundId: true,
  equippedTitleId: true,
} as const;
