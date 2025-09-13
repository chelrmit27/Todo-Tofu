import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../lib/api';

// Types
interface ApiError {
  response?: {
    data: unknown;
    status: number;
  };
}

interface Task {
  _id: string;
  title: string;
  start: string;
  end: string;
  done: boolean;
  date: string;
  categoryId: string;
}

interface WalletState {
  spentHours: number;
  budgetHours: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  // Computed values
  remainingHours: number;

  // Actions
  fetchSpentHours: () => Promise<void>;
  updateSpentHours: (hours: number) => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const useWalletStore = create<WalletState>()(
  devtools(
    (set, get) => ({
      // Initial state
      spentHours: 0,
      budgetHours: 15,
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Computed value
      get remainingHours() {
        const state = get();
        return Math.max(0, state.budgetHours - state.spentHours);
      },

      // Actions
      fetchSpentHours: async () => {
        const state = get();

        // Prevent multiple simultaneous calls
        if (state.isLoading) return;

        console.log('Wallet Store: Starting fetchSpentHours');
        const currentDate = new Date();
        // Use local date instead of UTC to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const todayDateString = `${year}-${month}-${day}`;
        
        set({ isLoading: true, error: null }, false, 'wallet/fetchStart');

        try {
          const { data } = await api.get(`/tasks?date=${todayDateString}`);

          // Calculate spent hours from tasks
          let totalMinutes = 0;
          if (data?.tasks && Array.isArray(data.tasks)) {
            data.tasks.forEach((task: Task) => {
              if (task.start && task.end) {
                const start = new Date(task.start);
                const end = new Date(task.end);
                const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
                if (minutes > 0) {
                  totalMinutes += minutes;
                }
              }
            });
          }
          
          const hours = Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places
          console.log('💰 WALLET STORE: Calculated total minutes:', totalMinutes);
          console.log('💰 WALLET STORE: Calculated spentHours:', hours, 'type:', typeof hours);
          
          if (typeof hours === 'number' && !isNaN(hours) && hours >= 0) {
            console.log('💰 WALLET STORE: Setting spentHours to:', hours);
            set(
              {
                spentHours: hours,
                lastUpdated: new Date(),
                isLoading: false,
                error: null,
              },
              false,
              'wallet/fetchSuccess',
            );
          } else {
            console.warn('💰 WALLET STORE: Invalid spentHours calculated:', hours);
            set(
              {
                spentHours: 0,
                isLoading: false,
                error: null,
              },
              false,
              'wallet/fetchInvalidData',
            );
          }
        } catch (error) {
          console.error('Wallet Store: Error fetching spent hours:', error);
          if (error && typeof error === 'object' && 'response' in error) {
            const apiError = error as ApiError;
            console.error('Wallet Store: Error details:', apiError.response?.data);
            console.error('Wallet Store: Error status:', apiError.response?.status);
          }
          set(
            {
              error: 'Failed to fetch wallet data',
              isLoading: false,
            },
            false,
            'wallet/fetchError',
          );
        }
      },

      updateSpentHours: (hours: number) => {
        if (typeof hours === 'number' && !isNaN(hours) && hours >= 0) {
          set(
            {
              spentHours: hours,
              lastUpdated: new Date(),
            },
            false,
            'wallet/updateSpentHours',
          );
        }
      },

      refreshData: async () => {
        await get().fetchSpentHours();
      },

      clearError: () => {
        set({ error: null }, false, 'wallet/clearError');
      },
    }),
    {
      name: 'wallet-store', // For Redux DevTools
    },
  ),
);

export default useWalletStore;
