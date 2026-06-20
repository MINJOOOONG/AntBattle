# Project Log

개미배틀 개발 진행 기록. 각 Phase의 목표, 구현 내용, 검증 결과, 트러블슈팅, 아키텍처 결정을 누적 기록한다.

## 문서 구조

| 파일 | 역할 |
|------|------|
| `docs/architecture.md` | 기술 아키텍처, 데이터 모델, 서비스 레이어, 확장 설계 |
| `docs/design.md` | 디자인 가이드, 색상, 타이포그래피, 화면 레이아웃, 마이크로카피 |
| `docs/claude.md` | Claude 코딩 규칙, 금지 사항, 컨벤션, 우선순위 |
| `docs/PROJECT_LOG.md` | 개발 진행 기록 (이 파일) |

---

## 현재 상태 요약

**기준일**: 2026-06-20

| Phase | 상태 |
|-------|------|
| Phase 0: 프로젝트 스캐폴딩 | 완료 |
| Phase 1: Auth + 유저 + AntBean 레저 | 완료 |
| Phase 2: 유저/친구/종목 API + 모바일 기본 화면 | 완료 |
| Phase 3: 배틀 시스템 | 완료 |
| Phase 4: 상점 + 꾸미기 | 완료 |
| Phase 5: 랭킹 + 마이페이지 통계 | 완료 |
| Phase 6: 폴리시 | 예정 |

## Phase 0: 프로젝트 스캐폴딩

**목표**: 프로젝트 루트/서버/모바일 기본 구조 생성, Docker Compose + PostgreSQL, Prisma 스키마, Express health check

**상태**: 완료 (2026-06-18)

### 생성 파일

```
AntBattle/
├── .gitignore
├── .env.example
├── docker-compose.yml              # name: antbattle, antbattle-postgres, antbattle-api
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example, .env
│   ├── prisma/
│   │   ├── schema.prisma           # 10 models
│   │   ├── seed.ts                 # 15 mock stocks + 23 shop items + price history
│   │   └── migrations/20260617165815_init/
│   └── src/
│       ├── index.ts, app.ts
│       ├── config/env.ts           # zod 환경변수 검증
│       ├── middleware/             # auth.ts, errorHandler.ts, validate.ts
│       ├── routes/                # index.ts, auth.routes.ts (stub)
│       ├── utils/                 # errors.ts, jwt.ts, battle-calc.ts, rank.ts
│       └── types/index.ts
├── mobile/
│   ├── (Expo blank-typescript template)
│   └── src/
│       ├── types/                 # models.ts, enums.ts, api.ts
│       ├── constants/             # colors.ts, ranks.ts, rewards.ts
│       └── services/api.ts       # axios + JWT interceptor
└── docs/
```

### 검증 결과

| 항목 | 결과 |
|------|------|
| `docker compose up -d postgres` | antbattle-postgres Up (healthy) |
| `prisma migrate dev --name init` | 성공, 10 테이블 생성 |
| `prisma db seed` | 15 stocks + 23 items + price history 삽입 |
| `GET /api/health` | 200 OK |
| `tsc --noEmit` | 에러 없음 |

### 아키텍처 결정

| 결정 | 이유 | 대안 | 변경 가능성 |
|------|------|------|------------|
| Express + PostgreSQL | AWS Free Tier 적합, 단순, 확장 가능 | Fastify, Lambda+DynamoDB | 낮음 |
| Prisma ORM | TypeScript DX, migration 관리, 타입 안전 | Drizzle | 낮음 |
| 단일 레포 폴더 분리 | 초기 단순성, 모노레포 도구 불필요 | Turborepo | 중간 (DAU 증가 시) |
| AntBeanTransaction 레저 | 잔액 무결성, 이력 추적, 중복 방지 | balance 컬럼 직접 수정 | 낮음 |
| JWT stateless auth | 수평 확장 가능, 서버 메모리 무상태 | 세션 기반 | 낮음 |
| Docker naming: antbattle-* | Docker Desktop에서 프로젝트 식별 용이 | - | 낮음 |

---

## Phase 1: Auth + 유저 + AntBean 레저

**목표**: 회원가입(bcrypt, zod 검증, email+handle unique), 로그인(JWT), /api/auth/me, AntBean 레저 서비스, seed에 테스트 유저 2명

