import axios from 'axios';
import { getStoredToken } from './authApi';

const API_BASE_URL = 'https://todaymall.co.kr/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AddToWishlistRequest {
  externalId: string;
  source: string;
  country: string;
  imageUrl: string;
  price: number;
  title: string;
}

export interface WishlistItem {
  _id: string;
  imageUrl: string;
  externalId: string;
  price: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface WishlistResponse {
  wishlist: WishlistItem[];
  total?: number;
}

export const wishlistApi = {
  // Add product to wishlist
  addToWishlist: async (request: AddToWishlistRequest): Promise<ApiResponse<{ wishlist: WishlistItem[]; product?: any }>> => {
    try {
      const token = await getStoredToken();

      const url = `${API_BASE_URL}/users/wishlist`;
      // console.log('Sending add to wishlist request to:', url);
      // console.log('Add to wishlist request body:', JSON.stringify(request, null, 2));

      const response = await axios.post(url, request, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // console.log('Add to wishlist response:', response.data);

      if (!response.data || !response.data.data) {
        return {
          success: false,
          message: 'No wishlist data received',
          data: undefined,
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Product added to wishlist successfully',
      };
    } catch (error: any) {
      // console.error('Add to wishlist error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add product to wishlist';
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  },

  // Get wishlist
  getWishlist: async (): Promise<ApiResponse<WishlistResponse>> => {
    try {
      const token = await getStoredToken();

      const url = `${API_BASE_URL}/users/wishlist`;
      // console.log('Sending get wishlist request to:', url);

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // console.log('Get wishlist response:', response.data);

      if (!response.data || !response.data.data) {
        return {
          success: false,
          message: 'No wishlist data received',
          data: undefined,
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Wishlist retrieved successfully',
      };
    } catch (error: any) {
      // console.error('Get wishlist error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get wishlist';
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  },

  // Delete product from wishlist
  // Always uses externalId (not MongoDB _id)
  deleteFromWishlist: async (externalId: string): Promise<ApiResponse<{ wishlist: WishlistItem[] }>> => {
    try {
      const token = await getStoredToken();

      const url = `${API_BASE_URL}/users/wishlist/${externalId}`;
      // console.log('Sending delete from wishlist request to:', url);
      // console.log('Delete request externalId:', externalId);

      const response = await axios.delete(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // console.log('Delete from wishlist response status:', response.status);
      // console.log('Delete from wishlist response data:', response.data);

      // Check if response has data structure
      if (response.data) {
        // If response has data.data, use it
        if (response.data.data) {
          return {
            success: true,
            data: response.data.data,
            message: response.data.message || 'Product removed from wishlist successfully',
          };
        }
        // If response.data exists but no nested data, check if it's a direct wishlist array
        if (response.data.wishlist) {
          return {
            success: true,
            data: response.data,
            message: response.data.message || 'Product removed from wishlist successfully',
          };
        }
        // If response.data exists but no wishlist, might be a success message
        if (response.data.message || response.data.success) {
          // Try to get updated wishlist by fetching it
          // console.log('Delete response indicates success, but no wishlist data. Fetching updated wishlist...');
          const wishlistResponse = await wishlistApi.getWishlist();
          if (wishlistResponse.success && wishlistResponse.data) {
            return {
              success: true,
              data: wishlistResponse.data,
              message: response.data.message || 'Product removed from wishlist successfully',
            };
          }
        }
      }

      // If no data structure, return error
      return {
        success: false,
        message: 'No wishlist data received from delete response',
        data: undefined,
      };
    } catch (error: any) {
      // console.error('Delete from wishlist error:', error);
      // console.error('Error response status:', error.response?.status);
      // console.error('Error response data:', error.response?.data);
      
      // Handle 404 - item might not exist (already deleted or never existed)
      if (error.response?.status === 404) {
        // Verify if item actually doesn't exist by fetching wishlist
        const wishlistResponse = await wishlistApi.getWishlist();
        if (wishlistResponse.success && wishlistResponse.data) {
          const itemExists = wishlistResponse.data.wishlist?.some((item: WishlistItem) => 
            item.externalId === externalId
          );

          if (itemExists) {
            // Item still exists - deletion failed
            return {
              success: false,
              message: 'Wishlist item not found by externalId. The item might be stored with a different ID format.',
              data: undefined,
            };
          } else {
            // Item doesn't exist - treat as successful deletion
            return {
              success: true,
              message: 'Product removed from wishlist successfully',
              data: wishlistResponse.data,
            };
          }
        }
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove product from wishlist';
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  },
};

