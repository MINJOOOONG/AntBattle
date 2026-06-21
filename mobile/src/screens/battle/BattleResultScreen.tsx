import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useBattleStore } from '../../store/battleStore';
import { useAuthStore } from '../../store/authStore';
import AntCharacter from '../../components/ant/AntCharacter';
import SoftCard from '../../components/common/SoftCard';
import PastelButton from '../../components/common/PastelButton';
import LoadingView from '../../components/common/LoadingView';
import ErrorView from '../../components/common/ErrorView';
import SafetyDisclaimer from '../../components/common/SafetyDisclaimer';
import type { RootScreenProps } from '../../navigation/types';

function getResultDisplay(userId: string, battle: { winnerId: string | null; loserId: string | null; isDraw: boolean }) {
  if (battle.isDraw) return { emoji: '🤝', title: '무승부!', subtitle: '둘 다 비슷한 개미', color: COLORS.textSecondary };
  if (battle.winnerId === userId) return { emoji: '🏆', title: '승리!', subtitle: '오늘의 개미왕 등극!', color: COLORS.clay };
  return { emoji: '😢', title: '패배...', subtitle: '다음엔 꼭 이기자!', color: COLORS.lossBlue };
}

export default function BattleResultScreen({ route, navigation }: RootScreenProps<'BattleResult'>) {
  const { battleId } = route.params;
  const { currentBattle, isLoading, loadBattleDetail } = useBattleStore();
  const { user } = useAuthStore();

  useEffect(() => { loadBattleDetail(battleId); }, [battleId]);

  if (isLoading && !currentBattle) return <LoadingView message="결과 불러오는 중..." />;
  if (!currentBattle || !user) return <ErrorView message="배틀 정보를 불러올 수 없어요." onRetry={() => loadBattleDetail(battleId)} />;

  const result = getResultDisplay(user.id, currentBattle);
  const myP = currentBattle.participants.find((p) => p.userId === user.id);
  const opP = currentBattle.participants.find((p) => p.userId !== user.id);
  const opponent = currentBattle.requesterId === user.id ? currentBattle.opponent : currentBattle.requester;
  const myRate = myP?.returnRate ?? 0;
  const opRate = opP?.returnRate ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 결과 헤더 */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultEmoji}>{result.emoji}</Text>
        <Text style={[styles.resultTitle, { color: result.color }]}>{result.title}</Text>
        <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
      </View>

      {/* 개미 VS 개미 */}
      <View style={styles.vsSection}>
        <View style={styles.antSide}>
          <AntCharacter scale={myP?.antScale ?? 1} rankScore={user.rankScore}
            equippedHat={user.equippedHatId} equippedGlasses={user.equippedGlassesId} equippedExpression={user.equippedExpressionId} size="medium" />
          <Text style={styles.antName}>{user.nickname}</Text>
        </View>
        <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
        <View style={styles.antSide}>
          <AntCharacter scale={opP?.antScale ?? 1} rankScore={opponent?.rankScore ?? 0}
            equippedHat={opponent?.equippedHatId} equippedGlasses={opponent?.equippedGlassesId} equippedExpression={opponent?.equippedExpressionId} size="medium" />
          <Text style={styles.antName}>{opponent?.nickname || '상대 개미'}</Text>
        </View>
      </View>

      {/* 수익률 비교 */}
      <SoftCard style={styles.compareCard}>
        <Text style={styles.cardLabel}>수익률 비교</Text>
        <View style={styles.rateRow}>
          <View style={styles.rateSide}>
            <Text style={styles.stockName}>{myP?.stock?.name || '-'}</Text>
            <Text style={[styles.rateValue, { color: myRate >= 0 ? COLORS.gainRed : COLORS.lossBlue }]}>
              {myRate >= 0 ? '+' : ''}{myRate.toFixed(2)}%
            </Text>
            {myP?.finalPrice != null && (
              <Text style={styles.priceRange}>{myP.startPrice?.toLocaleString()} → {myP.finalPrice.toLocaleString()}원</Text>
            )}
          </View>
          <View style={styles.rateDivider} />
          <View style={styles.rateSide}>
            <Text style={styles.stockName}>{opP?.stock?.name || '-'}</Text>
            <Text style={[styles.rateValue, { color: opRate >= 0 ? COLORS.gainRed : COLORS.lossBlue }]}>
              {opRate >= 0 ? '+' : ''}{opRate.toFixed(2)}%
            </Text>
            {opP?.finalPrice != null && (
              <Text style={styles.priceRange}>{opP.startPrice?.toLocaleString()} → {opP.finalPrice.toLocaleString()}원</Text>
            )}
          </View>
        </View>
      </SoftCard>

      {/* 보상 */}
      {myP && (
        <SoftCard variant="soft" style={styles.rewardCard}>
          <Text style={styles.cardLabel}>보상</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>개미콩</Text>
            <Text style={styles.rewardValue}>+{myP.rewardBeans} 🫘</Text>
          </View>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>랭크 점수</Text>
            <Text style={[styles.rewardValue, { color: myP.rankScoreDelta >= 0 ? COLORS.gainRed : COLORS.lossBlue }]}>
              {myP.rankScoreDelta >= 0 ? '+' : ''}{myP.rankScoreDelta}
            </Text>
          </View>
        </SoftCard>
      )}

      <PastelButton title="다시 승부하러 가기" variant="clay" onPress={() => navigation.popToTop()} style={{ marginTop: 8 }} />
      <SafetyDisclaimer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  resultHeader: { alignItems: 'center', marginBottom: 20, paddingTop: 8 },
  resultEmoji: { fontSize: 56, marginBottom: 8 },
  resultTitle: { fontSize: 28, fontWeight: '700' },
  resultSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
  vsSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 12 },
  antSide: { alignItems: 'center', flex: 1 },
  antName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginTop: 8 },
  vsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSoft, justifyContent: 'center', alignItems: 'center' },
  vsText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  compareCard: { marginBottom: 12 },
  cardLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 14, textAlign: 'center' },
  rateRow: { flexDirection: 'row' },
  rateSide: { flex: 1, alignItems: 'center' },
  rateDivider: { width: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 12 },
  stockName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 },
  rateValue: { fontSize: 24, fontWeight: '700' },
  priceRange: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  rewardCard: { marginBottom: 16 },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rewardLabel: { fontSize: 15, color: COLORS.textPrimary },
  rewardValue: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
});
