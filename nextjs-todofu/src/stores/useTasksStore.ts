import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../lib/api';

// Types
export interface Task {
  _id: string;
  title: string;
  categoryId: string;
  date: string;
  start: Date;
  end: Date;
  done: boolean;
  notes?: string;
}

interface TasksState {
  tasks: Task[];
  todayTasks: Task[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  fetchTasks: (date: string, done?: boolean) => Promise<void>;
  fetchTodayTasks: () => Promise<void>;
  createTask: (taskData: Omit<Task, '_id'>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskDone: (id: string) => Promise<void>;
  clearError: () => void;
}

const useTasksStore = create<TasksState>()(
  devtools(
    (set, get) => ({
      // Initial state
      tasks: [],
      todayTasks: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      // Actions
      fetchTasks: async (date: string, done?: boolean) => {
        const state = get();
        if (state.isLoading) return;

        set({ isLoading: true, error: null }, false, 'tasks/fetchStart');

        try {
          const params: {date: string; done?: boolean} = { date };
          if (done !== undefined) {
            params.done = done;
          }

          const { data } = await api.get('/tasks', { params });

          set(
            {
              tasks: data,
              isLoading: false,
              lastFetched: new Date(),
              error: null,
            },
            false,
            'tasks/fetchSuccess',
          );
        } catch (error) {
          console.error('Failed loading tasks', error);
          set(
            {
              error: 'Failed to load tasks',
              isLoading: false,
            },
            false,
            'tasks/fetchError',
          );
        }
      },

      fetchTodayTasks: async () => {
        const state = get();
        if (state.isLoading) return;

        set({ isLoading: true, error: null }, false, 'tasks/fetchTodayStart');

        try {
          const { data } = await api.get('/tasks/today');

          set(
            {
              todayTasks: data.tasks || [],
              isLoading: false,
              lastFetched: new Date(),
              error: null,
            },
            false,
            'tasks/fetchTodaySuccess',
          );
        } catch (error) {
          console.error('Failed loading today tasks', error);
          set(
            {
              error: 'Failed to load today tasks',
              isLoading: false,
            },
            false,
            'tasks/fetchTodayError',
          );
        }
      },

      createTask: async (taskData) => {
        try {
          const { data } = await api.post<Task>('/tasks', taskData);
          set(
            (state) => ({
              tasks: [...state.tasks, data],
              todayTasks: [...state.todayTasks, data],
            }),
            false,
            'tasks/createSuccess',
          );
        } catch (error) {
          console.error('Failed to create task', error);
          set({ error: 'Failed to create task' }, false, 'tasks/createError');
        }
      },

      updateTask: async (id, taskData) => {
        try {
          const { data } = await api.patch<Task>(`/tasks/${id}`, taskData);
          set(
            (state) => ({
              tasks: state.tasks.map((t) => (t._id === data._id ? data : t)),
              todayTasks: state.todayTasks.map((t) =>
                t._id === data._id ? data : t,
              ),
            }),
            false,
            'tasks/updateSuccess',
          );
        } catch (error) {
          console.error('Failed to update task', error);
          set({ error: 'Failed to update task' }, false, 'tasks/updateError');
        }
      },

      deleteTask: async (id) => {
        try {
          await api.delete(`/tasks/${id}`);
          set(
            (state) => ({
              tasks: state.tasks.filter((t) => t._id !== id),
              todayTasks: state.todayTasks.filter((t) => t._id !== id),
            }),
            false,
            'tasks/deleteSuccess',
          );
        } catch (error) {
          console.error('Failed to delete task', error);
          set({ error: 'Failed to delete task' }, false, 'tasks/deleteError');
        }
      },

      toggleTaskDone: async (id) => {
        const state = get();
        const task =
          state.tasks.find((t) => t._id === id) ||
          state.todayTasks.find((t) => t._id === id);

        if (!task) return;

        try {
          const { data } = await api.patch<Task>(`/tasks/${id}`, {
            done: !task.done,
          });

          set(
            (state) => ({
              tasks: state.tasks.map((t) => (t._id === data._id ? data : t)),
              todayTasks: state.todayTasks.map((t) =>
                t._id === data._id ? data : t,
              ),
            }),
            false,
            'tasks/toggleDoneSuccess',
          );
        } catch (error) {
          console.error('Failed to toggle task', error);
          set(
            { error: 'Failed to toggle task' },
            false,
            'tasks/toggleDoneError',
          );
        }
      },

      clearError: () => {
        set({ error: null }, false, 'tasks/clearError');
      },
    }),
    {
      name: 'tasks-store',
    },
  ),
);

export default useTasksStore;
