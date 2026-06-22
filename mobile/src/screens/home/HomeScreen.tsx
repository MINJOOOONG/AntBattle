import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HOME_COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { getRankName, getRankColor } from '../../constants/ranks';
import ClayAntCharacter from '../../components/ant/ClayAntCharacter';
import LoadingView from '../../components/common/LoadingView';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const GREETINGS = [
  '오늘도 장이 열렸어요',
  '오늘은 어떤 승부를 해볼까요?',
  '개미 친구들이 기다리고 있어요',
];

const BUBBLES = [
  '오늘은 신중하게 골라볼까요?',
  '친구 개미랑 한 판 붙어볼까요?',
  '개미콩 모아서 뭐 사지...',
  '오늘은 떡상 기운이 느껴져요!',
  '오늘 수익률 실화...?',
  '나 지금 개미콩 부자임 ㅋ',
  '손절은 없다 뚝심으로 간다',
  '주식은 멘탈이지 멘탈',
  '오늘 장 분위기 좀 치는데?',
  '개미인생 레전드 찍자',
  'ㅎㅇ 오늘도 출근했다',
  '누가 날 이기겠어 ㅋㅋ',
  '개미콩 다 쓰면 어쩌지...',
  '오늘은 좀 쉴까... 아니 안 쉰다',
  '나 원래 이 종목 찍었었음',
  '연승 중인 건 비밀임',
  '배틀 지면 없던 일로 ㅋ',
  '개미 중에 제일 귀여운 듯',
  '이번 달 목표: 개미콩 부자',
  '지금 내 표정 어때 귀엽지',
  '오늘 승률 100% 갈 수 있다',
  '슬리피하지만 장은 봐야지',
  '친구 개미한테 질 수 없음',
  '개미콩 모아서 드립 사야지',
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 홈 전용 말풍선 */
function HomeBubble({ message }: { message: string }) {
  return (
    <View style={styles.bubbleWrap}>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{message}</Text>
      </View>
      <View style={styles.bubbleTail} />
    </View>
  );
}

export default function HomeScreen(_props: HomeScreenProps) {
  const { user, antBeans } = useAuthStore();
  const [bubbleMsg, setBubbleMsg] = useState(() => pickRandom(BUBBLES));

  const rotateBubble = useCallback(() => {
    setBubbleMsg((prev) => {
      let next = pickRandom(BUBBLES);
      while (next === prev && BUBBLES.length > 1) next = pickRandom(BUBBLES);
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(rotateBubble, 5000);
    return () => clearInterval(timer);
  }, [rotateBubble]);

  if (!user) return <LoadingView message="개미 불러오는 중..." />;

  const rankName = getRankName(user.rankScore);
  const rankColor = getRankColor(user.rankScore);

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.nickname}>{user.nickname},</Text>
          <Text style={styles.greetingSub}>{pickRandom(GREETINGS)}</Text>
        </View>
        <View style={styles.beanBadge}>
          <Text style={styles.beanLabel}>개미콩</Text>
          <Text style={styles.beanValue}>{antBeans.toLocaleString()}</Text>
        </View>
      </View>

      {/* 캐릭터 영역 */}
      <View style={styles.characterSection}>
        <HomeBubble message={bubbleMsg} />

        <View style={styles.characterWrap}>
          {/* 캐릭터 뒤 원형 배경 */}
          <View style={styles.characterCircleBg} />
          <ClayAntCharacter
            rankScore={user.rankScore}
            size="hero"
            equippedExpression={user.equippedExpressionId}
          />
        </View>

        {/* 바닥 그림자 */}
        <View style={styles.floorShadow} />

        {/* 프로필 배지 */}
        <View style={styles.infoBadge}>
          <Text style={[styles.infoRank, { color: rankColor }]}>{rankName}</Text>
          <Text style={styles.infoDot}> · </Text>
          <Text style={styles.infoHandle}>@{user.handle}</Text>
          {user.currentWinStreak > 0 && (
            <>
              <Text style={styles.infoDot}> · </Text>
              <Text style={styles.infoStreak}>{user.currentWinStreak}연승</Text>
            </>
          )}
        </View>
      </View>

      {/* 면책조항 - 홈 전용 스타일 */}
      <Text style={styles.disclaimer}>
        개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다.{'\n'}
        표시되는 수익률과 종목 정보는 게임/학습 목적의 콘텐츠입니다.
      </Text>
    </View>
  );
}

const HC = HOME_COLORS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HC.bg,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },

  // ── 상단 바 ──
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topBarLeft: {
    flex: 1,
  },
  nickname: {
    fontSize: 22,
    fontWeight: '800',
    color: HC.textPrimary,
  },
  greetingSub: {
    fontSize: 13,
    color: HC.textMuted,
    marginTop: 3,
  },
  beanBadge: {
    backgroundColor: HC.beanBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: HC.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  beanLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: HC.textMuted,
    letterSpacing: 0.5,
  },
  beanValue: {
    fontSize: 18,
    fontWeight: '800',
    color: HC.beanText,
    marginTop: 2,
  },

  // ── 말풍선 (홈 전용) ──
  bubbleWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  bubble: {
    backgroundColor: HC.bubbleBg,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 260,
    shadowColor: HC.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '600',
    color: HC.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bubbleTail: {
    width: 12,
    height: 8,
    backgroundColor: HC.bubbleBg,
    transform: [{ rotate: '45deg' }],
    marginTop: -5,
    shadowColor: HC.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  // ── 캐릭터 영역 ──
  characterSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  characterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCircleBg: {
    position: 'absolute',
    width: '85%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: HC.border,
    opacity: 0.1,
  },
  floorShadow: {
    width: 120,
    height: 12,
    borderRadius: 60,
    backgroundColor: HC.border,
    opacity: 0.25,
    marginTop: -6,
  },

  // ── 프로필 배지 ──
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HC.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginTop: 10,
    shadowColor: HC.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRank: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoHandle: {
    fontSize: 13,
    color: HC.textMuted,
  },
  infoStreak: {
    fontSize: 13,
    fontWeight: '700',
    color: HC.warmAccent,
  },
  infoDot: {
    fontSize: 13,
    color: HC.border,
  },

  // ── 면책조항 (홈 전용) ──
  disclaimer: {
    fontSize: 10,
    color: HC.border,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 16,
  },
});
