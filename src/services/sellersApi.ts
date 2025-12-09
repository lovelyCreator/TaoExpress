import { Seller, ApiResponse } from '../types';
import * as LocalDB from './localDatabase';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Sellers API
export const sellersApi = {
  // Get all sellers
  getSellers: async (): Promise<ApiResponse<Seller[]>> => {
    const result = await LocalDB.getSellers();
    return {
      success: true,
      data: result.data,
    };
  },

  // Get seller by ID
  getSellerById: async (id: string): Promise<ApiResponse<Seller>> => {
    try {
      const result = await LocalDB.getSellerById(id);
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Seller not found',
        data: null as any,
      };
    }
  },

  // Create seller
  createSeller: async (sellerData: Omit<Seller, 'id'>): Promise<ApiResponse<Seller>> => {
    try {
      const token = await getStoredToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null as any,
        };
      }

      // Send request using Axios with proper typing
      const response = await axios.post(
        `${API_BASE_URL}/seller/register`,
        sellerData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Seller created successfully',
      };
    } catch (error: any) {
      console.error('Create seller error:', error);

      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to create seller. Status: ${error.response.status}`,
          data: null as any,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null as any,
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null as any,
        };
      }
    }
  },

  // Update seller
  updateSeller: async (id: string, sellerData: Partial<Seller>): Promise<ApiResponse<Seller>> => {
    try {
      const token = await getStoredToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null as any,
        };
      }

      // Send request using Axios with proper typing
      const response = await axios.put(
        `${API_BASE_URL}/seller/update`,
        { ...sellerData, id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Seller updated successfully',
      };
    } catch (error: any) {
      console.error('Update seller error:', error);

      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to update seller. Status: ${error.response.status}`,
          data: null as any,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null as any,
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null as any,
        };
      }
    }
  },

  // Delete seller
  deleteSeller: async (id: string) => {
    try {
      const token = await getStoredToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null as any,
        };
      }

      // Send request using Axios with proper typing
      const response = await axios.delete(
        `${API_BASE_URL}/seller/delete/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Seller deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete seller error:', error);

      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to delete seller. Status: ${error.response.status}`,
          data: null as any,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null as any,
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null as any,
        };
      }
    }
  },
};