import { create } from 'zustand';
import { User } from '../types/models';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  antBeans: number;
  isLoading: boolean;
  isAuthenticated: boolean;

  signup: (email: string, nickname: string, handle: string, password: string) => Promise<void>;
  login: (handle: string, password: string) => Promise<void>;
  loadSession: () => Promise<void>;
  logout: () => Promise<void>;
  patchUser: (patch: Partial<User>) => void;
  setAntBeans: (antBeans: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  antBeans: 0,
  isLoading: true,
  isAuthenticated: false,

  signup: async (email, nickname, handle, password) => {
    const result = await authService.signup(email, nickname, handle, password);
    set({
      user: result.user,
      token: result.token,
      antBeans: result.antBeans,
      isAuthenticated: true,
    });
  },

  login: async (handle, password) => {
    const result = await authService.login(handle, password);
    set({
      user: result.user,
      token: result.token,
      antBeans: result.antBeans,
      isAuthenticated: true,
    });
  },

  loadSession: async () => {
    try {
      const token = await authService.getToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const result = await authService.getMe();
      set({
        user: result.user,
        antBeans: result.antBeans,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await authService.logout();
      set({ user: null, token: null, antBeans: 0, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, antBeans: 0, isAuthenticated: false });
  },

  patchUser: (patch) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...patch } : state.user,
    }));
  },

  setAntBeans: (antBeans) => {
    set({ antBeans });
  },
}));
