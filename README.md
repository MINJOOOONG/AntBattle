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
| Mobile | React Native (Expo 56), TypeScript |
| State | Zustand |
| Navigation | React Navigation (native stack, bottom tabs) |
| HTTP Client | Axios |
| Chart | react-native-svg |
| Animation | React Native Animated API |
| Infra | Docker Compose |

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
│   ├── prisma/
│   │   ├── schema.prisma          # 10 models
│   │   ├── seed.ts                # mock stocks, shop items, test users
│   │   └── migrations/
│   └── src/
│       ├── index.ts, app.ts
│       ├── config/env.ts          # zod 환경변수 검증
│       ├── middleware/            # auth, errorHandler, validate
│       ├── routes/                # auth, friend, stock, user, battle, shop, ranking
│       ├── controllers/           # 각 도메인 HTTP 핸들러
│       ├── services/              # 비즈니스 로직
│       │   ├── auth.service.ts
│       │   ├── ant-bean.service.ts
│       │   ├── friend.service.ts
│       │   ├── battle.service.ts
│       │   ├── reward.service.ts
│       │   ├── inventory.service.ts
│       │   ├── ranking.service.ts
│       │   └── market-data/       # IMarketDataService + Mock 구현체
│       ├── utils/                 # jwt, rank, battle-calc, errors
│       └── types/
│
└── mobile/
    ├── app.json
    ├── package.json
    ├── tsconfig.json
    ├── App.tsx
    └── src/
        ├── components/
        │   ├── common/            # Button, EmptyState, LoadingView, ErrorView, SafetyDisclaimer
        │   ├── ant/               # AntCharacter (스케일 애니메이션)
        │   └── chart/             # MiniBarChart (react-native-svg)
        ├── screens/
        │   ├── auth/              # Splash, Login, Signup
        │   ├── home/              # Home
        │   ├── social/            # FriendSearch, FriendList
        │   └── profile/           # MyPage
        ├── navigation/            # RootNavigator, MainTabNavigator, types
        ├── services/              # API 호출 래퍼 (auth, user, friend, stock, battle, shop, ranking)
        ├── store/                 # Zustand (auth, friend, battle, shop, ranking)
        ├── types/                 # models.ts, enums.ts, api.ts
        ├── constants/             # colors.ts, ranks.ts, rewards.ts
        └── utils/
```

## 실행 방법

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

# 3. 모바일 실행
cd mobile
npm install
npx expo start
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

### 제외

- 실제 증권 계좌 연결
- 실제 주식 주문 / 자동매매
- 실제 돈 베팅 / 현금성 보상
- 종목 추천 / AI 매매 추천
- API key/secret 프론트엔드 저장

## 향후 확장 계획

1. **실제 시세 연동**: 증권/시세 API 연결 (IMarketDataService 인터페이스 교체)
2. **Pro 구독**: 추가 배틀 티켓, 광고 제거, 프리미엄 통계
3. **시즌 시스템**: 시즌패스, 한정 스킨/칭호
4. **소셜 확장**: 프라이빗 리그, 결과 카드 공유
5. **인프라 확장**: Redis 캐시, 별도 worker, Load Balancer

## 안전 문구

> 개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다. 표시되는 수익률과 종목 정보는 게임/학습 목적의 콘텐츠입니다.
