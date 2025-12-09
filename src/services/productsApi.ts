import { 
  Product, 
  SearchFilters, 
  ApiResponse, 
  PaginatedResponse,
  VariationData,
  ProductCreateData,
  ProductUpdateData
} from '../types';
import * as LocalDB from './localDatabase';
import { getStoredToken } from './authApi';
import axios, { AxiosRequestConfig } from 'axios';
import { uploadToCloudinary, uploadVideoToCloudinary } from './cloudinary';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Products API
export const productsApi = {
  // Get product recommendations
  getRecommendations: async (
    country: string = 'en',
    outMemberId: string = 'dferg0001',
    beginPage: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // Construct the API URL with query parameters
      const params = new URLSearchParams({
        country,
        outMemberId,
        beginPage: beginPage.toString(),
        pageSize: pageSize.toString(),
      });
      
      const url = `${API_BASE_URL}/products/recommendations?${params.toString()}`;
      
      console.log('Sending get recommendations request to:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Recommendations Response:', response.data);
      
      // Check if response data exists
      if (!response.data || !response.data.data || !response.data.data.recommendations) {
        return {
          success: false,
          message: 'No recommendations data received',
          data: null,
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Recommendations retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get recommendations error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get recommendations. Status: ${error.response.status}`,
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

  // Get related product recommendations
  getRelatedRecommendations: async (
    productId: string | number,
    pageNo: number = 1,
    pageSize: number = 20,
    language: string = 'en'
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // Construct the API URL with query parameters
      const params = new URLSearchParams({
        pageNo: pageNo.toString(),
        pageSize: pageSize.toString(),
        language,
      });
      
      const url = `${API_BASE_URL}/products/${productId}/related-recommendations?${params.toString()}`;
      
      console.log('Sending get related recommendations request to:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Related Recommendations Response:', response.data);
      
      // Check if response data exists
      if (!response.data || !response.data.data || !response.data.data.recommendations) {
        return {
          success: false,
          message: 'No related recommendations data received',
          data: null,
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Related recommendations retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get related recommendations error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get related recommendations. Status: ${error.response.status}`,
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

  // Search products by keyword
  searchProductsByKeyword: async (
    keyword: string,
    source: string = '1688',
    country: string = 'en',
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // Construct the API URL with query parameters
      const params = new URLSearchParams({
        keyword,
        source,
        country,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      const url = `${API_BASE_URL}/products/search?${params.toString()}`;
      
      console.log('Sending search products by keyword request to:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Search Products Response:', response.data);
      
      // Check if response data exists
      if (!response.data || !response.data.data || !response.data.data.products) {
        return {
          success: false,
          message: 'No products data received',
          data: null,
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Products retrieved successfully',
      };
    } catch (error: any) {
      console.error('Search products by keyword error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to search products. Status: ${error.response.status}`,
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

  // Get product detail by productId, source, and country
  getProductDetail: async (
    productId: string | number,
    source: string = '1688',
    country: string = 'en'
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // Construct the API URL with query parameters
      const params = new URLSearchParams({
        productId: productId.toString(),
        source,
        country,
      });
      
      const url = `${API_BASE_URL}/products/detail?${params.toString()}`;
      
      console.log('Sending get product detail request to:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Get Product Detail Response:', response.data);
      
      // Check if response data exists
      if (!response.data || !response.data.data || !response.data.data.product) {
        return {
          success: false,
          message: 'No product data received',
          data: null,
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Product detail retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get product detail error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get product detail. Status: ${error.response.status}`,
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

  getNewInProducts: async (
    platform: string = '1688',
    country: string = 'en'
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // Validate and sanitize parameters
      const validPlatform = platform || '1688';
      const validCountry = country || 'en';
      
      // Construct the API URL with query parameters
      const params = new URLSearchParams({
        platform: validPlatform,
        country: validCountry,
      });
      
      const url = `${API_BASE_URL}/products/newin?${params.toString()}`;
      
      console.log('Sending get new in products request to:', url);
      console.log('Parameters:', { platform: validPlatform, country: validCountry });
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Get new in products response:', response.data);
      
      if (response.data.status === 'success' && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: 'New in products retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get new in products',
          data: null,
        };
      }
    } catch (error: any) {
      console.error('Get new in products error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message 
          || error.response.data?.error 
          || `Failed to get new in products. Status: ${error.response.status}`;
        console.error('Error message:', errorMessage);
        return {
          success: false,
          message: errorMessage,
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

  // Get featured products (using local database)
  getFeaturedProducts: async (limit: number = 10): Promise<ApiResponse<Product[]>> => {
    try {
      const result = await LocalDB.getFeaturedProducts(limit);
      return {
        success: true,
        data: result.data,
        message: 'Featured products retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get featured products error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get featured products',
        data: [],
      };
    }
  },

  // Get new products (using local database)
  getNewProducts: async (limit: number = 10): Promise<ApiResponse<Product[]>> => {
    try {
      const result = await LocalDB.getNewProducts(limit);
      return {
        success: true,
        data: result.data,
        message: 'New products retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get new products error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get new products',
        data: [],
      };
    }
  },

  // Get sale products (using local database)
  getSaleProducts: async (limit: number = 10): Promise<ApiResponse<Product[]>> => {
    try {
      const result = await LocalDB.getSaleProducts(limit);
      return {
        success: true,
        data: result.data,
        message: 'Sale products retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get sale products error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get sale products',
        data: [],
      };
    }
  },
};