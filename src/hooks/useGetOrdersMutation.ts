import { useState, useCallback } from 'react';
import { orderApi, GetOrdersResponse } from '../services/orderApi';

interface UseGetOrdersMutationOptions {
  onSuccess?: (data: GetOrdersResponse) => void;
  onError?: (error: string) => void;
}

export const useGetOrdersMutation = (options?: UseGetOrdersMutationOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (page: number = 1, pageSize: number = 10) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await orderApi.getOrders(page, pageSize);

      if (response.success && response.data) {
        options?.onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'Failed to get orders';
        setIsError(true);
        setError(errorMessage);
        options?.onError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setIsError(true);
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    isLoading,
    isError,
    error,
  };
};

