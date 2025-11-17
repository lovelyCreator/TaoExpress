import { useState, useCallback } from 'react';
import { followsApi } from '../services/followsApi';
import { Follow, Follower, CheckFollowResponse } from '../types';

// Define the types for our mutations
interface UseFollowsMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export interface UseGetFollowedStoresMutationResult {
  mutate: () => Promise<void>;
  data: Follow[] | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseGetFollowersMutationResult {
  mutate: () => Promise<void>;
  data: Follower[] | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseCheckFollowingMutationResult {
  mutate: (storeId: number) => Promise<void>;
  data: CheckFollowResponse | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseFollowStoreMutationResult {
  mutate: (storeId: number) => Promise<void>;
  data: { message: string } | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseUnfollowStoreMutationResult {
  mutate: (storeId: number) => Promise<void>;
  data: { message: string } | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// Hook for getting followed stores
export const useGetFollowedStoresMutation = (
  options?: UseFollowsMutationOptions<Follow[]>
): UseGetFollowedStoresMutationResult => {
  const [data, setData] = useState<Follow[] | null>(null);
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
      const response = await followsApi.getFollowedStores();
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to get followed stores';
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

// Hook for getting followers
export const useGetFollowersMutation = (
  options?: UseFollowsMutationOptions<Follower[]>
): UseGetFollowersMutationResult => {
  const [data, setData] = useState<Follower[] | null>(null);
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
      const response = await followsApi.getFollowers();
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to get followers';
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

// Hook for checking follow status
export const useCheckFollowingMutation = (
  options?: UseFollowsMutationOptions<CheckFollowResponse>
): UseCheckFollowingMutationResult => {
  const [data, setData] = useState<CheckFollowResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (storeId: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      console.log("Check Store Id: ", storeId);
      const response = await followsApi.checkFollowing(storeId);
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to check follow status';
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

// Hook for following a store
export const useFollowStoreMutation = (
  options?: UseFollowsMutationOptions<{ message: string }>
): UseFollowStoreMutationResult => {
  const [data, setData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (storeId: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await followsApi.followStore(storeId);
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to follow store';
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

// Hook for unfollowing a store
export const useUnfollowStoreMutation = (
  options?: UseFollowsMutationOptions<{ message: string }>
): UseUnfollowStoreMutationResult => {
  const [data, setData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (storeId: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await followsApi.unfollowStore(storeId);
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to unfollow store';
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