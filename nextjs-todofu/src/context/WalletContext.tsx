import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '../lib/api';

// Types
interface WalletData {
  spentHours: number;
  budgetHours: number;
  remainingHours: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface WalletContextValue extends WalletData {
  refreshWalletData: () => Promise<void>;
  updateSpentHours: (hours: number) => void;
}

// Create context
const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// Custom hook to use wallet context
export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Provider component
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [spentHours, setSpentHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Constants
  const budgetHours = 15;
  const remainingHours = Math.max(0, budgetHours - spentHours);

  // Fetch wallet data from API
  const fetchWalletData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setIsLoading(false);
        return;
      }

      const response = await api.get('/tasks/today');

      console.log('WalletContext - API Response:', response.data);

      const hours = response.data?.spentHours;
      if (typeof hours === 'number' && !isNaN(hours) && hours >= 0) {
        setSpentHours(hours);
        setLastUpdated(new Date());
      } else {
        console.warn('Invalid spentHours received:', hours);
        setSpentHours(0);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to fetch wallet data');
      setSpentHours(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual update function for optimistic updates
  const updateSpentHours = useCallback((hours: number) => {
    if (typeof hours === 'number' && !isNaN(hours) && hours >= 0) {
      setSpentHours(hours);
      setLastUpdated(new Date());
    }
  }, []);

  // Refresh function that can be called from components
  const refreshWalletData = useCallback(async () => {
    await fetchWalletData();
  }, [fetchWalletData]);

  // Initial data fetch
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Context value
  const contextValue: WalletContextValue = {
    spentHours,
    budgetHours,
    remainingHours,
    isLoading,
    error,
    lastUpdated,
    refreshWalletData,
    updateSpentHours,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
