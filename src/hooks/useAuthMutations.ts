import { useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, guestLogin as apiGuestLogin, loginFrontendOnly, registerFrontendOnly, changePassword as apiChangePassword } from '../services/authApi';
import { User, AuthUseMutationOptions, LoginVariables, RegisterVariables, GuestLoginVariables, UseLoginMutationResult, UseRegisterMutationResult, useGuestLoginMutationResult } from '../types';

// Flag to switch between frontend-only and backend modes
const USE_FRONTEND_ONLY = false; // Set to false when backend is ready

// Add the change password mutation result type
interface UseChangePasswordMutationResult {
  mutate: (variables: { currentPassword: string; newPassword: string }) => Promise<void>;
  data: any | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export const useLoginMutation = (options?: AuthUseMutationOptions): UseLoginMutationResult => {
  const [data, setData] = useState<{ token: string; user: Partial<User> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: LoginVariables) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Use frontend-only or backend API based on flag
      const response = USE_FRONTEND_ONLY 
        ? await loginFrontendOnly(variables.email, variables.password)
        : await apiLogin(variables.email, variables.password);
      
      console.log('useLoginMutation: API response:', response);
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Login failed';
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

export const useRegisterMutation = (options?: AuthUseMutationOptions): UseRegisterMutationResult => {
  const [data, setData] = useState<{ token: string; user: Partial<User> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: RegisterVariables) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Use frontend-only or backend API based on flag
      // const response = USE_FRONTEND_ONLY
      //   ? await registerFrontendOnly(
      //       variables.email,
      //       variables.password,
      //       variables.name,
      //       variables.gender
      //     )
      //   : await apiRegister(
      //       variables.email,
      //       variables.password,
      //       variables.name,
      //       variables.gender
      //     );
      console.log('Register Started:', variables);
      const response = await apiRegister(
        variables.email,
        variables.password,
        variables.name,
        variables.gender
      );
      
      if (response.success && response.data) {
        console.log("Signup API Success!", response.data);
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Registration failed';
        console.log("Signup Api Failed:", errorMessage);
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      console.log("Signup Failed:", errorMessage);
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

export const useGustLoginMutation = (options?: AuthUseMutationOptions): useGuestLoginMutationResult => {
  const [data, setData] = useState<{ guest_id: number; } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: GuestLoginVariables) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Use frontend-only or backend API based on flag
      const response = await apiGuestLogin(
        variables.fcm_token
      );
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Guest login failed';
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

// Add the change password mutation hook
export const useChangePasswordMutation = (options?: AuthUseMutationOptions): UseChangePasswordMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: { currentPassword: string; newPassword: string }) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await apiChangePassword(
        variables.currentPassword,
        variables.newPassword
      );
      
      if (response.success && response.data) {
        setData(response.data);
        setIsSuccess(true);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Failed to change password';
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