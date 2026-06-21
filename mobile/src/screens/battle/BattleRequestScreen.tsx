import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useBattleStore } from '../../store/battleStore';
import { useFriendStore } from '../../store/friendStore';
import { BATTLE_PERIOD_LABELS } from '../../types/enums';
import type { BattlePeriod } from '../../types/enums';
import type { User } from '../../types/models';
import SoftCard from '../../components/common/SoftCard';
import PastelButton from '../../components/common/PastelButton';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingView from '../../components/common/LoadingView';
import EmptyState from '../../components/common/EmptyState';
import type { RootScreenProps } from '../../navigation/types';

const PERIODS: BattlePeriod[] = ['1d', '3d', '1w', '1m'];

export default function BattleRequestScreen({ navigation }: RootScreenProps<'BattleRequest'>) {
  const { friends, isLoading: friendsLoading, loadFriends } = useFriendStore();
  const { createBattle } = useBattleStore();
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<BattlePeriod>('1d');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const handleSubmit = async () => {
    if (!selectedFriend) {
      Alert.alert('알림', '도전할 친구 개미를 선택해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const battle = await createBattle(selectedFriend.id, selectedPeriod);
      navigation.replace('PeriodNegotiation', { battleId: battle.id });
    } catch (e: any) {
      const message = e?.response?.data?.error?.message || '도전장 보내기에 실패했어요.';
      Alert.alert('앗!', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (friendsLoading && friends.length === 0) return <LoadingView message="친구 목록 불러오는 중..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="어떤 친구 개미에게 도전장을 보낼까요?" />

      {friends.length === 0 ? (
        <EmptyState emoji="👥" title="아직 친구 개미가 없어요" subtitle="먼저 친구를 추가해보세요!" />
      ) : (
        <View style={styles.friendList}>
          {friends.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              activeOpacity={0.7}
              onPress={() => setSelectedFriend(friend)}
            >
              <SoftCard
                style={[
                  styles.friendCard,
                  selectedFriend?.id === friend.id && styles.friendCardSelected,
                ]}
              >
                <Text style={styles.friendEmoji}>🐜</Text>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.nickname}</Text>
                  <Text style={styles.friendHandle}>@{friend.handle}</Text>
                </View>
                {selectedFriend?.id === friend.id && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </SoftCard>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <SectionHeader title="배틀 기간" style={{ marginTop: 24 }} />

      <View style={styles.periodGrid}>
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodChip,
              selectedPeriod === period && styles.periodChipSelected,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodLabel,
                selectedPeriod === period && styles.periodLabelSelected,
              ]}
            >
              {BATTLE_PERIOD_LABELS[period]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <SoftCard variant="soft" style={styles.costCard}>
        <Text style={styles.costText}>도전 참가비: 50 개미콩 (양쪽 모두)</Text>
      </SoftCard>

      <PastelButton
        title="도전장 보내기!"
        variant="clay"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!selectedFriend || submitting}
        style={{ marginTop: 20 }}
      />
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
  },
  friendList: {
    gap: 8,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  friendCardSelected: {
    borderColor: COLORS.clay,
  },
  friendEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  friendHandle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkMark: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.clay,
  },
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  periodChip: {
    width: '47%',
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodChipSelected: {
    borderColor: COLORS.clay,
    backgroundColor: COLORS.surface,
  },
  periodLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  periodLabelSelected: {
    color: COLORS.clay,
  },
  costCard: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  costText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
