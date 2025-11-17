import { useState, useCallback } from 'react';
import { reviewsApi } from '../services/reviewsApi';
import { ApiReview } from '../services/reviewsApi';

interface PostProdcutReviewParams {
  productId: number;
  comment: string;
  rating: number;
  orderId: number;
}

interface UseGetProductRatingResult {
  data: number | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  getProductRating: (productId: number) => Promise<void>;
}

interface UseGetProductReviewsResult {
  data: ApiReview[] | null;
  totalSize: number;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  getProductReviews: (productId: number) => Promise<void>;
}


interface UsePostProductReviewsResult {
  data: Object | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  postProductReviews: (variables: PostProdcutReviewParams) => Promise<void>;
}


interface ReviewMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useGetProductRatingMutation = (options?: ReviewMutationOptions): UseGetProductRatingResult => {
  const [data, setData] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const getProductRating = useCallback(async (productId: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await reviewsApi.getProductRating(productId);
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to get product rating';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
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
    error,
    isLoading,
    isSuccess,
    isError,
    getProductRating,
  };
};

export const useGetProductReviewsMutation = (options?: ReviewMutationOptions): UseGetProductReviewsResult => {
  const [data, setData] = useState<ApiReview[] | null>(null);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const getProductReviews = useCallback(async (productId: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await reviewsApi.getProductReviews(productId);
      
      if (response.success && response.data) {
        setData(response.data.reviews);
        setTotalSize(response.data.total_size || response.data.reviews.length);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to get product reviews';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
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
    totalSize,
    error,
    isLoading,
    isSuccess,
    isError,
    getProductReviews,
  };
};

export const usePostProductReviewsMutation = (options?: ReviewMutationOptions): UsePostProductReviewsResult => {
  const [data, setData] = useState<Object | null>(null);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const postProductReviews = useCallback(async (variables: PostProdcutReviewParams) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await reviewsApi.postProductReviews(variables.productId, variables.orderId, variables.rating, variables.comment);
      
      if (response.success && response.data) {
        setData(response.data);
        // setTotalSize(response.data.total_size || response.data.reviews.length);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to get product reviews';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
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
    error,
    isLoading,
    isSuccess,
    isError,
    postProductReviews,
  };
};