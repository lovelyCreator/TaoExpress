import { ApiResponse, PaginatedResponse, ApiAddress, CreateAddressRequest, UpdateAddressRequest } from '../types';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://221.138.36.200:5000/api/v1';

// Addresses API
export const addressesApi = {
  // Get all addresses
  getAddresses: async (moduleId: number = 2): Promise<ApiResponse<PaginatedResponse<ApiAddress>>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: {
            data: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        };
      }
      
      const url = `${API_BASE_URL}/customer/address/list`;
      console.log("Address URL: ", url);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(url, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   params: {
      //     module_id: moduleId,
      //   },
      // });
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          data: [],
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1,
          next_page_url: null,
          prev_page_url: null,
        }
      };
      const response = mockResponse;
      let parsedData = response.data;
      // console.log("Address Response:", parsedData);
      if (typeof parsedData === 'string') {
        try {
          // Try to fix malformed JSON by adding closing brace if missing
          let fixedJson: string = parsedData;
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
      
      // Transform the response to match our PaginatedResponse format
      const paginatedData: PaginatedResponse<ApiAddress> = {
        data: parsedData.data,
        pagination: {
          page: parsedData.current_page,
          limit: parsedData.per_page,
          total: parsedData.total,
          totalPages: parsedData.last_page,
          hasNext: parsedData.next_page_url !== null,
          hasPrev: parsedData.prev_page_url !== null,
        },
      };
      
      return {
        success: true,
        data: paginatedData,
        message: 'Addresses retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get addresses error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get addresses. Status: ${error.response.status}`,
          data: {
            data: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: {
            data: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: {
            data: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        };
      }
    }
  },

  // Create a new address
  createAddress: async (addressData: CreateAddressRequest, moduleId: number = 2): Promise<ApiResponse<{ message: string }>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: { message: 'Authentication required' },
        };
      }
      
      const url = `${API_BASE_URL}/customer/address/add`;
      
      // MOCK DATA: Commented out API call
      // const response = await axios.post(url, addressData, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   params: {
      //     module_id: moduleId,
      //   },
      // });
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          message: 'Address created successfully',
        }
      };
      const response = mockResponse;
      
      return {
        success: true,
        data: response.data,
        message: 'Address created successfully',
      };
    } catch (error: any) {
      console.error('Create address error:', error);
      
      if (error.response) {
        // Handle 403 Forbidden error specifically
        if (error.response.status === 403) {
          return {
            success: false,
            message: error.response.data.message || 'Forbidden: You do not have permission to create this address',
            data: { message: 'Forbidden' },
          };
        }
        
        console.log("Add New Address Error: ", error.response.data);
        return {
          success: false,
          message: error.response.data.message || `Failed to create address. Status: ${error.response.status}`,
          data: { message: 'Failed to create address' },
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

  // Update an existing address
  updateAddress: async (addressData: UpdateAddressRequest, moduleId: number = 2): Promise<ApiResponse<{ message: string }>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: { message: 'Authentication required' },
        };
      }
      
      const url = `${API_BASE_URL}/customer/address/update/${addressData.id}`;
      
      // Remove the id from the data we send (it's in the URL)
      const { id, ...updateData } = addressData;
      console.log ('Sending update request to:', updateData);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.put(url, updateData, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   params: {
      //     module_id: moduleId,
      //   },
      // });
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          message: 'Address updated successfully',
        }
      };
      const response = mockResponse;
      console.log("Response Update Address (MOCK): ", response.data)
      return {
        success: true,
        data: response.data,
        message: 'Address updated successfully',
      };
    } catch (error: any) {
      console.error('Update address error:', error);
      
      if (error.response) {
        // Handle 403 Forbidden error specifically
        if (error.response.status === 403) {
          return {
            success: false,
            message: error.response.data.message || 'Forbidden: You do not have permission to update this address',
            data: { message: 'Forbidden' },
          };
        }
        
        return {
          success: false,
          message: error.response.data.message || `Failed to update address. Status: ${error.response.status}`,
          data: { message: 'Failed to update address' },
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

  // Delete an address
  deleteAddress: async (addressId: number, moduleId: number = 2): Promise<ApiResponse<{ message: string }>> => {
    try {
      const token = await getStoredToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: { message: 'Authentication required' },
        };
      }
      
      const url = `${API_BASE_URL}/customer/address/delete/${addressId}`;
      
      // MOCK DATA: Commented out API call
      // const response = await axios.delete(url, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   params: {
      //     module_id: moduleId,
      //   },
      // });
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          message: 'Address deleted successfully',
        }
      };
      const response = mockResponse;
      
      return {
        success: true,
        data: response.data,
        message: 'Address deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete address error:', error);
      
      if (error.response) {
      console.error('Delete address error:', error.response.data);
        return {
          success: false,
          message: error.response.data.message || `Failed to delete address. Status: ${error.response.status}`,
          data: { message: 'Failed to delete address' },
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