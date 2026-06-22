import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { EXPRESSION_ASSETS, EXPRESSION_ITEMS, isExpressionKey } from '../../constants/expressionAssets';
import ClayAntCharacter from '../../components/ant/ClayAntCharacter';
import PastelButton from '../../components/common/PastelButton';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import { AntItem, UserItem } from '../../types/models';
import type { MainTabScreenProps } from '../../navigation/types';

type ShopScreenProps = MainTabScreenProps<'Shop'>;

const FACE_PRICE = 10;

function getExpressionImage(item: AntItem) {
  return isExpressionKey(item.emoji) ? EXPRESSION_ASSETS[item.emoji] : undefined;
}

export default function ShopScreen({}: ShopScreenProps) {
  const { user, antBeans, patchUser, setAntBeans } = useAuthStore();
  const {
    shopItems,
    inventory,
    isLoading,
    loadShopItems,
    loadInventory,
    purchaseItem,
    equipItem,
  } = useShopStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  useEffect(() => {
    loadShopItems('expression');
    loadInventory();
  }, [loadInventory, loadShopItems]);

  const sortedItems = useMemo(() => {
    const order = new Map(EXPRESSION_ITEMS.map((item, index) => [item.key, index]));
    return [...shopItems]
      .filter((item) => item.category === 'expression')
      .sort((a, b) => (order.get(a.emoji as never) ?? 99) - (order.get(b.emoji as never) ?? 99));
  }, [shopItems]);

  const inventoryByItemId = useMemo(() => {
    const map = new Map<string, UserItem>();
    inventory.forEach((item) => map.set(item.itemId, item));
    return map;
  }, [inventory]);

  const selectedItem = useMemo(
    () => sortedItems.find((item) => item.id === selectedItemId) ?? sortedItems[0],
    [selectedItemId, sortedItems]
  );
  const previewExpression = selectedItem?.emoji ?? user?.equippedExpressionId ?? null;

  async function handleItemPress(item: AntItem) {
    setSelectedItemId(item.id);
  }

  async function handlePrimaryAction(item: AntItem) {
    if (!user || pendingItemId) return;

    const ownedItem = inventoryByItemId.get(item.id);
    const isEquipped = user.equippedExpressionId === item.emoji;

    if (isEquipped) return;

    try {
      setPendingItemId(item.id);

      if (ownedItem) {
        const patch = await equipItem(ownedItem.id);
        patchUser(patch);
        return;
      }

      if (antBeans < FACE_PRICE) {
        Alert.alert('개미콩이 부족해요', '얼굴 표정은 하나당 10개미콩이에요.');
        return;
      }

      const resultBalance = await purchaseItem(item.id);
      setAntBeans(resultBalance);

      const purchased = useShopStore.getState().inventory.find((userItem) => userItem.itemId === item.id);
      if (purchased) {
        const patch = await equipItem(purchased.id);
        patchUser(patch);
      }
    } catch {
      Alert.alert('상점 오류', '잠시 후 다시 시도해주세요.');
    } finally {
      setPendingItemId(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.breadcrumb}>상점 &gt; 얼굴</Text>
          <Text style={styles.title}>개미 표정</Text>
        </View>
        <View style={styles.beanBadge}>
          <Text style={styles.beanLabel}>개미콩</Text>
          <Text style={styles.beanValue}>{antBeans.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.previewSection}>
        <ClayAntCharacter
          size="large"
          rankScore={user?.rankScore ?? 0}
          equippedExpression={previewExpression}
        />
        <Text style={styles.previewName}>{selectedItem?.name ?? '표정을 고르세요'}</Text>
        <Text style={styles.previewDescription}>
          {selectedItem?.description ?? '얼굴 표정을 구매하고 장착할 수 있어요.'}
        </Text>
      </View>

      <View style={styles.categoryTabs}>
        <View style={styles.activeTab}>
          <Text style={styles.activeTabText}>얼굴</Text>
        </View>
      </View>

      {isLoading && sortedItems.length === 0 ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator color={COLORS.clay} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.itemList}
          showsVerticalScrollIndicator={false}
        >
          {sortedItems.map((item) => {
            const ownedItem = inventoryByItemId.get(item.id);
            const isOwned = Boolean(ownedItem);
            const isEquipped = user?.equippedExpressionId === item.emoji;
            const isPending = pendingItemId === item.id;
            const expressionImage = getExpressionImage(item);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                style={[
                  styles.itemCard,
                  selectedItem?.id === item.id && styles.selectedCard,
                ]}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.itemPreview}>
                  {expressionImage ? (
                    <Image source={expressionImage} style={styles.expressionThumb} resizeMode="contain" />
                  ) : (
                    <ClayAntCharacter size="small" equippedExpression={item.emoji} />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={styles.priceText}>🫘 {FACE_PRICE}</Text>
                </View>
                <PastelButton
                  title={isPending ? '처리중' : isEquipped ? '장착중' : isOwned ? '장착' : '구매'}
                  variant={isEquipped ? 'ghost' : 'clay'}
                  onPress={() => handlePrimaryAction(item)}
                  disabled={isPending || isEquipped}
                  style={styles.actionButton}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breadcrumb: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  beanBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  beanLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  beanValue: {
    color: COLORS.clay,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  previewSection: {
    alignItems: 'center',
    paddingBottom: 12,
    paddingTop: 10,
  },
  previewName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  previewDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  activeTab: {
    backgroundColor: COLORS.clay,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  activeTabText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '800',
  },
  loadingArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  itemList: {
    paddingBottom: 28,
  },
  itemCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
  },
  selectedCard: {
    borderColor: COLORS.clay,
    shadowColor: '#3F3A36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  itemPreview: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 14,
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
  },
  expressionThumb: {
    height: 54,
    width: 54,
  },
  itemInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  itemDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  priceText: {
    color: COLORS.clay,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
  actionButton: {
    minWidth: 82,
    paddingHorizontal: 0,
    paddingVertical: 9,
  },
});
