# Architecture

개미배틀 앱의 기술 아키텍처 문서.

## 전체 구조

```
┌─────────────────────────────────────────┐
│              Screens (UI)               │
│  Login, Home, Battle, Shop, Ranking...  │
├─────────────────────────────────────────┤
│           Zustand Store                 │
│  authStore, battleStore, shopStore...   │
├─────────────────────────────────────────┤
│          Service Layer                  │
│  AuthService, BattleService,            │
│  MarketDataService, RewardService...    │
├─────────────────────────────────────────┤
│          Data Layer                     │
│  Mock Data (1차 MVP)                    │
│  → 추후 Supabase / Firebase / REST API  │
└─────────────────────────────────────────┘
```

## 데이터 모델

### User

```typescript
interface User {
  id: string;
  nickname: string;
  handle: string;              // @ant_minjoo 형태
  passwordHash: string;        // MVP에서는 plain text mock 가능
  antBeans: number;            // 개미콩
  battleTickets: number;       // 일일 배틀 티켓
  rankScore: number;           // 랭크 점수
  rankName: string;            // 브론즈 개미, 실버 개미 등
  winCount: number;
  loseCount: number;
  drawCount: number;
  currentWinStreak: number;
  bestWinStreak: number;
  equippedItems: EquippedItems; // 카테고리별 장착 아이템 ID
  createdAt: string;
}

interface EquippedItems {
  hat?: string;
  glasses?: string;
  expression?: string;
  outfit?: string;
  background?: string;
  title?: string;
}
```

### Friendship

```typescript
type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
}
```

### Battle

```typescript
type BattleStatus =
  | 'pending_period'           // 기간 협상 중
  | 'period_rejected'          // 기간 거절됨 (재제안 대기)
  | 'pending_stock_selection'  // 기간 확정, 종목 선택 대기
  | 'active'                   // 배틀 진행 중
  | 'finished'                 // 배틀 종료
  | 'cancelled';               // 취소됨

type BattlePeriod =
  | '1d'    // 내일 종가까지
  | '3d'    // 3일 뒤 종가까지
  | '1w'    // 1주일 뒤 종가까지
  | '1m';   // 1개월 뒤 종가까지

interface Battle {
  id: string;
  requesterId: string;
  opponentId: string;
  status: BattleStatus;
  proposedPeriod: BattlePeriod | null;
  finalPeriod: BattlePeriod | null;
  startAt: string | null;
  endAt: string | null;
  winnerId: string | null;
  loserId: string | null;
  isDraw: boolean;
  createdAt: string;
}
```

### BattleParticipant

```typescript
interface BattleParticipant {
  id: string;
  battleId: string;
  userId: string;
  stockId: string;
  stockName: string;
  stockCode: string;
  startPrice: number;
  currentPrice: number;
  finalPrice: number | null;
  returnRate: number;          // 수익률 (%)
  antScale: number;            // 개미 크기 (0.75 ~ 1.4)
  rewardBeans: number;         // 보상 개미콩
  rankScoreDelta: number;      // 랭크 점수 변동
}
```

### Stock

```typescript
interface Stock {
  id: string;
  code: string;                // 종목 코드 (예: 005930)
  name: string;                // 종목명 (예: 삼성전자)
  sector: string;              // 섹터 (예: 반도체)
  currentPrice: number;
  previousClose: number;
  changeRate: number;          // 전일 대비 등락률 (%)
  priceHistory: PricePoint[];  // 과거 가격 데이터
}

interface PricePoint {
  date: string;
  price: number;
}
```

### AntItem

```typescript
type ItemCategory = 'hat' | 'glasses' | 'expression' | 'outfit' | 'background' | 'title';
type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface AntItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;               // 개미콩 가격
  rarity: ItemRarity;
  emoji: string;               // MVP에서는 이모지 사용
  description: string;
}
```

### UserItem

```typescript
interface UserItem {
  id: string;
  userId: string;
  itemId: string;
  acquiredAt: string;
  equipped: boolean;
}
```

### PriceSnapshot

```typescript
interface PriceSnapshot {
  id: string;
  battleId: string;
  stockId: string;
  price: number;
  capturedAt: string;
}
```

## 서비스 레이어

모든 데이터 접근은 서비스 레이어를 통해 이루어진다. MVP에서는 로컬 mock 데이터를 사용하지만, 서비스 인터페이스를 유지하여 추후 백엔드 API로 교체 가능하게 설계한다.

### AuthService

```typescript
interface IAuthService {
  login(handle: string, password: string): Promise<User | null>;
  signup(nickname: string, handle: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
}
```

### FriendService

```typescript
interface IFriendService {
  searchUser(handle: string): Promise<User | null>;
  sendFriendRequest(targetUserId: string): Promise<Friendship>;
  respondToRequest(friendshipId: string, accept: boolean): Promise<void>;
  getFriendList(): Promise<User[]>;
  getPendingRequests(): Promise<Friendship[]>;
}
```

### BattleService

```typescript
interface IBattleService {
  requestBattle(opponentId: string): Promise<Battle>;
  proposePeriod(battleId: string, period: BattlePeriod): Promise<void>;
  respondToPeriod(battleId: string, accept: boolean): Promise<void>;
  selectStock(battleId: string, stockId: string): Promise<void>;
  getBattleStatus(battleId: string): Promise<Battle>;
  getActiveBattles(): Promise<Battle[]>;
  finishBattle(battleId: string): Promise<BattleResult>;
}
```

