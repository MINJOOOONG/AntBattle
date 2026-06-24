# Architecture

개미배틀의 기술 아키텍처 문서. 서버 API + 모바일 클라이언트 구조로, 이 문서는 현재 코드 기준의 구현 상태와 확장 지점을 기록한다.

## 전체 구조

```
AntBattle/
├── server/                 # Express API 서버
│   ├── prisma/             # PostgreSQL schema, migrations, seed
│   └── src/
│       ├── config/         # env validation (zod)
│       ├── constants/      # game-config (배틀/스케일 상수)
│       ├── controllers/    # HTTP handler (7개)
│       ├── middleware/     # auth, validation, error handling, rate limiting
│       ├── routes/         # /api 하위 라우트 (7개 도메인)
│       ├── services/       # 비즈니스 로직 (8개 + market-data)
│       │   └── __tests__/  # reward.service.test.ts
│       ├── utils/          # JWT, rank, battle calculation, user-select
│       │   └── __tests__/  # battle-calc.test.ts, rank.test.ts
│       └── types/
├── mobile/                 # Expo React Native 앱
│   └── src/
│       ├── components/     # 공통 UI (11개), AntCharacter (2개), Chart, Icons (4개)
│       ├── navigation/     # React Navigation
│       ├── screens/        # auth (3), home (1), battle (6), shop (1), social (2), profile (1)
│       ├── services/       # API client wrapper (8개)
│       ├── store/          # Zustand stores (5개, 에러 상태 포함)
│       ├── hooks/          # useBGM
│       ├── types/          # API/model/enums
│       └── constants/      # color, rank, reward, expression, font
├── docker-compose.yml      # PostgreSQL (로컬 개발)
└── docs/
```

## 런타임 아키텍처

```
Mobile Screen
  -> Zustand Store (error 상태 포함)
  -> mobile/src/services/*.service.ts
  -> Axios API Client (timeout: 60s)
  -> Express Route (rate-limit 적용)
  -> Controller
  -> Service
  -> Prisma
  -> PostgreSQL
```

### 서버 책임

- 인증, 비밀번호 해싱, JWT 발급 및 검증
- 유저/친구/종목/개미콩/배틀/상점/랭킹 API 제공
- Prisma schema와 migration 관리
- AntBeanTransaction 레저 기반 잔액 계산
- 배틀 상태 머신 (pending_period → active → finished)
- 보상/랭크 점수 처리 (Serializable 트랜잭션)
- 아이템 구매/장착/해제
- Rate Limiting (글로벌 200/15분, 인증 10/15분)
- 회원가입 트랜잭션 원자성 보장 ($transaction)

### 모바일 책임

- Expo React Native 화면과 네비게이션
- JWT 저장 및 API 요청
- 인증/친구/배틀/상점/랭킹 상태 관리 (에러 상태 포함)
- 구현 화면: Splash, Login, Signup, Home, BattleList, BattleRequest, PeriodNegotiation, StockSelect, BattleProgress, BattleResult, Shop, FriendSearch, FriendList, MyPage
- 공통 컴포넌트: Button, PastelButton, SoftCard, EmptyState, LoadingView, ErrorView, SafetyDisclaimer, MiniBarChart, CharacterBubble, StatPill, StatusBadge, SectionHeader
- AntCharacter 스케일 애니메이션 (300ms easeInOut)
- ClayAntCharacter (홈/상점용 클레이 스타일)
- 접근성 레이블 (주요 화면)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Mobile | Expo, React Native, TypeScript |
| Navigation | React Navigation native stack, bottom tabs |
| State | Zustand (에러 상태 패턴 적용) |
| HTTP Client | Axios |
| Chart | react-native-svg |
| Animation | React Native Animated API |
| Server | Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | bcrypt, JWT |
| Validation | zod |
| Rate Limiting | express-rate-limit |
| Testing | Vitest |
| Server Hosting | Render |
| Web Hosting | Vercel |
| Infra (로컬) | Docker Compose |

## API 구조

모든 API는 `/api` 하위에 위치한다. 인증이 필요한 라우트는 `Authorization: Bearer <token>` 헤더를 사용한다.

### Rate Limiting

- 글로벌: 200회/15분 (모든 API)
- 인증: 10회/15분 (`/api/auth/signup`, `/api/auth/login`)

