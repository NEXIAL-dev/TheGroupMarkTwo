// src/components/layout/Topbar.tsx
import { useAuth } from '@/stores/useAuth';
import { Bell, LogOut, Settings } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0]}!
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <Bell size={20} />
        </button>

        {/* Settings */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <Settings size={20} />
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          {user?.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <button
            onClick={() => logout()}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}