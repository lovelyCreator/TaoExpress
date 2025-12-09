import { ApiResponse } from '../types';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Cart API
export const cartApi = {
  // Add item to cart
  addToCart: async (itemId: number, quantity: number, variation: number, option: number): Promise<ApiResponse<any>> => {
    try {
      console.log('cartApi.addToCart: Adding item to cart', { itemId, quantity, variation, option });
      const token = await getStoredToken();
      
      if (!token) {
        console.log('cartApi.addToCart: No token, returning auth error');
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null,
        };
      }
      console.log("cartApi.addToCart: Token retrieved", token);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.post(
      //   `${API_BASE_URL}/customer/cart/add`,
      //   { item_id: itemId, quantity: quantity, variation: variation, option: option },
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          id: Date.now(),
          item_id: itemId,
          quantity: quantity,
          message: 'Item added to cart successfully',
        }
      };
      const response = { data: mockResponse.data };
      
      console.log('cartApi.addToCart: API response (MOCK)', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Item added to cart successfully',
      };
    } catch (error: any) {
      // console.error('Add to cart error:', error.response.data.errors);
      
      if (error.response) {
        // Handle incomplete response data
        let errorMessage = error.response.data.errors[0].message || `Failed to add item to cart. Status: ${error.response.status}`;
        let errorData = error.response.data;
        console.log("Error Response:", errorMessage)
        // Check for specific 403 error when item already exists
        if (error.response.status === 403) {
          let itemExistsError = errorMessage === 'Item already exists';
          
          if (itemExistsError) {
            return {
              success: false,
              message: 'Item already exists in cart', // Specific message for toast display
              data: errorData,
            };
          }
        }
        
        // Try to fix incomplete JSON in error response as well
        if (typeof errorData === 'string') {
          if (!errorData.trim().endsWith(']') && !errorData.trim().endsWith('}')) {
            if (errorData.includes('[') && !errorData.includes(']')) {
              errorData += ']';
            } else if (errorData.includes('{') && !errorData.includes('}')) {
              errorData += '}';
            }
          }
          
          try {
            errorData = JSON.parse(errorData);
          } catch (parseError) {
            console.error('Failed to parse error response JSON', parseError);
          }
        }
        
        return {
          success: false,
          message: errorMessage,
          data: errorData,
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null,
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },

  // Get cart items
  getCart: async (): Promise<ApiResponse<any[]>> => {
    try {
      console.log('cartApi.getCart: Starting request');
      const token = await getStoredToken();
      console.log('cartApi.getCart: Token retrieved', token);
      
      if (!token) {
        console.log('cartApi.getCart: No token, returning auth error');
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: [],
        };
      }
      
      console.log('cartApi.getCart: Making API request to', `${API_BASE_URL}/customer/cart/list`);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/customer/cart/list`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: []
      };
      const response = { data: mockResponse.data };
      
      console.log('cartApi.getCart: API response received (MOCK)', response.data);
      
      // Ensure responseData is an array
      const validData = Array.isArray(response.data) ? response.data : [];
      
      console.log('cartApi.getCart: Returning success response with', validData.length, 'items');
      return {
        success: true,
        data: validData,
        message: 'Cart items retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get cart error:', error);
      
      if (error.response) {
        console.log('cartApi.getCart: Error response received', error.response);
        // Handle incomplete response data
        let errorMessage = error.response.data.message || `Failed to get cart items. Status: ${error.response.status}`;
        let errorData = error.response.data;
        
        // Try to fix incomplete JSON in error response as well
        if (typeof errorData === 'string') {
          if (!errorData.trim().endsWith(']') && !errorData.trim().endsWith('}')) {
            if (errorData.includes('[') && !errorData.includes(']')) {
              errorData += ']';
            } else if (errorData.includes('{') && !errorData.includes('}')) {
              errorData += '}';
            }
          }
          
          try {
            errorData = JSON.parse(errorData);
          } catch (parseError) {
            console.error('Failed to parse error response JSON', parseError);
          }
        }
        
        return {
          success: false,
          message: errorMessage,
          data: Array.isArray(errorData) ? errorData : [],
        };
      } else if (error.request) {
        console.log('cartApi.getCart: No response received (network error)');
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: [],
        };
      } else {
        console.log('cartApi.getCart: Unexpected error', error.message);
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: [],
        };
      }
    }
  },

  // Update cart item
  updateCartItem: async (cartId: number, quantity: number, variation: number, option: number): Promise<ApiResponse<any>> => {
    try {
      console.log('cartApi.updateCartItem: Updating cart item', { cartId, quantity, variation, option });
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null,
        };
      }
      
      // MOCK DATA: Commented out API call
      // const response = await axios.put(
      //   `${API_BASE_URL}/customer/cart/update`,
      //   { cart_id: cartId, quantity, variation, option },
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          id: cartId,
          quantity: quantity,
          message: 'Cart item updated successfully',
        }
      };
      const response = { data: mockResponse.data };
      
      console.log('cartApi.updateCartItem: API response (MOCK)', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Cart item updated successfully',
      };
    } catch (error: any) {
      console.error('Update cart item error:', error);
      
      if (error.response) {
        // Handle incomplete response data
        let errorMessage = error.response.data.message || `Failed to update cart item. Status: ${error.response.status}`;
        let errorData = error.response.data;
        
        // Try to fix incomplete JSON in error response as well
        if (typeof errorData === 'string') {
          if (!errorData.trim().endsWith(']') && !errorData.trim().endsWith('}')) {
            if (errorData.includes('[') && !errorData.includes(']')) {
              errorData += ']';
            } else if (errorData.includes('{') && !errorData.includes('}')) {
              errorData += '}';
            }
          }
          
          try {
            errorData = JSON.parse(errorData);
          } catch (parseError) {
            console.error('Failed to parse error response JSON', parseError);
          }
        }
        
        return {
          success: false,
          message: errorMessage,
          data: errorData,
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null,
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },

  // Remove item from cart
  removeFromCart: async (cartId: number): Promise<ApiResponse<any>> => {
    try {
      console.log('cartApi.removeFromCart: Removing item from cart', { cartId });
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null,
        };
      }
      
      // MOCK DATA: Commented out API call
      // const response = await axios.delete(
      //   `${API_BASE_URL}/customer/cart/remove-item/${cartId}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          message: 'Item removed from cart successfully',
        }
      };
      const response = { data: mockResponse.data };
      
      console.log('cartApi.removeFromCart: API response (MOCK)', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Item removed from cart successfully',
      };
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      
      if (error.response) {
        // Handle incomplete response data
        let errorMessage = error.response.data.message || `Failed to remove item from cart. Status: ${error.response.status}`;
        let errorData = error.response.data;
        
        // Try to fix incomplete JSON in error response as well
        if (typeof errorData === 'string') {
          if (!errorData.trim().endsWith(']') && !errorData.trim().endsWith('}')) {
            if (errorData.includes('[') && !errorData.includes(']')) {
              errorData += ']';
            } else if (errorData.includes('{') && !errorData.includes('}')) {
              errorData += '}';
            }
          }
          
          try {
            errorData = JSON.parse(errorData);
          } catch (parseError) {
            console.error('Failed to parse error response JSON', parseError);
          }
        }
        
        return {
          success: false,
          message: errorMessage,
          data: errorData,
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null,
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },

  // Checkout order
  checkoutOrder: async (orderAmount: number, cartIds: number[], addressId: number): Promise<ApiResponse<any>> => {
    try {
      console.log('cartApi.checkoutOrder: Placing order', { orderAmount, cartIds, addressId });
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null,
        };
      }
      
      // MOCK DATA: Commented out API call
      // const response = await axios.post(
      //   `${API_BASE_URL}/customer/order/place`,
      //   { order_amount: orderAmount, cart_ids: cartIds, address_id: addressId },
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          order_id: Date.now(),
          order_amount: orderAmount,
          message: 'Order placed successfully',
        }
      };
      const response = { data: mockResponse.data };
      
      console.log('cartApi.checkoutOrder: API response (MOCK)', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Order placed successfully',
      };
    } catch (error: any) {
      console.error('Checkout order error:', error, error.response.data);
      
      if (error.response) {
        // Handle incomplete response data
        let errorMessage = error.response.data.message || error.response.data.errors || `Failed to place order. Status: ${error.response.status}`;
        let errorData = error.response.data;
        
        // Try to fix incomplete JSON in error response as well
        if (typeof errorData === 'string') {
          if (!errorData.trim().endsWith(']') && !errorData.trim().endsWith('}')) {
            if (errorData.includes('[') && !errorData.includes(']')) {
              errorData += ']';
            } else if (errorData.includes('{') && !errorData.includes('}')) {
              errorData += '}';
            }
          }
          
          try {
            errorData = JSON.parse(errorData);
          } catch (parseError) {
            console.error('Failed to parse error response JSON', parseError);
          }
        }
        
        return {
          success: false,
          message: errorMessage,
          data: errorData,
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null,
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },
};

export default cartApi;