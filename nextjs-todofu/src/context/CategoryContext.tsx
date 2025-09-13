'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

// Define the shape of the category context
interface Category {
  name: string;
  color?: string;
}

interface CategoryData {
  _id: string;
  name: string;
  color: string;
}

interface CategoryContextType {
  categories: Record<string, Category>;
  setCategories: React.Dispatch<React.SetStateAction<Record<string, Category>>>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error(
      'useCategoryContext must be used within a CategoryProvider',
    );
  }
  return context;
};

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Record<string, Category>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for categories');
        return;
      }

      try {
        const categoryResponse = await api.get('/categories');
        
        const transformedCategories = categoryResponse.data.reduce(
          (acc: Record<string, Category>, category: CategoryData) => {
            acc[category._id] = { name: category.name, color: category.color };
            return acc;
          },
          {},
        );
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, setCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