**상태**: 완료 (2026-06-20)

### 생성/수정 파일

**신규 생성**:
- `server/src/services/auth.service.ts` — 회원가입(bcrypt), 로그인(JWT), me 조회, passwordHash 제외 응답
- `server/src/services/ant-bean.service.ts` — 레저 기반 개미콩 (credit/debit/getBalance/grantBattleReward)
- `server/src/controllers/auth.controller.ts` — auth 라우트 핸들러
- `server/prisma/migrations/20260618020000_add_user_email/migration.sql` — email 컬럼 migration

**수정**:
- `server/prisma/schema.prisma` — User.email 필드 추가 (NOT NULL, UNIQUE)
- `server/prisma/seed.ts` — 테스트 유저 2명 추가 (bcrypt 해싱, 레저 기반 가입 보너스)
- `server/src/routes/auth.routes.ts` — signup/login/me 엔드포인트 구현 (zod 검증)
- `mobile/src/types/models.ts` — User.email 필드 추가
- `mobile/src/types/api.ts` — SignupRequest.email 필드 추가

### API 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/auth/signup` | 불필요 | 회원가입 (email, nickname, handle, password) |
| POST | `/api/auth/login` | 불필요 | 로그인 (handle, password) → JWT 발급 |
| GET | `/api/auth/me` | 필요 | 현재 유저 정보 + antBeans 잔액 조회 |

### 검증 결과

| 항목 | 결과 |
|------|------|
| `tsc --noEmit` | 에러 없음 |
| `tsc` (빌드) | 성공, dist/ 생성 |
| 회원가입 API | 201 Created, passwordHash 미포함, antBeans: 500 (레저 기반) |
| 로그인 API | 200 OK, JWT 발급, antBeans 잔액 반환 |
| `/api/auth/me` (유효 토큰) | 200 OK, 유저 정보 + antBeans 반환 |
| `/api/auth/me` (토큰 없음) | 401, `UNAUTHORIZED` |
| `/api/auth/me` (잘못된 토큰) | 401, `Invalid or expired token` |
| 중복 email 가입 | 409, `이미 사용 중인 이메일입니다` |
| 중복 handle 가입 | 409, `이미 사용 중인 핸들입니다` |
| seed 재실행 | 테스트 유저 2명 생성 (password: test1234, bcrypt 해싱) |

### 보안 체크

- [x] 비밀번호 bcrypt 해싱 (10 rounds)
- [x] 응답에 passwordHash 미포함 (toSafeUser 함수)
- [x] JWT payload에 userId만 포함
- [x] email/handle unique constraint 기반 중복 방지
- [x] zod validation (email 형식, handle 영문/숫자/밑줄, 비밀번호 6자+)
- [x] 가입 보너스 개미콩은 AntBeanTransaction 레저 테이블에 signup_bonus로 기록

### Troubleshooting Notes

#### 2026-06-18: `prisma migrate dev` non-interactive 환경 에러

**증상**: User 모델에 required `email` 필드(unique)를 추가하고 migration 실행 시 에러

```
Error: Prisma Migrate has detected that the environment is non-interactive, which is not supported.
```

**원인**:
- `prisma migrate dev`와 `--create-only` 모두 interactive 프롬프트가 필요
- Claude Code CLI 환경이 non-interactive로 감지됨
- DB 상태(User 0건)와는 무관한 실행 환경 문제

**해결 방법**: 수동 migration 방식 사용
1. `prisma/migrations/20260618020000_add_user_email/migration.sql` 파일을 직접 작성
2. `npx prisma migrate deploy`로 적용 (non-interactive OK)
3. `npx prisma generate`로 Client 재생성

**Migration SQL 내용**:
```sql
ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
```

**검증 결과**:

| 항목 | 결과 |
|------|------|
| `prisma migrate deploy` | 성공, migration 적용 완료 |
| DB 스키마 확인 | `email TEXT NOT NULL` 컬럼 존재 확인 |
| `prisma generate` | Prisma Client 재생성 완료 |
| `tsc --noEmit` | 에러 없음 |
| seed 재실행 | 불필요 (User 0건, Stock/AntItem 데이터 영향 없음) |

