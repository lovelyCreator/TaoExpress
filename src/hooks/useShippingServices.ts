import { useState, useCallback } from 'react';
import { shippingServicesApi } from '../services/api';
import { ShippingService, UseShippingServicesOptions, UseShippingServicesResult, UseGetShippingServicesMutationResult, UseDeleteShippingServiceMutationResult } from '../types';
import { useShipping } from '../context/ShippingContext';

export const useGetShippingServicesMutation = (options?: UseShippingServicesOptions): UseGetShippingServicesMutationResult => {
  const { setShippingServices } = useShipping();
  const [data, setData] = useState<ShippingService[] | null>(null);
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
      const response = await shippingServicesApi.getShippingServices(storeId);
      
      if (response.success && response.data) {
        setData(response.data);
        setShippingServices(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to fetch shipping services';
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
  }, [options, setShippingServices]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

export const useDeleteShippingServiceMutation = (options?: UseShippingServicesOptions): UseDeleteShippingServiceMutationResult => {
  const { removeShippingService } = useShipping();
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
        removeShippingService(serviceId);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
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
  }, [options, removeShippingService]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};