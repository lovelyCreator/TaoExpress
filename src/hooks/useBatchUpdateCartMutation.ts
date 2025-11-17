import { useState, useCallback } from 'react';
import { cartApi } from '../services/cartApi';
import { UpdateCartItemParams } from '../types';

export interface BatchUpdateCartOptions {
  onSuccess?: (data: any[]) => void;
  onError?: (error: string) => void;
}

export interface UseBatchUpdateCartMutationResult {
  mutate: (items: UpdateCartItemParams[]) => Promise<void>;
  data: any[] | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export const useBatchUpdateCartMutation = (options?: BatchUpdateCartOptions): UseBatchUpdateCartMutationResult => {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (items: UpdateCartItemParams[]) => {
    console.log('useBatchUpdateCartMutation: Updating cart items', items);
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Update each item sequentially
      const results = [];
      for (const item of items) {
        const response = await cartApi.updateCartItem(
          item.cartId,
          item.quantity,
          item.variation,
          item.option
        );
        
        if (response.success) {
          results.push(response.data);
        } else {
          throw new Error(response.message || 'Failed to update cart item');
        }
      }
      
      setData(results);
      setIsSuccess(true);
      console.log('useBatchUpdateCartMutation: Success', results);
      options?.onSuccess?.(results);
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      console.error('useBatchUpdateCartMutation: Exception', err);
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