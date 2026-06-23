import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { EXPRESSION_ASSETS, isExpressionKey } from '../../constants/expressionAssets';
import ClayAntCharacter from '../../components/ant/ClayAntCharacter';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import { AntItem, UserItem } from '../../types/models';
import type { MainTabScreenProps } from '../../navigation/types';

type ShopScreenProps = MainTabScreenProps<'Shop'>;
type TabType = 'expression' | 'outfit';

const SCREEN_W = Dimensions.get('window').width;
// right panel is flex:6 of total, with 8px right margin
const RIGHT_PANEL_W = SCREEN_W * 0.6 - 8;
// 3 cols, 8px horizontal padding each side, 4px gap between cols
const ITEM_W = Math.floor((RIGHT_PANEL_W - 16 - 8) / 3);

function getExpressionImage(emoji: string) {
  return isExpressionKey(emoji) ? EXPRESSION_ASSETS[emoji] : undefined;
}

export default function ShopScreen({}: ShopScreenProps) {
  const { user, antBeans, patchUser, setAntBeans } = useAuthStore();
  const { shopItems, inventory, isLoading, loadShopItems, loadInventory, purchaseItem, equipItem } =
    useShopStore();
  const [activeTab, setActiveTab] = useState<TabType>('expression');
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [previewExpr, setPreviewExpr] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    loadShopItems(activeTab);
  }, [activeTab, loadShopItems]);

  const filteredItems = useMemo(
    () => shopItems.filter((item) => item.category === activeTab),
    [shopItems, activeTab]
  );

  const inventoryByItemId = useMemo(() => {
    const map = new Map<string, UserItem>();
    inventory.forEach((inv) => map.set(inv.itemId, inv));
    return map;
  }, [inventory]);

  const currentExpression = previewExpr ?? user?.equippedExpressionId ?? null;

  const handleItemPress = useCallback(
    async (item: AntItem) => {
      if (!user || pendingItemId) return;

      if (activeTab === 'expression') {
        setPreviewExpr(item.emoji);
      }

      const ownedItem = inventoryByItemId.get(item.id);
      const isEquipped =
        activeTab === 'expression'
          ? user.equippedExpressionId === item.emoji
          : user.equippedOutfitId === item.id;

      if (isEquipped) return;

      try {
        setPendingItemId(item.id);

        if (ownedItem) {
          const patch = await equipItem(ownedItem.id);
          patchUser(patch);
          return;
        }

        if (antBeans < item.price) {
          Alert.alert('개미콩이 부족해요', `이 아이템은 ${item.price}개미콩이에요.`);
          return;
        }

        const resultBalance = await purchaseItem(item.id);
        setAntBeans(resultBalance);

        const purchased = useShopStore.getState().inventory.find((ui) => ui.itemId === item.id);
        if (purchased) {
          const patch = await equipItem(purchased.id);
          patchUser(patch);
        }
      } catch {
        Alert.alert('상점 오류', '잠시 후 다시 시도해주세요.');
      } finally {
        setPendingItemId(null);
      }
    },
    [user, pendingItemId, activeTab, inventoryByItemId, antBeans, equipItem, patchUser, purchaseItem, setAntBeans]
  );

  const renderItem = useCallback(
    ({ item }: { item: AntItem }) => {
      const isEquipped =
        activeTab === 'expression'
          ? user?.equippedExpressionId === item.emoji
          : user?.equippedOutfitId === item.id;
      const isPending = pendingItemId === item.id;
      const isPreview = activeTab === 'expression' && previewExpr === item.emoji;
      const exprImg = getExpressionImage(item.emoji);

      return (
        <TouchableOpacity
          style={[
            styles.itemCard,
            isEquipped && styles.equippedCard,
            !isEquipped && isPreview && styles.previewCard,
          ]}
          activeOpacity={0.8}
          onPress={() => handleItemPress(item)}
          disabled={isPending}
        >
          <View style={styles.itemImgWrap}>
            {exprImg ? (
              <Image source={exprImg} style={styles.itemImg} resizeMode="contain" />
            ) : (
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
            )}
            {isEquipped && (
              <View style={styles.checkCircle}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </View>

          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>

          {isPending ? (
            <ActivityIndicator size="small" color={COLORS.clay} style={styles.itemStatus} />
          ) : isEquipped ? (
            <View style={styles.equippedBadge}>
              <Text style={styles.equippedText}>장착중</Text>
            </View>
          ) : (
            <View style={styles.priceRow}>
              <Image
                source={require('../../../assets/icons/antbean.png')}
                style={styles.beanSmall}
              />
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [activeTab, handleItemPress, pendingItemId, previewExpr, user]
  );

  return (
    <View style={styles.container}>
      {/* Cave background */}
      <Image
        source={require('../../../assets/backgrounds/shop-background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <View style={styles.layout}>
        {/* Left: character preview */}
        <View style={styles.leftPanel}>
          <View style={styles.charWrap}>
            <ClayAntCharacter
              size="large"
              rankScore={user?.rankScore ?? 0}
              equippedExpression={currentExpression}
              animated
            />
          </View>
          <View style={styles.beanBadge}>
            <Image
              source={require('../../../assets/icons/antbean.png')}
              style={styles.beanIcon}
            />
            <Text style={styles.beanCount}>{antBeans.toLocaleString()}</Text>
          </View>
        </View>

        {/* Right: shop panel */}
        <View style={styles.rightPanel}>
          {/* Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'expression' && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab('expression');
                setPreviewExpr(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.tabIcon}>😊</Text>
              <Text style={[styles.tabLabel, activeTab === 'expression' && styles.tabLabelActive]}>
                얼굴
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'outfit' && styles.tabBtnActive]}
              onPress={() => setActiveTab('outfit')}
              activeOpacity={0.8}
            >
              <Text style={styles.tabIcon}>👕</Text>
              <Text style={[styles.tabLabel, activeTab === 'outfit' && styles.tabLabelActive]}>
                옷
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Item grid */}
          {isLoading && filteredItems.length === 0 ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={COLORS.clay} size="large" />
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.emptyText}>아이템이 없어요</Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 52,
    paddingBottom: 80,
  },

  // ── Left panel ──
  leftPanel: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 12,
  },
  charWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 240, 224, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  beanIcon: {
    width: 22,
    height: 22,
  },
  beanCount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // ── Right panel ──
  rightPanel: {
    flex: 6,
    backgroundColor: 'rgba(251, 247, 242, 0.97)',
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 8,
    marginRight: 8,
    overflow: 'hidden',
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: COLORS.clay,
  },
  tabIcon: {
    fontSize: 13,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSoft,
    marginHorizontal: 10,
    marginBottom: 8,
  },

  // ── Grid ──
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  row: {
    gap: 4,
    marginBottom: 4,
  },

  // ── Item card ──
  itemCard: {
    width: ITEM_W,
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    padding: 6,
    paddingBottom: 8,
  },
  equippedCard: {
    borderColor: COLORS.clay,
    backgroundColor: '#FFF8F2',
  },
  previewCard: {
    borderColor: COLORS.stone,
  },
  itemImgWrap: {
    width: ITEM_W - 16,
    height: ITEM_W - 16,
    borderRadius: 10,
    backgroundColor: '#EDE7DF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImg: {
    width: '88%',
    height: '88%',
  },
  itemEmoji: {
    fontSize: 28,
  },
  checkCircle: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.clay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  itemName: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 5,
    textAlign: 'center',
  },
  itemStatus: {
    marginTop: 4,
  },
  equippedBadge: {
    marginTop: 4,
    backgroundColor: COLORS.clay,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  equippedText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  beanSmall: {
    width: 11,
    height: 11,
  },
  priceText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
