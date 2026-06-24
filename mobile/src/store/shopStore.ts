import { create } from 'zustand';
import { AntItem, User, UserItem } from '../types/models';
import { shopService } from '../services/shop.service';

function extractErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const res = (e as { response?: { data?: { error?: { message?: string } } } }).response;
    if (res?.data?.error?.message) return res.data.error.message;
  }
  if (e instanceof Error) return e.message;
  return '오류가 발생했습니다.';
}

interface ShopState {
  shopItems: AntItem[];
  inventory: UserItem[];
  isLoading: boolean;
  error: string | null;

  loadShopItems: (category?: string) => Promise<void>;
  loadInventory: () => Promise<void>;
  purchaseItem: (itemId: string) => Promise<number>;
  equipItem: (userItemId: string) => Promise<Partial<User>>;
  unequipItem: (category: string) => Promise<void>;
}

export const useShopStore = create<ShopState>((set) => ({
  shopItems: [],
  inventory: [],
  isLoading: false,
  error: null,

  loadShopItems: async (category?: string) => {
    set({ isLoading: true, error: null });
    try {
      const shopItems = await shopService.getShopItems(category);
      set({ shopItems, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: extractErrorMessage(e) });
    }
  },

  loadInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      const inventory = await shopService.getInventory();
      set({ inventory, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: extractErrorMessage(e) });
    }
  },

  purchaseItem: async (itemId: string) => {
    const result = await shopService.purchaseItem(itemId);
    set((state) => ({
      inventory: [result.userItem, ...state.inventory],
    }));
    return result.newBalance;
  },

  equipItem: async (userItemId: string) => {
    const result = await shopService.equipItem(userItemId);
    return result.user;
  },

  unequipItem: async (category: string) => {
    await shopService.unequipItem(category);
  },
}));
