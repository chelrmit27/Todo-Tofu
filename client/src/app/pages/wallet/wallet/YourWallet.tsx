import React, { useEffect } from 'react';
import useWalletStore from '../../../../stores/useWalletStore';

const YourWallet = () => {
  // Get data and actions from Zustand store
  const {
    spentHours,
    budgetHours,
    remainingHours,
    isLoading,
    error,
    fetchSpentHours,
    clearError,
  } = useWalletStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchSpentHours();
  }, [fetchSpentHours]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-foreground">
        Your Wallet
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-row items-center justify-between px-14 mb-6">
        <div
          className="flex flex-row 
                bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-2xl
                py-5 items-center justify-center
                w-72 h-40
            "
        >
          <div className="flex flex-col">
            <div className="text-foreground">Budget Hours</div>
            <div className="text-[hsl(var(--primary-green))] font-bold text-5xl">
              {budgetHours}
            </div>
            <div className="text-[hsl(var(--primary-green))] font-bold text-3xl">
              hours
            </div>
          </div>
        </div>

        <div
          className="flex flex-col 
                bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-2xl
                py-5 items-center justify-center
                w-72 h-40
            "
        >
          <div className="flex flex-col">
            <div className="text-foreground">Spent Hours</div>
            <div className="text-[hsl(var(--primary-green))] font-bold text-5xl">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                spentHours
              )}
            </div>
            <div className="text-[hsl(var(--primary-green))] font-bold text-3xl">
              hours
            </div>
          </div>
        </div>

        <div
          className="flex flex-row 
                bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-2xl
                py-5 items-center justify-center
                w-72 h-40
            "
        >
          <div className="flex flex-col">
            <div className="text-foreground">Remaining</div>
            <div className="text-[hsl(var(--primary-green))] font-bold text-5xl">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                remainingHours
              )}
            </div>
            <div className="text-[hsl(var(--primary-green))] font-bold text-3xl">
              hours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourWallet;
