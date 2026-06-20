# Architecture

개미배틀의 현재 기술 아키텍처 문서. 초기 모바일 mock 설계에서 서버 API + 모바일 클라이언트 구조로 전환되었으며, 이 문서는 현재 코드 기준의 구현 상태와 다음 확장 지점을 함께 기록한다.

## 전체 구조

```
AntBattle/
├── server/                 # Express API 서버
│   ├── prisma/             # PostgreSQL schema, migrations, seed
│   └── src/
│       ├── controllers/    # HTTP handler
│       ├── middleware/     # auth, validation, error handling
│       ├── routes/         # /api 하위 라우트
│       ├── services/       # 비즈니스 로직
│       ├── utils/          # JWT, rank, battle calculation
│       └── config/         # env validation
├── mobile/                 # Expo React Native 앱
│   └── src/
│       ├── components/     # 공통 UI, AntCharacter
│       ├── navigation/     # React Navigation
│       ├── screens/        # auth, home, social, profile
│       ├── services/       # API client wrapper
│       ├── store/          # Zustand stores
│       ├── types/          # API/model/enums
│       └── constants/      # color, rank, reward
├── docker-compose.yml      # PostgreSQL
└── docs/
```

## 런타임 아키텍처

```
Mobile Screen
  -> Zustand Store
  -> mobile/src/services/*.service.ts
  -> Axios API Client
  -> Express Route
  -> Controller
  -> Service
  -> Prisma
  -> PostgreSQL
```

### 서버 책임

- 인증, 비밀번호 해싱, JWT 발급 및 검증
- 유저/친구/종목/개미콩 API 제공
- Prisma schema와 migration 관리
- AntBeanTransaction 레저 기반 잔액 계산
- 추후 배틀/상점/인벤토리/랭킹 도메인 확장

### 모바일 책임

- Expo React Native 화면과 네비게이션
- JWT 저장 및 API 요청
- 인증 상태와 친구 상태 관리
- 현재 구현 화면: Splash, Login, Signup, Home, FriendSearch, FriendList, MyPage
- 현재 placeholder: Battle, Shop

## 기술 스택

| 영역 | 기술 |
|------|------|
| Mobile | Expo, React Native, TypeScript |
| Navigation | React Navigation native stack, bottom tabs |
| State | Zustand |
| HTTP Client | Axios |
| Server | Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | bcrypt, JWT |
| Validation | zod |
| Infra | Docker Compose |

## API 구조

모든 API는 `/api` 하위에 위치한다. 인증이 필요한 라우트는 `Authorization: Bearer <token>` 헤더를 사용한다.

### Auth

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/auth/signup` | No | email, nickname, handle, password로 가입 |
| POST | `/api/auth/login` | No | handle, password로 로그인 |
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

### Planned

| Phase | API |
|-------|-----|
| Phase 3 | `/api/battles` |
| Phase 4 | `/api/shop`, `/api/inventory` |
| Phase 5 | `/api/rankings` |

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
  type: string;          // signup_bonus, battle_win, item_purchase 등
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

친구 관계는 양방향 중복을 서비스 레이어에서 검사한다. Prisma unique 제약은 `requesterId, receiverId` 방향 기준이므로 반대 방향 존재 여부도 코드에서 확인해야 한다.

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

현재 schema와 모바일 타입은 준비되어 있으나 배틀 API와 화면은 아직 구현 예정이다.

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

종목 데이터는 PostgreSQL seed 데이터와 `MockMarketDataService`를 통해 제공한다. 현재 MVP는 실제 증권 API를 호출하지 않는다.

## 서비스 레이어

### AuthService

- 회원가입: email/handle unique 검증, bcrypt 해싱, 가입 보너스 ledger 기록
- 로그인: handle/password 검증, JWT 발급
- me: passwordHash 제외 유저 정보와 개미콩 잔액 반환

### AntBeanService

- `credit`, `debit`, `getBalance`, `getTransactions`, `grantBattleReward`
- 잔액 변경은 항상 `AntBeanTransaction` insert로 처리
- 아이템 구매 등 차감 로직은 잔액 부족 검사를 서비스에서 수행해야 한다

### FriendService

- handle 검색
- 친구 요청 생성
- 받은 요청 수락/거절
- 친구 목록 및 대기 요청 조회
- 친구 관계 삭제

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

## 보안과 안전 경계

- 비밀번호는 bcrypt로 해싱한다.
- JWT payload에는 최소 식별자만 넣는다.
- API 응답에 `passwordHash`를 포함하지 않는다.
- zod로 request body를 검증한다.
- 실제 주식 주문, 계좌 연결, 자동매매, 금전 베팅, 현금성 보상은 구현하지 않는다.
- 종목 조회는 게임/학습용 정보이며 투자 추천 문구를 사용하지 않는다.

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
npm run db:seed

# 모바일
cd mobile
npm install
npm start
npm run ios
npm run android
```

## Migration 운영 원칙

이 프로젝트의 현재 CLI 환경에서는 `prisma migrate dev`가 non-interactive 문제로 실패할 수 있다.

- 새 migration은 SQL 파일을 직접 작성한다.
- 적용은 `npx prisma migrate deploy`를 사용한다.
- 적용 후 `npx prisma generate`를 실행한다.
- seed는 `npm run db:seed`로 재실행한다.

## 구현 로드맵

| Phase | 범위 | 상태 |
|-------|------|------|
| 0 | 스캐폴딩, DB, Prisma, health check | 완료 |
| 1 | Auth, User, AntBean ledger | 완료 |
| 2 | User/Friend/Stock API, 모바일 인증/친구/프로필 | 진행 중 |
| 3 | Battle API, 종목 선택, 배틀 진행/결과 | 예정 |
| 4 | Shop, Inventory, 아이템 구매/장착 | 예정 |
| 5 | Ranking, 통계, UI polishing | 예정 |
