import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { addressesApi } from '../services/addressesApi';
import { 
  UseGetAddressesMutationResult, 
  UseCreateAddressMutationResult, 
  UseUpdateAddressMutationResult, 
  UseDeleteAddressMutationResult,
  CreateAddressRequest,
  UpdateAddressRequest
} from '../types';

interface AddressMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useGetAddressesMutation = (options?: AddressMutationOptions): UseGetAddressesMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (moduleId?: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await addressesApi.getAddresses(moduleId);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to get addresses';
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

export const useCreateAddressMutation = (options?: AddressMutationOptions): UseCreateAddressMutationResult => {
  const [data, setData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: { addressData: CreateAddressRequest; moduleId?: number }) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await addressesApi.createAddress(variables.addressData, variables.moduleId);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to create address';
        setError(errorMessage);
        setIsError(true);
        
        // Check if this is a 403 error and show alert
        if (response.message && response.message.toLowerCase().includes('forbidden')) {
          Alert.alert('Forbidden', errorMessage);
        } else {
          options?.onError?.(errorMessage);
        }
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

export const useUpdateAddressMutation = (options?: AddressMutationOptions): UseUpdateAddressMutationResult => {
  const [data, setData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: { addressData: UpdateAddressRequest; moduleId?: number }) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await addressesApi.updateAddress(variables.addressData, variables.moduleId);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to update address';
        setError(errorMessage);
        setIsError(true);
        
        // Check if this is a 403 error and show alert
        if (response.message && response.message.toLowerCase().includes('forbidden')) {
          Alert.alert('Forbidden', errorMessage);
        } else {
          options?.onError?.(errorMessage);
        }
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

export const useDeleteAddressMutation = (options?: AddressMutationOptions): UseDeleteAddressMutationResult => {
  const [data, setData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: { addressId: number; moduleId?: number }) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await addressesApi.deleteAddress(variables.addressId, variables.moduleId);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to delete address';
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