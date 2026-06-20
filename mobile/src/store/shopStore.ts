import { create } from 'zustand';
import { AntItem, UserItem } from '../types/models';
import { shopService } from '../services/shop.service';

interface ShopState {
  shopItems: AntItem[];
  inventory: UserItem[];
  isLoading: boolean;

  loadShopItems: (category?: string) => Promise<void>;
  loadInventory: () => Promise<void>;
  purchaseItem: (itemId: string) => Promise<number>;
  equipItem: (userItemId: string) => Promise<void>;
  unequipItem: (category: string) => Promise<void>;
}

export const useShopStore = create<ShopState>((set) => ({
  shopItems: [],
  inventory: [],
  isLoading: false,

  loadShopItems: async (category?: string) => {
    set({ isLoading: true });
    try {
      const shopItems = await shopService.getShopItems(category);
      set({ shopItems, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadInventory: async () => {
    set({ isLoading: true });
    try {
      const inventory = await shopService.getInventory();
      set({ inventory, isLoading: false });
    } catch {
      set({ isLoading: false });
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
    await shopService.equipItem(userItemId);
  },

  unequipItem: async (category: string) => {
    await shopService.unequipItem(category);
  },
}));