**향후 참고**: 이 프로젝트에서 `prisma migrate dev`는 사용 불가. migration은 항상 SQL 수동 작성 + `prisma migrate deploy` 방식으로 진행.

### Migrations

| Migration | 변경 내용 | 적용일 |
|-----------|----------|--------|
| `20260617165815_init` | 전체 스키마 초기 생성 (10 테이블) | 2026-06-18 |
| `20260618020000_add_user_email` | User.email 컬럼 추가 (NOT NULL, UNIQUE, INDEX) | 2026-06-18 |

---

## Phase 2: 유저/친구/종목 API + 모바일 기본 화면

**목표**: 인증 이후 사용할 유저 프로필, 친구, 종목 조회 API와 모바일 기본 화면/스토어/서비스 연결

**상태**: 완료 (2026-06-20)

### 현재 워크트리에서 확인된 신규/수정 파일

**Server**:

- `server/src/controllers/friend.controller.ts`
- `server/src/controllers/stock.controller.ts`
- `server/src/controllers/user.controller.ts`
- `server/src/routes/friend.routes.ts`
- `server/src/routes/stock.routes.ts`
- `server/src/routes/user.routes.ts`
- `server/src/services/friend.service.ts`
- `server/src/services/market-data/`
- `server/src/routes/index.ts`

**Mobile**:

- `mobile/src/components/ant/AntCharacter.tsx`
- `mobile/src/components/common/Button.tsx`
- `mobile/src/navigation/MainTabNavigator.tsx`
- `mobile/src/navigation/RootNavigator.tsx`
- `mobile/src/navigation/types.ts`
- `mobile/src/screens/auth/LoginScreen.tsx`
- `mobile/src/screens/auth/SignupScreen.tsx`
- `mobile/src/screens/auth/SplashScreen.tsx`
- `mobile/src/screens/home/HomeScreen.tsx`
- `mobile/src/screens/profile/MyPageScreen.tsx`
- `mobile/src/screens/social/FriendListScreen.tsx`
- `mobile/src/screens/social/FriendSearchScreen.tsx`
- `mobile/src/services/auth.service.ts`
- `mobile/src/services/friend.service.ts`
- `mobile/src/services/stock.service.ts`
- `mobile/src/services/user.service.ts`
- `mobile/src/store/authStore.ts`
- `mobile/src/store/friendStore.ts`
- `mobile/src/types/api.ts`

### API 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/users/me` | 필요 | 내 프로필 |
| GET | `/api/users/me/beans` | 필요 | 개미콩 잔액과 최근 거래 |
| GET | `/api/users/me/beans/history` | 필요 | 개미콩 거래 내역 |
| GET | `/api/users/:id` | 필요 | 유저 프로필 |
| GET | `/api/friends` | 필요 | 친구 목록 |
| GET | `/api/friends/requests` | 필요 | 받은/보낸 친구 요청 |
| POST | `/api/friends/search` | 필요 | handle 기반 유저 검색 |
| POST | `/api/friends/request` | 필요 | 친구 요청 |
| PATCH | `/api/friends/request/:id` | 필요 | 친구 요청 수락/거절 |
| DELETE | `/api/friends/:friendshipId` | 필요 | 친구 관계 삭제 |
| GET | `/api/stocks` | 필요 | 종목 목록, search/sector query 지원 |
| GET | `/api/stocks/:id` | 필요 | 종목 상세와 가격 히스토리 |
| GET | `/api/stocks/:id/price` | 필요 | 현재가와 등락률 |

### 모바일 구현 범위

- Auth stack: Splash, Login, Signup
- App stack: MainTab, FriendSearch, FriendList
- Main tabs: Home, Battle placeholder, Shop placeholder, MyPage
- Zustand stores: authStore, friendStore
- API service wrappers: auth, user, friend, stock
- 공통 UI: Button, AntCharacter

### 검증 결과

| 항목 | 결과 |
|------|------|
| `cd server && npx tsc --noEmit` | 에러 없음 |
| `cd mobile && npx tsc --noEmit` | 에러 없음 |
| GET /api/users/me | 200 OK, 민두개미, antBeans: 500 |
| GET /api/users/me/beans | 200 OK, balance: 500, transactions: 1건 |
| POST /api/friends/search | 200 OK, ant_chulsoo 검색 성공 |
| POST /api/friends/request | 200 OK, pending 상태 생성 |
| PATCH /api/friends/request/:id (수락) | 200 OK, accepted 전환 |
| GET /api/friends | 200 OK, 1명 (철수개미) |
| GET /api/stocks | 200 OK, 15개 종목 |
| GET /api/stocks/:id | 200 OK, KB금융, 28일 가격 히스토리 |

