# 개미배틀 (AntBattle)

> 친구와 한국 주식 종목을 하나씩 고르고, 정해진 기간 동안 수익률로 1:1 배틀하는 소셜 투자 게임 앱

"내 종목이 네 종목보다 잘 오를까?"

## 핵심 컨셉

- 친구와 각자 한국 주식 종목을 고르고, 실제 시장 가격(또는 mock 데이터) 기준으로 수익률을 겨룬다
- 배틀에서 이기면 **개미콩**을 얻고, 개미콩으로 내 개미 캐릭터를 꾸밀 수 있다
- 실제 돈을 걸거나 실제 주식을 매매하는 앱이 **아니다**

## 주요 기능

- **1:1 수익률 배틀**: 친구와 종목 하나씩 골라 수익률 대결
- **기간 협상**: 내일 종가 ~ 1개월까지, 상대와 합의하여 기간 결정
- **개미 크기 연출**: 수익률이 높은 유저의 개미가 더 크게 표시 (300ms 애니메이션)
- **개미콩 보상**: 승리/패배/무승부 시 시스템이 개미콩 지급 (도박 아님)
- **개미 꾸미기**: 모자, 안경, 표정, 의상, 배경, 칭호 등 커스터마이징
- **랭크 시스템**: 브론즈 개미 ~ 개미왕까지 6단계
- **친구 시스템**: 핸들로 검색, 친구 추가, 친구에게 배틀 신청
- **전적/랭킹**: 전체/친구 랭킹, 전적 통계, 막대 차트 시각화

## 기술 스택

| 영역 | 기술 |
|------|------|
| Server | Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | bcrypt, JWT |
| Validation | zod |
| Rate Limiting | express-rate-limit |
| Testing | Vitest |
| Mobile | React Native (Expo), TypeScript |
| State | Zustand |
| Navigation | React Navigation (native stack, bottom tabs) |
| HTTP Client | Axios |
| Chart | react-native-svg |
| Animation | React Native Animated API |
| Server Hosting | Render |
| Web Hosting | Vercel (Expo web export) |
| Infra | Docker Compose (로컬 개발) |

## 폴더 구조

```
AntBattle/
├── docker-compose.yml
├── .gitignore
├── .env.example
├── docs/
│   ├── architecture.md
│   ├── design.md
│   ├── claude.md
│   └── PROJECT_LOG.md
│
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── prisma/
│   │   ├── schema.prisma          # 10 models
│   │   ├── seed.ts                # mock stocks, shop items, test users
│   │   └── migrations/
│   └── src/
│       ├── index.ts, app.ts
│       ├── config/env.ts          # zod 환경변수 검증
│       ├── constants/game-config.ts  # 배틀/스케일 상수
│       ├── middleware/            # auth, errorHandler, validate, rateLimiter
│       ├── routes/                # auth, friend, stock, user, battle, shop, ranking
│       ├── controllers/           # 각 도메인 HTTP 핸들러
│       ├── services/              # 비즈니스 로직
│       │   ├── auth.service.ts
│       │   ├── ant-bean.service.ts
│       │   ├── user.service.ts
│       │   ├── friend.service.ts
│       │   ├── battle.service.ts
│       │   ├── reward.service.ts
│       │   ├── inventory.service.ts
│       │   ├── ranking.service.ts
│       │   ├── market-data/       # IMarketDataService + Mock 구현체
│       │   └── __tests__/         # reward.service.test.ts
│       ├── utils/                 # jwt, rank, battle-calc, errors, user-select
│       │   └── __tests__/         # battle-calc.test.ts, rank.test.ts
│       └── types/
│
└── mobile/
    ├── app.json
    ├── package.json
    ├── tsconfig.json
    ├── vercel.json
    ├── App.tsx
    └── src/
        ├── components/
        │   ├── common/            # Button, EmptyState, LoadingView, ErrorView, SafetyDisclaimer, SoftCard, PastelButton 등
        │   ├── ant/               # AntCharacter (스케일 애니메이션), ClayAntCharacter
        │   ├── chart/             # MiniBarChart (react-native-svg)
        │   └── icons/             # HomeIcon, BattleIcon, ShopIcon, MyPageIcon
        ├── screens/
        │   ├── auth/              # Splash, Login, Signup
        │   ├── home/              # Home
        │   ├── battle/            # BattleList, BattleRequest, PeriodNegotiation, StockSelect, BattleProgress, BattleResult
        │   ├── shop/              # Shop
        │   ├── social/            # FriendSearch, FriendList
        │   └── profile/           # MyPage
        ├── navigation/            # RootNavigator, MainTabNavigator, types
        ├── services/              # API 호출 래퍼 (auth, user, friend, stock, battle, shop, ranking)
        ├── store/                 # Zustand (auth, friend, battle, shop, ranking)
        ├── hooks/                 # useBGM
        ├── types/                 # models.ts, enums.ts, api.ts
        ├── constants/             # colors.ts, ranks.ts, rewards.ts, expressionAssets.ts, fonts.ts
        └── utils/
```

