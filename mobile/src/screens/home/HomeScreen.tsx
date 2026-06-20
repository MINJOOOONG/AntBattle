import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { getRankName, getRankColor } from '../../constants/ranks';
import AntCharacter from '../../components/ant/AntCharacter';
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

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, antBeans } = useAuthStore();

  if (!user) return <LoadingView />;

  const rankName = getRankName(user.rankScore);
  const rankColor = getRankColor(user.rankScore);
  const totalBattles = user.winCount + user.loseCount + user.drawCount;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요, {user.nickname}님!</Text>
        <Text style={styles.handle}>@{user.handle}</Text>
      </View>

      <View style={styles.profileCard}>
        <AntCharacter
          rankScore={user.rankScore}
          equippedHat={user.equippedHatId}
          equippedGlasses={user.equippedGlassesId}
          equippedExpression={user.equippedExpressionId}
          size="large"
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.rankBadge, { color: rankColor }]}>{rankName}</Text>
          <Text style={styles.score}>{user.rankScore}점</Text>
          <Text style={styles.beans}>🫘 {antBeans.toLocaleString()} 개미콩</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
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

      {user.currentWinStreak > 0 && (
        <View style={styles.streakBanner}>
          <Text style={styles.streakText}>🔥 {user.currentWinStreak}연승 중!</Text>
        </View>
      )}

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>소셜</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FriendSearch')}>
          <Text style={styles.menuIcon}>🔍</Text>
          <Text style={styles.menuLabel}>친구 찾기</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FriendList')}>
          <Text style={styles.menuIcon}>👥</Text>
          <Text style={styles.menuLabel}>친구 목록</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  handle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  rankBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  score: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  beans: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
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
  streakBanner: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
});
