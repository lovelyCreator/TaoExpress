import { useState, useCallback } from 'react';
import axios from 'axios';
import { getStoredToken } from '../services/authApi';
import { Product, WishlistItem, UseMutationOptions, UseAddToWishlistMutationResult, UseRemoveFromWishlistMutationResult, UseGetWishlistMutationResult } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// API Response Types
interface WishlistApiItem {
  _id: string;
  imageUrl: string;
  externalId: string;
  price: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface WishlistApiResponse {
  status: string;
  statusCode: number;
  message?: string;
  data: {
    wishlist?: WishlistApiItem[];
    wishlistItem?: {
      imageUrl: string;
      externalId: string;
      price: number;
      title: string;
      _id: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    total?: number;
    refreshed?: boolean;
  };
  timestamp?: string;
}

// Transform API wishlist item to Product type
const transformWishlistItemToProduct = (item: WishlistApiItem): Product => {
  const product: Product = {
    id: item.externalId,
    name: item.title,
    description: '',
    price: item.price,
    originalPrice: item.price,
    discount: 0,
    discountPercentage: 0,
    image: item.imageUrl || '',
    category: {
      id: '',
      name: 'Uncategorized',
      icon: '',
      image: '',
      subcategories: []
    },
    subcategory: '',
    brand: '',
    seller: {
      id: '',
      name: '',
      avatar: '',
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      followersCount: 0,
      description: '',
      location: '',
      joinedDate: new Date(),
    },
    rating: 0,
    reviewCount: 0,
    rating_count: 0,
    inStock: true,
    stockCount: 0,
    sizes: undefined,
    colors: undefined,
    tags: [],
    isNew: false,
    isFeatured: false,
    isOnSale: false,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    orderCount: 0,
  } as Product & { offerId?: string | number; source?: string };
  
  // Store additional data for product detail navigation
  (product as any).offerId = item.externalId;
  (product as any).source = '1688'; // Default source
  
  return product;
};

// Add to wishlist
const addToWishlist = async (
  imageUrl: string,
  externalId: string,
  price: number,
  title: string
): Promise<WishlistApiResponse> => {
  try {
    const token = await getStoredToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const requestBody = {
      imageUrl,
      externalId,
      price,
      title,
    };
    
    const response = await axios.post<WishlistApiResponse>(
      `${API_BASE_URL}/users/wishlist`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to wishlist';
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;
    throw enhancedError;
  }
};

// Remove from wishlist
const removeFromWishlist = async (externalId: string): Promise<WishlistApiResponse> => {
  try {
    const token = await getStoredToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.delete<WishlistApiResponse>(
      `${API_BASE_URL}/users/wishlist/${externalId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item from wishlist';
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;
    throw enhancedError;
  }
};

// Get wishlist
const getWishlist = async (): Promise<WishlistItem[]> => {
  const token = await getStoredToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    const response = await axios.get<WishlistApiResponse>(
      `${API_BASE_URL}/users/wishlist`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  
    if (!response.data || !response.data.data || !response.data.data.wishlist) {
      return [];
    }
  
    const wishlistArray = response.data.data.wishlist;
  
    // Transform API response to WishlistItem format
    const wishlistItems: WishlistItem[] = wishlistArray.map((item: WishlistApiItem) => {
      const product = transformWishlistItemToProduct(item);
      // Convert MongoDB ObjectId string to a number (simple hash)
      const idHash = item._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000000000;
      return {
        id: idHash || 0,
        user_id: 0,
        item_id: parseInt(item.externalId) || 0,
        created_at: item.createdAt || new Date().toISOString(),
        updated_at: item.updatedAt || new Date().toISOString(),
        store_id: null,
        item: product,
      };
    });
  
    return wishlistItems;
  } catch (error: any) {
    console.error("Wishlist API Error:", error);
    throw error;
  }
};

export const useAddToWishlistMutation = <T = { message: string }>(options?: UseMutationOptions<T>): UseAddToWishlistMutationResult => {
  const [data, setData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    imageUrl: string,
    externalId: string,
    price: number,
    title: string
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await addToWishlist(imageUrl, externalId, price, title);
      
      if (response.status === 'error' || (response.statusCode && response.statusCode >= 400)) {
        const errorMessage = response.message || 'Failed to add item to wishlist';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
        return;
      }
      
      const isSuccess = response.status === 'success' || 
                       (response.statusCode && response.statusCode >= 200 && response.statusCode < 300);
      
      if (!isSuccess) {
        const errorMessage = response.message || 'Unexpected response from server';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
        return;
      }
      
      setData({ message: response.message || 'Product added to wishlist' });
      setIsSuccess(true);
      // Pass the full response to onSuccess so we can access wishlistItem.externalId
      options?.onSuccess?.({ message: response.message || 'Product added to wishlist', response } as unknown as T);
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || err.message || 'Failed to add item to wishlist';
      
      if (errorMessage.includes('Cast to Map failed') || errorMessage.includes('specifications')) {
        errorMessage = 'Product data format error. Please try again or contact support.';
      }
      
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

  const mutate = useCallback(async (externalId: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await removeFromWishlist(externalId);
      
      if (response.status === 'error' || response.statusCode >= 400) {
        const errorMessage = response.message || 'Failed to remove item from wishlist';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
        return;
      }
      
      setData({ message: response.message || 'Product removed from wishlist' });
      setIsSuccess(true);
      options?.onSuccess?.({ message: response.message || 'Product removed from wishlist' } as unknown as T);
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
