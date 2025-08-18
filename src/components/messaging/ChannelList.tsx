// src/components/messaging/ChannelList.tsx
import { useChannels } from '@/stores/useChannels';
import { useAuth } from '@/stores/useAuth';
import { canAccessGroupChannel, canAccessAgencyChannel } from '@/utils/rbac';
import { Hash, Building } from 'lucide-react';

export default function ChannelList() {
  const { channels, activeChannelId, setActiveChannel } = useChannels();
  const { user } = useAuth();

  const filteredChannels = channels.filter(channel => {
    if (channel.type === 'GROUP') {
      return canAccessGroupChannel(user);
    }
    return canAccessAgencyChannel(user, channel.agencyId);
  });

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Channels</h3>
      </div>
      <div className="p-2">
        {filteredChannels.map((channel) => {
          const isActive = activeChannelId === channel.id;
          return (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                ${isActive 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'text-gray-700 hover:bg-white hover:shadow-sm'
                }
              `}
            >
              {channel.type === 'GROUP' ? (
                <Hash size={16} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
              ) : (
                <Building size={16} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
              )}
              <span className="font-medium truncate">{channel.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}