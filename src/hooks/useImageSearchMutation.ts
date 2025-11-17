import { useState, useCallback } from 'react';
import { imageSearchApi, ImageSearchRequest, ImageSearchResponse } from '../services/imageSearchApi';

interface UseImageSearchMutationOptions {
  onSuccess?: (data: ImageSearchResponse) => void;
  onError?: (error: Error) => void;
}

export const useImageSearchMutation = (options?: UseImageSearchMutationOptions) => {
  const [data, setData] = useState<ImageSearchResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mutate = useCallback(async (request: ImageSearchRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await imageSearchApi.searchByImage(request);
      setData(response);
      
      if (options?.onSuccess) {
        options.onSuccess(response);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (options?.onError) {
        options.onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    isLoading,
  };
};
