import { ApiResponse } from '../types';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://221.138.36.200:5000/api/v1';

// Categories API
export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<ApiResponse<any[]>> => {
    try {
      const token = await getStoredToken();
      
      // console.log('Sending get categories request to:', `${API_BASE_URL}/categories`);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/categories`,
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
        data: [
          { id: 1, name: 'Electronics', icon: 'electronics', image: 'https://via.placeholder.com/200' },
          { id: 2, name: 'Fashion', icon: 'fashion', image: 'https://via.placeholder.com/200' },
          { id: 3, name: 'Home & Garden', icon: 'home', image: 'https://via.placeholder.com/200' },
        ]
      };
      const response = { data: mockResponse.data };
      
      // Handle empty or invalid responses
      if (!response.data) {
        console.warn('Categories API returned no data');
        return {
          success: true,
          message: 'No categories data received',
          data: [],
        };
      }
      
      // Ensure we're returning an array
      let categoriesData = response.data;
      if (!Array.isArray(categoriesData)) {
        categoriesData = [];
      }
      
      return {
        success: true,
        data: categoriesData,
        message: 'Categories retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get categories error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get categories. Status: ${error.response.status}`,
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

  // Get category by ID
  getCategoryById: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // console.log('Sending get category by ID request to:', `${API_BASE_URL}/categories/${id}`);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/categories/${id}`,
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
          id: parseInt(id),
          name: 'Mock Category',
          icon: 'category',
          image: 'https://via.placeholder.com/200',
        }
      };
      const response = { data: mockResponse.data };
      
      return {
        success: true,
        data: response.data,
        message: 'Category retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get category by ID error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get category. Status: ${error.response.status}`,
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

  // Get child categories by parent ID
  getChildCategories: async (parentId: number): Promise<ApiResponse<any[]>> => {
    try {
      const token = await getStoredToken();
      
      // console.log('Sending get child categories request to:', `${API_BASE_URL}/categories/childes/${parentId}`);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/categories/childes/${parentId}`,
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
        data: [
          { id: parentId * 10 + 1, name: 'Child Category 1', parent_id: parentId },
          { id: parentId * 10 + 2, name: 'Child Category 2', parent_id: parentId },
        ]
      };
      const response = { data: mockResponse.data };
      
      // console.log('Response status:', response.status);
      // console.log('Response data type:', typeof response.data);
      // console.log('Response data:', response.data);
      // console.log('Is response.data an array?', Array.isArray(response.data));
      
      // Ensure we're returning an array
      let childCategoriesData = response.data;
      if (!Array.isArray(childCategoriesData)) {
        console.warn('Child categories data is not an array, wrapping in array');
        childCategoriesData = [childCategoriesData];
      }
      
      return {
        success: true,
        data: childCategoriesData,
        message: 'Child categories retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get child categories error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get child categories. Status: ${error.response.status}`,
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
};