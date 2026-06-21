# Design

개미배틀 앱의 디자인 가이드.

## 전체 컨셉

개미배틀은 주식 수익률을 친구와 겨루는 캐주얼 캐릭터 배틀 앱이다.

핵심 느낌:

- 귀여운 개미 캐릭터가 앱의 주인공
- 캐릭터 육성 앱 같은 따뜻함
- 말랑한 카드 UI, 따뜻한 여백
- 파스텔/뮤트톤 컬러
- 숫자 정보는 깔끔하고 명확하게
- 배틀 요소는 귀엽고 가볍게
- 앱을 켜자마자 "내 개미가 있는 앱"처럼 느껴지게

디자인 키워드: soft, clay, cozy, minimal, character-driven, gentle finance, casual battle, collectible ant, warm dashboard

## 디자인 원칙

1. **게임 앱답게**: 금융 거래 앱이 아니라 친구와 겨루는 캐주얼 게임으로 보이게 한다.
2. **캐릭터 중심**: 홈, 배틀, 프로필에서 개미 캐릭터를 명확한 시각 중심으로 둔다.
3. **명확한 액션**: 주요 버튼은 50px 높이와 충분한 터치 영역을 유지한다.
4. **모바일 우선**: 작은 화면에서 한 손 조작, 읽기 쉬운 여백, 짧은 문구를 우선한다.
5. **안전한 카피**: 수익률은 게임 결과 지표로만 표현하고 매수/매도 유도 문구를 쓰지 않는다.

## 컬러 팔레트

`mobile/src/constants/colors.ts` 기준.

### Primary Palette

```
BLUSH:  #CFC0BB
SKY:    #B2BCC5
STONE:  #979178
CLAY:   #987455
```

### Neutral

```
Background:     #F8F5F1
Surface:        #FFFFFF
Surface Soft:   #F1ECE8
Text Primary:   #3F3A36
Text Secondary: #7C746D
Border Soft:    #E5DDD7
```

### 수익률 (부드러운 톤, 한국 주식 관습 유지)

```
Gain Red:   #C75B5B
Loss Blue:  #5B7FB5
Neutral:    #7C746D
```

### UI

```
Border:    #E5DDD7
Disabled:  #C9C1BA
Danger:    #C75B5B
Success:   #6B9E6B
```

사용 방향:

- 전체 배경은 밝은 크림/웜화이트 계열
- 주요 카드는 화이트 또는 연한 BLUSH/SKY tint
- 기본 텍스트는 진한 브라운/스톤 계열
- 포인트 버튼은 CLAY 또는 SKY
- 보조 정보는 STONE 계열을 연하게 사용

하지 말 것:

- 쨍한 원색 사용 금지
- 기본 React Native 파란색 버튼 느낌 금지
- 차가운 증권 앱 느낌 금지
- 네온/강한 그라데이션/과한 게임 UI 금지

## 랭크 색상

```
Bronze: #CD7F32
Silver: #B0B0B0
Gold:   #D4A843
Fire:   #D4714E
Limit:  #8E6BA5
King:   #C75B5B
```

## 타이포그래피

React Native 기본 폰트를 사용한다.

| 용도 | 권장 |
|------|------|
| 화면 제목 | 22-24px, 700 |
| 섹션 제목 | 18px, 700 |
| 본문 | 15-16px |
| 보조 텍스트 | 13-14px |
| 수익률/잔액 강조 | 24-28px, 700 |

## 개미 캐릭터

`mobile/src/components/ant/AntCharacter.tsx`

View 기반 클레이 개미 캐릭터:

- 큰 둥근 머리 (C4B5A5)
- 동그란 눈 2개 (3F3A36)
- 작은 미소
- 둥근 더듬이 2개 (8B7D6B)
- 작은 몸통 (B8A896)
- 짧고 둥근 팔다리 (A89888)
- 전체적으로 회갈색/스톤/클레이 톤
- size: small(48), medium(80), large(120), hero(160)
- scale prop으로 배틀 우세/열세 표현 (Animated.timing 300ms easeInOut)
- rankScore 기반 border color
- 장착 아이템: hat/glasses/expression 이모지로 위치에 표시
- 나중에 꾸미기 아이템 확장 가능한 구조

## 공통 컴포넌트

### SoftCard

`mobile/src/components/common/SoftCard.tsx`

