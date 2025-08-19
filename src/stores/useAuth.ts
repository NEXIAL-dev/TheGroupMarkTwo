// src/stores/useAuth.ts
import { create } from 'zustand';
import { User } from '@/types/models';
import { AuthService, SignUpData, SignInData } from '@/services/auth';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user?: User;
  isLoading: boolean;
  error?: string;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: undefined,
  isLoading: false,
  error: undefined,
  
  signUp: async (data) => {
    set({ isLoading: true, error: undefined });
    try {
      await AuthService.signUp(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  signIn: async (data) => {
    set({ isLoading: true, error: undefined });
    try {
      const result = await AuthService.signIn(data);
      if (result.profile) {
        set({ user: result.profile, isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await AuthService.signOut();
      set({ user: undefined });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  logout: () => {
    get().signOut();
  },

  setUser: (user) => set({ user }),

  initialize: async () => {
    set({ isLoading: true });
    try {
      const user = await AuthService.getCurrentUser();
      set({ user: user || undefined, isLoading: false });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },
}));

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const { initialize } = useAuth.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    await initialize();
  } else if (event === 'SIGNED_OUT') {
    useAuth.setState({ user: undefined });
  }
});