import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import api from '../lib/api';

// Types
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: localStorage.getItem('token'),
        isAuthenticated: !!localStorage.getItem('token'),
        isLoading: false,
        error: null,

        // Actions
        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null }, false, 'auth/loginStart');

          try {
            const { data } = await api.post('/auth/login', {
              email,
              password,
            });

            const { token, user } = data;

            // Store token in localStorage and API headers
            localStorage.setItem('token', token);

            set(
              {
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              },
              false,
              'auth/loginSuccess',
            );

            return true;
          } catch (error: unknown) {
            const errorMessage =
              (error as {response?: {data?: {message?: string}}})?.response?.data?.message || 'Login failed';
            console.error('Login failed', error);
            set(
              {
                error: errorMessage,
                isLoading: false,
                isAuthenticated: false,
              },
              false,
              'auth/loginError',
            );
            return false;
          }
        },

        register: async (email: string, password: string, name?: string) => {
          set({ isLoading: true, error: null }, false, 'auth/registerStart');

          try {
            const { data } = await api.post('/auth/register', {
              email,
              password,
              name,
            });

            const { token, user } = data;

            // Store token in localStorage
            localStorage.setItem('token', token);

            set(
              {
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              },
              false,
              'auth/registerSuccess',
            );

            return true;
          } catch (error: unknown) {
            const errorMessage =
              (error as {response?: {data?: {message?: string}}})?.response?.data?.message || 'Registration failed';
            console.error('Registration failed', error);
            set(
              {
                error: errorMessage,
                isLoading: false,
                isAuthenticated: false,
              },
              false,
              'auth/registerError',
            );
            return false;
          }
        },

        logout: () => {
          localStorage.removeItem('token');
          set(
            {
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            },
            false,
            'auth/logout',
          );
        },

        checkAuth: async () => {
          const state = get();
          if (!state.token) return;

          set({ isLoading: true }, false, 'auth/checkStart');

          try {
            const { data } = await api.get('/auth/me');
            set(
              {
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
              },
              false,
              'auth/checkSuccess',
            );
          } catch (error) {
            console.error('Auth check failed', error);
            // Token is invalid, clear auth state
            localStorage.removeItem('token');
            set(
              {
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              },
              false,
              'auth/checkError',
            );
          }
        },

        clearError: () => {
          set({ error: null }, false, 'auth/clearError');
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    {
      name: 'auth-store',
    },
  ),
);

export default useAuthStore;
