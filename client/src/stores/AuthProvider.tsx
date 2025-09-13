import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

// Constants for inactivity timeout
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
];

export interface AppUser {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAuth: boolean;
  isLoading: boolean;
  setUserSession: (userData: AppUser) => Promise<void>;
  logout: () => Promise<void>;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for user management
const getUser = async (): Promise<AppUser | null> => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔍 Checking token:', token ? 'exists' : 'missing');

    if (!token) {
      console.log('❌ No token found');
      return null;
    }

    // Validate token with server (with fallback for development)
    try {
      console.log('🌐 Validating token with server...');
      const response = await api.get('/auth/validate');

      console.log('✅ Token validated successfully');
      const data = response.data;
    } catch (error) {
      console.log('🚨 Token validation error:', error);

      // For development: if validation endpoint doesn't exist,
      // fallback to just checking if token and user data exist
      // Remove this fallback in production!
      console.log('⚠️  Falling back to local token check (development only)');
    }

    const userData = localStorage.getItem('USER');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('👤 Parsed user data:', parsedUser);

      if (
        parsedUser &&
        parsedUser.id &&
        parsedUser.email &&
        parsedUser.username
      ) {
        console.log('✅ Valid user data found');
        return parsedUser;
      }
    }

    console.log('❌ Invalid user data, cleaning up');
    await removeUser();
    return null;
  } catch (error) {
    console.error('🚨 getUser error:', error);
    await removeUser();
    return null;
  }
};

const setUser = async (userData: AppUser): Promise<void> => {
  localStorage.setItem('USER', JSON.stringify(userData));
};

const removeUser = async (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('USER');
  localStorage.removeItem('lastAnalyticsUpdate');
};

// Helper function to update weekly analytics
const updateWeeklyAnalytics = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Check if we've already updated today
    const lastUpdate = localStorage.getItem('lastAnalyticsUpdate');
    const today = new Date().toISOString().split('T')[0];

    if (lastUpdate === today) {
      console.log('Weekly analytics already updated today');
      return;
    }

    console.log('Updating weekly analytics...');

    const response = await api.post('/aggregation/analytics/weekly/update');

    localStorage.setItem('lastAnalyticsUpdate', today);
    console.log('Weekly analytics updated successfully');
  } catch (error) {
    console.error('Error updating weekly analytics:', error);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    await removeUser();
    setUserState(null);
    setIsAuth(false);
    navigate('/');
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    if (!isAuth) return;

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [isAuth, logout]);

  useEffect(() => {
    const loadUser = async () => {
      console.log('🔄 Starting auth check, isLoading:', true);
      setIsLoading(true);

      try {
        const userData = await getUser();
        console.log('👤 User data from getUser:', userData);

        if (userData) {
          setUserState(userData);
          setIsAuth(true);
          console.log('✅ User authenticated successfully');
          // Update weekly analytics when user loads (once per day)
          await updateWeeklyAnalytics();
        } else {
          setIsAuth(false);
          console.log('❌ User not authenticated');
        }
      } catch (error) {
        console.error('🚨 Auth check error:', error);
        setIsAuth(false);
        setUserState(null);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth check complete, isLoading:', false);
      }
    };

    loadUser();
  }, []);

  const setUserSession = async (userData: AppUser) => {
    await setUser(userData);
    setUserState(userData);
    setIsAuth(true);
    // Update weekly analytics when user logs in (once per day)
    await updateWeeklyAnalytics();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        isLoading,
        setUserSession,
        logout,
        resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
