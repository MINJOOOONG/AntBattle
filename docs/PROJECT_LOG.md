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

**기준일**: 2026-06-25

| Phase | 상태 |
|-------|------|
| Phase 0: 프로젝트 스캐폴딩 | 완료 |
| Phase 1: Auth + 유저 + AntBean 레저 | 완료 |
| Phase 2: 유저/친구/종목 API + 모바일 기본 화면 | 완료 |
| Phase 3: 배틀 시스템 | 완료 |
| Phase 4: 상점 + 꾸미기 | 완료 |
| Phase 5: 랭킹 + 마이페이지 통계 | 완료 |
| Phase 6: 폴리시 | 완료 |
| Phase 7: 코드 품질 개선 | 완료 |

### 배포 현황

| 영역 | 호스팅 | URL |
|------|--------|-----|
| API 서버 | Render | https://antbattle.onrender.com/api |
| 웹 앱 | Vercel | Expo web export (자동 배포) |

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

### 검증 결과

| 항목 | 결과 |
|------|------|
| `tsc --noEmit` | 에러 없음 |
| 회원가입 API | 201 Created, passwordHash 미포함, antBeans: 500 (레저 기반) |
| 로그인 API | 200 OK, JWT 발급, antBeans 잔액 반환 |
| `/api/auth/me` (유효 토큰) | 200 OK, 유저 정보 + antBeans 반환 |
| 중복 email/handle 가입 | 409, 적절한 에러 메시지 |

### Troubleshooting Notes

#### 2026-06-18: `prisma migrate dev` non-interactive 환경 에러

**해결**: SQL 직접 작성 + `prisma migrate deploy` 방식으로 전환. 이후 모든 migration은 이 방식을 따름.

---

## Phase 2: 유저/친구/종목 API + 모바일 기본 화면

**목표**: 인증 이후 사용할 유저 프로필, 친구, 종목 조회 API와 모바일 기본 화면/스토어/서비스 연결

**상태**: 완료 (2026-06-20)

### 생성 파일 요약

**Server**: friend/stock/user controller, service, routes, market-data 모듈
**Mobile**: AntCharacter, Button, Navigation, Auth/Home/Social/Profile 화면, auth/friend/stock/user 서비스, authStore/friendStore

### 검증 결과

| 항목 | 결과 |
|------|------|
| `cd server && npx tsc --noEmit` | 에러 없음 |
| `cd mobile && npx tsc --noEmit` | 에러 없음 |
| GET /api/users/me | 200 OK |
| POST /api/friends/search | 200 OK |
| GET /api/stocks | 200 OK, 15개 종목 |

---

## Phase 3: 배틀 시스템

**목표**: 친구와 1:1 주식 수익률 배틀 전체 플로우 구현

**상태**: 완료 (2026-06-20)

### 생성 파일 요약

- `server/src/services/battle.service.ts` — 배틀 생성, 기간 협상, 종목 선택, 시작, 취소, tick
- `server/src/services/reward.service.ts` — 보상/랭크 점수 처리 (DB 트랜잭션)
- `server/src/controllers/battle.controller.ts` + `routes/battle.routes.ts`
- `mobile/src/services/battle.service.ts` + `store/battleStore.ts`

### 배틀 상태 흐름

```
pending_period → pending_stock_selection → active → finished
             ↘ period_rejected → pending_period (재제안)
             ↘ cancelled (참가비 환불)
```

### 개미콩 처리

| 이벤트 | 금액 | 트랜잭션 타입 |
|--------|------|-------------|
| 배틀 생성 | -50 (양쪽) | battle_entry |
| 배틀 취소 | +50 (양쪽) | battle_refund |
| 승리 | +100 | battle_win |
| 패배 | +20 | battle_lose |
| 무승부 | +50 (양쪽) | battle_draw |
| 3연승+ | +30 | streak_bonus |

---

## Phase 4: 상점 + 꾸미기

**목표**: 개미콩으로 아이템 구매, 보유 아이템 관리, 개미 캐릭터 장착/해제

**상태**: 완료 (2026-06-20)

### 생성 파일 요약

- `server/src/services/inventory.service.ts` + `controllers/shop.controller.ts` + `routes/shop.routes.ts`
- `mobile/src/services/shop.service.ts` + `store/shopStore.ts`

---

## Phase 5: 랭킹 + 마이페이지 통계

**목표**: 전체/친구 랭킹, 유저 전적 통계 조회

**상태**: 완료 (2026-06-20)

### 생성 파일 요약

- `server/src/services/ranking.service.ts` + `controllers/ranking.controller.ts` + `routes/ranking.routes.ts`
- `mobile/src/services/ranking.service.ts` + `store/rankingStore.ts`

---

## Phase 6: 폴리시

**목표**: UX 폴리시 — 공통 컴포넌트(빈 상태, 에러, 로딩, 안전 문구), 개미 스케일 애니메이션, 전적 차트

**상태**: 완료 (2026-06-20)

### 생성 파일 요약

- EmptyState, LoadingView, ErrorView, SafetyDisclaimer, MiniBarChart 컴포넌트
- AntCharacter 스케일 애니메이션 (300ms easeInOut)
- 의존성 추가: react-native-svg

