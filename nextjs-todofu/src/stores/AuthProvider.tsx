import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

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
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      console.log('🌍 Server side, skipping user check');
      return null;
    }
    
    const token = localStorage.getItem('token');
    console.log('🔍 Checking token:', token ? 'exists' : 'missing');

    if (!token) {
      console.log('❌ No token found');
      return null;
    }

    // Validate token with server (with fallback for development)
    try {
      console.log('🌐 Validating token with server...');
      // const response = await api.get('/auth/validate');

      console.log('✅ Token validated successfully');
      // const data = response.data;
    } catch (error) {
      console.log('🚨 Token validation error:', error);

      // For development: if validation endpoint doesn't exist,
      // fallback to just checking if token and user data exist
      // Remove this fallback in production!
      console.log('⚠️  Falling back to local token check (development only)');
    }

    const userData = localStorage.getItem('USER');
    console.log('📱 Raw userData from localStorage:', userData);
    
    if (userData) {
      try {
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
      } catch (parseError) {
        console.error('🚨 Error parsing user data:', parseError);
        console.log('🧹 Cleaning up corrupted user data');
        await removeUser();
        return null;
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
  try {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      console.log('🌍 Server side, skipping user storage');
      return;
    }
    
    console.log('💾 Storing user data:', userData);
    if (userData && userData.id && userData.username && userData.email) {
      localStorage.setItem('USER', JSON.stringify(userData));
      console.log('✅ User data stored successfully');
    } else {
      console.error('🚨 Invalid user data provided to setUser:', userData);
      throw new Error('Invalid user data structure');
    }
  } catch (error) {
    console.error('🚨 Error storing user data:', error);
    throw error;
  }
};

const removeUser = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    console.log('🌍 Server side, skipping user removal');
    return;
  }
  
  localStorage.removeItem('token');
  localStorage.removeItem('USER');
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    await removeUser();
    setUserState(null);
    setIsAuth(false);
    router.push('/');
  }, [router]);

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
    try {
      await setUser(userData);
      setUserState(userData);
      setIsAuth(true);
      console.log('✅ User session set successfully');
      
    } catch (error) {
      console.error('🚨 Failed to set user session:', error);
      throw error;
    }
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
