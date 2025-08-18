// src/pages/Dashboard.tsx
import { useEffect } from 'react';
import { useAuth } from '@/stores/useAuth';
import { useTasks } from '@/stores/useTasks';
import { useChannels } from '@/stores/useChannels';
import { useAgencies } from '@/stores/useAgencies';
import { MessageSquare, CheckSquare, Building, TrendingUp } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loadTasks } = useTasks();
  const { channels, loadChannels } = useChannels();
  const { agencies, loadAgencies } = useAgencies();

  useEffect(() => {
    loadTasks();
    loadChannels();
    loadAgencies();
  }, [loadTasks, loadChannels, loadAgencies]);

  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const myTasks = tasks.filter(task => task.assignedTo === user?.id);

  const stats = [
    {
      name: 'Active Channels',
      value: channels.length,
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      name: 'Pending Tasks',
      value: pendingTasks,
      icon: CheckSquare,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      name: 'My Agencies',
      value: agencies.filter(a => a.ownerId === user?.id).length,
      icon: Building,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      name: 'Completed Tasks',
      value: completedTasks,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your business activities</p>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="flex flex-wrap gap-2">
                {user.baseRoles.map((role) => (
                  <RoleBadge key={role} role={role} size="md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Recent Tasks</h3>
          <div className="space-y-3">
            {myTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {task.dueAt && `Due: ${new Date(task.dueAt).toLocaleDateString()}`}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'COMPLETED' 
                    ? 'bg-green-100 text-green-700' 
                    : task.status === 'POSTPONED'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
            {myTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">No tasks assigned to you</p>
            )}
          </div>
        </div>

        {/* Agencies Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Agencies</h3>
          <div className="space-y-3">
            {agencies.filter(a => a.ownerId === user?.id).slice(0, 3).map((agency) => (
              <div key={agency.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{agency.name}</p>
                    <p className="text-xs text-gray-500">{agency.memberIds.length} members</p>
                  </div>
                </div>
              </div>
            ))}
            {agencies.filter(a => a.ownerId === user?.id).length === 0 && (
              <p className="text-gray-500 text-center py-4">No agencies owned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}