---

## Phase 7: 코드 품질 개선

**목표**: 테스트 추가, 에러 처리, 타입 안전, 코드 중복 제거, 보안/성능 개선, 접근성

**상태**: 완료 (2026-06-24)

### 개선 항목 (13개)

| # | 항목 | 내용 |
|---|------|------|
| 1 | 테스트 코드 추가 | Vitest 설치, battle-calc/rank/reward 테스트 (35개 케이스) |
| 2 | Zustand 에러 상태 추가 | battleStore, friendStore, rankingStore, shopStore에 error 상태 추가 |
| 3 | any 타입 제거 | inventory.service, battle.service → Prisma 타입, LoginScreen → unknown 타입 가드 |
| 4 | SAFE_USER_SELECT 공통화 | user-select.ts 생성 (FULL/RANKING/EQUIPPED), 4개 파일에서 import |
| 5 | 컨트롤러→서비스 분리 | user.service.ts 생성, user.controller에서 Prisma 직접 호출 제거 |
| 6 | 페이지네이션 추가 | 배틀 목록/랭킹 API에 limit, offset 파라미터 추가 |
| 7 | Rate Limiting 적용 | rateLimiter.ts 생성, 글로벌 200/15분, 인증 10/15분 |
| 8 | 트랜잭션 원자성 수정 | auth.service signup을 prisma.$transaction()으로 래핑 |
| 9 | DB 인덱스 추가 | Friendship 모델에 복합 인덱스 추가 |
| 10 | 매직 넘버 상수화 | game-config.ts 생성, battle-calc/battle.service에서 import |
| 11 | PriceSnapshot 최적화 | 가격 변동 1% 이상 시에만 기록 |
| 12 | periodToMs 에러 처리 | 잘못된 기간 입력 시 에러 throw |
| 13 | 접근성 레이블 추가 | HomeScreen, ShopScreen, BattleProgressScreen, LoginScreen |

### 신규 생성 파일

- `server/vitest.config.ts`
- `server/src/constants/game-config.ts`
- `server/src/middleware/rateLimiter.ts`
- `server/src/services/user.service.ts`
- `server/src/utils/user-select.ts`
- `server/src/utils/__tests__/battle-calc.test.ts`
- `server/src/utils/__tests__/rank.test.ts`
- `server/src/services/__tests__/reward.service.test.ts`

### 수정 파일

**Server**:
- `package.json` — vitest 의존성, test/test:watch 스크립트 추가
- `app.ts` — globalLimiter 적용
- `auth.routes.ts` — authLimiter 적용
- `auth.service.ts` — $transaction 래핑
- `battle.service.ts` — Prisma 타입, ENTRY_FEE 상수, 페이지네이션, PriceSnapshot 최적화
- `battle.controller.ts` — limit/offset 파싱
- `inventory.service.ts` — Prisma 타입, EQUIPPED_USER_SELECT
- `friend.service.ts` — FULL_USER_SELECT
- `ranking.service.ts` — RANKING_USER_SELECT, offset 파라미터
- `ranking.controller.ts` — offset 파싱
- `user.controller.ts` — 서비스 호출로 변경
- `battle-calc.ts` — SCALE_CONFIG import, periodToMs 에러 처리
- `prisma/schema.prisma` — Friendship 인덱스 추가

**Mobile**:
- `store/battleStore.ts` — error 상태 추가
- `store/friendStore.ts` — error 상태 추가
- `store/rankingStore.ts` — error 상태 추가
- `store/shopStore.ts` — error 상태 추가
- `screens/auth/LoginScreen.tsx` — unknown 타입 가드, 접근성 레이블
- `screens/home/HomeScreen.tsx` — 접근성 레이블
- `screens/shop/ShopScreen.tsx` — 접근성 레이블
- `screens/battle/BattleProgressScreen.tsx` — 접근성 레이블

### 검증 결과

| 항목 | 결과 |
|------|------|
| `cd server && npm test` | 35 tests passed |
| `cd server && npx tsc --noEmit` | 에러 없음 |
| `cd mobile && npx tsc --noEmit` | 에러 없음 |

---

## 전체 프로젝트 완료 요약

모든 Phase(0~7) 구현 완료. MVP 기능 전체 동작 + 코드 품질 개선 완료.

### 구현된 기능

| 영역 | 기능 |
|------|------|
| 인증 | 회원가입, 로그인, JWT, 세션 관리 |
| 유저 | 프로필 조회, 개미콩 잔액/내역 |
| 친구 | 검색, 요청, 수락/거절, 목록, 삭제 |
| 배틀 | 생성, 기간 협상, 종목 선택, 진행, 종료, 보상 |
| 상점 | 아이템 조회, 구매, 인벤토리, 장착/해제 |
| 랭킹 | 전체/친구 랭킹, 전적 통계, 페이지네이션 |
| 폴리시 | 빈/로딩/에러 상태, 안전 문구, 차트, 애니메이션 |
| 품질 | 테스트, 타입 안전, 에러 처리, 상수화, Rate Limiting, 접근성 |
| 배포 | Render (API), Vercel (웹) |
