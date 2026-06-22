import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { getRankName, getRankColor } from '../../constants/ranks';
import ClayAntCharacter from '../../components/ant/ClayAntCharacter';
import CharacterBubble from '../../components/common/CharacterBubble';

import PastelButton from '../../components/common/PastelButton';
import LoadingView from '../../components/common/LoadingView';
import SafetyDisclaimer from '../../components/common/SafetyDisclaimer';
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

export default function HomeScreen({ navigation }: HomeScreenProps) {
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

  const infoSegments = [
    rankName,
    `@${user.handle}`,
    ...(user.currentWinStreak > 0 ? [`${user.currentWinStreak}연승`] : []),
  ];

  return (
    <View style={styles.container}>
      {/* 상단 바: 인사 + 개미콩 */}
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
        <CharacterBubble message={bubbleMsg} />
        <ClayAntCharacter rankScore={user.rankScore} size="hero" />
        <Text style={styles.infoLine}>
          {infoSegments.map((seg, i) => (
            <Text key={i}>
              {i === 0 ? (
                <Text style={[styles.infoSegment, { color: rankColor, fontWeight: '700' }]}>{seg}</Text>
              ) : (
                <Text style={styles.infoSegment}>{seg}</Text>
              )}
              {i < infoSegments.length - 1 && <Text style={styles.infoDot}> · </Text>}
            </Text>
          ))}
        </Text>
      </View>

      {/* CTA 영역 */}
      <View style={styles.ctaSection}>
        <PastelButton
          title="친구 개미에게 도전하기"
          variant="clay"
          onPress={() => navigation.navigate('BattleRequest')}
          style={styles.ctaMain}
        />
        <View style={styles.ctaSubRow}>
          <PastelButton
            title="친구 찾기"
            variant="blush"
            onPress={() => navigation.navigate('FriendSearch')}
            style={styles.ctaSub}
          />
          <View style={styles.statGap} />
          <PastelButton
            title="친구 목록"
            variant="ghost"
            onPress={() => navigation.navigate('FriendList')}
            style={styles.ctaSub}
          />
        </View>
      </View>

      {/* 면책조항 */}
      <SafetyDisclaimer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },

  // 상단 바
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topBarLeft: {
    flex: 1,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  greetingSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  beanBadge: {
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  beanLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  beanValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.clay,
    marginTop: 1,
  },

  // 캐릭터
  characterSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  infoLine: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  infoSegment: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  infoDot: {
    color: COLORS.disabled,
  },

  statGap: {
    width: 6,
  },

  // CTA
  ctaSection: {
    marginBottom: 4,
  },
  ctaMain: {
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#B08E6E',
    borderBottomWidth: 1.5,
    borderBottomColor: '#7A5C3E',
    shadowColor: '#5A4030',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaSubRow: {
    flexDirection: 'row',
  },
  ctaSub: {
    flex: 1,
    height: 42,
  },
});
