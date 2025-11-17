import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CategoryData } from '../hooks/useCategories';

interface CategoryContextType {
  selectedCategory: CategoryData | null;
  selectedSubCategory: CategoryData | null;
  setSelectedCategory: (category: CategoryData | null) => void;
  setSelectedSubCategory: (subCategory: CategoryData | null) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<CategoryData | null>(null);

  const value = {
    selectedCategory,
    selectedSubCategory,
    setSelectedCategory,
    setSelectedSubCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};