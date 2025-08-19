// src/stores/useAgencies.ts
import { create } from "zustand";
import { Agency, AgencyWithMembers } from "@/types/models";
import { AgencyService } from "@/services/agencies";
import { supabase } from "@/lib/supabase";

interface AgencyState {
  agencies: AgencyWithMembers[];
  isLoading: boolean;
  error?: string;
  loadAgencies: () => Promise<void>;
  createAgency: (name: string, status?: string) => Promise<void>;
  updateAgency: (agencyId: string, updates: any) => Promise<void>;
  deleteAgency: (agencyId: string) => Promise<void>;
  addActivity: (agencyId: string, activity: string) => Promise<void>;
}

export const useAgencies = create<AgencyState>((set, get) => ({
  agencies: [],
  isLoading: false,
  error: undefined,

  loadAgencies: async () => {
    set({ isLoading: true });
    try {
      const agencies = await AgencyService.getAllAgencies();
      set({ agencies, isLoading: false, error: undefined });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createAgency: async (name, status) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await AgencyService.createAgency({ name, status }, user.id);
      await get().loadAgencies();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateAgency: async (agencyId, updates) => {
    try {
      await AgencyService.updateAgency(agencyId, updates);
      await get().loadAgencies();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteAgency: async (agencyId) => {
    try {
      await AgencyService.deleteAgency(agencyId);
      await get().loadAgencies();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addActivity: async (agencyId, activity) => {
    try {
      await AgencyService.addRecentActivity(agencyId, activity);
      await get().loadAgencies();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
