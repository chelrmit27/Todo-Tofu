import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../lib/api';

// Types
export interface Category {
  _id: string;
  name: string;
  color: string;
  userId: string;
}

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (
    categoryData: Omit<Category, '_id' | 'userId'>,
  ) => Promise<void>;
  updateCategory: (
    id: string,
    categoryData: Partial<Category>,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

const useCategoriesStore = create<CategoriesState>()(
  devtools(
    (set, get) => ({
      // Initial state
      categories: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      // Actions
      fetchCategories: async () => {
        const state = get();
        if (state.isLoading) return;

        set({ isLoading: true, error: null }, false, 'categories/fetchStart');

        try {
          const { data } = await api.get('/categories');

          set(
            {
              categories: data,
              isLoading: false,
              lastFetched: new Date(),
              error: null,
            },
            false,
            'categories/fetchSuccess',
          );
        } catch (error) {
          console.error('Failed loading categories', error);
          set(
            {
              error: 'Failed to load categories',
              isLoading: false,
            },
            false,
            'categories/fetchError',
          );
        }
      },

      createCategory: async (categoryData) => {
        try {
          const { data } = await api.post<Category>(
            '/categories',
            categoryData,
          );
          set(
            (state) => ({
              categories: [...state.categories, data],
            }),
            false,
            'categories/createSuccess',
          );
        } catch (error) {
          console.error('Failed to create category', error);
          set(
            { error: 'Failed to create category' },
            false,
            'categories/createError',
          );
        }
      },

      updateCategory: async (id, categoryData) => {
        try {
          const { data } = await api.patch<Category>(
            `/categories/${id}`,
            categoryData,
          );
          set(
            (state) => ({
              categories: state.categories.map((c) =>
                c._id === data._id ? data : c,
              ),
            }),
            false,
            'categories/updateSuccess',
          );
        } catch (error) {
          console.error('Failed to update category', error);
          set(
            { error: 'Failed to update category' },
            false,
            'categories/updateError',
          );
        }
      },

      deleteCategory: async (id) => {
        try {
          await api.delete(`/categories/${id}`);
          set(
            (state) => ({
              categories: state.categories.filter((c) => c._id !== id),
            }),
            false,
            'categories/deleteSuccess',
          );
        } catch (error) {
          console.error('Failed to delete category', error);
          set(
            { error: 'Failed to delete category' },
            false,
            'categories/deleteError',
          );
        }
      },

      clearError: () => {
        set({ error: null }, false, 'categories/clearError');
      },
    }),
    {
      name: 'categories-store',
    },
  ),
);

export default useCategoriesStore;