### Troubleshooting Notes

#### 2026-06-20: AuthResponse에 antBeans 필드 누락

**증상**: `mobile/src/store/authStore.ts`에서 `result.antBeans` 접근 시 TypeScript 에러

**원인**: `mobile/src/types/api.ts`의 `AuthResponse` 타입에 `antBeans` 필드가 누락되어 있었음. 서버는 정상적으로 반환하고 있었으나 모바일 타입 정의만 누락.

**해결**: `AuthResponse`에 `antBeans: number` 필드 추가

#### 2026-06-20: GET /api/users/me 404 에러

**증상**: `GET /api/users/me` 호출 시 `{"error":{"code":"NOT_FOUND","message":"User not found"}}`

**원인**: `/api/users/:id` 라우트가 `me`를 사용자 ID로 해석하여 DB 조회 실패. `/me` 전용 라우트가 없었음.

**해결**: `UserController.getMyProfile()` 메서드를 추가하여 `req.userId`로 조회하도록 분리. `/api/users/me` 라우트를 `/:id` 라우트보다 먼저 등록.

### 다음 단계

1. ~~Battle 도메인 API 설계 및 구현 (Phase 3)~~ → 완료
2. 배틀 모바일 화면 구현
3. Shop/Inventory 구현 (Phase 4)

---

## Phase 3: 배틀 시스템

**목표**: 친구와 1:1 주식 수익률 배틀 전체 플로우 구현. 배틀 생성 → 기간 협상 → 종목 선택 → 진행(가격 업데이트) → 종료 → 보상 지급.

**상태**: 완료 (2026-06-20)

### 생성/수정 파일

**신규 생성**:
- `server/src/services/battle.service.ts` — 배틀 생성, 기간 협상, 종목 선택, 시작, 취소, tick(가격 갱신/종료)
- `server/src/services/reward.service.ts` — 배틀 종료 후 개미콩 보상/랭크 점수 처리 (DB 트랜잭션)
- `server/src/controllers/battle.controller.ts` — 배틀 API 핸들러
- `server/src/routes/battle.routes.ts` — 배틀 라우트 + zod 검증
- `mobile/src/services/battle.service.ts` — 배틀 API 호출 래퍼
- `mobile/src/store/battleStore.ts` — Zustand 배틀 스토어

**수정**:
- `server/src/routes/index.ts` — battle 라우트 등록
- `server/src/types/index.ts` — `battle_entry`, `battle_refund` 트랜잭션 타입 추가

### 데이터 모델

기존 Prisma 스키마 변경 없음. Phase 0에서 생성한 `Battle`, `BattleParticipant`, `PriceSnapshot` 모델을 그대로 활용.

### 배틀 상태 흐름

```
pending_period → pending_stock_selection → active → finished
             ↘ period_rejected → pending_period (재제안)
             ↘ cancelled (참가비 환불)
```

### API 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/battles` | 필요 | 배틀 생성 (참가비 50콩 차감, 기간 제안) |
| GET | `/api/battles` | 필요 | 내 배틀 목록 (?status 필터) |
| GET | `/api/battles/:id` | 필요 | 배틀 상세 (참가자/종목/수익률 포함) |
| POST | `/api/battles/:id/period` | 필요 | 기간 재제안 |
| POST | `/api/battles/:id/period/respond` | 필요 | 기간 수락/거절 |
| POST | `/api/battles/:id/stock` | 필요 | 종목 선택 (양쪽 완료 시 active 전환) |
| POST | `/api/battles/:id/cancel` | 필요 | 배틀 취소 (active 전, 참가비 환불) |
| POST | `/api/battles/tick` | 필요 | 가격 업데이트 + 기간 만료 종료 처리 (cron용) |

### 개미콩 처리 방식

