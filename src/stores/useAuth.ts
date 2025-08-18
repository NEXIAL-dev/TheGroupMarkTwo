// src/stores/useAuth.ts
import { create } from 'zustand';
import { User } from '@/types/models';

interface AuthState {
  user?: User;
  token?: string;
  isLoading: boolean;
  error?: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: undefined,
  token: undefined,
  isLoading: false,
  error: undefined,
  login: async (email, password) => {
    set({ isLoading: true, error: undefined });
    try {
      // Mock login - replace with actual API call
      const mockUser: User = {
        id: 'u1',
        name: 'Darshan Patel',
        email,
        baseRoles: ['CORE_MEMBER', 'AGENCY_OWNER'],
        agencyRoles: [
          { agencyId: 'a1', roles: ['OWNER'] },
          { agencyId: 'a2', roles: ['OWNER'] }
        ],
        avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      };
      const mockToken = 'mock-jwt-token';
      
      localStorage.setItem('auth_token', mockToken);
      set({ user: mockUser, token: mockToken, isLoading: false });
    } catch (error) {
      set({ error: 'Login failed', isLoading: false });
    }
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: undefined, token: undefined });
  },
  setUser: (user) => set({ user }),
}));