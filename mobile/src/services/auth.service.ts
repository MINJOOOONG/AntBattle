import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from '../types/api';

const TOKEN_KEY = 'auth_token';

export const authService = {
  async signup(email: string, nickname: string, handle: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/signup', { email, nickname, handle, password });
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  async login(handle: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { handle, password });
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  async getMe(): Promise<AuthResponse> {
    const { data } = await api.get<AuthResponse>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
};
