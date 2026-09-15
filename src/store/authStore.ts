import { create } from 'zustand';
import type { AuthSessionDTO } from '../types/user.types';
import { userService } from '../services/userService';

export interface AuthState {
  session: AuthSessionDTO | null;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  login: async (userId: string) => {
    const user = await userService.getUserById(userId);
    if (user) {
      set({
        session: {
          user,
          jwt: 'mock-jwt-token-' + user.id,
          activeTenantId: user.role === 'vendor' ? 'v1' : null, // Default to a tenant for vendors if needed, or handle later
        }
      });
    }
  },
  logout: () => set({ session: null }),
  switchTenant: (tenantId: string) => {
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          activeTenantId: tenantId,
        },
      };
    });
  },
}));
