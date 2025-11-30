import { useState, useCallback } from 'react';
import axios from 'axios';
import { getStoredToken } from '../services/authApi';
import { Product, WishlistItem, UseMutationOptions, UseAddToWishlistMutationResult, UseRemoveFromWishlistMutationResult, UseGetWishlistMutationResult } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://221.138.36.200:5000/api/v1';

// Add to wishlist
const addToWishlist = async (itemId: string): Promise<{ message: string }> => {
  const token = await getStoredToken();
  
  const response = await axios.post(
    `${API_BASE_URL}/customer/wish-list/add?item_id=${itemId}`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
};

// Remove from wishlist
const removeFromWishlist = async (itemId: string): Promise<{ message: string }> => {
  const token = await getStoredToken();
  
  const response = await axios.delete(
    `${API_BASE_URL}/customer/wish-list/remove?item_id=${itemId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  console.log("Wishlist removed respose:", response.data);
  return response.data;
};

// Get wishlist
const getWishlist = async (): Promise<WishlistItem[]> => {
  const token = await getStoredToken();
  
  const response = await axios.get(
    `${API_BASE_URL}/customer/wish-list`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  console.log("get wishlist response:", response.data);
  if (!response.data) {
    return [];
  }
  let responseData = response.data;
  if (typeof responseData === 'string') {
    console.log('cartApi.updateCartItem: Response is string, checking for incomplete JSON');
    // Check if the string ends with a closing bracket
    if (!responseData.trim().endsWith(']')) {
      responseData += ']';
    }
    
    try {
      responseData = JSON.parse(responseData);
      console.log('cartApi.updateCartItem: Parsed fixed JSON', responseData);
    } catch (parseError) {
      // console.error('cartApi.updateCartItem: Failed to parse fixed JSON', parseError);
    }
  }
  console.log("Wishlist response:", responseData);
  return responseData;
};

export const useAddToWishlistMutation = <T = { message: string }>(options?: UseMutationOptions<T>): UseAddToWishlistMutationResult => {
  const [data, setData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await addToWishlist(itemId);
      setData(response);
      setIsSuccess(true);
      options?.onSuccess?.(response as unknown as T);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add item to wishlist';
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

export const useRemoveFromWishlistMutation = <T = { message: string }>(options?: UseMutationOptions<T>): UseRemoveFromWishlistMutationResult => {
  const [data, setData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await removeFromWishlist(itemId);
      setData(response);
      setIsSuccess(true);
      options?.onSuccess?.(response as unknown as T);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove item from wishlist';
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

export const useGetWishlistMutation = (options?: UseMutationOptions<WishlistItem[]>): UseGetWishlistMutationResult => {
  const [data, setData] = useState<WishlistItem[] | null>(null);
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
      const response = await getWishlist();
      setData(response);
      setIsSuccess(true);
      
      // Add null check for response data
      if (response && Array.isArray(response)) {
        // Extract and log item IDs for debugging with proper null checks
        const itemIds = response
          .filter(item => item && item.item_id)
          .map(item => item.item_id.toString());
        console.log('Wishlist item IDs:', itemIds);
      }
      
      options?.onSuccess?.(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch wishlist';
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