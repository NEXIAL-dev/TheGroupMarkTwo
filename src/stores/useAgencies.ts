// src/stores/useAgencies.ts
import { create } from "zustand";
import { Agency } from "@/types/models";

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
      {
      id: 'a1',
      name: 'Tech Solutions',
      owner_id: 'u1',
      status: 'Open to Work',
      recent_activity: ['Organized team meeting', 'Updated project roadmap'],
      memeber_id: ['string'],
      created_at: '2023-10-01T00:00:00Z',
      },
      {
      id: 'a2',
      name: 'Creative Minds',
      owner_id: 'u2',
      status: 'Busy',
      recent_activity: ['Completed design sprint', 'Client feedback received'],
      memeber_id: ['string'],
      created_at: '2023-10-02T00:00:00Z',
      },
      {
      id: 'a3',
      name: 'Marketing Gurus',
      owner_id: 'u3',
      status: 'Break/Vacation',
      recent_activity: ['Created new campaign', 'Analyzed market trends'],
      memeber_id: ['string'],
      created_at: '2023-10-03T00:00:00Z',
      },
      {
      id: 'a4',
      name: 'Design Wizards',
      owner_id: 'u4',
      status: 'Holiday',
      recent_activity: ['Worked on branding project', 'Reviewed design guidelines'],
      memeber_id: ['string'],
      created_at: '2023-10-04T00:00:00Z',
      }
    ];
    set({ agencies: mockAgencies, isLoading: false });
  },
}));
