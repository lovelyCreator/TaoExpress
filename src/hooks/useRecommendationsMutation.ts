import { useState, useCallback } from 'react';
import { productsApi } from '../services/productsApi';

interface UseRecommendationsMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseRecommendationsMutationResult {
  mutate: (country: string, outMemberId?: string, beginPage?: number, pageSize?: number, platform?: string) => Promise<void>;
  data: any;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export const useRecommendationsMutation = (
  options?: UseRecommendationsMutationOptions
): UseRecommendationsMutationResult => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    country: string,
    outMemberId?: string,
    beginPage: number = 1,
    pageSize: number = 20,
    platform: string = '1688'
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.getRecommendations(country, outMemberId, beginPage, pageSize, platform);
      
      if (response.success && response.data) {
        console.log('More to Love Recommendations API Response:', "Success");
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to fetch recommendations';
        console.warn('[Recommendations] API returned error:', errorMessage, response);
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      console.error('[Recommendations] API call failed:', err);
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

