import { useState, useCallback } from 'react';
import { getProfile, GetProfileResponse } from '../services/authApi';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

interface UseGetProfileMutationOptions {
  onSuccess?: (data: GetProfileResponse['data']) => void;
  onError?: (error: string) => void;
}

interface UseGetProfileMutationResult {
  mutate: () => Promise<void>;
  data: GetProfileResponse['data'] | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export const useGetProfileMutation = (
  options?: UseGetProfileMutationOptions
): UseGetProfileMutationResult => {
  const [data, setData] = useState<GetProfileResponse['data'] | null>(null);
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
      const response = await getProfile();

      // console.log('useGetProfileMutation: API response:', response);

      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        
        // Update user data in AsyncStorage
        if (response.data.user) {
          const user = response.data.user;
          
          // Get existing user data to preserve fields not in response
          const existingUserData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
          let existingUser: Partial<User> = {};
          if (existingUserData) {
            existingUser = JSON.parse(existingUserData);
          }
          
          // Map addresses from new structure
          const mappedAddresses = (user.addresses || []).map((addr: any) => ({
            id: addr._id || '',
            type: 'home' as const,
            name: addr.recipient || '',
            street: addr.detailedAddress || '',
            city: addr.mainAddress || '',
            state: '',
            zipCode: addr.zipCode || '',
            country: '',
            phone: addr.contact || '',
            isDefault: addr.defaultAddress || false,
          }));
          
          // Map response to User type
          const updatedUser: Partial<User> = {
            ...existingUser,
            id: user._id || user.user_id || existingUser.id || '',
            email: user.email || existingUser.email || '',
            name: user.user_id || existingUser.name || '',
            phone: user.phone || existingUser.phone || '',
            birthday: user.birthday || existingUser.birthday,
            avatar: user.pictureUrl || existingUser.avatar,
            addresses: mappedAddresses.length > 0 ? mappedAddresses : existingUser.addresses || [],
            wishlist: user.wishlist || existingUser.wishlist || [],
            updatedAt: new Date(),
          };
          
          // Store updated user data
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
          // console.log('Updated user data in AsyncStorage from getProfile');
        }
        
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Failed to get profile';
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

