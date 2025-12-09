import { getStoredToken } from './authApi';
import axios from 'axios';
import { ApiResponse } from '../types';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Define the Review type based on the API response
export interface ApiReview {
  id: number;
  item_id: number;
  user_id: number;
  comment: string;
  attachment: string[];
  rating: number;
  order_id: number;
  created_at: string;
  updated_at: string;
  item_campaign_id: number | null;
  status: number;
  module_id: number;
  store_id: number | null;
  reply: string | null;
  review_id: string;
  replied_at: string | null;
  item_name: string;
  customer: {
    id: number;
    f_name: string;
    l_name: string;
    phone: string | null;
    email: string;
    image: string;
    is_phone_verified: number;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    status: number;
    order_count: number;
    login_medium: string;
    social_id: string | null;
    zone_id: string | null;
    wallet_balance: number;
    loyalty_point: number;
    ref_code: string;
    current_language_key: string;
    ref_by: string | null;
    temp_token: string | null;
    module_ids: string | null;
    is_email_verified: number;
    is_from_pos: number;
    country_code: string | null;
    gender: string;
    birthday: string;
    image_full_url: string | null;
    storage: {
      id: number;
      data_type: string;
      data_id: string;
      key: string;
      value: string;
      created_at: string;
      updated_at: string;
    }[];
  };
}

export interface ReviewsResponse {
  total_size: number;
  limit: number | null;
  offset: number | null;
  reviews: ApiReview[];
}

// Reviews API
export const reviewsApi = {
  // Get product rating
  getProductRating: async (productId: number): Promise<ApiResponse<number>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: 0,
        };
      }
      
      const url = `${API_BASE_URL}/items/rating/${productId}`;
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(url, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = { data: 4.5 };
      const response = mockResponse;
      
      let rating = 0;
      if (typeof response.data === 'number') {
        rating = response.data;
      } else if (typeof response.data === 'string') {
        rating = parseFloat(response.data) || 0;
      }
      
      return {
        success: true,
        data: rating,
        message: 'Product rating retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get product rating error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get product rating',
        data: 0,
      };
    }
  },

  // Get product reviews
  getProductReviews: async (productId: number): Promise<ApiResponse<ReviewsResponse>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: {
            total_size: 0,
            limit: null,
            offset: null,
            reviews: [],
          },
        };
      }
      
      const url = `${API_BASE_URL}/items/reviews/${productId}`;
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(url, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          total_size: 0,
          limit: null,
          offset: null,
          reviews: [],
        }
      };
      const response = mockResponse;
      
      let parsedData = response.data;
      
      // Handle string response
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch (parseError) {
          console.error('Error parsing reviews data:', parseError);
          parsedData = {
            total_size: 0,
            limit: null,
            offset: null,
            reviews: [],
          };
        }
      }
      
      // Ensure we have the proper structure
      if (!parsedData || typeof parsedData !== 'object') {
        parsedData = {
          total_size: 0,
          limit: null,
          offset: null,
          reviews: [],
        };
      }
      
      // Ensure reviews array exists
      if (!Array.isArray(parsedData.reviews)) {
        parsedData.reviews = [];
      }
      
      return {
        success: true,
        data: parsedData,
        message: 'Product reviews retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get product reviews error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get product reviews',
        data: {
          total_size: 0,
          limit: null,
          offset: null,
          reviews: [],
        },
      };
    }
  },

  
  postProductReviews: async (item_id: number = 1, order_id: number = 1, rating: number = 1, comment: string = " "): Promise<ApiResponse<number>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: 0,
        };
      }
      
      const url = `${API_BASE_URL}/items/reviews/submit`;
      
      // MOCK DATA: Commented out API call
      // const response = await axios.post(url, 
      // { item_id, order_id, rating, comment  },
      // {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: Date.now()
      };
      const response = mockResponse;
      
      return {
        success: true,
        data: response.data,
        message: 'Product rating retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get product rating error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get product rating',
        data: 0,
      };
    }
  },
};