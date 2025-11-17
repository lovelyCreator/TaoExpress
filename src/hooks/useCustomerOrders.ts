import { useState, useCallback } from 'react';
import { customerOrdersApi } from '../services/api';
import { CustomerOrderResponse } from '../types';
import { customerUpdateOrdersApi } from '../services/customerOrdersApi';

interface UseCustomerOrdersOptions {
  onSuccess?: (data: CustomerOrderResponse) => void;
  onError?: (error: string) => void;
}
interface UpdateOrderParams { 
  update?: string;
  order_id?: number;
}

interface UseGetCustomerOrdersMutationResult {
  mutate: (limit?: number, offset?: number, status?: string) => Promise<void>;
  data: CustomerOrderResponse | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}


interface UseGetSellerOrdersMutationResult {
  mutate: (store_id?: string, limit?: number, offset?: number, status?: string) => Promise<void>;
  data: CustomerOrderResponse | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseUpdateCustomerOrderMutationResult {
  mutate: (variables: UpdateOrderParams) => Promise<void>;
  data: any | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseCustomerUpdateOrderOptions { 
  onSuccess?: (data: object) => void;
  onError?: (error: string) => void;
}

export const useGetCustomerOrdersMutation = (options?: UseCustomerOrdersOptions): UseGetCustomerOrdersMutationResult => {
  const [data, setData] = useState<CustomerOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (limit: number = 13, offset: number = 1, status: string = 'all') => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await customerOrdersApi.getCustomerOrders(limit, offset, status);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        console.log('Customer orders fetched successfully:', response.data);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to fetch customer orders';
        setError(errorMessage);
        setIsError(true);
        // console.error('Error fetching customer orders:', errorMessage);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      // console.error('Exception fetching customer orders:', err);
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

export const useGetSellerOrdersMutation = (options?: UseCustomerOrdersOptions): UseGetSellerOrdersMutationResult => {
  const [data, setData] = useState<CustomerOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (store_id: string = "1", limit: number = 13, offset: number = 1, status: string = 'all') => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await customerOrdersApi.getSellerOrders(store_id, limit, offset, status);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        console.log('Customer orders fetched successfully:', response.data);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to fetch customer orders';
        setError(errorMessage);
        setIsError(true);
        // console.error('Error fetching customer orders:', errorMessage);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      // console.error('Exception fetching customer orders:', err);
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

export const useUpdateCustomerOrderMutation = (options?: UseCustomerUpdateOrderOptions): UseUpdateCustomerOrderMutationResult => {
  const [data, setData] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: UpdateOrderParams) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      console.log("Update Order Params:", variables);
      const response = await customerUpdateOrdersApi.updateCustomerOrders(variables.update, variables.order_id);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        console.log('Customer orders Updated successfully:', response.data);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to update customer orders';
        setError(errorMessage);
        setIsError(true);
        // console.error('Error fetching customer orders:', errorMessage);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      // console.error('Exception fetching customer orders:', err);a
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