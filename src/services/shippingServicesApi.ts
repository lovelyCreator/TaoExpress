import { ApiResponse, ShippingService } from '../types';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Helper function to convert string to number safely
const toNumber = (value: string | number | undefined, defaultValue: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// Helper function to convert string to integer safely
const toInteger = (value: string | number | undefined, defaultValue: number = 0): number => {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// Shipping Services API
export const shippingServicesApi = {
  // Get shipping services by store ID
  getShippingServices: async (storeId: number): Promise<ApiResponse<ShippingService[]>> => {
    try {
      const token = await getStoredToken();
      
      // Debug: Log token status
      // console.log('Get shipping services - Token:', token ? 'Present' : 'Missing');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null as any,
        };
      }
      
      // console.log('Sending get shipping services request to:', `${API_BASE_URL}/shipping-service/${storeId}`);
      // console.log('Authorization header:', `Bearer ${token.substring(0, 10)}...`); // Log first 10 chars of token for debugging
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/shipping-service/${storeId}`,
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
      const response = mockResponse;
      
      // console.log('Response status:', response.status);
      // console.log('Response data:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Shipping services retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get shipping services error:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        return {
          success: false,
          message: error.response.data.message || `Failed to get shipping services. Status: ${error.response.status}`,
          data: null as any,
        };
      } else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null as any,
        };
      } else {
        // Something else happened
        console.error('Unexpected error:', error.message);
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null as any,
        };
      }
    }
  },

  // Create a new shipping service
  createShippingService: async (serviceData: Omit<ShippingService, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ShippingService>> => {
    try {
      const token = await getStoredToken();
      
      // Debug: Log token status
      console.log('Shipping service creation - Token:', token ? 'Present' : 'Missing');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null as any,
        };
      }
      
      // Ensure proper type conversion for numeric fields
      const processedServiceData = {
        ...serviceData,
        store_id: toInteger(serviceData.store_id),
        origin_zip: serviceData.origin_zip,
        locations: serviceData.locations.map(location => ({
          ...location,
          one_item: toNumber(location.one_item),
          additional_item: toNumber(location.additional_item)
        }))
      };
      
      // console.log('Sending shipping service creation request to:', `${API_BASE_URL}/shipping-service/store`);
      // console.log('Shipping service data:', processedServiceData);
      // console.log('Authorization header:', `Bearer ${token}`); // Log first 10 chars of token for debugging
      
      // MOCK DATA: Commented out API call
      // const response = await axios.post(
      //   `${API_BASE_URL}/shipping-service/store`,
      //   processedServiceData,
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
          service_name: serviceData.service_name || 'Mock Service',
          shipping_price_type: serviceData.shipping_price_type || 'fixed',
          origin_zip: serviceData.origin_zip || '',
          processing_time: serviceData.processing_time || '1-2 days',
          store_id: serviceData.store_id,
          locations: serviceData.locations,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any
      };
      const response = mockResponse;
      
      // console.log('Response status:', response.status);
      // console.log('Response data:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Shipping service created successfully',
      };
    } catch (error: any) {
      console.error('Create shipping service error:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        return {
          success: false,
          message: error.response.data.message || `Failed to create shipping service. Status: ${error.response.status}`,
          data: null as any,
        };
      } else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null as any,
        };
      } else {
        // Something else happened
        console.error('Unexpected error:', error.message);
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null as any,
        };
      }
    }
  },

  // Update an existing shipping service
  updateShippingService: async (serviceId: number, serviceData: Omit<ShippingService, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ShippingService>> => {
    try {
      const token = await getStoredToken();
      
      // Debug: Log token status
      // console.log('Shipping service update - Token:', token ? 'Present' : 'Missing');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null as any,
        };
      }
      
      // Ensure proper type conversion for numeric fields
      const processedServiceData = {
        ...serviceData,
        store_id: toInteger(serviceData.store_id),
        origin_zip: serviceData.origin_zip,
        locations: serviceData.locations.map(location => ({
          ...location,
          one_item: toNumber(location.one_item),
          additional_item: toNumber(location.additional_item)
        }))
      };
      
      // console.log('Sending shipping service update request to:', `${API_BASE_URL}/shipping-service/${serviceId}`);
      // console.log('Shipping service data:', processedServiceData);
      // console.log('Authorization header:', `Bearer ${token.substring(0, 10)}...`); // Log first 10 chars of token for debugging
      
      // MOCK DATA: Commented out API call
      // const response = await axios.put(
      //   `${API_BASE_URL}/shipping-service/${serviceId}/update`,
      //   processedServiceData,
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
          id: serviceId,
          service_name: serviceData.service_name || 'Mock Service',
          shipping_price_type: serviceData.shipping_price_type || 'fixed',
          origin_zip: serviceData.origin_zip || '',
          processing_time: serviceData.processing_time || '1-2 days',
          store_id: serviceData.store_id,
          locations: serviceData.locations,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any
      };
      const response = mockResponse;
      
      // console.log('Response status:', response.status);
      // console.log('Response data:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Shipping service updated successfully',
      };
    } catch (error: any) {
      console.error('Update shipping service error:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        return {
          success: false,
          message: error.response.data.message || `Failed to update shipping service. Status: ${error.response.status}`,
          data: null as any,
        };
      } else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null as any,
        };
      } else {
        // Something else happened
        console.error('Unexpected error:', error.message);
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null as any,
        };
      }
    }
  },

  deleteShippingService: async (serviceId: number) => { 
    try {
      const token = await getStoredToken();
      // console.log('Deleting shipping service with ID:', serviceId);
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please log in first.',
          data: null as any,
        };
      }
      // MOCK DATA: Commented out API call
      // const response = await axios.delete(`${API_BASE_URL}/shipping-service/service/${serviceId}/delete`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          message: 'Shipping service deleted successfully',
        }
      };
      const response = mockResponse;
      
      return {
        success: true,
        message: 'Shipping service deleted successfully',
        data: null,
      };
    } catch (error: any) {
      console.error('Delete shipping service error:', error);
      if (error.response) {
        // Server responded with error status
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        return {
          success: false,
          message: error.response.data.message || `Failed to Delete shipping service. Status: ${error.response.status}`,
          data: null as any,
        };
      }else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null as any,
        };
      } else {
        // Something else happened
        console.error('Unexpected error:', error.message);
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null as any,
        };
      }
    }
  },
};