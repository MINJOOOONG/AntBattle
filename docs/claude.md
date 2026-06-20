# Claude Instructions

개미배틀 프로젝트에서 Claude와 자동화 에이전트가 따라야 할 규칙과 현재 컨텍스트.

## 프로젝트 개요

개미배틀은 친구와 한국 주식 종목을 하나씩 고르고, 정해진 기간 동안 수익률로 1:1 배틀하는 소셜 투자 게임 앱이다. 실제 돈을 걸거나 실제 주식을 거래하는 앱이 아니다.

현재 구조는 `server/` Express API와 `mobile/` Expo React Native 앱으로 분리되어 있다.

## 절대 금지 사항

### 구현 금지

- 실제 증권 계좌 연결 코드
- 실제 주식 주문 API 호출
- 매수/매도/정정/취소 주문 기능
- 자동매매 로직
- API key, secret을 모바일 앱 또는 프론트엔드에 저장
- 사용자 증권 계좌 비밀번호 입력 UI
- 실제 돈 베팅/결제 기능
- 개미콩 현금 환전 기능
- 유저 간 개미콩 송금
- 승자가 패자의 개미콩을 빼앗는 로직
- 종목 추천 또는 AI 매매 추천 기능

### 표현 금지

- "베팅", "판돈", "도박", "올인"
- "매수 추천", "수익 보장", "따라 사기"
- 실제 돈이 걸려 있다고 오해될 수 있는 표현
- 투자 자문으로 오해될 수 있는 표현

## 기술 스택

### Server

- Express
- TypeScript
- Prisma
- PostgreSQL
- bcrypt
- JWT
- zod

### Mobile

- Expo React Native
- TypeScript
- Zustand
- React Navigation
- Axios
- AsyncStorage

## 현재 구현 상태

| 영역 | 상태 |
|------|------|
| Project scaffold | 완료 |
| PostgreSQL + Prisma schema | 완료 |
| Auth API | 완료 |
| AntBean ledger | 완료 |
| User/Friend/Stock API | 진행 중 |
| Mobile auth/session | 진행 중 |
| Mobile friend/profile screens | 진행 중 |
| Battle API/screens | 예정 |
| Shop/Inventory | 예정 |
| Ranking | 예정 |

## 아키텍처 원칙

### 서버

- HTTP handler는 `controllers/`에 둔다.
- 라우팅은 `routes/`에 둔다.
- 비즈니스 로직은 `services/`에 둔다.
- DB 접근은 Prisma를 사용한다.
- request body 검증은 zod schema와 `validate` middleware를 사용한다.
- 인증이 필요한 라우트는 `authMiddleware`를 사용한다.
- API 응답에 `passwordHash`를 절대 포함하지 않는다.

### 모바일

- 화면은 `screens/`에 둔다.
- API 호출 래퍼는 `services/`에 둔다.
- 로그인 세션/공유 상태는 Zustand store에 둔다.
- 타입은 `types/models.ts`, `types/api.ts`, `types/enums.ts`에 둔다.
- 색상/랭크/보상 값은 `constants/`에 둔다.

### 데이터 흐름

```
Mobile Screen -> Zustand Store -> Mobile Service -> API Client
Express Route -> Controller -> Service -> Prisma -> PostgreSQL
```

## MarketDataService 원칙

시세 데이터는 서버의 `IMarketDataService` 인터페이스를 통해 접근한다.

- 현재 구현은 mock/DB 기반이다.
- 실제 시세 API가 필요하면 서버 adapter로만 추가한다.
- 모바일 앱에 외부 증권 API key를 저장하지 않는다.
- 시세 조회만 허용하고 주문 기능은 구현하지 않는다.

## AntBean 원칙

- 개미콩은 `AntBeanTransaction` ledger로 관리한다.
- 잔액은 거래 내역 합산으로 계산한다.
- 지급은 시스템이 한다.
- 승리 +100, 패배 +20, 무승부 +50, 연승 보너스 +30 기준을 유지한다.
- 아이템 구매는 음수 transaction으로 기록한다.
- 유저 간 송금과 패자 재화 약탈은 금지한다.

## 코딩 컨벤션

### 파일 네이밍

- React 컴포넌트: PascalCase (`HomeScreen.tsx`)
- 서비스 파일: kebab 또는 dot suffix는 기존 패턴 우선 (`auth.service.ts`)
- Store: camelCase (`authStore.ts`)
- 타입/인터페이스: PascalCase
- 상수: UPPER_SNAKE_CASE 또는 기존 constants export 패턴

### 언어

- UI 텍스트: 한국어
- 변수/함수/타입명: 영어
- 주석: 한국어 허용
- 에러 메시지: 사용자에게 보이는 메시지는 한국어

## 배틀 핵심 로직

### 수익률

```typescript
returnRate = (currentPrice - startPrice) / startPrice * 100;
```

### 개미 크기

```text
base scale: 1.0
leader scale: 1.05-1.4
trailer scale: 0.75-0.95
```

수익률 차이 기반으로 계산하고 0.75-1.4 범위로 clamp한다.

### 상태 흐름

```
pending_period -> pending_stock_selection -> active -> finished
              -> period_rejected -> pending_period
```

## Migration 운영 규칙

현재 환경에서는 `prisma migrate dev`가 non-interactive 문제로 실패할 수 있다.

1. migration SQL 파일을 직접 작성한다.
2. `npx prisma migrate deploy`로 적용한다.
3. `npx prisma generate`를 실행한다.
4. 필요하면 `npm run db:seed`를 실행한다.

## 안전 문구

앱 내 적절한 위치에 반드시 포함한다.

> 개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다. 표시되는 수익률과 종목 정보는 게임/학습 목적의 콘텐츠입니다.

## 다음 우선순위

1. Phase 2 변경사항 타입체크와 API 검증
2. Friend/User/Stock 모바일 화면과 서버 응답 shape 정합성 확인
3. Battle API 설계 및 구현
4. Battle 모바일 화면 구현
5. Shop/Inventory 구현
6. Ranking과 프로필 통계 구현
