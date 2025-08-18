// src/stores/useNotices.ts
import { create } from 'zustand';
import { Notice } from '@/types/models';

interface NoticeState {
  notices: Notice[];
  isLoading: boolean;
  scope: 'GROUP' | 'AGENCY';
  selectedAgencyId?: string;
  loadNotices: (scope: 'GROUP' | 'AGENCY', agencyId?: string) => Promise<void>;
  createNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => Promise<void>;
  setScope: (scope: 'GROUP' | 'AGENCY', agencyId?: string) => void;
}

export const useNotices = create<NoticeState>((set, get) => ({
  notices: [],
  isLoading: false,
  scope: 'GROUP',
  selectedAgencyId: undefined,
  loadNotices: async (scope, agencyId) => {
    set({ isLoading: true });
    // Mock data
    const mockNotices: Notice[] = [
      {
        id: 'n1',
        scope: 'GROUP',
        title: 'New Partnership Opportunities',
        body: 'We\'ve identified several new potential partners for the upcoming quarter. Please review the attached proposals and provide feedback by Friday.',
        createdBy: 'u1',
        createdByName: 'Darshan Patel',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'n2',
        scope: scope === 'GROUP' ? 'GROUP' : 'AGENCY',
        agencyId: scope === 'AGENCY' ? agencyId : undefined,
        title: 'Quarterly Performance Review',
        body: 'Time for our quarterly check-in! All team members should prepare their performance summaries and submit them through the portal.',
        createdBy: 'u2',
        createdByName: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
    set({ notices: mockNotices, isLoading: false });
  },
  createNotice: async (noticeData) => {
    const newNotice: Notice = {
      ...noticeData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    set({ notices: [...get().notices, newNotice] });
  },
  setScope: (scope, agencyId) => {
    set({ scope, selectedAgencyId: agencyId });
    get().loadNotices(scope, agencyId);
  },
}));