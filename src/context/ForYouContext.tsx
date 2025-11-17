import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ForYouState {
  products: any[];
  offset: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ForYouContextType extends ForYouState {
  appendProducts: (newProducts: any[]) => void;
  setProducts: (products: any[]) => void;
  setOffset: (offset: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProducts: () => void;
}

const initialForYouState: ForYouState = {
  products: [],
  offset: 1,
  hasMore: true,
  isLoading: false,
  error: null,
};

const ForYouContext = createContext<ForYouContextType | undefined>(undefined);

export const useForYou = () => {
  const context = useContext(ForYouContext);
  if (!context) {
    throw new Error('useForYou must be used within a ForYouProvider');
  }
  return context;
};

interface ForYouProviderProps {
  children: ReactNode;
}

export const ForYouProvider: React.FC<ForYouProviderProps> = ({ children }) => {
  const [state, setState] = useState<ForYouState>(initialForYouState);

  const appendProducts = useCallback((newProducts: any[]) => {
    setState(prev => {
      // Filter out duplicates based on product ID
      const existingIds = new Set(prev.products.map((item: any) => item.id));
      const uniqueNewProducts = newProducts.filter((item: any) => !existingIds.has(item.id));
      return {
        ...prev,
        products: [...prev.products, ...uniqueNewProducts],
      };
    });
  }, []);

  const setProducts = useCallback((products: any[]) => {
    setState(prev => ({
      ...prev,
      products,
    }));
  }, []);

  const setOffset = useCallback((offset: number) => {
    setState(prev => ({
      ...prev,
      offset,
    }));
  }, []);

  const setHasMore = useCallback((hasMore: boolean) => {
    setState(prev => ({
      ...prev,
      hasMore,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
    }));
  }, []);

  const clearProducts = useCallback(() => {
    setState(initialForYouState);
  }, []);

  const value: ForYouContextType = {
    ...state,
    appendProducts,
    setProducts,
    setOffset,
    setHasMore,
    setLoading,
    setError,
    clearProducts,
  };

  return (
    <ForYouContext.Provider value={value}>
      {children}
    </ForYouContext.Provider>
  );
};