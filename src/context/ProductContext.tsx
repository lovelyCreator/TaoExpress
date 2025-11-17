import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProductContextType {
  category: string;
  setCategory: (category: string) => void;
  resetProductData: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [category, setCategory] = useState<string>('Shoes');

  const resetProductData = () => {
    setCategory('Shoes');
  };

  return (
    <ProductContext.Provider
      value={{
        category,
        setCategory,
        resetProductData,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};