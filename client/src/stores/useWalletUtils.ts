import { useCallback } from 'react';
import useWalletStore from './useWalletStore';

/**
 * Custom hook to provide wallet-related utilities
 */
export const useWalletUtils = () => {
  const refreshData = useWalletStore((state) => state.refreshData);
  const updateSpentHours = useWalletStore((state) => state.updateSpentHours);
  const clearError = useWalletStore((state) => state.clearError);

  // Function to call after task operations to refresh wallet data
  const refreshWalletAfterTaskChange = useCallback(async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh wallet data after task change:', error);
    }
  }, [refreshData]);

  // Optimistic update function (use before API call for instant UI feedback)
  const optimisticUpdateSpentHours = useCallback((hours: number) => {
    updateSpentHours(hours);
  }, [updateSpentHours]);

  return {
    refreshWalletAfterTaskChange,
    optimisticUpdateSpentHours,
    clearError,
  };
};

export default useWalletUtils;