### MarketDataService (핵심 추상화)

```typescript
// 이 인터페이스는 추후 실제 증권 API로 교체 가능하도록 설계됨
interface IMarketDataService {
  getStockList(): Promise<Stock[]>;
  getStockByCode(code: string): Promise<Stock | null>;
  getCurrentPrice(code: string): Promise<number>;
  getPriceHistory(code: string, days: number): Promise<PricePoint[]>;
  searchStocks(query: string): Promise<Stock[]>;
}
```

### MockMarketDataService

```typescript
// 1차 MVP 구현체: 로컬 mock 데이터 기반
class MockMarketDataService implements IMarketDataService {
  // mock 한국 주식 데이터 (삼성전자, SK하이닉스, NAVER 등)
  // 가격 변동은 랜덤 시뮬레이션 또는 고정 시나리오
  // 실제 API key, secret, 주문 기능은 포함하지 않음
}
```

추후 실제 시세 API 연동 시:

```typescript
// 예시: 토스증권 Open API 연동 시
class TossMarketDataService implements IMarketDataService {
  // API key는 서버 사이드에서만 관리
  // 프론트엔드에는 절대 저장하지 않음
  // 시세 조회만 구현, 주문/자동매매는 구현하지 않음
}
```

### RewardService

```typescript
interface IRewardService {
  calculateBattleReward(battle: Battle, userId: string): BattleReward;
  grantReward(userId: string, reward: BattleReward): Promise<void>;
  getDailyLoginReward(): Promise<number>;
}

interface BattleReward {
  beans: number;           // 승리 100, 패배 20, 무승부 50
  streakBonus: number;     // 연승 보너스 30
  rankScoreDelta: number;  // 승리 +30, 패배 -10, 무승부 +5
}
```

### InventoryService

```typescript
interface IInventoryService {
  getShopItems(): Promise<AntItem[]>;
  getUserItems(userId: string): Promise<UserItem[]>;
  purchaseItem(userId: string, itemId: string): Promise<boolean>;
  equipItem(userId: string, itemId: string): Promise<void>;
  unequipItem(userId: string, itemId: string): Promise<void>;
}
```

### RankingService

```typescript
interface IRankingService {
  getFriendRanking(userId: string): Promise<RankEntry[]>;
  getGlobalRanking(): Promise<RankEntry[]>;
  getSeasonRanking(): Promise<RankEntry[]>;
}
```

## 상태 관리 (Zustand)

```
authStore      - 현재 로그인 유저 정보
battleStore    - 진행 중인 배틀, 배틀 기록
friendStore    - 친구 목록, 친구 요청
shopStore      - 상점 아이템, 보유 아이템
rankingStore   - 랭킹 데이터
```

## 개미 크기 계산 로직

```typescript
function calculateAntScale(myReturnRate: number, opponentReturnRate: number): number {
  const diff = myReturnRate - opponentReturnRate;
  const BASE_SCALE = 1.0;
  const scaleFactor = diff * 0.02; // 수익률 차이 1%당 0.02 변화

  const scale = BASE_SCALE + scaleFactor;
  return Math.min(1.4, Math.max(0.75, scale)); // clamp 0.75 ~ 1.4
}
```

## 랭크 시스템

| 점수 범위 | 랭크 |
|-----------|------|
| 0 ~ 299 | 브론즈 개미 |
| 300 ~ 699 | 실버 개미 |
| 700 ~ 1199 | 골드 개미 |
| 1200 ~ 1799 | 불장 개미 |
| 1800 ~ 2499 | 상한가 개미 |
| 2500+ | 개미왕 |

## 배틀 상태 흐름

```
배틀 신청
  → pending_period (기간 협상 중)
    → 좋아요 → pending_stock_selection (종목 선택 대기)
    → 싫어요 → period_rejected → 재제안 → pending_period
  → pending_stock_selection
    → 양측 종목 선택 완료 → active (배틀 진행 중)
  → active
    → endAt 도달 → finished (배틀 종료)
  → cancelled (취소)
```

## 추후 증권 API 연동 시 주의사항

1. **API key/secret은 절대 프론트엔드에 저장하지 않는다**
   - 서버 사이드(백엔드)에서만 관리
   - 환경 변수 또는 시크릿 매니저 사용

2. **시세 조회만 구현한다**
   - 현재가, 과거 가격 조회만 허용
   - 주문(매수/매도), 자동매매 기능은 구현하지 않음

3. **MarketDataService 인터페이스를 교체하는 방식으로 연동한다**
   - MockMarketDataService → TossMarketDataService 등
   - 프론트엔드 코드 변경 최소화

4. **사용자 증권 계좌를 연결하지 않는다**
   - 계좌번호, 비밀번호 입력 UI 없음
   - OAuth 연동도 1차 MVP에서는 불필요

5. **실제 주문/자동매매를 제외한 이유**
   - 개미배틀은 투자 게임 앱이지, 증권 앱이 아님
   - 규제 리스크 회피 (투자 자문, 자동매매 라이센스 불필요)
   - 도박 앱으로 오해받을 수 있는 요소 제거
