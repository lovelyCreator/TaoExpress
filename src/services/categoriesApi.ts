import { ApiResponse } from '../types';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Categories API
export const categoriesApi = {

  // Get categories tree by platform
  getCategoriesTree: async (platform: string): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      console.log('Sending get categories tree request to:', `${API_BASE_URL}/categories/tree?platform=${platform}`);
      
      const response = await axios.get(
        `${API_BASE_URL}/categories/tree`,
        {
          params: {
            platform: platform,
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Handle the response structure: { status, statusCode, data: { tree, platform, ... }, timestamp }
      if (response.data && response.data.status === 'success' && response.data.data) {
        return {
          success: true,
          data: response.data.data, // Contains tree, platform, cached, totalCategories, responseTime
          message: 'Categories tree retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to get categories tree',
          data: null,
        };
      }
    } catch (error: any) {
      console.error('Get categories tree error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data?.message || `Failed to get categories tree. Status: ${error.response.status}`,
          data: null,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null,
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },
};