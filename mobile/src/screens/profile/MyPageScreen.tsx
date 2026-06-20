import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { getRankName, getRankColor } from '../../constants/ranks';
import AntCharacter from '../../components/ant/AntCharacter';
import Button from '../../components/common/Button';

export default function MyPageScreen() {
  const { user, antBeans, logout } = useAuthStore();

  if (!user) return null;

  const rankName = getRankName(user.rankScore);
  const rankColor = getRankColor(user.rankScore);
  const totalBattles = user.winCount + user.loseCount + user.drawCount;
  const winRate = totalBattles > 0 ? Math.round((user.winCount / totalBattles) * 100) : 0;

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>마이페이지</Text>

      <View style={styles.profileCard}>
        <AntCharacter
          rankScore={user.rankScore}
          equippedHat={user.equippedHatId}
          equippedGlasses={user.equippedGlassesId}
          equippedExpression={user.equippedExpressionId}
          size="large"
        />
        <Text style={styles.nickname}>{user.nickname}</Text>
        <Text style={styles.handle}>@{user.handle}</Text>
        <Text style={[styles.rank, { color: rankColor }]}>{rankName} ({user.rankScore}점)</Text>
      </View>

      <View style={styles.beansCard}>
        <Text style={styles.beansLabel}>보유 개미콩</Text>
        <Text style={styles.beansValue}>🫘 {antBeans.toLocaleString()}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>전적</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalBattles}</Text>
            <Text style={styles.statLabel}>총 배틀</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.gainRed }]}>{user.winCount}</Text>
            <Text style={styles.statLabel}>승</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.lossBue }]}>{user.loseCount}</Text>
            <Text style={styles.statLabel}>패</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.drawCount}</Text>
            <Text style={styles.statLabel}>무</Text>
          </View>
        </View>
        <View style={styles.statsExtra}>
          <Text style={styles.extraLabel}>승률: {winRate}%</Text>
          <Text style={styles.extraLabel}>최고 연승: {user.bestWinStreak}회</Text>
          {user.currentWinStreak > 0 && (
            <Text style={styles.extraLabel}>🔥 현재 {user.currentWinStreak}연승 중</Text>
          )}
        </View>
      </View>

      <Button title="로그아웃" onPress={handleLogout} variant="danger" style={{ marginTop: 24 }} />

      <Text style={styles.disclaimer}>
        본 앱은 실제 주식 거래와 무관한 게임입니다.{'\n'}
        모의투자 결과를 실제 투자 판단에 활용하지 마세요.
      </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  nickname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  handle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  beansCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  beansLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  beansValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsExtra: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    gap: 4,
  },
  extraLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  disclaimer: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 16,
  },
});
