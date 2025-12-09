import { useState, useCallback } from 'react';
import { categoriesApi } from '../services/api';
import { CategoryData, UseCategoriesOptions, UseChildCategoriesOptions, UseCategoriesResult, UseChildCategoriesResult, UseCategoriesTreeOptions, UseCategoriesTreeResult, CategoriesTreeResponse } from '../types';

// Hook for fetching all categories
export const useCategoriesMutation = (options?: UseCategoriesOptions): UseCategoriesResult => {
  const [data, setData] = useState<CategoryData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await categoriesApi.getCategories();
      
      if (response.success) {
        // Ensure we always have an array
        let categoriesArray = Array.isArray(response.data) ? response.data : [];
        
        // Log the raw categories data for debugging
        console.log('Raw categories data from API:', categoriesArray);
        
        // Filter out invalid categories (must have at least id or name)
        categoriesArray = categoriesArray.filter((cat: any) => 
          cat && (cat.id !== undefined || cat.name !== undefined)
        );
        
        console.log('Filtered categories data:', categoriesArray);
        
        setData(categoriesArray);
        setIsSuccess(true);
        options?.onSuccess?.(categoriesArray);
      } else {
        const errorMessage = response.message || 'Failed to fetch categories';
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

// Hook for fetching child categories by parent ID
export const useChildCategoriesMutation = (options?: UseChildCategoriesOptions): UseChildCategoriesResult => {
  const [data, setData] = useState<CategoryData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (parentId: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await categoriesApi.getChildCategories(parentId);
      
      if (response.success) {
        // Ensure we always have an array and cast to CategoryData[]
        const childCategoriesArray = Array.isArray(response.data) ? response.data as CategoryData[] : [];
        
        // Filter out invalid categories (must have at least id or name)
        const validCategories = childCategoriesArray.filter((cat: any) => 
          cat && (cat.id !== undefined || cat.name !== undefined)
        );
        
        setData(validCategories);
        setIsSuccess(true);
        options?.onSuccess?.(validCategories);
      } else {
        const errorMessage = response.message || 'Failed to fetch child categories';
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

// Hook for fetching categories tree by platform
export const useCategoriesTreeMutation = (options?: UseCategoriesTreeOptions): UseCategoriesTreeResult => {
  const [data, setData] = useState<CategoriesTreeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (platform: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await categoriesApi.getCategoriesTree(platform);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to fetch categories tree';
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

export { CategoryData };
