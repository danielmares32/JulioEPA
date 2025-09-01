import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';
import { offlineManager } from '../services/offlineSync';
import { User } from '../../shared/types/database';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  error: string | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      rememberMe: false,
      error: null,

      login: async (email: string, password: string, remember: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login(email, password);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            set({
              user,
              token,
              isAuthenticated: true,
              rememberMe: remember,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.error || 'Login failed');
          }
        } catch (error) {
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Network error'
          });
          throw error;
        }
      },

      logout: async () => {
        // Clear API token
        await apiClient.logout();
        
        // Clear offline data
        offlineManager.clearAll();
        
        // Reset auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          rememberMe: false,
          error: null
        });
      },

      checkAuth: async () => {
        const currentState = get();
        
        if (currentState.token && currentState.user) {
          // Token exists and user is already set
          set({ isAuthenticated: true });
        } else if (currentState.user && !currentState.rememberMe) {
          // User exists but remember me is false - keep them authenticated for this session
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false, user: null, token: null });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      clearError: () => set({ error: null }),

      refreshUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          // This would be an API call to get current user info
          // const response = await apiClient.getCurrentUser();
          // if (response.success) {
          //   set({ user: response.data });
          // }
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);