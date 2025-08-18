// src/components/messaging/MessageList.tsx
import { useChannels } from '@/stores/useChannels';
import { useEffect, useRef } from 'react';

export default function MessageList() {
  const { messages, activeChannelId } = useChannels();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelMessages = activeChannelId ? messages[activeChannelId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  if (!activeChannelId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Select a channel to start messaging</p>
          <p className="text-sm">Choose from the available channels on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {channelMessages.map((message) => (
        <div key={message.id} className="flex gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {message.authorName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{message.authorName || 'Unknown'}</span>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}