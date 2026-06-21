import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { getRankName, getRankColor } from '../../constants/ranks';
import ClayAntCharacter from '../../components/ant/ClayAntCharacter';
import CharacterBubble from '../../components/common/CharacterBubble';
import SoftCard from '../../components/common/SoftCard';
import StatPill from '../../components/common/StatPill';
import SectionHeader from '../../components/common/SectionHeader';
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
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, antBeans } = useAuthStore();

  if (!user) return <LoadingView message="개미 불러오는 중..." />;

  const rankName = getRankName(user.rankScore);
  const rankColor = getRankColor(user.rankScore);
  const totalBattles = user.winCount + user.loseCount + user.drawCount;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 인사 */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{user.nickname},</Text>
        <Text style={styles.subGreeting}>{pickRandom(GREETINGS)}</Text>
      </View>

      {/* 메인 캐릭터 */}
      <View style={styles.heroSection}>
        <CharacterBubble message={pickRandom(BUBBLES)} />
        <View style={styles.heroCharacter}>
          <ClayAntCharacter
            rankScore={user.rankScore}
            size="hero"
          />
        </View>
        <Text style={[styles.rankLabel, { color: rankColor }]}>{rankName}</Text>
        <Text style={styles.handleText}>@{user.handle}</Text>
      </View>

      {/* 상태 카드 — 3D clay 볼륨감 */}
      <SoftCard style={styles.statsCard3d}>
        <View style={styles.statsRow}>
          <StatPill label="개미콩" value={`${antBeans.toLocaleString()}`} color={COLORS.clay} />
          <View style={{ width: 8 }} />
          <StatPill label="랭크" value={`${user.rankScore}점`} color={rankColor} />
        </View>
        <View style={[styles.statsRow, { marginTop: 8 }]}>
          <StatPill label="승" value={user.winCount} color={COLORS.gainRed} />
          <View style={{ width: 8 }} />
          <StatPill label="패" value={user.loseCount} color={COLORS.lossBlue} />
          <View style={{ width: 8 }} />
          <StatPill label="무" value={user.drawCount} />
          <View style={{ width: 8 }} />
          <StatPill label="총" value={totalBattles} />
        </View>
      </SoftCard>

      {/* 연승 배너 */}
      {user.currentWinStreak > 0 && (
        <SoftCard variant="soft" style={styles.streakCard}>
          <Text style={styles.streakText}>{user.currentWinStreak}연승 중!</Text>
        </SoftCard>
      )}

      {/* CTA 메뉴 */}
      <SectionHeader title="무엇을 할까요?" />

      <PastelButton
        title="친구 개미에게 도전하기"
        variant="clay"
        onPress={() => navigation.navigate('BattleRequest')}
        style={styles.ctaClay}
      />
      <PastelButton
        title="친구 찾기"
        variant="blush"
        onPress={() => navigation.navigate('FriendSearch')}
        style={styles.ctaBlush}
      />
      <PastelButton
        title="친구 목록 보기"
        variant="ghost"
        onPress={() => navigation.navigate('FriendList')}
        style={styles.ctaGhost}
      />

      <SafetyDisclaimer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  greetingSection: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subGreeting: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroCharacter: {
    marginTop: 12,
    marginBottom: 8,
  },
  rankLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  handleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsCard3d: {
    marginBottom: 12,
    // 3D clay card: stronger shadow + top highlight
    shadowColor: '#3F3A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(255,255,255,0.5)',
  },
  statsRow: {
    flexDirection: 'row',
  },
  streakCard: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.clay,
  },
  ctaClay: {
    marginBottom: 10,
    // 3D button: top light, bottom dark
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
  ctaBlush: {
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#DDD0CA',
    borderBottomWidth: 1.5,
    borderBottomColor: '#B5A8A0',
    shadowColor: '#8A7C74',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaGhost: {
    marginBottom: 10,
  },
});
