# Design

개미배틀 앱의 디자인 가이드. 현재 구현은 Expo React Native 기반이며, 귀여운 소셜 게임 톤을 유지하되 실제 투자/도박 앱처럼 보이지 않도록 한다.

## 톤앤매너

- 주식 수익률을 소재로 한 가벼운 소셜 게임
- 개미 캐릭터가 앱의 주인공
- 밝고 직관적인 모바일 UX
- 증권앱처럼 딱딱하거나 도박앱처럼 자극적인 인상은 피한다
- 투자 조언, 리딩방, 자동매매, 현금 보상처럼 오해될 표현을 쓰지 않는다

## 디자인 원칙

1. **게임 앱답게**: 금융 거래 앱이 아니라 친구와 겨루는 캐주얼 게임으로 보이게 한다.
2. **캐릭터 중심**: 홈, 배틀, 프로필에서 개미 캐릭터를 명확한 시각 중심으로 둔다.
3. **명확한 액션**: 주요 버튼은 48px 이상 높이와 충분한 터치 영역을 유지한다.
4. **모바일 우선**: 작은 화면에서 한 손 조작, 읽기 쉬운 여백, 짧은 문구를 우선한다.
5. **안전한 카피**: 수익률은 게임 결과 지표로만 표현하고 매수/매도 유도 문구를 쓰지 않는다.

## 현재 색상 토큰

`mobile/src/constants/colors.ts` 기준.

```typescript
primary:       '#FF6B35'
secondary:     '#FFD166'
background:    '#FFF8F0'
surface:       '#FFFFFF'
textPrimary:   '#2D2D2D'
textSecondary: '#888888'

gainRed:       '#FF4444'
lossBue:       '#4488FF' // 현재 코드의 key 이름. 추후 lossBlue로 rename 검토
neutral:       '#888888'

border:        '#E0E0E0'
disabled:      '#CCCCCC'
danger:        '#FF4444'
success:       '#4CAF50'
```

한국 주식 시장 관습에 맞춰 상승은 빨간색, 하락은 파란색을 사용한다.

## 랭크 색상

```typescript
rankBronze: '#CD7F32'
rankSilver: '#C0C0C0'
rankGold:   '#FFD700'
rankFire:   '#FF4500'
rankLimit:  '#9B59B6'
rankKing:   '#E74C3C'
```

## 타이포그래피

React Native 기본 폰트를 사용한다. 텍스트는 화면 밀도에 맞춰 과도하게 크게 쓰지 않는다.

| 용도 | 권장 |
|------|------|
| 화면 제목 | 22-24px, bold |
| 섹션 제목 | 18-20px, bold |
| 본문 | 15-16px |
| 보조 텍스트 | 13-14px |
| 수익률/잔액 강조 | 24-28px, bold |

## 컴포넌트 규칙

### Button

현재 공통 버튼은 `mobile/src/components/common/Button.tsx`다.

- 높이: 48px
- borderRadius: 12px
- variant: `primary`, `secondary`, `danger`
- loading 상태는 ActivityIndicator 표시
- disabled 상태는 opacity 0.5

### Card

아직 별도 공통 Card 컴포넌트는 없다. 화면 내부에서 카드형 컨테이너를 만들 때는 다음을 기본값으로 한다.

- 배경: `COLORS.surface`
- border: `COLORS.border`
- borderRadius: 12-16px
- padding: 16px
- 그림자는 과하지 않게 사용

### AntCharacter

현재 `mobile/src/components/ant/AntCharacter.tsx`는 이모지 기반 캐릭터다.

- size: `small` 48, `medium` 80, `large` 120
- scale prop으로 배틀 우세/열세를 표현 (Animated.timing 300ms easeInOut)
- rankScore 기반 border color
- 장착 아이템은 hat/glasses/expression 이모지 우선 표시
- scale 변경 시 `useNativeDriver: true`로 성능 최적화

추후 일러스트나 SVG로 바꾸더라도 props 계약은 최대한 유지한다.

### EmptyState

`mobile/src/components/common/EmptyState.tsx`

- Props: `emoji`, `title`, `subtitle?`, `actionLabel?`, `onAction?`
- 데이터가 없는 화면에서 재사용 (친구 목록, 배틀 목록, 인벤토리 등)
- 중앙 정렬, 이모지 크게, 선택적 CTA 버튼

### LoadingView

`mobile/src/components/common/LoadingView.tsx`

- Props: `message?` (기본: "로딩 중...")
- 전체 화면 로딩용 ActivityIndicator + 메시지

### ErrorView

`mobile/src/components/common/ErrorView.tsx`

- Props: `message`, `onRetry?`
- 에러 이모지 + 메시지 + 선택적 "다시 시도" 버튼

### SafetyDisclaimer

