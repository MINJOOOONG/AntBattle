import api from './api';
import { BeanBalanceResponse, BeanHistoryResponse } from '../types/api';

export const userService = {
  async getProfile(id: string) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async getMyBeans(): Promise<BeanBalanceResponse> {
    const { data } = await api.get<BeanBalanceResponse>('/users/me/beans');
    return data;
  },

  async getBeanHistory(limit = 20, offset = 0): Promise<BeanHistoryResponse> {
    const { data } = await api.get<BeanHistoryResponse>('/users/me/beans/history', {
      params: { limit, offset },
    });
    return data;
  },
};
