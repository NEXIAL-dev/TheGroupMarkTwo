// src/components/messaging/MessageInput.tsx
import { useState } from 'react';
import { useChannels } from '@/stores/useChannels';
import { Send } from 'lucide-react';

export default function MessageInput() {
  const [text, setText] = useState('');
  const { activeChannelId, sendMessage } = useChannels();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChannelId) return;
    
    sendMessage(activeChannelId, text.trim());
    setText('');
  };

  if (!activeChannelId) {
    return null;
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
        >
          <Send size={16} />
          Send
        </button>
      </form>
    </div>
  );
}