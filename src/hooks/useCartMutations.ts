import { useState, useCallback } from 'react';
import { cartApi } from '../services/cartApi';
import { ApiResponse, CartUseMutationOptions, AddToCartParams, UpdateCartItemParams, RemoveFromCartParams, UseAddToCartMutationResult, UseGetCartQueryResult, UseUpdateCartItemMutationResult, UseRemoveFromCartMutationResult, UseGetCartMutationResult, UseCheckoutOrderMutationResult, CheckoutOrderParams } from '../types';
import { useToast } from '../context/ToastContext';

// Add to Cart Mutation
export const useAddToCartMutation = (options?: CartUseMutationOptions): UseAddToCartMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { showToast } = useToast();

  const mutate = useCallback(async (variables: AddToCartParams) => {
    console.log('useAddToCartMutation: Adding to cart', variables);
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await cartApi.addToCart(variables.itemId, variables.quantity, variables.variation, variables.option);
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        console.log('useAddToCartMutation: Success', response.data);
        options?.onSuccess?.(response.data);
      } else {
        // Check if this is the specific "item already exists" error
        if (response.message === 'Item already exists in cart') {
          // Show warning toast instead of setting error
          showToast('Item already exist in Cart.', 'warning');
          setIsSuccess(true); // Treat as success to avoid error handling
        } else {
          const errorMessage = response.message || 'Failed to add item to cart';
          setError(errorMessage);
          setIsError(true);
          console.error('useAddToCartMutation: Error', errorMessage);
          options?.onError?.(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      console.log('useAddToCartMutation: Exception', err);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options, showToast]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Get Cart Mutation
export const useGetCartMutation = (): UseGetCartMutationResult => {
  console.log('useGetCartMutation: Initializing hook');
  
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async () => {
    console.log('useGetCartMutation: mutate function called');
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      console.log('useGetCartMutation: Calling cartApi.getCart()');
      const response = await cartApi.getCart();
      console.log('useGetCartMutation: API response received', response);
      
      if (response.success) {
        // Ensure the data is an array before setting it
        const validData = Array.isArray(response.data) ? response.data : [];
        setData(validData);
        setIsSuccess(true);
        console.log('useGetCartMutation: Data set successfully', validData);
      } else {
        const errorMessage = response.message || 'Failed to fetch cart';
        setError(errorMessage);
        setIsError(true);
        console.error('useGetCartMutation: API error', errorMessage);
      }
    } catch (err) {
      console.error('useGetCartMutation: Exception caught', err);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
      console.log('useGetCartMutation: Finished fetching cart data');
    }
  }, []);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Update Cart Item Mutation
export const useUpdateCartItemMutation = (options?: CartUseMutationOptions): UseUpdateCartItemMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: UpdateCartItemParams) => {
    console.log('useUpdateCartItemMutation: Updating cart item', variables);
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await cartApi.updateCartItem(variables.cartId, variables.quantity, variables.variation, variables.option);
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        console.log('useUpdateCartItemMutation: Success', response.data);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to update cart item';
        setError(errorMessage);
        setIsError(true);
        console.error('useUpdateCartItemMutation: Error', errorMessage);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      console.error('useUpdateCartItemMutation: Exception', err);
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

// Remove From Cart Mutation
export const useRemoveFromCartMutation = (options?: CartUseMutationOptions): UseRemoveFromCartMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: RemoveFromCartParams) => {
    console.log('useRemoveFromCartMutation: Removing from cart', variables);
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await cartApi.removeFromCart(variables.cartId);
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        console.log('useRemoveFromCartMutation: Success', response.data);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to remove item from cart';
        setError(errorMessage);
        setIsError(true);
        console.error('useRemoveFromCartMutation: Error', errorMessage);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      console.error('useRemoveFromCartMutation: Exception', err);
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

export interface RemoveFromCartMutationResult {
  mutate: (variables: RemoveFromCartParams) => Promise<void>;
  data: any | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// Checkout Order Mutation
export const useCheckoutOrderMutation = (options?: CartUseMutationOptions): UseCheckoutOrderMutationResult => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (variables: CheckoutOrderParams) => {
    console.log('useCheckoutOrderMutation: Placing order', variables);
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await cartApi.checkoutOrder(variables.orderAmount, variables.cartIds, variables.addressId);
      
      if (response.success) {
        setData(response.data);
        setIsSuccess(true);
        console.log('useCheckoutOrderMutation: Success', response.data);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.message || 'Failed to place order';
        setError(errorMessage);
        setIsError(true);
        console.error('useCheckoutOrderMutation: Error', errorMessage);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      console.error('useCheckoutOrderMutation: Exception', err);
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