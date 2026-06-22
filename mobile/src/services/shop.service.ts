import api from './api';
import { AntItem, UserItem } from '../types/models';
import { ShopItemsResponse, PurchaseResponse, InventoryResponse, EquipResponse } from '../types/api';

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

  async equipItem(userItemId: string): Promise<EquipResponse> {
    const { data } = await api.post<EquipResponse>('/shop/inventory/equip', { userItemId });
    return data;
  },

  async unequipItem(category: string): Promise<void> {
    await api.post('/shop/inventory/unequip', { category });
  },
};
