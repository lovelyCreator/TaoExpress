import { useState, useCallback } from 'react';
import { productsApi, storesApi } from '../services/api';
import { Product, Store, HomeUseMutationOptions, NewInProduct, TrendingProduct, ForYouProduct, UseNewInProductsMutationResult, UseTrendingProductsMutationResult, UseForYouProductsMutationResult, UseStoresMutationResult } from '../types';
import mockProductsData from '../data/mockProducts.json';

// Toggle this to switch between mock and real API
const USE_MOCK_DATA = true;

// Hook for fetching "New In" products
export const useNewInProductsMutation = (options?: HomeUseMutationOptions): UseNewInProductsMutationResult => {
  const [data, setData] = useState<NewInProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    categoryId: number,
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 999999.0,
    search: string = ''
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockData = mockProductsData.newIn as any[];
        setData(mockData);
        setIsSuccess(true);
        options?.onSuccess?.(mockData);
        setIsLoading(false);
        return;
      }

      const response = await productsApi.getLatestProductsByCategory(
        [categoryId], 
        1, 
        10,
        type,
        filter,
        ratingCount,
        minPrice,
        maxPrice,
        search
      );
      
      if (response.success && response.data) {
        // Check if data is a string and parse it
        let parsedData = response.data;
        if (typeof parsedData === 'string') {
          // Check if string is empty or whitespace only
          if (!parsedData.trim()) {
            setData([]);
            setIsLoading(false);
            return;
          }
          
          try {
            parsedData = JSON.parse(parsedData);
          } catch (parseError) {
            console.error('Error parsing new in products response data:', parseError);
            throw parseError;
          }
        }
        
        // Check if products array exists and is valid
        const products = parsedData.products || parsedData;
        if (Array.isArray(products)) {
          setData(products);
          setIsSuccess(true);
          options?.onSuccess?.(products);
        } else {
          throw new Error('Invalid products data format');
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch new in products';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Hook for fetching "Trending" products
export const useTrendingProductsMutation = (options?: HomeUseMutationOptions): UseTrendingProductsMutationResult => {
  const [data, setData] = useState<TrendingProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    categoryIds: number[],
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 9999999999.0,
    search: string = '',
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockData = mockProductsData.trending as any[];
        setData(mockData);
        setIsSuccess(true);
        options?.onSuccess?.(mockData);
        setIsLoading(false);
        return;
      }

      // Safety check for categoryIds
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new Error('Category IDs are required');
      }

      const response = await productsApi.getPopularProducts(
        categoryIds,
        1,
        25,
        type,
        filter,
        ratingCount,
        minPrice,
        maxPrice,
        search
      );
      
      if (response.success && response.data) {
        // Check if data is a string and parse it
        let parsedData = response.data;
        if (typeof parsedData === 'string') {
          // Check if string is empty or whitespace only
          if (!parsedData.trim()) {
            setData([]);
            setIsLoading(false);
            return;
          }
          
          try {
            parsedData = JSON.parse(parsedData);
          } catch (parseError) {
            console.error('Error parsing trending products response data:', parseError);
            throw parseError;
          }
        }
        console.log("Product Data from Trending Products", parsedData);
        // Check if products array exists and is valid
        const products = parsedData.products || parsedData;
        if (Array.isArray(products)) {
          setData(products);
          setIsSuccess(true);
          options?.onSuccess?.(products);
        } else {
          throw new Error('Invalid products data format');
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch trending products';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      console.error('Trending products fetch error:', errorMessage);
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Hook for fetching "For You" products
export const useForYouProductsMutation = (options?: HomeUseMutationOptions): UseForYouProductsMutationResult => {
  const [data, setData] = useState<ForYouProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    categoryIds: number[], 
    offset: number = 1, 
    limit: number = 25,
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 9999999999.0,
    search: string = ''
  ) => {
    // Don't reset data on subsequent calls, only set loading state
    if (offset === 1) {
      // Reset data only for first page
      setData(null);
    }
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockData = mockProductsData.forYou as any[];
        setData(mockData);
        setIsSuccess(true);
        options?.onSuccess?.(mockData, offset);
        setIsLoading(false);
        return;
      }

      // Safety check for categoryIds
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new Error('Category IDs are required');
      }

      const response = await productsApi.getMostReviewedProducts(
        categoryIds,
        offset,
        limit,
        type,
        filter,
        ratingCount,
        minPrice,
        maxPrice,
        search
      );
      
      if (response.success && response.data) {
        // Check if data is a string and parse it
        let parsedData = response.data;
        if (typeof parsedData === 'string') {
          // Check if string is empty or whitespace only
          if (!parsedData.trim()) {
            if (offset === 1) {
              setData([]);
            }
            setIsLoading(false);
            return;
          }
          
          try {
            parsedData = JSON.parse(parsedData);
          } catch (parseError) {
            console.error('Error parsing for you products response data:', parseError);
            throw parseError;
          }
        }
        
        // Check if products array exists and is valid
        const products = parsedData.products || parsedData;
        if (Array.isArray(products)) {
          setData(products);
          setIsSuccess(true);
          // Pass the offset information to the onSuccess callback
          options?.onSuccess?.(products, offset);
        } else {
          throw new Error('Invalid products data format');
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch for you products';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Hook for fetching stores
export const useStoresMutation = (options?: HomeUseMutationOptions): UseStoresMutationResult => {
  const [data, setData] = useState<Store[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (storeType: string = 'all', offset: number = 1, limit: number = 25) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await storesApi.getAllStores(storeType, offset, limit);
      
      if (response.success && response.data) {
        // Check if data is a string and parse it
        let parsedData: any = response.data;
        if (typeof parsedData === 'string') {
          // Check if string is empty or whitespace only
          if (!parsedData.trim()) {
            setData([]);
            setIsLoading(false);
            return;
          }
          
          try {
            parsedData = JSON.parse(parsedData);
          } catch (parseError) {
            console.error('Error parsing stores response data:', parseError);
            throw parseError;
          }
        }
        
        // Check if stores array exists and is valid
        const stores = parsedData.stores || parsedData;
        if (Array.isArray(stores)) {
          // Format stores to match search page store array style
          const formattedStores = stores.map((store: any) => ({
            id: store.id?.toString() || '',
            name: store.name || 'Unknown Store',
            // Add avatar property to match SearchResultsScreen format
            avatar: store.logo_full_url ? { uri: store.logo_full_url } : require('../assets/images/avatar.png'),
            // Keep all other properties
            ...store
          }));
          
          setData(formattedStores);
          setIsSuccess(true);
          options?.onSuccess?.(formattedStores);
        } else {
          throw new Error('Invalid stores data format');
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch stores';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};