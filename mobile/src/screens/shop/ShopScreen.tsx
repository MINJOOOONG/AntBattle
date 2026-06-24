import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { EXPRESSION_ASSETS, isExpressionKey } from '../../constants/expressionAssets';
import ClayAntCharacter from '../../components/ant/ClayAntCharacter';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import { AntItem, UserItem } from '../../types/models';
import type { MainTabScreenProps } from '../../navigation/types';
import type { ItemCategory } from '../../types/enums';

/** 배경 이미지 원본 비율 (941 × 1672) */
const BG_IMG_W = 941;
const BG_IMG_H = 1672;

type ShopScreenProps = MainTabScreenProps<'Shop'>;
type ShopTab = Extract<ItemCategory, 'outfit' | 'hat' | 'glasses'>;

const SHOP_TABS: { key: ShopTab; label: string }[] = [
  { key: 'outfit', label: '옷' },
  { key: 'hat', label: '모자' },
  { key: 'glasses', label: '액세서리' },
];

function getExpressionImage(emoji: string) {
  return isExpressionKey(emoji) ? EXPRESSION_ASSETS[emoji] : undefined;
}

function isEquippedItem(user: ReturnType<typeof useAuthStore.getState>['user'], item: AntItem) {
  if (!user) return false;

  switch (item.category) {
    case 'hat':
      return user.equippedHatId === item.id;
    case 'glasses':
      return user.equippedGlassesId === item.id;
    case 'expression':
      return user.equippedExpressionId === item.emoji;
    case 'outfit':
      return user.equippedOutfitId === item.id;
    case 'background':
      return user.equippedBackgroundId === item.id;
    case 'title':
      return user.equippedTitleId === item.id;
    default:
      return false;
  }
}

