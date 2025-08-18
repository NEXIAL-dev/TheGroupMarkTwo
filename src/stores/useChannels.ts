// src/stores/useChannels.ts
import { create } from 'zustand';
import { Channel, Message } from '@/types/models';

interface ChannelState {
  channels: Channel[];
  messages: Record<string, Message[]>; // by channelId
  activeChannelId?: string;
  isLoading: boolean;
  loadChannels: () => Promise<void>;
  loadMessages: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, content: string) => Promise<void>;
  setActiveChannel: (channelId: string) => void;
}

export const useChannels = create<ChannelState>((set, get) => ({
  channels: [],
  messages: {},
  activeChannelId: undefined,
  isLoading: false,
  loadChannels: async () => {
    set({ isLoading: true });
    // Mock data - replace with API call
    const mockChannels: Channel[] = [
      { id: 'group', type: 'GROUP', name: 'Core Group', memberIds: ['u1', 'u2', 'u3'] },
      { id: 'agency-1', type: 'AGENCY', agencyId: 'a1', name: 'Skyline Marketing', memberIds: ['u1', 'u4'] },
      { id: 'agency-2', type: 'AGENCY', agencyId: 'a2', name: 'Digital Innovations', memberIds: ['u1', 'u5'] },
      { id: 'agency-3', type: 'AGENCY', agencyId: 'a3', name: 'Creative Solutions', memberIds: ['u2', 'u6'] },
      { id: 'agency-4', type: 'AGENCY', agencyId: 'a4', name: 'Growth Partners', memberIds: ['u3', 'u7'] },
    ];
    set({ channels: mockChannels, isLoading: false });
  },
  loadMessages: async (channelId) => {
    // Mock messages
    const mockMessages: Message[] = [
      {
        id: 'm1',
        channelId,
        authorId: 'u1',
        authorName: 'Darshan Patel',
        content: 'Welcome to the channel! Let\'s discuss our upcoming projects.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'm2',
        channelId,
        authorId: 'u2',
        authorName: 'Sarah Johnson',
        content: 'Thanks for setting this up. I have some ideas to share.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
    set({ messages: { ...get().messages, [channelId]: mockMessages } });
  },
  sendMessage: async (channelId, content) => {
    const newMsg: Message = {
      id: crypto.randomUUID(),
      channelId,
      authorId: 'u1',
      authorName: 'Darshan Patel',
      content,
      createdAt: new Date().toISOString()
    };
    const curr = get().messages[channelId] ?? [];
    set({ messages: { ...get().messages, [channelId]: [...curr, newMsg] } });
  },
  setActiveChannel: (channelId) => {
    set({ activeChannelId: channelId });
    get().loadMessages(channelId);
  },
}));