// src/stores/useAgencies.ts
import { create } from 'zustand';
import { Agency } from '@/types/models';

interface AgencyState {
  agencies: Agency[];
  isLoading: boolean;
  loadAgencies: () => Promise<void>;
}

export const useAgencies = create<AgencyState>((set) => ({
  agencies: [],
  isLoading: false,
  loadAgencies: async () => {
    set({ isLoading: true });
    // Mock data
    const mockAgencies: Agency[] = [
      { id: 'a1', name: 'Skyline Marketing', ownerId: 'u1', memberIds: ['u1', 'u4'] },
      { id: 'a2', name: 'Digital Innovations', ownerId: 'u1', memberIds: ['u1', 'u5'] },
      { id: 'a3', name: 'Creative Solutions', ownerId: 'u2', memberIds: ['u2', 'u6'] },
      { id: 'a4', name: 'Growth Partners', ownerId: 'u3', memberIds: ['u3', 'u7'] },
    ].map(agency => ({ ...agency, status: 'Open to Work' as const, recent_activity: [], created_at: new Date().toISOString() }));
    set({ agencies: mockAgencies, isLoading: false });
  },
}));