`mobile/src/components/common/SafetyDisclaimer.tsx`

- Props 없음 (고정 문구)
- 안전 문구를 한곳에서 관리, 여러 화면에서 재사용

### MiniBarChart

`mobile/src/components/chart/MiniBarChart.tsx`

- Props: `data: { label, value, color }[]`, `height?`
- react-native-svg 기반 SVG 막대 차트
- 승/패/무 전적 시각화용

## 구현된 화면

### Auth Stack

- **SplashScreen**: 앱 로고 + 안전 문구(SafetyDisclaimer), 1.5초 후 Login으로 이동
- **LoginScreen**: handle + password 입력, Button.loading 상태, Alert 에러 표시
- **SignupScreen**: email, nickname, handle, password, confirm 입력

### Main Tab

- **Home**: 프로필 카드(AntCharacter), 전적 요약, 연승 배너, 소셜 메뉴, SafetyDisclaimer
- Battle placeholder
- Shop placeholder
- **MyPage**: 프로필, 개미콩 잔액, 전적(MiniBarChart), 로그아웃, SafetyDisclaimer

### Social Stack

- **FriendSearchScreen**: handle 검색, 친구 요청 전송
- **FriendListScreen**: 탭(친구/요청), EmptyState 컴포넌트, RefreshControl, 수락/거절

### 상태 처리

| 화면 | 로딩 | 에러 | 빈 상태 |
|------|------|------|--------|
| HomeScreen | LoadingView | - | - |
| MyPageScreen | LoadingView | - | - |
| FriendListScreen | RefreshControl | - | EmptyState |
| FriendSearchScreen | isLoading | Alert | 인라인 |
| LoginScreen | Button.loading | Alert | - |
| SignupScreen | Button.loading | Alert | - |
| SplashScreen | 타이머 | - | - |

## 예정 화면 가이드

### Battle

핵심 시각 구조:

```
상단: 상대, 남은 시간, 상태
중앙: 양쪽 개미 캐릭터 크기 비교
하단: 선택 종목, 현재가, 수익률, 간단한 흐름
```

배틀 화면에서 금지할 표현:

- 베팅
- 판돈
- 올인
- 매수 추천
- 이 종목 사세요
- 수익 보장

허용 가능한 표현:

- 배틀 신청
- 종목 선택
- 현재 우세
- 반등 기도 중
- 개미콩 보상

### Shop

아이템 카테고리:

- hat
- glasses
- expression
- outfit
- background
- title

구매는 유저 간 재화 이동이 아니라 시스템 상점 구매다. 개미콩을 현금성 가치처럼 표현하지 않는다.

### MyPage

표시 우선순위:

1. 내 개미 캐릭터
2. nickname, handle
3. 랭크와 전적
4. 개미콩 잔액
5. 안전 문구와 로그아웃

## 마이크로카피

### 홈

- "개미 입장 완료"
- "오늘은 누구 종목이 더 잘 버틸까?"
- "친구와 수익률 배틀을 시작해보세요"

### 친구

- "개미 친구를 찾아볼까요?"
- "이미 친구 요청을 보냈어요"
- "친구가 되면 배틀을 신청할 수 있어요"

### 종목 선택

- "종목 고르는 중... 신중한 척하는 중"
- "이 종목으로 배틀할까요?"
- "상대가 고른 종목은 아직 비밀이에요"

### 배틀 진행

- "현재 우세!"
- "떡상 개미 출몰!"
- "반등 기도 중..."
- "물림 주의"
- "역전! 개미판 뒤집혔다!"

### 배틀 결과

- "개미콩 +100 획득!"
- "참가 보상 +20"
- "무승부! 둘 다 비슷한 개미"
- "오늘의 개미왕 등극!"

### 빈 상태

- 친구 없음: "아직 친구가 없어요. 개미 친구를 찾아볼까요?"
- 배틀 없음: "진행 중인 배틀이 없어요. 배틀을 신청해볼까요?"
- 아이템 없음: "아직 아이템이 없어요. 배틀에서 개미콩을 모아보세요."

## 애니메이션

### 개미 크기 변화

- AntCharacter `scale` prop 사용, `Animated.timing`으로 구현 완료
- 300ms easeInOut, `useNativeDriver: true`
- 수익률 차이에 따라 0.75-1.4 범위로 clamp
- scale prop 변경 시 자동 애니메이션 트리거

### 화면 전환

- Auth/Main 전환은 RootNavigator에서 인증 상태 기준으로 분기
- Stack 화면은 기본 native stack 전환
- Tab은 React Navigation bottom tabs 사용

## 안전 문구

앱 내 적절한 위치에 다음 문구를 유지한다.

> 개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다. 표시되는 수익률과 종목 정보는 게임/학습 목적의 콘텐츠입니다.