### Auth

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/auth/signup` | No | email, nickname, handle, password로 가입 (rate-limit 10/15분) |
| POST | `/api/auth/login` | No | handle, password로 로그인 (rate-limit 10/15분) |
| GET | `/api/auth/me` | Yes | 현재 로그인 유저 조회 |

### Users

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/users/me` | Yes | 내 프로필 |
| GET | `/api/users/me/beans` | Yes | 개미콩 잔액과 최근 거래 |
| GET | `/api/users/me/beans/history` | Yes | 개미콩 거래 내역 |
| GET | `/api/users/:id` | Yes | 다른 유저 프로필 |

### Friends

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/friends` | Yes | 수락된 친구 목록 |
| GET | `/api/friends/requests` | Yes | 받은/보낸 대기 요청 |
| POST | `/api/friends/search` | Yes | handle로 유저 검색 |
| POST | `/api/friends/request` | Yes | 친구 요청 보내기 |
| PATCH | `/api/friends/request/:id` | Yes | 친구 요청 수락/거절 |
| DELETE | `/api/friends/:friendshipId` | Yes | 친구 관계 삭제 |

### Stocks

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/stocks` | Yes | 종목 목록, `search`, `sector` query 지원 |
| GET | `/api/stocks/:id` | Yes | 종목 상세와 30일 가격 히스토리 |
| GET | `/api/stocks/:id/price` | Yes | 현재가와 등락률 |

### Battles

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/battles` | Yes | 배틀 생성 (참가비 50콩 차감, 기간 제안) |
| GET | `/api/battles` | Yes | 내 배틀 목록 (?status, ?limit, ?offset) |
| GET | `/api/battles/:id` | Yes | 배틀 상세 (참가자/종목/수익률) |
| POST | `/api/battles/:id/period` | Yes | 기간 재제안 |
| POST | `/api/battles/:id/period/respond` | Yes | 기간 수락/거절 |
| POST | `/api/battles/:id/stock` | Yes | 종목 선택 (양쪽 완료 시 active 전환) |
| POST | `/api/battles/:id/cancel` | Yes | 배틀 취소 (참가비 환불) |
| POST | `/api/battles/tick` | Yes | 가격 업데이트 + 만료 종료 처리 |

### Shop

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/shop/items` | Yes | 상점 아이템 목록 (?category 필터) |
| POST | `/api/shop/purchase` | Yes | 아이템 구매 (개미콩 차감) |
| GET | `/api/shop/inventory` | Yes | 보유 아이템 목록 |
| POST | `/api/shop/inventory/equip` | Yes | 아이템 장착 |
| POST | `/api/shop/inventory/unequip` | Yes | 아이템 해제 |

### Rankings

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/rankings/global` | Yes | 전체 랭킹 (?limit, ?offset, 기본 50) + myRank |
| GET | `/api/rankings/friends` | Yes | 친구 랭킹 (나+친구) + myRank |
| GET | `/api/rankings/stats/me` | Yes | 내 전적 통계 + 최근 5배틀 |
| GET | `/api/rankings/stats/:id` | Yes | 유저 전적 통계 + 최근 5배틀 |

## 데이터 모델

Prisma가 서버의 canonical schema다. 모바일 타입은 `mobile/src/types/models.ts`에서 이 응답 형태를 따라간다.

### User

```typescript
interface User {
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
  antBeans: number; // 응답에서 ledger 합산으로 제공
  equippedHatId: string | null;
  equippedGlassesId: string | null;
  equippedExpressionId: string | null;
  equippedOutfitId: string | null;
  equippedBackgroundId: string | null;
  equippedTitleId: string | null;
  createdAt: string;
}
```

서버 DB에는 `passwordHash`가 존재하지만 API 응답에는 포함하지 않는다.

### AntBeanTransaction

개미콩은 `User`의 단순 balance 컬럼이 아니라 ledger 합산으로 계산한다.

```typescript
interface AntBeanTransaction {
  id: string;
  userId: string;
  amount: number;        // 양수 적립, 음수 차감
  type: string;          // signup_bonus, battle_win, battle_lose, battle_draw,
                         // streak_bonus, item_purchase, battle_entry, battle_refund
  referenceId: string | null;
  description: string | null;
  createdAt: string;
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
  requester?: User;
  receiver?: User;
  createdAt: string;
}
```

친구 관계는 양방향 중복을 서비스 레이어에서 검사한다.

### Battle

```typescript
type BattleStatus =
  | 'pending_period'
  | 'period_rejected'
  | 'pending_stock_selection'
  | 'active'
  | 'finished'
  | 'cancelled';