## 배포 현황

| 영역 | 호스팅 | URL |
|------|--------|-----|
| API 서버 | Render | https://antbattle.onrender.com/api |
| 웹 앱 | Vercel | Expo web export (자동 배포) |

## 실행 방법

### 로컬 개발

```bash
# 1. PostgreSQL 시작
docker compose up -d postgres

# 2. 서버 실행
cd server
npm install
npx prisma migrate deploy
npx prisma generate
npm run db:seed              # mock 데이터 삽입 (최초 1회)
npm run dev                  # http://localhost:3000

# 3. 모바일 앱 실행
cd mobile
npm install
npm start                    # http://localhost:8081

# 4. 테스트 실행
cd server
npm test                     # vitest run
npm run test:watch           # vitest (watch mode)
```

### 테스트 계정

| 핸들 | 비밀번호 |
|------|---------|
| ant_mindoo | test1234 |
| ant_chulsoo | test1234 |

## API 엔드포인트

| 영역 | 주요 경로 |
|------|----------|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `GET /api/users/me`, `GET /api/users/me/beans` |
| Friends | `GET /api/friends`, `POST /api/friends/search`, `POST /api/friends/request` |
| Stocks | `GET /api/stocks`, `GET /api/stocks/:id` |
| Battles | `POST /api/battles`, `POST /api/battles/:id/stock`, `POST /api/battles/tick` |
| Shop | `GET /api/shop/items`, `POST /api/shop/purchase`, `POST /api/shop/inventory/equip` |
| Rankings | `GET /api/rankings/global`, `GET /api/rankings/friends`, `GET /api/rankings/stats/me` |

Rate Limiting 적용: 글로벌 200회/15분, 인증 엔드포인트 10회/15분

## MVP 범위

### 포함

- 회원가입 / 로그인 (bcrypt + JWT)
- 친구 검색 / 추가 / 수락 / 거절
- 1:1 배틀 신청 및 기간 협상
- 한국 주식 종목 선택 (mock 15종)
- 배틀 진행 (수익률 계산, 개미 크기 연출)
- 배틀 종료 및 결과 (보상 + 랭크 점수)
- 개미콩 보상 (레저 기반)
- 개미 꾸미기 상점 (23개 아이템)
- 전체/친구 랭킹 + 전적 통계
- 마이페이지 (전적 차트, 프로필)
- UX 폴리시 (빈/로딩/에러 상태, 안전 문구, 애니메이션)
- 서버 유닛 테스트 (Vitest)
- API Rate Limiting
- 접근성 레이블 (주요 화면)

### 제외

- 실제 증권 계좌 연결
- 실제 주식 주문 / 자동매매
- 실제 돈 베팅 / 현금성 보상
- 종목 추천 / AI 매매 추천
- API key/secret 프론트엔드 저장

## 코드 품질

- **테스트**: Vitest 기반 유닛 테스트 (battle-calc, rank, reward 서비스)
- **타입 안전**: `any` 타입 전면 제거, Prisma 타입 + unknown 타입 가드 사용
- **에러 처리**: Zustand 스토어에 `error` 상태 추가, 빈 catch 블록 제거
- **상수 관리**: 매직 넘버 상수화 (`game-config.ts`)
- **코드 구조**: 컨트롤러-서비스 분리, SAFE_USER_SELECT 공통화
- **보안**: Rate Limiting, 트랜잭션 원자성 보장, DB 인덱스 최적화
- **접근성**: 주요 화면 accessibilityLabel/accessibilityRole 적용

## 향후 확장 계획

1. **실제 시세 연동**: 증권/시세 API 연결 (IMarketDataService 인터페이스 교체)
2. **Pro 구독**: 추가 배틀 티켓, 광고 제거, 프리미엄 통계
3. **시즌 시스템**: 시즌패스, 한정 스킨/칭호
4. **소셜 확장**: 프라이빗 리그, 결과 카드 공유
5. **인프라 확장**: Redis 캐시, 별도 worker, Load Balancer

## 발표 피칭 영상

- [CEO 소개 피칭 영상](docs/ceo-intro/index.html)

## 안전 문구

> 개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다. 표시되는 수익률과 종목 정보는 게임/학습 목적의 콘텐츠입니다.
