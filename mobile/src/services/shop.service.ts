import api from './api';
import { AntItem, UserItem } from '../types/models';
import { ShopItemsResponse, PurchaseResponse, InventoryResponse } from '../types/api';

export const shopService = {
  async getShopItems(category?: string): Promise<AntItem[]> {
    const params = category ? { category } : undefined;
    const { data } = await api.get<ShopItemsResponse>('/shop/items', { params });
    return data.items;
  },

  async purchaseItem(itemId: string): Promise<PurchaseResponse> {
    const { data } = await api.post<PurchaseResponse>('/shop/purchase', { itemId });
    return data;
  },

  async getInventory(): Promise<UserItem[]> {
    const { data } = await api.get<InventoryResponse>('/shop/inventory');
    return data.items;
  },

  async equipItem(userItemId: string): Promise<void> {
    await api.post('/shop/inventory/equip', { userItemId });
  },

  async unequipItem(category: string): Promise<void> {
    await api.post('/shop/inventory/unequip', { category });
  },
};