- borderRadius: 20
- 부드러운 그림자 (shadowOpacity 0.06)
- variant: 'surface' (흰색) | 'soft' (연한 크림)
- padding: 20

### PastelButton

`mobile/src/components/common/PastelButton.tsx`

- variant: 'clay' | 'sky' | 'blush' | 'ghost'
- borderRadius: 16, height: 50
- 말랑한 색상, 원색 금지

### StatusBadge

`mobile/src/components/common/StatusBadge.tsx`

- 배틀 상태를 둥근 스티커처럼 표시
- 상태별 색상 매핑

### CharacterBubble

`mobile/src/components/common/CharacterBubble.tsx`

- 개미 캐릭터 위/옆에 말풍선
- surfaceSoft 배경

### StatPill

`mobile/src/components/common/StatPill.tsx`

- 작은 둥근 알약 형태
- 라벨 + 값

### SectionHeader

`mobile/src/components/common/SectionHeader.tsx`

- 섹션 제목 + 선택적 부제목/액션 버튼

### Button (기존)

`mobile/src/components/common/Button.tsx`

- height: 50, borderRadius: 16
- variant: primary(clay), secondary(ghost), danger
- 새 버튼은 PastelButton 권장

### EmptyState, LoadingView, ErrorView, SafetyDisclaimer (기존)

컬러 팔레트 자동 반영.

## 문구 톤

앱 문구는 귀엽고 가벼운 톤. 딱딱한 금융 서비스 말투 금지.

예시 변환:

- "배틀 신청" → "친구 개미에게 도전하기"
- "종목 선택" → "내 개미가 들고 뛸 종목 고르기"
- "진행 중인 배틀" → "겨루는 중"
- "결과 보기" → "승부 결과 보러가기"
- "참가비" → "도전 참가비"
- "상대방 응답 대기 중" → "친구 개미의 답장을 기다리는 중이에요"
- "데이터 없음" → "아직 열린 승부가 없어요"

주의: 너무 유치한 말투는 피하고, 금융 정보와 안전 고지는 명확하게 유지.

## 마이크로카피

### 홈

- "오늘도 장이 열렸어요"
- "오늘은 어떤 승부를 해볼까요?"
- "오늘은 신중하게 골라볼까요?"
- "친구 개미랑 한 판 붙어볼까요?"

### 배틀 진행

- "현재 우세!"
- "떡상 개미 출몰!"
- "반등 기도 중..."
- "역전을 노려보자!"
- "팽팽한 접전!"

### 배틀 결과

- "오늘의 개미왕 등극!"
- "다음엔 꼭 이기자!"
- "둘 다 비슷한 개미"

### 빈 상태

- 배틀: "아직 열린 승부가 없어요. 친구 개미에게 도전해볼까요?"
- 친구: "아직 친구 개미가 없어요"

## 화면 구조

### HomeScreen

1. 인사 영역 ("민두개미, 오늘도 장이 열렸어요")
2. 메인 캐릭터 영역 (AntCharacter hero + CharacterBubble)
3. 상태 카드 (SoftCard + StatPill: 개미콩, 랭크, 전적)
4. CTA 버튼 (PastelButton)
5. SafetyDisclaimer

### BattleListScreen

- 헤더: "내 개미의 승부장" + 작은 개미
- 필터 탭: 전체/겨루는 중/대기 중/끝난 승부 (둥근 칩)
- 배틀 카드: SoftCard + StatusBadge
- CTA: "친구 개미에게 도전하기"

### BattleRequestScreen → "도전장 보내기"

### PeriodNegotiationScreen → "기간 정하기"

### StockSelectScreen → "종목 고르기"

### BattleProgressScreen → "겨루는 중"

### BattleResultScreen → "승부 결과"

## 애니메이션

### 개미 크기 변화

- AntCharacter `scale` prop, `Animated.timing` 300ms easeInOut
- 수익률 차이에 따라 0.75-1.4 범위로 clamp
- `useNativeDriver: true`

## 안전 문구

> 개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다. 표시되는 수익률과 종목 정보는 게임/학습 목적의 콘텐츠입니다.

## 금지 표현

- 베팅, 판돈, 올인
- 매수 추천, 이 종목 사세요
- 수익 보장, 따라 사기
- 주식맞짱 (서비스 이름은 "개미배틀"만 사용)