| 이벤트 | 처리 | 트랜잭션 타입 |
|--------|------|-------------|
| 배틀 생성 | 양쪽 50콩 차감 (Serializable 트랜잭션) | `battle_entry` |
| 배틀 취소 | 양쪽 50콩 환불 | `battle_refund` |
| 승리 | 100콩 지급 (멱등, referenceId 체크) | `battle_win` |
| 패배 | 20콩 위로금 지급 | `battle_lose` |
| 무승부 | 양쪽 50콩 지급 | `battle_draw` |
| 3연승+ | 30콩 연승 보너스 | `streak_bonus` |

### 보상/랭크 처리

- 승리: rankScore +30, winCount +1, currentWinStreak +1
- 패배: rankScore -10 (최소 0), loseCount +1, currentWinStreak 초기화
- 무승부: rankScore +5, drawCount +1, currentWinStreak 초기화
- 모든 보상은 `rewardService.processResult()` → DB 트랜잭션으로 일괄 처리
- `grantBattleReward()`의 referenceId+type 조합으로 중복 지급 방지 (멱등성)

### 검증 결과

| 항목 | 결과 |
|------|------|
| `cd server && npx tsc --noEmit` | 에러 없음 |
| `cd mobile && npx tsc --noEmit` | 에러 없음 |
| 배틀 생성 (POST /battles) | 201 Created, status: pending_period |
| 참가비 차감 확인 | 양쪽 500 → 450 (-50콩) |
| 기간 수락 | pending_stock_selection, finalPeriod: 1d |
| 종목 선택 (1명) | pending_stock_selection, participants: 1 |
| 종목 선택 (2명) → 배틀 시작 | active, startAt 설정, 시작가 기록 |
| 배틀 목록 조회 | 1건, active 상태 |
| Tick (가격 업데이트) | updated: 1, finished: 0 |
| 수익률/스케일 갱신 | 민두개미 -0.13% (scale 0.98), 철수개미 +0.82% (scale 1.02) |
| 중복 배틀 방지 | 409 "이미 진행 중인 배틀이 있습니다" |

### Troubleshooting Notes

#### 2026-06-20: validate 미들웨어와 zod 스키마 구조 불일치

**증상**: `POST /api/battles` 호출 시 `{"error":{"code":"VALIDATION_ERROR","message":"Invalid request data"}}`

**원인**: `validate()` 미들웨어는 `schema.parse(req.body)`로 body를 직접 파싱하는데, battle.routes.ts에서 `z.object({ body: z.object({...}) })` 형태로 이중 래핑하여 `req.body`를 `{ body: { opponentId, ... } }` 구조로 검증하려 했음.

**해결**: 기존 friend.routes.ts 패턴과 동일하게 `z.object({ opponentId, proposedPeriod })` 형태로 body 스키마만 직접 전달.

#### 2026-06-20: /tick 라우트가 /:id에 매칭되는 문제

**증상**: `POST /api/battles/tick` 호출 시 `tick`이 `:id` 파라미터로 매칭됨.

**원인**: Express 라우트 등록 순서에서 `/:id`가 `/tick`보다 먼저 매칭.

**해결**: `/tick` 라우트를 `/:id` 라우트보다 먼저 등록.

### 다음 단계

1. 배틀 모바일 화면 구현 (BattleRequest, PeriodNegotiation, StockSelect, BattleProgress, BattleResult)
2. Shop/Inventory 구현 (Phase 4)
3. ~~Ranking + MyPage 통계 (Phase 5)~~ → 완료

---

## Phase 4: 상점 + 꾸미기

**목표**: 개미콩으로 아이템 구매, 보유 아이템 관리, 개미 캐릭터 장착/해제

**상태**: 완료 (2026-06-20)

### 생성/수정 파일

**신규 생성**:
- `server/src/services/inventory.service.ts` — 상점 아이템 조회, 구매(중복 방지, 레저 차감), 인벤토리, 장착/해제
- `server/src/controllers/shop.controller.ts` — 상점 API 핸들러
- `server/src/routes/shop.routes.ts` — 상점 라우트 + zod 검증
- `mobile/src/services/shop.service.ts` — 상점 API 호출 래퍼
- `mobile/src/store/shopStore.ts` — Zustand 상점 스토어

**수정**:
- `server/src/routes/index.ts` — shop 라우트 등록

