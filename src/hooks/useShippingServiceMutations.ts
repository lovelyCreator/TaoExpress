import { useState, useCallback } from 'react';
import { shippingServicesApi } from '../services/api';
import { ShippingService, UseShippingServiceMutationOptions, CreateShippingServiceVariables, UpdateShippingServiceVariables, DeleteShippingServiceVariables, UseCreateShippingServiceMutationResult, UseUpdateShippingServiceMutationResult, UseDeleteShippingServiceMutationResult } from '../types';

export const useCreateShippingServiceMutation = (options?: UseShippingServiceMutationOptions): UseCreateShippingServiceMutationResult => {
  const [data, setData] = useState<ShippingService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: CreateShippingServiceVariables) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await shippingServicesApi.createShippingService(variables.serviceData);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to create shipping service';
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

export const useUpdateShippingServiceMutation = (options?: UseShippingServiceMutationOptions): UseUpdateShippingServiceMutationResult => {
  const [data, setData] = useState<ShippingService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: UpdateShippingServiceVariables) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await shippingServicesApi.updateShippingService(variables.serviceId, variables.serviceData);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to update shipping service';
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

export const useDeleteShippingServiceMutation = (options?: UseShippingServiceMutationOptions): UseDeleteShippingServiceMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (serviceId: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await shippingServicesApi.deleteShippingService(serviceId);
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.();
      } else {
        const errorMessage = response.message || 'Failed to delete shipping service';
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