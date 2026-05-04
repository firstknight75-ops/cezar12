import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SubscriptionPlan, TokenBalance } from '@cezar12/shared';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface User {
  id: string;
  email: string;
  fullName: string;
  countryCode: string;
  currency: string;
  preferredLang: string;
  isVerified: boolean;
  hasCompanyProfile: boolean;
}

interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  billingCycle: string;
  status: string;
  tokensPerCycle: number;
  tokensRemaining: number;
  currentPeriodEnd: string;
}

interface AuthStore {
  // State
  user: User | null;
  subscription: Subscription | null;
  tokenBalance: TokenBalance | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (params: {
    user: User;
    subscription: Subscription;
    tokenBalance: TokenBalance;
    accessToken: string;
    refreshToken: string;
  }) => void;
  updateUser: (user: Partial<User>) => void;
  updateSubscription: (subscription: Subscription) => void;
  updateTokenBalance: (balance: TokenBalance) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// ═══════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      subscription: null,
      tokenBalance: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: ({ user, subscription, tokenBalance, accessToken, refreshToken }) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
        }
        set({
          user,
          subscription,
          tokenBalance,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateSubscription: (subscription) => set({ subscription }),

      updateTokenBalance: (tokenBalance) => set({ tokenBalance }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        set({
          user: null,
          subscription: null,
          tokenBalance: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'cezar12-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        user: state.user,
        subscription: state.subscription,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════

export const selectUser = (state: AuthStore) => state.user;
export const selectPlan = (state: AuthStore) => state.subscription?.plan;
export const selectTokenBalance = (state: AuthStore) => state.tokenBalance;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
