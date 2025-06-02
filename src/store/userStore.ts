import { create } from 'zustand';
import { TelegramUser } from '../types';

interface UserState {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: TelegramUser) => void;
  logout: () => void;
  initializeFromStorage: () => void;
}

// Function to get stored user data
const getStoredUser = (): TelegramUser | null => {
  try {
    const storedUser = localStorage.getItem('telegramUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Error parsing stored user:', error);
    localStorage.removeItem('telegramUser');
  }
  return null;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (user: TelegramUser) => {
    localStorage.setItem('telegramUser', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },
  
  logout: () => {
    localStorage.removeItem('telegramUser');
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  
  initializeFromStorage: () => {
    try {
      const storedUser = getStoredUser();
      
      if (storedUser) {
        // Have user data, treat as authenticated for now
        // Token validation will be done in LoginPage if needed
        set({ user: storedUser, isAuthenticated: true, isLoading: false });
        return;
      }
      
      // No valid authentication found
      set({ isLoading: false });
    } catch (error) {
      console.error('Error initializing from storage:', error);
      set({ isLoading: false });
    }
  },
}));

// Initialize from localStorage when the store is created
useUserStore.getState().initializeFromStorage();