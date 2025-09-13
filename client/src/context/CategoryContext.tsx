import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define the shape of the category context
interface Category {
  name: string;
  color?: string;
}

interface CategoryContextType {
  categories: Record<string, Category>;
  setCategories: React.Dispatch<React.SetStateAction<Record<string, Category>>>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Record<string, Category>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please log in.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const categoryResponse = await axios.get('http://localhost:5001/api/categories', config);
        const transformedCategories = categoryResponse.data.reduce(
          (acc: Record<string, Category>, category: any) => {
            acc[category._id] = { name: category.name, color: category.color };
            return acc;
          },
          {}
        );
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Only show alert if we're in a protected route context
        if (window.location.pathname.startsWith('/app/')) {
          alert('Failed to fetch categories.');
        }
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
