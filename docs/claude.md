# Claude Instructions

개미배틀 프로젝트에서 Claude가 따라야 할 규칙과 컨텍스트.

## 프로젝트 개요

개미배틀은 친구와 한국 주식 종목을 하나씩 고르고, 정해진 기간 동안 수익률로 1:1 배틀하는 소셜 투자 게임 앱이다.

## 절대 금지 사항

### 구현 금지

- 실제 증권 계좌 연결 코드
- 실제 주식 주문 (매수/매도) API 호출
- 자동매매 로직
- API key, secret을 프론트엔드에 저장
- 토스증권/한국투자증권 등 실제 증권 API 호출 코드
- 사용자 증권 계좌 비밀번호 입력 UI
- 실제 돈 베팅/결제 기능
- 개미콩 현금 환전 기능
- 유저 간 개미콩 송금
- 승자가 패자의 개미콩을 빼앗는 로직
- 종목 추천 / AI 매매 추천 기능

### 디자인 금지

- 도박 앱처럼 보이는 UI (슬롯머신, 룰렛 등)
- "베팅", "판돈", "도박" 등의 용어 사용
- 실제 돈이 걸려있다고 오해할 수 있는 표현
- 투자 추천/자문으로 오해할 수 있는 표현

## 기술 스택

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State**: Zustand
- **Navigation**: React Navigation (Expo Router도 가능)
- **Data**: Mock 데이터 (1차 MVP)
- **Animation**: React Native Animated / Reanimated

## 아키텍처 원칙

### 서비스 레이어 패턴

모든 데이터 접근은 서비스 인터페이스를 통해 이루어진다. MVP에서는 mock 구현체를 사용하되, 인터페이스를 유지하여 추후 백엔드 교체가 용이하도록 한다.

```
Screen → Store → Service (interface) → MockService (구현체)
                                      → 추후 APIService (구현체)
```

### MarketDataService 추상화

시세 데이터는 반드시 `IMarketDataService` 인터페이스를 통해 접근한다. 현재는 `MockMarketDataService`를 사용하며, 추후 토스증권 Open API 등으로 교체할 수 있다. 단, 시세 조회만 허용하고 주문 기능은 구현하지 않는다.

### 보상 시스템

- 개미콩은 시스템이 지급한다 (패자에게서 빼앗지 않음)
- 승리 +100, 패배 +20, 무승부 +50, 연승 보너스 +30
- 랭크 점수: 승리 +30, 패배 -10, 무승부 +5

## 코딩 컨벤션

### 파일 구조

```
src/
├── components/       # 재사용 가능한 UI 컴포넌트
├── screens/          # 화면별 컴포넌트
├── navigation/       # 네비게이션 설정
├── services/         # 비즈니스 로직 서비스
├── store/            # Zustand 스토어
├── types/            # TypeScript 타입
├── data/             # Mock 데이터
├── utils/            # 유틸리티 함수
└── constants/        # 상수 값
```

### 네이밍

- 컴포넌트: PascalCase (`BattleProgress.tsx`)
- 서비스: camelCase (`battleService.ts`)
- 타입: PascalCase (`BattleStatus`)
- 상수: UPPER_SNAKE_CASE (`MAX_ANT_SCALE`)
- 스토어: camelCase (`useBattleStore`)

### 한국어 사용

- UI 텍스트: 한국어
- 코드/변수명: 영어
- 주석: 한국어 허용
- 타입/인터페이스: 영어

## 배틀 핵심 로직

### 수익률 계산

```
수익률 = (현재가 - 시작가) / 시작가 * 100
```

### 개미 크기 계산

```
기본 scale: 1.0
앞서는 개미: 1.05 ~ 1.4
뒤처지는 개미: 0.75 ~ 0.95
수익률 차이 기반으로 계산, clamp(0.75, 1.4)
```

### 배틀 상태 흐름

```
pending_period → pending_stock_selection → active → finished
              ↘ period_rejected (재제안) ↗
```

## 안전 문구

앱 내 적절한 위치(온보딩, 마이페이지, 배틀 시작 전)에 반드시 포함:

> "개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다. 표시되는 수익률과 종목 정보는 게임/학습 목적의 콘텐츠입니다."

## MVP 우선순위

1. 프로젝트 구조 + 타입 + mock data + 핵심 플로우 (홈/배틀/종목선택/결과/꾸미기)
2. 친구 시스템 + 배틀 신청 + 기간 협상
3. 개미콩 보상 + 랭크 + 아이템 구매/장착
4. 랭킹 + 마이페이지 + 전적/통계
5. UI 다듬기 + 애니메이션 + 빈 상태/에러/로딩