export default function ShopScreen({ navigation }: ShopScreenProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { user, antBeans, patchUser, setAntBeans } = useAuthStore();
  const { shopItems, inventory, isLoading, loadShopItems, loadInventory, purchaseItem, equipItem } =
    useShopStore();
  const [activeTab, setActiveTab] = useState<ShopTab>('outfit');
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const isCompact = screenW < 720;

  // ── 배경 이미지 비율 기반 레이아웃 계산 ──
  // 배경을 약간 축소하여 화면 안에 맞추고, 가로 중앙·상단 정렬
  const BG_SCALE = 0.9;
  const bgW = Math.ceil(screenW * BG_SCALE);
  const bgH = Math.ceil(bgW * (BG_IMG_H / BG_IMG_W));
  const bgLeft = Math.round((screenW - bgW) / 2);
  const bgTop = 0;

  // 개미 캐릭터 크기: 화면 너비의 42% (compact) — 크게 배치
  const antSize = isCompact ? Math.round(screenW * 0.42) : 236;
  const antH = antSize * 1.76;

  // 나무 무대 위치 (배경 이미지 좌표 기준)
  const platformTopY = bgTop + bgH * 0.79;
  const platformCenterX = bgLeft + bgW * 0.33;

  // 개미 캐릭터 — 발이 무대 표면 위에 오도록 절대 위치 계산
  const antTop = platformTopY - antH;
  const antLeft = platformCenterX - antSize / 2;

  // 상점 패널 위치 (배경 이미지 내부 오른쪽)
  const TAB_BAR_H = 64;
  const shopPanelTop = bgTop + bgH * 0.15;
  const shopPanelRight = bgLeft + (isCompact ? 8 : 20);
  const shopPanelWidth = isCompact ? bgW * 0.55 : 430;

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

  const currentExpression = user?.equippedExpressionId ?? null;

  const handleItemPress = useCallback(
    async (item: AntItem) => {
      if (!user || pendingItemId) return;

      const ownedItem = inventoryByItemId.get(item.id);
      const isEquipped = isEquippedItem(user, item);

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
      const isEquipped = isEquippedItem(user, item);
      const isPending = pendingItemId === item.id;
      const exprImg = getExpressionImage(item.emoji);

      return (
        <TouchableOpacity
          style={[
            styles.itemCard,
            isCompact && styles.itemCardCompact,
            isEquipped && styles.equippedCard,
          ]}
          activeOpacity={0.8}
          onPress={() => handleItemPress(item)}
          disabled={isPending}
          accessibilityLabel={`${item.name} ${isEquipped ? '장착중' : `${item.price} 개미콩`}`}
          accessibilityRole="button"
        >
          <View style={[styles.itemImgWrap, isCompact && styles.itemImgWrapCompact]}>
            {exprImg ? (
              <Image source={exprImg} style={styles.itemImg} resizeMode="contain" />
            ) : (
              <Text style={[styles.itemEmoji, isCompact && styles.itemEmojiCompact]}>{item.emoji}</Text>
            )}
            {isEquipped && (
              <View style={styles.checkCircle}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </View>

          <Text style={[styles.itemName, isCompact && styles.itemNameCompact]} numberOfLines={1}>
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
                style={[styles.beanSmall, isCompact && styles.beanSmallCompact]}
              />
              <Text style={[styles.priceText, isCompact && styles.priceTextCompact]}>{item.price}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [handleItemPress, pendingItemId, user]
  );

  return (
    <View style={styles.container}>
      {/* 배경 이미지: 화면 너비 꽉 채우고, 원본 비율 유지, 상단 정렬 */}
      <Image
        source={require('../../../assets/backgrounds/shop-background.png')}
        style={{
          position: 'absolute',
          top: bgTop,
          left: bgLeft,
          width: bgW,
          height: bgH,
        }}
        resizeMode="stretch"
      />

      {/* 상단 버튼 영역 — 배경 흙 라인 위(하늘 영역) */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: isCompact ? Math.round(bgH * 0.025) : 36,
            paddingHorizontal: isCompact ? 14 : 22,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.iconButton, isCompact && styles.iconButtonCompact]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
        >
          <Text style={[styles.topIcon, isCompact && styles.topIconCompact]}>‹</Text>
        </TouchableOpacity>

        <View style={[styles.topActions, isCompact && styles.topActionsCompact]}>
          <View style={[styles.topBeanBadge, isCompact && styles.topBeanBadgeCompact]}>
            <Image
              source={require('../../../assets/icons/antbean.png')}
              style={[styles.topBeanIcon, isCompact && styles.topBeanIconCompact]}
            />
            <Text style={[styles.topBeanCount, isCompact && styles.topBeanCountCompact]}>
              {antBeans.toLocaleString()}
            </Text>
            <Text style={[styles.plusText, isCompact && styles.plusTextCompact]}>＋</Text>
          </View>

          <TouchableOpacity style={[styles.iconButton, isCompact && styles.iconButtonCompact]} activeOpacity={0.75}>
            <Text style={[styles.topSmallIcon, isCompact && styles.topSmallIconCompact]}>🎁</Text>
            <Text style={[styles.iconCaption, isCompact && styles.iconCaptionCompact]}>이벤트</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconButton, isCompact && styles.iconButtonCompact]} activeOpacity={0.75}>
            <Text style={[styles.topSmallIcon, isCompact && styles.topSmallIconCompact]}>⚙</Text>
            <Text style={[styles.iconCaption, isCompact && styles.iconCaptionCompact]}>설정</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 개미 캐릭터 — 나무 무대 위에 절대 위치 배치 */}
      <View style={{ position: 'absolute', top: antTop, left: antLeft, zIndex: 2 }}>
        <ClayAntCharacter
          size={antSize}
          rankScore={user?.rankScore ?? 0}
          equippedExpression={currentExpression}
          animated
        />
      </View>

      {/* 오른쪽: 상점 카드 패널 — 동굴 내부 오른쪽 영역 */}
      <View
        style={[
          styles.rightPanel,
          isCompact && styles.rightPanelCompact,
          {
            position: 'absolute',
            top: shopPanelTop,
            right: shopPanelRight,
            bottom: TAB_BAR_H + 10,
            width: shopPanelWidth,
          },
        ]}
      >
        <View style={styles.tabRow}>
          {SHOP_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab(tab.key);
              }}
              activeOpacity={0.8}
              accessibilityLabel={`${tab.label} 탭`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab.key }}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
            numColumns={2}
            key="shop-grid-2"
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.refreshRow}>
          <Text style={styles.refreshText}>상품 갱신까지</Text>
          <Text style={styles.refreshTime}>23:59:59</Text>
          <Text style={styles.refreshIcon}>↻</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A2917', // 배경 이미지 하단과 이어지는 흙 색상
  },

  /* ── 상단 버튼 바 ── */
  topBar: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 3,
  },
  topActions: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
  },
  topActionsCompact: {
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    borderColor: '#8E765C',
    borderRadius: 18,
    borderWidth: 1.5,
    height: 54,
    justifyContent: 'center',
    minWidth: 54,
    paddingHorizontal: 12,
  },
  iconButtonCompact: {
    borderRadius: 14,
    height: 44,
    minWidth: 44,
    paddingHorizontal: 8,
  },
  topIcon: {
    color: '#2E2924',
    fontSize: 40,
    lineHeight: 42,
    marginTop: -4,
  },
  topIconCompact: {
    fontSize: 34,
    lineHeight: 36,
  },
  topSmallIcon: {
    color: '#2E2924',
    fontSize: 25,
    lineHeight: 28,
  },
  topSmallIconCompact: {
    fontSize: 20,
    lineHeight: 23,
  },
  iconCaption: {
    bottom: -26,
    color: '#4C3F33',
    fontSize: 12,
    fontWeight: '700',
    position: 'absolute',
  },
  iconCaptionCompact: {
    bottom: -22,
    fontSize: 10,
  },
  topBeanBadge: {
    alignItems: 'center',
    borderColor: '#8E765C',
    borderRadius: 28,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 10,
    height: 54,
    paddingHorizontal: 20,
  },
  topBeanBadgeCompact: {
    gap: 7,
    height: 44,
    paddingHorizontal: 12,
  },
  topBeanIcon: {
    height: 24,
    width: 24,
  },
  topBeanIconCompact: {
    height: 18,
    width: 18,
  },
  topBeanCount: {
    color: '#2E2924',
    fontSize: 24,
    fontWeight: '800',
    minWidth: 64,
    textAlign: 'center',
  },
  topBeanCountCompact: {
    fontSize: 18,
    minWidth: 44,
  },
  plusText: {
    color: '#2E2924',
    fontSize: 31,
    lineHeight: 32,
  },
  plusTextCompact: {
    fontSize: 24,
    lineHeight: 25,
  },

  /* ── 오른쪽: 상점 카드 패널 (절대 위치, width/top/right/bottom은 인라인) ── */
  rightPanel: {
    backgroundColor: 'rgba(255, 250, 243, 0.73)',
    borderColor: '#9A7D60',
    borderRadius: 28,
    borderWidth: 1.5,
    overflow: 'hidden',
    paddingBottom: 46,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  rightPanelCompact: {
    borderRadius: 18,
    paddingBottom: 36,
    paddingHorizontal: 10,
    paddingTop: 12,
  },

  /* ── 탭 버튼 ── */
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tabBtn: {
    alignItems: 'center',
    flex: 1,
    height: 40,
    justifyContent: 'center',
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: '#9B7653',
  },
  tabLabel: {
    color: '#735C47',
    fontSize: 15,
    fontWeight: '800',
  },
  tabLabelActive: {
    color: '#fff',
  },

  /* ── 아이템 그리드 ── */
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#735C47',
    fontSize: 15,
    fontWeight: '700',
  },
  gridContent: {
    gap: 10,
    paddingBottom: 10,
  },
  row: {
    gap: 10,
    marginBottom: 10,
  },

  itemCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 239, 0.52)',
    borderColor: 'rgba(154, 125, 96, 0.32)',
    borderRadius: 18,
    borderWidth: 2,
    flex: 1,
    minHeight: 168,
    paddingBottom: 14,
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  itemCardCompact: {
    borderRadius: 14,
    minHeight: 116,
    paddingBottom: 8,
    paddingHorizontal: 5,
    paddingTop: 7,
  },
  equippedCard: {
    backgroundColor: 'rgba(255, 248, 239, 0.84)',
    borderColor: '#9B7653',
  },
  previewCard: {
    borderColor: COLORS.stone,
  },
  itemImgWrap: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    width: '100%',
  },
  itemImgWrapCompact: {
    height: 44,
    marginBottom: 5,
  },
  itemImg: {
    height: '100%',
    width: '100%',
  },
  itemEmoji: {
    fontSize: 46,
  },
  itemEmojiCompact: {
    fontSize: 30,
  },
  checkCircle: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#9B7653',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  itemName: {
    color: '#211B16',
    fontSize: 16,
    fontWeight: '800',
    minHeight: 22,
    textAlign: 'center',
  },
  itemNameCompact: {
    fontSize: 11,
    minHeight: 16,
  },
  itemStatus: {
    marginTop: 4,
  },
  equippedBadge: {
    backgroundColor: '#9B7653',
    borderRadius: 999,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  equippedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  beanSmall: {
    width: 18,
    height: 18,
  },
  beanSmallCompact: {
    height: 13,
    width: 13,
  },
  priceText: {
    color: '#211B16',
    fontSize: 18,
    fontWeight: '800',
  },
  priceTextCompact: {
    fontSize: 13,
  },
  refreshRow: {
    alignItems: 'center',
    bottom: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    left: 14,
    position: 'absolute',
    right: 14,
  },
  refreshText: {
    color: '#4B3B2E',
    fontSize: 12,
    fontWeight: '700',
  },
  refreshTime: {
    color: '#211B16',
    fontSize: 15,
    fontWeight: '900',
  },
  refreshIcon: {
    color: '#211B16',
    fontSize: 24,
    lineHeight: 25,
  },
});
