import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useBattleStore } from '../../store/battleStore';
import { useAuthStore } from '../../store/authStore';
import { stockService } from '../../services/stock.service';
import type { Stock } from '../../types/models';
import SoftCard from '../../components/common/SoftCard';
import PastelButton from '../../components/common/PastelButton';
import SectionHeader from '../../components/common/SectionHeader';
import AntCharacter from '../../components/ant/AntCharacter';
import CharacterBubble from '../../components/common/CharacterBubble';
import LoadingView from '../../components/common/LoadingView';
import ErrorView from '../../components/common/ErrorView';
import type { RootScreenProps } from '../../navigation/types';

export default function StockSelectScreen({ route, navigation }: RootScreenProps<'StockSelect'>) {
  const { battleId } = route.params;
  const { currentBattle, isLoading, loadBattleDetail, selectStock } = useBattleStore();
  const { user } = useAuthStore();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBattleDetail(battleId);
    loadStocks();
  }, [battleId]);

  const loadStocks = async (query?: string) => {
    setStocksLoading(true);
    try {
      const data = await stockService.getStocks(query);
      setStocks(data.stocks);
    } catch {} finally {
      setStocksLoading(false);
    }
  };

  const handleSearch = () => {
    const trimmed = search.trim();
    loadStocks(trimmed || undefined);
  };

  const handleSelectStock = async (stock: Stock) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`${stock.name}을 내 개미가 들고 뛸까요?`)
      : await new Promise<boolean>((resolve) =>
          Alert.alert('종목 선택', `${stock.name}을 내 개미가 들고 뛸까요?`, [
            { text: '다시 볼게', style: 'cancel', onPress: () => resolve(false) },
            { text: '이 종목이야!', onPress: () => resolve(true) },
          ])
        );

    if (!confirmed) return;

    setSubmitting(true);
    try {
      await selectStock(battleId, stock.id);
      await loadBattleDetail(battleId);
      const battle = useBattleStore.getState().currentBattle;
      if (battle?.status === 'active') {
        navigation.replace('BattleProgress', { battleId });
      } else {
        if (Platform.OS === 'web') {
          window.alert('상대 개미가 종목을 고르면 배틀이 시작돼요.');
        } else {
          Alert.alert('종목 선택 완료!', '상대 개미가 종목을 고르면 배틀이 시작돼요.');
        }
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || '종목 선택에 실패했어요.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('앗!', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading && !currentBattle) return <LoadingView message="배틀 정보 불러오는 중..." />;
  if (!currentBattle || !user) return <ErrorView message="배틀 정보를 불러올 수 없어요." onRetry={() => loadBattleDetail(battleId)} />;

  const myParticipant = currentBattle.participants.find((p) => p.userId === user.id);
  const alreadySelected = myParticipant && myParticipant.stockId;

  // 대기 중일 때 폴링으로 상태 확인 → active 되면 자동 이동
  useEffect(() => {
    if (!alreadySelected) return;
    const interval = setInterval(async () => {
      await loadBattleDetail(battleId);
      const battle = useBattleStore.getState().currentBattle;
      if (battle?.status === 'active') {
        clearInterval(interval);
        navigation.replace('BattleProgress', { battleId });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [alreadySelected, battleId]);

  if (alreadySelected) {
    return (
      <View style={styles.waitContainer}>
        <AntCharacter size="large" rankScore={user.rankScore} />
        <CharacterBubble message="상대 개미가 종목을 고르면 배틀이 시작돼요!" />
        <Text style={styles.waitStock}>{myParticipant?.stock?.name || '선택한 종목'}으로 결정!</Text>
        <PastelButton title="돌아가기" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 20, width: '60%' }} />
      </View>
    );
  }

  const renderStockItem = ({ item }: { item: Stock }) => {
    const isPositive = item.changeRate >= 0;
    return (
      <TouchableOpacity onPress={() => handleSelectStock(item)} disabled={submitting} activeOpacity={0.7}>
        <SoftCard style={styles.stockCard}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>{item.name}</Text>
            <Text style={styles.stockCode}>{item.code}</Text>
          </View>
          <View style={styles.stockPrice}>
            <Text style={styles.priceText}>{item.currentPrice.toLocaleString()}원</Text>
            <Text style={[styles.changeText, { color: isPositive ? COLORS.gainRed : COLORS.lossBlue }]}>
              {isPositive ? '+' : ''}{item.changeRate.toFixed(2)}%
            </Text>
          </View>
        </SoftCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="내 개미가 들고 뛸 종목 고르기" style={{ paddingHorizontal: 20, paddingTop: 8 }} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="종목명 또는 코드 검색"
          placeholderTextColor={COLORS.disabled}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {stocksLoading ? (
        <LoadingView message="종목 불러오는 중..." />
      ) : (
        <FlatList
          data={stocks}
          keyExtractor={(item) => item.id}
          renderItem={renderStockItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  searchButton: { backgroundColor: COLORS.clay, borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center' },
  searchButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  stockCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: 16 },
  stockInfo: { flex: 1 },
  stockName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  stockCode: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  stockPrice: { alignItems: 'flex-end' },
  priceText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  changeText: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  waitContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  waitStock: { fontSize: 16, fontWeight: '700', color: COLORS.clay, marginTop: 12 },
});
