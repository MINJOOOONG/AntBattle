import { User, Battle, Friendship, Stock, AntItem, UserItem, AntBeanTransaction, StockPriceHistory } from './models';

// 공통 API 응답 래퍼
export interface ApiError {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
}

export interface ApiErrorResponse {
  error: ApiError;
}

// Auth
export interface SignupRequest {
  email: string;
  nickname: string;
  handle: string;
  password: string;
}

export interface LoginRequest {
  handle: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  antBeans: number;
}

// Friends
export interface SearchUserResponse {
  user: User | null;
}

export interface FriendListResponse {
  friends: User[];
}

export interface FriendRequestsResponse {
  incoming: Friendship[];
  outgoing: Friendship[];
}

// Battle
export interface CreateBattleRequest {
  opponentId: string;
}

export interface ProposePeriodRequest {
  period: string;
}

export interface RespondPeriodRequest {
  accept: boolean;
}

export interface SelectStockRequest {
  stockId: string;
}

export interface BattleDetailResponse {
  battle: Battle;
}

export interface BattleListResponse {
  battles: Battle[];
}

// Stock
export interface StockListResponse {
  stocks: Stock[];
}

export interface StockDetailResponse {
  stock: Stock;
  priceHistory: StockPriceHistory[];
}

// Shop
export interface ShopItemsResponse {
  items: AntItem[];
}

export interface PurchaseRequest {
  itemId: string;
}

export interface PurchaseResponse {
  userItem: UserItem;
  newBalance: number;
}

// Inventory
export interface InventoryResponse {
  items: UserItem[];
}

export interface EquipRequest {
  userItemId: string;
}

// Ranking
export interface RankEntry {
  rank: number;
  user: User;
}

export interface RankingResponse {
  rankings: RankEntry[];
  myRank?: number;
}

// AntBeans
export interface BeanBalanceResponse {
  balance: number;
  recentTransactions: AntBeanTransaction[];
}

export interface BeanHistoryResponse {
  transactions: AntBeanTransaction[];
}
