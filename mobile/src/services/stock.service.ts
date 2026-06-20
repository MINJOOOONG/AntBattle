import api from './api';
import { StockListResponse, StockDetailResponse } from '../types/api';

export const stockService = {
  async getStocks(search?: string, sector?: string): Promise<StockListResponse> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (sector) params.sector = sector;
    const { data } = await api.get<StockListResponse>('/stocks', { params });
    return data;
  },

  async getStockById(id: string): Promise<StockDetailResponse> {
    const { data } = await api.get<StockDetailResponse>(`/stocks/${id}`);
    return data;
  },

  async getStockPrice(id: string): Promise<{ price: number; changeRate: number }> {
    const { data } = await api.get(`/stocks/${id}/price`);
    return data;
  },
};
