import { BattleStatus, BattlePeriod, FriendshipStatus, ItemCategory, ItemRarity } from './enums';

export interface User {
  id: string;
  email: string;
  nickname: string;
  handle: string;
  rankScore: number;
  winCount: number;
  loseCount: number;
  drawCount: number;
  currentWinStreak: number;
  bestWinStreak: number;
  battleTickets: number;
  antBeans: number; // 서버에서 ledger 합산하여 제공
  equippedHatId: string | null;
  equippedGlassesId: string | null;
  equippedExpressionId: string | null;
  equippedOutfitId: string | null;
  equippedBackgroundId: string | null;
  equippedTitleId: string | null;
  createdAt: string;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  requester?: User;
  receiver?: User;
  createdAt: string;
}

export interface Battle {
  id: string;
  requesterId: string;
  opponentId: string;
  status: BattleStatus;
  proposedPeriod: BattlePeriod | null;
  proposedBy: string | null;
  finalPeriod: BattlePeriod | null;
  startAt: string | null;
  endAt: string | null;
  winnerId: string | null;
  loserId: string | null;
  isDraw: boolean;
  participants: BattleParticipant[];
  requester?: User;
  opponent?: User;
  createdAt: string;
}

export interface BattleParticipant {
  id: string;
  battleId: string;
  userId: string;
  stockId: string;
  startPrice: number | null;
  currentPrice: number | null;
  finalPrice: number | null;
  returnRate: number;
  antScale: number;
  rewardBeans: number;
  rankScoreDelta: number;
  stock?: Stock;
  user?: User;
}

export interface Stock {
  id: string;
  code: string;
  name: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  changeRate: number;
}

export interface StockPriceHistory {
  date: string;
  price: number;
}

export interface AntItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  rarity: ItemRarity;
  emoji: string;
  description: string | null;
}

export interface UserItem {
  id: string;
  userId: string;
  itemId: string;
  acquiredAt: string;
  item?: AntItem;
}

export interface AntBeanTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}
