import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useBattleStore } from '../../store/battleStore';
import { useAuthStore } from '../../store/authStore';
import { BATTLE_PERIOD_LABELS } from '../../types/enums';
import AntCharacter from '../../components/ant/AntCharacter';
import CharacterBubble from '../../components/common/CharacterBubble';
import SoftCard from '../../components/common/SoftCard';
import SafetyDisclaimer from '../../components/common/SafetyDisclaimer';
import LoadingView from '../../components/common/LoadingView';
import ErrorView from '../../components/common/ErrorView';
import type { RootScreenProps } from '../../navigation/types';

function useCountdown(endAt: string | null) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!endAt) return;
    const tick = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('종료'); return; }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setRemaining(d > 0 ? `${d}일 ${h}시간` : h > 0 ? `${h}시간 ${m}분` : `${m}분`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [endAt]);
  return remaining;
}

function getMicrocopy(myRate: number, opponentRate: number): string {
  const diff = myRate - opponentRate;
  if (diff > 3) return '떡상 개미 출몰!';
  if (diff > 0) return '현재 우세!';
  if (diff === 0) return '팽팽한 접전!';
  if (diff > -3) return '반등 기도 중...';
  return '역전을 노려보자!';
}

export default function BattleProgressScreen({ route, navigation }: RootScreenProps<'BattleProgress'>) {
  const { battleId } = route.params;
  const { currentBattle, isLoading, loadBattleDetail } = useBattleStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadBattleDetail(battleId); }, [battleId]);

  useEffect(() => {
    if (currentBattle?.status === 'finished') navigation.replace('BattleResult', { battleId });
  }, [currentBattle?.status]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBattleDetail(battleId);
    setRefreshing(false);
  }, [battleId, loadBattleDetail]);

  const remaining = useCountdown(currentBattle?.endAt || null);

  if (isLoading && !currentBattle) return <LoadingView message="배틀 불러오는 중..." />;
  if (!currentBattle || !user) return <ErrorView message="배틀 정보를 불러올 수 없어요." onRetry={() => loadBattleDetail(battleId)} />;

  const myP = currentBattle.participants.find((p) => p.userId === user.id);
  const opP = currentBattle.participants.find((p) => p.userId !== user.id);
  const opponent = currentBattle.requesterId === user.id ? currentBattle.opponent : currentBattle.requester;
  const myRate = myP?.returnRate ?? 0;
  const opRate = opP?.returnRate ?? 0;
  const microcopy = getMicrocopy(myRate, opRate);
  const period = currentBattle.finalPeriod || currentBattle.proposedPeriod;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.clay} />}
    >
      {/* 타이머 */}
      <SoftCard style={styles.timerCard}>
        <Text style={styles.timerLabel}>남은 시간</Text>
        <Text style={styles.timerValue}>{remaining || '계산 중...'}</Text>
        {period && <Text style={styles.periodText}>{BATTLE_PERIOD_LABELS[period]}</Text>}
      </SoftCard>

      {/* 마이크로카피 */}
      <CharacterBubble message={microcopy} />

      {/* 개미 VS 개미 */}
      <View style={styles.vsSection}>
        <View style={styles.antSide}>
          <AntCharacter
            scale={myP?.antScale ?? 1}
            rankScore={user.rankScore}
            equippedHat={user.equippedHatId}
            equippedGlasses={user.equippedGlassesId}
            equippedExpression={user.equippedExpressionId}
            size="medium"
          />
          <Text style={styles.antName}>{user.nickname}</Text>
          <Text style={styles.myLabel}>나</Text>
        </View>
        <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
        <View style={styles.antSide}>
          <AntCharacter
            scale={opP?.antScale ?? 1}
            rankScore={opponent?.rankScore ?? 0}
            equippedHat={opponent?.equippedHatId}
            equippedGlasses={opponent?.equippedGlassesId}
            equippedExpression={opponent?.equippedExpressionId}
            size="medium"
          />
          <Text style={styles.antName}>{opponent?.nickname || '상대 개미'}</Text>
        </View>
      </View>

      {/* 수익률 비교 */}
      <SoftCard>
        <View style={styles.rateRow}>
          <View style={styles.rateSide}>
            <Text style={styles.stockLabel}>{myP?.stock?.name || '-'}</Text>
            <Text style={[styles.rateValue, { color: myRate >= 0 ? COLORS.gainRed : COLORS.lossBlue }]}>
              {myRate >= 0 ? '+' : ''}{myRate.toFixed(2)}%
            </Text>
            {myP?.currentPrice != null && <Text style={styles.priceLabel}>{myP.currentPrice.toLocaleString()}원</Text>}
          </View>
          <View style={styles.rateDivider} />
          <View style={styles.rateSide}>
            <Text style={styles.stockLabel}>{opP?.stock?.name || '-'}</Text>
            <Text style={[styles.rateValue, { color: opRate >= 0 ? COLORS.gainRed : COLORS.lossBlue }]}>
              {opRate >= 0 ? '+' : ''}{opRate.toFixed(2)}%
            </Text>
            {opP?.currentPrice != null && <Text style={styles.priceLabel}>{opP.currentPrice.toLocaleString()}원</Text>}
          </View>
        </View>
      </SoftCard>

      <Text style={styles.refreshHint}>아래로 당겨서 새로고침</Text>
      <SafetyDisclaimer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  timerCard: { alignItems: 'center', marginBottom: 16 },
  timerLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  timerValue: { fontSize: 28, fontWeight: '700', color: COLORS.clay },
  periodText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  vsSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, gap: 12 },
  antSide: { alignItems: 'center', flex: 1 },
  antName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginTop: 8 },
  myLabel: { fontSize: 11, color: COLORS.clay, fontWeight: '700', marginTop: 2 },
  vsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSoft, justifyContent: 'center', alignItems: 'center' },
  vsText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  rateRow: { flexDirection: 'row' },
  rateSide: { flex: 1, alignItems: 'center' },
  rateDivider: { width: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 12 },
  stockLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 },
  rateValue: { fontSize: 24, fontWeight: '700' },
  priceLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  refreshHint: { textAlign: 'center', fontSize: 12, color: COLORS.disabled, marginVertical: 16 },
});
