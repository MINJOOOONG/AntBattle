export type BattleStatus =
  | 'pending_period'
  | 'period_rejected'
  | 'pending_stock_selection'
  | 'active'
  | 'finished'
  | 'cancelled';

export type BattlePeriod = '1d' | '3d' | '1w' | '1m';

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export type ItemCategory = 'hat' | 'glasses' | 'expression' | 'outfit' | 'background' | 'title';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export const BATTLE_PERIOD_LABELS: Record<BattlePeriod, string> = {
  '1d': '내일 종가까지',
  '3d': '3일 뒤 종가까지',
  '1w': '1주일 뒤 종가까지',
  '1m': '1개월 뒤 종가까지',
};

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  hat: '모자',
  glasses: '안경',
  expression: '표정',
  outfit: '의상',
  background: '배경',
  title: '칭호',
};
