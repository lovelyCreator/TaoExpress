import { ApiResponse } from '../types';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Define the Follow type based on the API response
export interface Follow {
  id: number;
  store_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  store: {
    id: number;
    name: string;
    phone: string;
    email: string;
    logo: string | null;
    latitude: string;
    longitude: string;
    address: string | null;
    footer_text: string | null;
    minimum_order: number;
    comission: string | null;
    schedule_order: boolean;
    status: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    free_delivery: boolean;
    rating: number[];
    cover_photo: string | null;
    delivery: boolean;
    take_away: boolean;
    item_section: boolean;
    tax: number;
    zone_id: number;
    reviews_section: boolean;
    active: boolean;
    off_day: string;
    self_delivery_system: number;
    pos_system: boolean;
    minimum_shipping_charge: number;
    delivery_time: string;
    veg: number;
    non_veg: number;
    order_count: number;
    total_order: number;
    module_id: number;
    order_place_to_schedule_interval: number;
    featured: number;
    per_km_shipping_charge: number;
    prescription_order: boolean;
    slug: string;
    maximum_shipping_charge: number;
    cutlery: boolean;
    meta_title: string | null;
    meta_description: string | null;
    meta_image: string | null;
    announcement: number;
    announcement_message: string | null;
    store_business_model: string;
    package_id: string | null;
    pickup_zone_id: string;
    comment: string | null;
    tin: string;
    tin_expire_date: string;
    tin_certificate_image: string | null;
    gst_status: boolean;
    gst_code: string;
    logo_full_url: string | null;
    cover_photo_full_url: string | null;
    meta_image_full_url: string | null;
    tin_certificate_image_full_url: string | null;
    translations: {
      id: number;
      translationable_type: string;
      translationable_id: number;
      locale: string;
      key: string;
      value: string;
      created_at: string | null;
      updated_at: string | null;
    }[];
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

// Define the Follower type based on the API response
export interface Follower {
  id: number;
  user_id: number;
  store_id: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    f_name: string;
    l_name: string;
    email: string;
    phone: string;
    image: string | null;
    image_full_url: string | null;
    is_phone_verified: number;
    is_email_verified: number;
    login_type: string;
    created_at: string;
    updated_at: string;
  };
}

// Define the CheckFollowResponse type
export interface CheckFollowResponse {
  is_following: boolean;
}

// Follows API
export const followsApi = {
  // Get all followed stores
  getFollowedStores: async (): Promise<ApiResponse<Follow[]>> => {
    try {
      const token = await getStoredToken();
      
      const url = `${API_BASE_URL}/customer/follow/stores`;
      
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
        data: []
      };
      const response = mockResponse;
      
      // Check if response data exists
      if (!response.data) {
        return {
          success: true,
          data: [],
          message: 'No followed stores data received',
        };
      }
      console.log("Following stores (MOCK)", response.data);
      
      // Return the response data directly
      return {
        success: true,
        data: response.data,
        message: 'Followed stores retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get followed stores error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get followed stores. Status: ${error.response.status}`,
          data: [],
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: [],
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: [],
        };
      }
    }
  },

  // Follow a store
  followStore: async (storeId: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      const token = await getStoredToken();
      
      const url = `${API_BASE_URL}/customer/follow/store`;
      
      // MOCK DATA: Commented out API call
      // const response = await axios.post(url, 
      //   { store_id: storeId },
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
          message: 'Store followed successfully',
        }
      };
      const response = mockResponse;
      
      return {
        success: true,
        data: response.data,
        message: 'Store followed successfully',
      };
    } catch (error: any) {
      console.error('Follow store error:', error);
      
      if (error.response) {
        // Handle 409 conflict specifically (already following)
        if (error.response.status === 409) {
          return {
            success: false,
            message: 'You are already following this store',
            data: { message: 'Already following' },
          };
        }
        
        return {
          success: false,
          message: error.response.data.message || `Failed to follow store. Status: ${error.response.status}`,
          data: { message: 'Failed to follow store' },
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: { message: 'Network error' },
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: { message: 'Unexpected error' },
        };
      }
    }
  },

  // Unfollow a store
  unfollowStore: async (storeId: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      const token = await getStoredToken();
      
      const url = `${API_BASE_URL}/customer/follow/store`;
      
      // MOCK DATA: Commented out API call
      // const response = await axios.delete(url, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   data: { store_id: storeId }
      // });
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          message: 'Store unfollowed successfully',
        }
      };
      const response = mockResponse;
      
      return {
        success: true,
        data: response.data,
        message: 'Store unfollowed successfully',
      };
    } catch (error: any) {
      console.error('Unfollow store error:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || `Failed to unfollow store. Status: ${error.response.status}`,
          data: { message: 'Failed to unfollow store' },
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: { message: 'Network error' },
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: { message: 'Unexpected error' },
        };
      }
    }
  },

  // Get followers
  getFollowers: async (): Promise<ApiResponse<Follower[]>> => {
    try {
      const token = await getStoredToken();
      
      const url = `${API_BASE_URL}/customer/follow/user`;
      
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
        data: []
      };
      const response = mockResponse;
      
      // Check if response data exists
      if (!response.data) {
        return {
          success: true,
          data: [],
          message: 'No followers data received',
        };
      }
      
      // Return the response data directly
      return {
        success: true,
        data: response.data,
        message: 'Followers retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get followers error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get followers. Status: ${error.response.status}`,
          data: [],
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: [],
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: [],
        };
      }
    }
  },

  // Check if following a store
  checkFollowing: async (storeId: number): Promise<ApiResponse<CheckFollowResponse>> => {
    try {
      const token = await getStoredToken();
      
      // Use GET method with query parameter instead of POST
      const url = `${API_BASE_URL}/customer/follow/check/${storeId}`;
      console.log(`Checking follow status for store ${storeId}, ${url}`);
      
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
          is_following: false,
        }
      };
      const response = mockResponse;
      
      return {
        success: true,
        data: response.data,
        message: 'Follow status checked successfully',
      };
    } catch (error: any) {
      console.error('Check follow status error:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || `Failed to check follow status. Status: ${error.response.status}` || 'The POST method is not supported for route api/v1/customer/follow/check. Supported methods: GET, HEAD.',
          data: { is_following: false },
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: { is_following: false },
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: { is_following: false },
        };
      }
    }
  },
};