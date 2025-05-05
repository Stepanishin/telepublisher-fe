import { create } from 'zustand';
import { TelegramUser } from '../types';

interface UserState {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  login: (user: TelegramUser) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user: TelegramUser) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));