// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/useAuth';
import { useAgencies } from '@/stores/useAgencies';
import { useEffect } from 'react';
import { 
  MessageSquare, 
  BookOpen, 
  CheckSquare, 
  Bell, 
  Calculator,
  Home,
  Building,
  Users
} from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { agencies, loadAgencies } = useAgencies();

  useEffect(() => {
    loadAgencies();
  }, [loadAgencies]);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/logs', label: 'Logs', icon: BookOpen },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/notices', label: 'Notices', icon: Bell },
    { to: '/ledger', label: 'Ledger', icon: Calculator },
  ];

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
    const isActive = pathname === to;
    return (
      <Link
        to={to}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }
        `}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Business Hub</h1>
            <p className="text-xs text-gray-500">Management Platform</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.baseRoles.map((role) => (
                  <RoleBadge key={role} role={role} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </div>

        {/* Agencies Section */}
        {agencies.length > 0 && (
          <div className="mt-8">
            <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Agencies
            </h3>
            <div className="space-y-1">
              {agencies.map((agency) => (
                <Link
                  key={agency.id}
                  to={`/agencies/${agency.id}`}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                >
                  <Building size={16} />
                  <span className="truncate">{agency.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}