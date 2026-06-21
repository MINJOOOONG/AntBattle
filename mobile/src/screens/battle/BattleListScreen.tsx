import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useBattleStore } from '../../store/battleStore';
import { useAuthStore } from '../../store/authStore';
import { BATTLE_PERIOD_LABELS } from '../../types/enums';
import type { Battle } from '../../types/models';
import SoftCard from '../../components/common/SoftCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import LoadingView from '../../components/common/LoadingView';
import PastelButton from '../../components/common/PastelButton';
import AntCharacter from '../../components/ant/AntCharacter';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type BattleListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Battle'>,
  NativeStackScreenProps<RootStackParamList>
>;

type FilterTab = 'all' | 'active' | 'pending' | 'finished';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '겨루는 중' },
  { key: 'pending', label: '대기 중' },
  { key: 'finished', label: '끝난 승부' },
];

function filterBattles(battles: Battle[], tab: FilterTab): Battle[] {
  switch (tab) {
    case 'active':
      return battles.filter((b) => b.status === 'active');
    case 'pending':
      return battles.filter((b) =>
        ['pending_period', 'period_rejected', 'pending_stock_selection'].includes(b.status)
      );
    case 'finished':
      return battles.filter((b) => ['finished', 'cancelled'].includes(b.status));
    default:
      return battles;
  }
}

export default function BattleListScreen({ navigation }: BattleListScreenProps) {
  const { battles, isLoading, loadBattles } = useBattleStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBattles();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBattles();
    setRefreshing(false);
  }, [loadBattles]);

  const handleBattleTap = (battle: Battle) => {
    switch (battle.status) {
      case 'pending_period':
      case 'period_rejected':
        navigation.navigate('PeriodNegotiation', { battleId: battle.id });
        break;
      case 'pending_stock_selection':
        navigation.navigate('StockSelect', { battleId: battle.id });
        break;
      case 'active':
        navigation.navigate('BattleProgress', { battleId: battle.id });
        break;
      case 'finished':
        navigation.navigate('BattleResult', { battleId: battle.id });
        break;
    }
  };

  const getOpponent = (battle: Battle) => {
    if (!user) return null;
    return battle.requesterId === user.id ? battle.opponent : battle.requester;
  };

  const filtered = filterBattles(battles, activeTab);

  if (isLoading && battles.length === 0) return <LoadingView message="승부 목록 불러오는 중..." />;

  const renderBattleCard = ({ item }: { item: Battle }) => {
    const opponent = getOpponent(item);
    const period = item.finalPeriod || item.proposedPeriod;

    return (
      <TouchableOpacity
        onPress={() => handleBattleTap(item)}
        disabled={item.status === 'cancelled'}
        activeOpacity={0.7}
      >
        <SoftCard style={styles.battleCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.opponentName}>
              vs {opponent?.nickname || '상대 개미'}
            </Text>
            <StatusBadge status={item.status} />
          </View>
          {period && (
            <Text style={styles.periodText}>{BATTLE_PERIOD_LABELS[period]}</Text>
          )}
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('ko-KR')}
          </Text>
        </SoftCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AntCharacter size="small" rankScore={user?.rankScore} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.title}>내 개미의 승부장</Text>
          </View>
        </View>
      </View>

      {/* 필터 탭 */}
      <View style={styles.tabRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderBattleCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.clay} />
        }
        ListHeaderComponent={
          <PastelButton
            title="친구 개미에게 도전하기"
            variant="clay"
            onPress={() => navigation.navigate('BattleRequest')}
            style={{ marginBottom: 16 }}
          />
        }
        ListEmptyComponent={
          <EmptyState
            emoji="⚔️"
            title="아직 열린 승부가 없어요"
            subtitle="친구 개미에게 도전해볼까요?"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSoft,
  },
  activeTab: {
    backgroundColor: COLORS.clay,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  battleCard: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  periodText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.disabled,
  },
});
