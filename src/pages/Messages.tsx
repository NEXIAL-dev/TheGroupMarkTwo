// src/pages/Messages.tsx
import { useEffect } from 'react';
import { useChannels } from '@/stores/useChannels';
import ChannelList from '@/components/messaging/ChannelList';
import MessageList from '@/components/messaging/MessageList';
import MessageInput from '@/components/messaging/MessageInput';

export default function Messages() {
  const { loadChannels } = useChannels();

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  return (
    <div className="h-full flex">
      <ChannelList />
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your team and agencies</p>
        </div>
        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
}