import { useState, useCallback } from 'react';
import { productsApi } from '../services/api';
import { UseProductDetailsOptions, UseProductDetailsResult } from '../types';

export const useProductDetails = (options?: UseProductDetailsOptions): UseProductDetailsResult => {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchProductDetails = useCallback(async (storeId: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.getProductsByStore(storeId);
      
      if (response.success && response.data) {
        console.log("Success to response details:", response.data)
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        console.log("failed to Response details:", response.message)
        const errorMessage = response.message || 'Failed to fetch product details';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    data,
    isLoading,
    error,
    fetchProductDetails,
    isSuccess,
    isError,
  };
};