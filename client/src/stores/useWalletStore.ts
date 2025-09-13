import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../lib/api';

// Types
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

        set({ isLoading: true, error: null }, false, 'wallet/fetchStart');

        try {
          const { data } = await api.get('/tasks/today');

          console.log('Zustand Store - API Response:', data);

          const hours = data?.spentHours;
          if (typeof hours === 'number' && !isNaN(hours) && hours >= 0) {
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
            console.warn('Invalid spentHours received:', hours);
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
          console.error('Error fetching spent hours:', error);
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
