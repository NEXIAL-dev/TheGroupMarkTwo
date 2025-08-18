// src/components/tasks/TaskList.tsx
import { useTasks } from '@/stores/useTasks';
import { useAuth } from '@/stores/useAuth';
import { CheckCircle, Clock, Pause, User, Calendar } from 'lucide-react';
import { TaskStatus } from '@/types/models';

export default function TaskList() {
  const { tasks, filter, updateTaskStatus } = useTasks();
  const { user } = useAuth();

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'assigned':
        return task.assignedTo === user?.id;
      case 'created':
        return task.createdBy === user?.id;
      default:
        return true;
    }
  });

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'POSTPONED':
        return <Pause className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'POSTPONED':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(task.status)}
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              
              {task.description && (
                <p className="text-gray-600 mb-3">{task.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>Assigned to: {task.assignedToName}</span>
                </div>
                {task.dueAt && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Due: {new Date(task.dueAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                disabled={task.status === 'COMPLETED'}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Complete
              </button>
              <button
                onClick={() => updateTaskStatus(task.id, 'POSTPONED')}
                disabled={task.status === 'POSTPONED'}
                className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Postpone
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock size={48} className="mx-auto mb-2 text-gray-300" />
          <p>No tasks found</p>
        </div>
      )}
    </div>
  );
}