### API 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/shop/items` | 필요 | 상점 아이템 목록 (?category 필터) |
| POST | `/api/shop/purchase` | 필요 | 아이템 구매 (개미콩 차감, 중복 방지) |
| GET | `/api/shop/inventory` | 필요 | 보유 아이템 목록 |
| POST | `/api/shop/inventory/equip` | 필요 | 아이템 장착 |
| POST | `/api/shop/inventory/unequip` | 필요 | 아이템 해제 |

### 장착 시스템

카테고리별 User 필드 매핑:

| 카테고리 | User 필드 | 저장 값 |
|---------|----------|--------|
| hat | equippedHatId | 아이템 emoji |
| glasses | equippedGlassesId | 아이템 emoji |
| expression | equippedExpressionId | 아이템 emoji |
| outfit | equippedOutfitId | 아이템 emoji |
| background | equippedBackgroundId | 아이템 emoji |
| title | equippedTitleId | 아이템 emoji |

### 검증 결과

| 항목 | 결과 |
|------|------|
| `cd server && npx tsc --noEmit` | 에러 없음 |
| `cd mobile && npx tsc --noEmit` | 에러 없음 |
| GET /api/shop/items | 200 OK, 23개 아이템 |
| GET /api/shop/items?category=hat | 200 OK, 카테고리 필터 정상 |
| POST /api/shop/purchase | 200 OK, 개미콩 차감, userItem 반환 |
| POST /api/shop/purchase (중복) | 409 "이미 보유한 아이템입니다" |
| GET /api/shop/inventory | 200 OK, 보유 아이템 목록 |
| POST /api/shop/inventory/equip | 200 OK, User.equippedHatId 등 갱신 |
| POST /api/shop/inventory/unequip | 200 OK, 해당 필드 null 전환 |

---

## Phase 5: 랭킹 + 마이페이지 통계

**목표**: 전체/친구 랭킹, 유저 전적 통계 조회

**상태**: 완료 (2026-06-20)

### 생성/수정 파일

**신규 생성**:
- `server/src/services/ranking.service.ts` — 전체 랭킹(rankScore desc, winCount desc), 친구 랭킹, 유저 전적 통계(최근 5배틀 포함)
- `server/src/controllers/ranking.controller.ts` — 랭킹 API 핸들러
- `server/src/routes/ranking.routes.ts` — 랭킹 라우트 (authMiddleware)
- `mobile/src/services/ranking.service.ts` — 랭킹 API 호출 래퍼
- `mobile/src/store/rankingStore.ts` — Zustand 랭킹 스토어

**수정**:
- `server/src/routes/index.ts` — rankings 라우트 등록

### API 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/rankings/global` | 필요 | 전체 랭킹 (?limit, 기본 50) + myRank |
| GET | `/api/rankings/friends` | 필요 | 친구 랭킹 (나+친구) + myRank |
| GET | `/api/rankings/stats/me` | 필요 | 내 전적 통계 + 최근 5배틀 |
| GET | `/api/rankings/stats/:id` | 필요 | 유저 전적 통계 + 최근 5배틀 |

### 랭킹 정렬 기준

1차: rankScore 내림차순, 2차: winCount 내림차순

myRank 계산: rankScore가 더 높거나, 동점일 때 winCount가 더 높은 유저 수 + 1

### 전적 통계 응답

```json
{
  "user": { "...userFields", "rankName": "브론즈 개미" },
  "stats": {
    "totalBattles": 0,
    "winRate": 0,
    "winCount": 0,
    "loseCount": 0,
    "drawCount": 0,
    "currentWinStreak": 0,
    "bestWinStreak": 0
  },
  "recentBattles": []
}
```

### 검증 결과

| 항목 | 결과 |
|------|------|
| `cd server && npx tsc --noEmit` | 에러 없음 |
| `cd mobile && npx tsc --noEmit` | 에러 없음 |
| GET /api/rankings/global | 200 OK, 3명 랭킹, myRank: 1 |
| GET /api/rankings/friends | 200 OK, 2명(나+친구), myRank: 2 |
| GET /api/rankings/stats/me | 200 OK, 전적 통계 + rankName |
| GET /api/rankings/stats/:id | 200 OK, 타 유저 전적 통계 |

### 다음 단계

1. Phase 6: 폴리시 (빈 상태, 에러 상태, 로딩 상태, 안전 문구, 차트, 개미 스케일 애니메이션)
