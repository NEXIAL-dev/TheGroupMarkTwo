// src/stores/useAuth.ts
import { create } from 'zustand';
import { User } from '@/types/models';
import { AuthService, SignUpData, SignInData } from '@/services/auth';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user?: User;
  isLoading: boolean;
  isInitialized: boolean;
  error?: string;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: undefined,
  isLoading: false,
  isInitialized: false,
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
      const result:any = await AuthService.signIn(data);
      if (result.profile) {
        set({ user: result.profile, isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await AuthService.signOut();
      set({ user: undefined, isLoading: false, error: undefined });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ isLoading: false });
    }
  },

  logout: () => {
    get().signOut();
  },

  setUser: (user) => set({ user }),

  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true, error: undefined });
    try {
      // Check if there's an active session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ user: undefined, isLoading: false, isInitialized: true });
        return;
      }

      const user = await AuthService.getCurrentUser();
      set({ user: user || undefined, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: undefined, isLoading: false, isInitialized: true, error: undefined });
    }
  },

  clearError: () => set({ error: undefined }),
}));

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const { initialize, isInitialized } = useAuth.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    // Only reinitialize if we're already initialized to avoid loops
    if (isInitialized) {
      const user = await AuthService.getCurrentUser();
      useAuth.setState({ user: user || undefined, isLoading: false });
    }
  } else if (event === 'SIGNED_OUT') {
    useAuth.setState({ user: undefined, isLoading: false, error: undefined });
  } else if (event === 'TOKEN_REFRESHED') {
    // Handle token refresh silently
    console.log('Token refreshed');
  }
});