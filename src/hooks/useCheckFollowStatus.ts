import { useState, useCallback } from 'react';
import { followsApi } from '../services/followsApi';
import { CheckFollowResponse } from '../types';

// Define the types for our mutation
interface UseCheckFollowStatusOptions {
  onSuccess?: (storeId: number, isFollowing: boolean) => void;
  onError?: (storeId: number, error: string) => void;
}

export interface UseCheckFollowStatusResult {
  checkFollowStatus: (storeId: number) => Promise<void>;
  followStatus: Record<number, boolean>;
  isLoading: Record<number, boolean>;
  error: Record<number, string | null>;
}

// Hook for checking follow status with store ID tracking
export const useCheckFollowStatus = (
  options?: UseCheckFollowStatusOptions
): UseCheckFollowStatusResult => {
  const [followStatus, setFollowStatus] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<Record<number, string | null>>({});

  const checkFollowStatus = useCallback(async (storeId: number) => {
    // Set loading state for this specific store
    setIsLoading(prev => ({ ...prev, [storeId]: true }));
    setError(prev => ({ ...prev, [storeId]: null }));

    try {
      const response = await followsApi.checkFollowing(storeId);
      
      if (response.success) {
        // Update the follow status for this specific store
        setFollowStatus(prev => ({ ...prev, [storeId]: response.data.is_following }));
        setIsLoading(prev => ({ ...prev, [storeId]: false }));
        options?.onSuccess?.(storeId, response.data.is_following);
      } else {
        const errorMessage = response.message || 'Failed to check follow status';
        setError(prev => ({ ...prev, [storeId]: errorMessage }));
        setIsLoading(prev => ({ ...prev, [storeId]: false }));
        options?.onError?.(storeId, errorMessage);
      }
    } catch (err: any) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(prev => ({ ...prev, [storeId]: errorMessage }));
      setIsLoading(prev => ({ ...prev, [storeId]: false }));
      options?.onError?.(storeId, errorMessage);
    }
  }, [options]);

  return {
    checkFollowStatus,
    followStatus,
    isLoading,
    error,
  };
};