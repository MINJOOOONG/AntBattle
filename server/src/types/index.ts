import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface PaginationQuery {
  limit?: string;
  offset?: string;
}

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

export type BeanTransactionType =
  | 'battle_win'
  | 'battle_lose'
  | 'battle_draw'
  | 'battle_entry'
  | 'battle_refund'
  | 'streak_bonus'
  | 'daily_login'
  | 'item_purchase'
  | 'signup_bonus';
