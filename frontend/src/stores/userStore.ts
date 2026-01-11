import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '../types/refTypes';
import { authAPI } from '../services/api';

export interface AuthenticatedUser {
  id?: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
}

interface UserState {
  user: AuthenticatedUser | null;
  loading: boolean;
  login: (userData: AuthenticatedUser) => void;
  logout: () => void;
  setUser: (user: AuthenticatedUser | null) => void;
  updateUser: (updates: Partial<AuthenticatedUser>) => void;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,

      login: (userData: AuthenticatedUser) => {
        set({ user: userData, loading: false });
      },

      logout: () => {
        authAPI.logout();
        set({ user: null, loading: false });
      },

      setUser: (user: AuthenticatedUser | null) => {
        set({ user, loading: false });
      },

      updateUser: (updates: Partial<AuthenticatedUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ loading: false, user: null });
          return;
        }

        try {
          const userData = await authAPI.getCurrentUser();
          set({
            user: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role as UserRole,
              avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=14b8a6&color=fff`,
            },
            loading: false,
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({ loading: false, user: null });
        }
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user, not loading
    }
  )
);