type BattlePeriod = '1d' | '3d' | '1w' | '1m';

interface Battle {
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
  createdAt: string;
}
```

### Stock

```typescript
interface Stock {
  id: string;
  code: string;
  name: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  changeRate: number;
}
```

종목 데이터는 PostgreSQL seed 데이터와 `MockMarketDataService`를 통해 제공한다.

## 서비스 레이어

### AuthService

- 회원가입: email/handle unique 검증, bcrypt 해싱, 가입 보너스 ledger 기록 (단일 $transaction)
- 로그인: handle/password 검증, JWT 발급
- me: passwordHash 제외 유저 정보와 개미콩 잔액 반환

### UserService

- `getMyProfile`: 내 프로필 조회 (FULL_USER_SELECT)
- `getUserProfile`: 타 유저 프로필 조회

### AntBeanService

- `credit`, `debit`, `getBalance`, `getTransactions`, `grantBattleReward`
- 잔액 변경은 항상 `AntBeanTransaction` insert로 처리
- 차감(구매/참가비) 시 Serializable isolation level로 음수 잔액 방지
- 보상 지급 시 referenceId+type 조합으로 중복 방지 (멱등성)

### FriendService

- handle 검색, 친구 요청 생성, 수락/거절, 목록 조회, 관계 삭제
- 양방향 중복 검사
- FULL_USER_SELECT 공통 상수 사용

### BattleService

- 배틀 생성 (친구 확인, 중복 확인, 참가비 차감 — BATTLE_CONFIG.ENTRY_FEE 상수)
- 기간 협상 (제안/수락/거절)
- 종목 선택 (양쪽 완료 시 active 전환, 시작가 기록)
- 배틀 취소 (참가비 환불)
- tick (가격 업데이트 + PriceSnapshot 1% 이상 변동 시에만 기록 + 만료 종료 + 보상 처리)
- 페이지네이션 지원 (limit, offset)

### RewardService

- processResult: 승/패/무 판정, 개미콩 보상, 랭크 점수 갱신
- 승리: +100콩, +30점 / 패배: +20콩, -10점 / 무승부: +50콩, +5점
- 3연승 이상: +30콩 보너스
- 유닛 테스트 커버리지 (Vitest)

### InventoryService

- 상점 아이템 조회 (카테고리 필터, Prisma.AntItemWhereInput 타입)
- 아이템 구매 (중복 방지, 레저 차감)
- 인벤토리 조회, 장착/해제
- 카테고리→User 필드 매핑 (hat→equippedHatId 등)
- EQUIPPED_USER_SELECT 공통 상수 사용

### RankingService

- 전체 랭킹 (rankScore desc, winCount desc, 페이지네이션)
- 친구 랭킹 (나+친구)
- 유저 전적 통계 (최근 5배틀 포함)
- myRank 계산
- RANKING_USER_SELECT 공통 상수 사용

### MarketDataService

```typescript
interface IMarketDataService {
  getStockList(): Promise<StockInfo[]>;
  getStockByCode(code: string): Promise<StockInfo | null>;
  getStockById(id: string): Promise<StockInfo | null>;
  getCurrentPrice(stockId: string): Promise<number>;
  getPriceHistory(stockId: string, days: number): Promise<PricePoint[]>;
  searchStocks(query: string): Promise<StockInfo[]>;
  simulatePriceUpdate(): Promise<void>;
}
```

실제 시세 연동이 필요해져도 모바일에서 API key를 들고 있으면 안 된다. 외부 시세 API는 서버 전용 adapter로 추가하고, 주문/자동매매 기능은 구현하지 않는다.

## 공통 유틸

### SAFE_USER_SELECT 공통화 (user-select.ts)

API 응답에 포함할 User 필드를 용도별로 분리:

| 상수 | 필드 수 | 용도 |
|------|--------|------|
| FULL_USER_SELECT | 20 | user.controller, friend.service |
| RANKING_USER_SELECT | 15 | ranking.service |
| EQUIPPED_USER_SELECT | 7 | inventory.service |

### 게임 상수 (game-config.ts)

```typescript
BATTLE_CONFIG.ENTRY_FEE = 50;
SCALE_CONFIG.MIN_SCALE = 0.75;
SCALE_CONFIG.MAX_SCALE = 1.4;
SCALE_CONFIG.SCALE_FACTOR = 0.02;
```

## 테스트

### Vitest 설정

- `server/vitest.config.ts` — tsconfig 경로 alias 지원
- `npm test` — `vitest run`
- `npm run test:watch` — `vitest` (watch mode)

### 테스트 파일

| 파일 | 테스트 수 | 대상 |
|------|----------|------|
| `utils/__tests__/battle-calc.test.ts` | 15 | calculateReturnRate, calculateAntScale, periodToMs |
| `utils/__tests__/rank.test.ts` | 13 | getRankName, getAllRanks, REWARD 상수 |
| `services/__tests__/reward.service.test.ts` | 7 | 보상 처리 로직 (Prisma mock) |

## 보안과 안전 경계

- 비밀번호는 bcrypt로 해싱한다.
- JWT payload에는 최소 식별자만 넣는다.
- API 응답에 `passwordHash`를 포함하지 않는다.
- zod로 request body를 검증한다.
- Rate Limiting으로 API 남용을 방지한다.
- 회원가입 시 유저 생성과 보너스 지급을 단일 트랜잭션으로 보장한다.
- 실제 주식 주문, 계좌 연결, 자동매매, 금전 베팅, 현금성 보상은 구현하지 않는다.
- 종목 조회는 게임/학습용 정보이며 투자 추천 문구를 사용하지 않는다.

## DB 인덱스

Prisma schema에 정의된 주요 인덱스:

- `User`: email, handle, rankScore(desc)
- `AntBeanTransaction`: userId+createdAt, userId+type, userId+referenceId+type
- `Friendship`: requesterId+receiverId(unique), receiverId+status, status+requesterId
- `Battle`: requesterId+status, opponentId+status, status+endAt
- `BattleParticipant`: battleId+userId(unique), userId
- `Stock`: name
- `PriceSnapshot`: battleId+stockId+capturedAt

## 개발 명령

```bash
# 루트
docker compose up -d postgres

