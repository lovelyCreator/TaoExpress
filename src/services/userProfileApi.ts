import { ApiResponse, StorePerformanceReuquest, StoreProfileResponse } from '../types';
import { getStoredToken } from './authApi';
import axios from 'axios';
import { uploadToCloudinary } from './cloudinary';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Define the User type based on the API response
export interface UserProfile {
  id: number;
  f_name: string;
  l_name: string;
  phone: string | null;
  email: string;
  image: string | null;
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
  birthday: string | null;
  image_full_url: string | null;
  storage: any[];
}

// Define the UpdateProfileRequest type
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  birthday?: string;
  gender?: string;
  phone?: string;
  image?: string;
}

// User Profile API
export const userProfileApi = {
  // Get user profile info
  getUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: {} as UserProfile,
        };
      }
      
      const url = `${API_BASE_URL}/customer/info`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("GET PROFILE RESPONSE:", response.data);
      
    let parsedData = response.data;
    if (typeof parsedData === 'string') {
      try {
        // Try to fix malformed JSON by adding closing brace if missing
        let fixedJson = parsedData;
        if (fixedJson.trim().endsWith(',')) {
          fixedJson = fixedJson.trim().slice(0, -1);
        }
        if (!fixedJson.trim().endsWith('}')) {
          fixedJson = fixedJson.trim() + '}';
        }
        parsedData = JSON.parse(fixedJson);
      } catch (parseError) {
        // If parsing fails, use the original string
        console.error('Error parsing error response:', parseError);
      }
    }
      return {
        success: true,
        data: parsedData,
        message: 'User profile retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get user profile error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get user profile. Status: ${error.response.status}`,
          data: {} as UserProfile,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: {} as UserProfile,
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: {} as UserProfile,
        };
      }
    }
  },

  // Upload image to Cloudinary
  uploadImage: async (imageUri: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const response = await uploadToCloudinary(imageUri);
      return {
        success: true,
        url: response.secure_url,
      };
    } catch (error: any) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image',
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData: UpdateProfileRequest): Promise<ApiResponse<{ message: string }>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: { message: 'Authentication required' },
        };
      }
      
      const url = `${API_BASE_URL}/customer/update-profile`;
      
      // Prepare the request data - only include fields that are provided
      const requestData: any = {};
      if (profileData.name !== undefined) {
        requestData.name = profileData.name;
      }
      if (profileData.email !== undefined) {
        requestData.email = profileData.email;
      }
      if (profileData.birthday !== undefined) {
        requestData.birthday = profileData.birthday;
      }
      if (profileData.gender !== undefined) {
        requestData.gender = profileData.gender;
      }
      if (profileData.phone !== undefined) {
        requestData.phone = profileData.phone;
      }
      if (profileData.image !== undefined) {
        requestData.image = profileData.image;
      }
      console.log("REQUEST DATA:", profileData);
      
      const response = await axios.post(url, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully',
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || `Failed to update profile. Status: ${error.response.status}`,
          data: { message: 'Failed to update profile' },
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

  
  // Update user profile
  updateStoreProfile: async (profileData: StoreProfileResponse): Promise<ApiResponse<Object>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: { message: 'Authentication required' },
        };
      }
      
      const url = `${API_BASE_URL}/vendor/update-profile`;
      
      // Prepare the request data - only include fields that are provided
      const requestData: any = {};
      if (profileData.name !== undefined) {
        requestData.store_name = profileData.name;
      }
      if (profileData.description !== undefined) {
        requestData.description = profileData.description;
      }
      if (profileData.logo !== undefined) {
        requestData.store_logo = profileData.logo;
      }
      console.log("REQUEST DATA:", profileData);
      
      const response = await axios.put(url, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully',
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || `Failed to update profile. Status: ${error.response.status}`,
          data: { message: 'Failed to update profile' },
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

  
  // Update user profile
  getStorePerformance: async (profileData: StorePerformanceReuquest): Promise<ApiResponse<Object>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: { message: 'Authentication required' },
        };
      }
      
      const url = `${API_BASE_URL}/vendor/get-performance?period=${profileData.period}&status=${profileData.status}`;
      
      console.log("REQUEST DATA:", url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("RESPONSE PERFORMANCE DATA:", response.data);
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully',
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || `Failed to update profile. Status: ${error.response.status}`,
          data: { message: 'Failed to update profile' },
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
};