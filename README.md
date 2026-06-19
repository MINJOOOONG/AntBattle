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
- **개미 크기 연출**: 수익률이 높은 유저의 개미가 더 크게 표시
- **개미콩 보상**: 승리/패배/무승부 시 시스템이 개미콩 지급 (도박 아님)
- **개미 꾸미기**: 모자, 안경, 표정, 의상, 배경, 칭호 등 커스터마이징
- **랭크 시스템**: 브론즈 개미 ~ 개미왕까지 6단계
- **친구 시스템**: ID로 검색, 친구 추가, 친구에게 배틀 신청

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | React Native (Expo) |
| Language | TypeScript |
| State Management | Zustand |
| Navigation | React Navigation |
| Animation | React Native Reanimated / Animated |
| Data | Mock 데이터 (1차 MVP) |
| Auth | Mock Auth (추후 Supabase/Firebase 전환 가능) |

## 폴더 구조

```
src/
├── components/       # 공통 UI 컴포넌트
├── screens/          # 화면 컴포넌트
│   ├── auth/         # Login, Signup
│   ├── home/         # Home
│   ├── battle/       # BattleRequest, PeriodNegotiation, StockSelect, BattleProgress, BattleResult
│   ├── social/       # FriendSearch, FriendList
│   ├── shop/         # Shop, AntCustomize
│   ├── ranking/      # Ranking
│   └── profile/      # MyPage
├── navigation/       # React Navigation 설정
├── services/         # 비즈니스 로직 서비스 레이어
│   ├── auth.ts
│   ├── user.ts
│   ├── friend.ts
│   ├── battle.ts
│   ├── market-data.ts          # MarketDataService 인터페이스
│   ├── mock-market-data.ts     # Mock 구현체
│   ├── reward.ts
│   ├── inventory.ts
│   └── ranking.ts
├── store/            # Zustand 스토어
├── types/            # TypeScript 타입 정의
├── data/             # Mock 데이터
├── utils/            # 유틸리티 함수
└── constants/        # 상수 (색상, 랭크 기준 등)
```

## 실행 방법

```bash
# 의존성 설치
npm install

# Expo 개발 서버 실행
npx expo start

# iOS 시뮬레이터
npx expo start --ios

# Android 에뮬레이터
npx expo start --android
```

## 1차 MVP 범위

### 포함

- 회원가입 / 로그인 (mock)
- 친구 검색 / 추가
- 1:1 배틀 신청 및 기간 협상
- 한국 주식 종목 선택 (mock 데이터)
- 배틀 진행 (수익률 계산, 개미 크기 연출)
- 배틀 종료 및 결과
- 개미콩 보상
- 개미 꾸미기 상점
- 랭크 / 랭킹
- 마이페이지

### 제외

- 실제 증권 계좌 연결
- 실제 주식 주문 / 자동매매
- 실제 돈 베팅 / 현금성 보상
- 종목 추천 / AI 매매 추천
- API key/secret 프론트엔드 저장

## 향후 확장 계획

1. **실제 시세 연동**: 토스증권 Open API 등 증권/시세 API 연결 (MarketDataService 인터페이스 교체)
2. **Pro 구독**: 추가 배틀 티켓, 광고 제거, 프리미엄 통계
3. **시즌 시스템**: 시즌패스, 한정 스킨/칭호
4. **소셜 확장**: 프라이빗 리그, 결과 카드 공유
5. **Backend 분리**: Supabase/Firebase/Node.js API 서버 구축

## 안전 문구

> 개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다. 표시되는 수익률과 종목 정보는 게임/학습 목적의 콘텐츠입니다.
