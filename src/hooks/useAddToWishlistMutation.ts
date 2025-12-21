import { useState, useCallback } from 'react';
import { wishlistApi, AddToWishlistRequest } from '../services/wishlistApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

interface UseAddToWishlistMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseAddToWishlistMutationResult {
  mutate: (request: AddToWishlistRequest) => Promise<void>;
  data: any;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export const useAddToWishlistMutation = (
  options?: UseAddToWishlistMutationOptions
): UseAddToWishlistMutationResult => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (request: AddToWishlistRequest) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await wishlistApi.addToWishlist(request);

      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        
        // Update external IDs in AsyncStorage with the full wishlist from backend
        // This ensures we have the complete list even if optimistic update already added the ID
        if (response.data.wishlist && Array.isArray(response.data.wishlist)) {
          const externalIds = response.data.wishlist.map((item: any) => item.externalId?.toString() || '').filter(Boolean);
          await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_EXTERNAL_IDS, JSON.stringify(externalIds));
        } else {
          // If no wishlist in response, ensure the external ID we sent is in AsyncStorage
          const currentIds = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST_EXTERNAL_IDS);
          let existingIds: string[] = [];
          if (currentIds) {
            const parsed = JSON.parse(currentIds);
            existingIds = Array.isArray(parsed) ? parsed.map((id: any) => id?.toString() || '').filter(Boolean) : [];
          }
          const requestId = request.externalId.toString();
          if (!existingIds.includes(requestId)) {
            existingIds.push(requestId);
            await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_EXTERNAL_IDS, JSON.stringify(existingIds));
          }
        }
        
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to add product to wishlist';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
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

