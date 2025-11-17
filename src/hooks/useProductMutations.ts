import { useState, useCallback } from 'react';
import { productsApi } from '../services/api';
import { Product } from '../types';

interface UseMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface CreateProductVariables {
  formData: FormData;
}

interface UpdateProductVariables {
  formData: FormData;
}

interface DeleteProductVariables {
  productId: string;
}

interface UseCreateProductMutationResult {
  mutate: (variables: CreateProductVariables) => Promise<void>;
  data: any | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseUpdateProductMutationResult {
  mutate: (variables: UpdateProductVariables) => Promise<void>;
  data: any | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseDeleteProductMutationResult {
  mutate: (variables: DeleteProductVariables) => Promise<void>;
  data: any | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export const useCreateProductMutation = (options?: UseMutationOptions): UseCreateProductMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: CreateProductVariables) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.createProduct(variables.formData);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to create product';
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
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

export const useUpdateProductMutation = (options?: UseMutationOptions): UseUpdateProductMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: UpdateProductVariables) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.updateProduct(variables.formData);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to update product';
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
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

export const useDeleteProductMutation = (options?: UseMutationOptions): UseDeleteProductMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: DeleteProductVariables) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.deleteProduct(variables.productId);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to delete product';
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
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};