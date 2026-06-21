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
import { useAuthStore } from '../../store/authStore';
import { BATTLE_PERIOD_LABELS } from '../../types/enums';
import type { BattlePeriod } from '../../types/enums';
import SoftCard from '../../components/common/SoftCard';
import PastelButton from '../../components/common/PastelButton';
import CharacterBubble from '../../components/common/CharacterBubble';
import AntCharacter from '../../components/ant/AntCharacter';
import LoadingView from '../../components/common/LoadingView';
import ErrorView from '../../components/common/ErrorView';
import type { RootScreenProps } from '../../navigation/types';

const PERIODS: BattlePeriod[] = ['1d', '3d', '1w', '1m'];

export default function PeriodNegotiationScreen({
  route,
  navigation,
}: RootScreenProps<'PeriodNegotiation'>) {
  const { battleId } = route.params;
  const { currentBattle, isLoading, loadBattleDetail, respondPeriod, proposePeriod, cancelBattle } =
    useBattleStore();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [showRepropose, setShowRepropose] = useState(false);
  const [newPeriod, setNewPeriod] = useState<BattlePeriod>('1d');

  useEffect(() => {
    loadBattleDetail(battleId);
  }, [battleId]);

  if (isLoading && !currentBattle) return <LoadingView message="배틀 정보 불러오는 중..." />;
  if (!currentBattle || !user) return <ErrorView message="배틀 정보를 불러올 수 없어요." onRetry={() => loadBattleDetail(battleId)} />;

  const isProposer = currentBattle.proposedBy === user.id;
  const opponent = currentBattle.requesterId === user.id ? currentBattle.opponent : currentBattle.requester;
  const proposedPeriod = currentBattle.proposedPeriod;

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await respondPeriod(battleId, true);
      navigation.replace('StockSelect', { battleId });
    } catch (e: any) {
      Alert.alert('앗!', e?.response?.data?.error?.message || '수락에 실패했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await respondPeriod(battleId, false);
      setShowRepropose(true);
    } catch (e: any) {
      Alert.alert('앗!', e?.response?.data?.error?.message || '거절에 실패했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepropose = async () => {
    setSubmitting(true);
    try {
      await proposePeriod(battleId, newPeriod);
      Alert.alert('알림', '새 기간을 제안했어요. 친구 개미의 답장을 기다려주세요!');
      loadBattleDetail(battleId);
    } catch (e: any) {
      Alert.alert('앗!', e?.response?.data?.error?.message || '재제안에 실패했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('배틀 취소', '배틀을 취소할까요?\n참가비 50 개미콩이 돌아와요.', [
      { text: '아니오', style: 'cancel' },
      {
        text: '취소하기',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBattle(battleId);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('앗!', e?.response?.data?.error?.message || '취소에 실패했어요.');
          }
        },
      },
    ]);
  };

  if (currentBattle.status === 'pending_stock_selection') {
    navigation.replace('StockSelect', { battleId });
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 상대 정보 */}
      <SoftCard style={styles.opponentCard}>
        <View style={styles.opponentRow}>
          <AntCharacter size="small" rankScore={opponent?.rankScore ?? 0} />
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.opponentName}>{opponent?.nickname || '상대 개미'}</Text>
            <Text style={styles.opponentHandle}>@{opponent?.handle || ''}</Text>
          </View>
        </View>
      </SoftCard>

      {/* 제안된 기간 */}
      <SoftCard style={styles.periodCard}>
        <Text style={styles.cardLabel}>제안된 기간</Text>
        {proposedPeriod && (
          <View style={styles.periodDisplay}>
            <Text style={styles.periodValue}>{BATTLE_PERIOD_LABELS[proposedPeriod]}</Text>
            <Text style={styles.periodBy}>
              {isProposer ? '내가 제안' : `${opponent?.nickname || '상대 개미'}이 제안`}
            </Text>
          </View>
        )}
      </SoftCard>

      {isProposer ? (
        <View style={styles.waitSection}>
          <AntCharacter size="large" rankScore={user.rankScore} />
          <CharacterBubble message="친구 개미의 답장을 기다리는 중이에요..." />
        </View>
      ) : showRepropose || currentBattle.status === 'period_rejected' ? (
        <SoftCard>
          <Text style={styles.cardLabel}>새 기간 제안하기</Text>
          <View style={styles.periodGrid}>
            {PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.periodChip, newPeriod === period && styles.periodChipSelected]}
                onPress={() => setNewPeriod(period)}
              >
                <Text style={[styles.chipLabel, newPeriod === period && styles.chipLabelSelected]}>
                  {BATTLE_PERIOD_LABELS[period]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <PastelButton
            title="이 기간으로 제안하기"
            variant="clay"
            onPress={handleRepropose}
            loading={submitting}
            disabled={submitting}
            style={{ marginTop: 16 }}
          />
        </SoftCard>
      ) : (
        <View style={styles.actionSection}>
          <PastelButton title="좋아, 이 기간으로!" variant="clay" onPress={handleAccept} loading={submitting} disabled={submitting} />
          <PastelButton title="다른 기간으로 바꿔볼래" variant="ghost" onPress={handleReject} disabled={submitting} style={{ marginTop: 10 }} />
        </View>
      )}

      <TouchableOpacity style={styles.cancelLink} onPress={handleCancel}>
        <Text style={styles.cancelText}>배틀 취소</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  opponentCard: { marginBottom: 12 },
  opponentRow: { flexDirection: 'row', alignItems: 'center' },
  opponentName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  opponentHandle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  periodCard: { marginBottom: 16 },
  cardLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 12 },
  periodDisplay: { alignItems: 'center', paddingVertical: 8 },
  periodValue: { fontSize: 20, fontWeight: '700', color: COLORS.clay, marginBottom: 4 },
  periodBy: { fontSize: 13, color: COLORS.textSecondary },
  waitSection: { alignItems: 'center', paddingVertical: 24, gap: 16 },
  actionSection: { marginBottom: 16 },
  periodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  periodChip: {
    width: '47%',
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodChipSelected: { borderColor: COLORS.clay },
  chipLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  chipLabelSelected: { color: COLORS.clay },
  cancelLink: { alignItems: 'center', paddingVertical: 20 },
  cancelText: { fontSize: 14, color: COLORS.danger },
});
