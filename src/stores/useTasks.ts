// src/stores/useTasks.ts
import { create } from 'zustand';
import { Task, TaskStatus } from '@/types/models';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  filter: 'all' | 'assigned' | 'created';
  loadTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  setFilter: (filter: 'all' | 'assigned' | 'created') => void;
}

export const useTasks = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  filter: 'all',
  loadTasks: async () => {
    set({ isLoading: true });
    // Mock data
    const mockTasks: Task[] = [
      {
        id: 't1',
        title: 'Review quarterly budget reports',
        description: 'Analyze Q4 financial performance and prepare recommendations',
        createdBy: 'u1',
        createdByName: 'Darshan Patel',
        assignedTo: 'u2',
        assignedToName: 'Sarah Johnson',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        dueAt: new Date(Date.now() + 604800000).toISOString(),
      },
      {
        id: 't2',
        title: 'Update agency onboarding process',
        description: 'Streamline the new client acquisition workflow',
        createdBy: 'u2',
        createdByName: 'Sarah Johnson',
        assignedTo: 'u1',
        assignedToName: 'Darshan Patel',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 't3',
        title: 'Prepare monthly agency reports',
        description: 'Compile performance metrics for all agencies',
        createdBy: 'u1',
        createdByName: 'Darshan Patel',
        assignedTo: 'u1',
        assignedToName: 'Darshan Patel',
        status: 'POSTPONED',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        dueAt: new Date(Date.now() + 1209600000).toISOString(),
      },
    ];
    set({ tasks: mockTasks, isLoading: false });
  },
  createTask: async (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ tasks: [...get().tasks, newTask] });
  },
  updateTaskStatus: async (taskId, status) => {
    const tasks = get().tasks.map(task =>
      task.id === taskId
        ? { ...task, status, updatedAt: new Date().toISOString() }
        : task
    );
    set({ tasks });
  },
  setFilter: (filter) => set({ filter }),
}));