# 서버
cd server
npm install
npm run dev
npm run build
npm run typecheck
npm test
npm run test:watch
npm run db:seed

# 모바일
cd mobile
npm install
npm start
```

## Migration 운영 원칙

이 프로젝트의 현재 CLI 환경에서는 `prisma migrate dev`가 non-interactive 문제로 실패할 수 있다.

- 새 migration은 SQL 파일을 직접 작성한다.
- 적용은 `npx prisma migrate deploy`를 사용한다.
- 적용 후 `npx prisma generate`를 실행한다.
- seed는 `npm run db:seed`로 재실행한다.

## 확장 가능성 설계

- API stateless → Load Balancer + 다수 인스턴스 가능
- 레저 테이블 + Serializable 트랜잭션 → Redis 락 없이 동시성 안전
- IMarketDataService 인터페이스 → 실제 증권 API 교체 가능
- node-cron tick → 추후 별도 worker + Redis Queue로 분리 가능
- 랭킹 DB 쿼리 → 추후 Redis sorted set 캐시 가능

## 구현 로드맵

| Phase | 범위 | 상태 |
|-------|------|------|
| 0 | 스캐폴딩, DB, Prisma, health check | 완료 |
| 1 | Auth, User, AntBean ledger | 완료 |
| 2 | User/Friend/Stock API, 모바일 인증/친구/프로필 | 완료 |
| 3 | Battle API, 종목 선택, 배틀 진행/결과/보상 | 완료 |
| 4 | Shop, Inventory, 아이템 구매/장착 | 완료 |
| 5 | Ranking, 전적 통계 | 완료 |
| 6 | UX 폴리시 (빈/로딩/에러 상태, 안전 문구, 차트, 애니메이션) | 완료 |
| 7 | 코드 품질 개선 (테스트, 타입 안전, 에러 처리, 상수화, Rate Limiting, 접근성) | 완료 |
