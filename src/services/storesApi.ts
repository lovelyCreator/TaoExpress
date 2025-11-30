import { ApiResponse, Store } from '../types';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://221.138.36.200:5000/api/v1';

// Stores API
export const storesApi = {
  // Get all stores
  getAllStores: async (
    storeType: string = 'all',
    offset: number = 1,
    limit: number = 12
  ): Promise<ApiResponse<{ stores: Store[]; total_size: number }>> => {
    try {
      const token = await getStoredToken();
      
      // Construct the API URL with query parameters
      const url = `${API_BASE_URL}/stores/get-stores/all?store_type=${storeType}&offset=${offset}&limit=${limit}`;
      
      // console.log('Sending get all stores request to:', url);
      
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
          stores: [
            {
              id: '1',
              name: 'TechStore',
              logo_full_url: 'https://via.placeholder.com/100',
              description: 'Premium tech products',
              rating: 4.5,
              followersCount: 5000,
            },
          ],
          total_size: 1,
        }
      };
      const response = { data: mockResponse.data };
      
      // Check if response data exists and is not empty
      if (!response.data) {
        return {
          success: true,
          data: { stores: [], total_size: 0 },
          message: 'No stores data received',
        };
      }
      
      // Ensure we have the expected structure
      let parsedData: any = response.data;
      if (!parsedData.stores) {
        // If response is directly an array of stores
        if (Array.isArray(parsedData)) {
          return {
            success: true,
            data: { stores: parsedData, total_size: parsedData.length },
            message: 'Stores retrieved successfully',
          };
        }
        // If response is a single store object
        else if (parsedData && parsedData.id) {
          return {
            success: true,
            data: { stores: [parsedData], total_size: 1 },
            message: 'Stores retrieved successfully',
          };
        }
        // Unknown format
        else {
          console.warn('Unexpected stores data format:', parsedData);
          return {
            success: true,
            data: { stores: [], total_size: 0 },
            message: 'No valid stores data found',
          };
        }
      }
      
      // Ensure the stores array is properly formatted for UI components
      const formattedStores = parsedData.stores.map((store: any) => ({
        ...store,
        id: store.id?.toString() || '',
        name: store.name || 'Unknown Store',
        // Add avatar property to match SearchResultsScreen format
        avatar: store.logo_full_url ? { uri: store.logo_full_url } : require('../assets/images/avatar.png'),
        // Keep logo_full_url for SearchScreen format
      }));
      
      return {
        success: true,
        data: { stores: formattedStores, total_size: parsedData.total_size || formattedStores.length },
        message: 'Stores retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get all stores error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get stores. Status: ${error.response.status}`,
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

  // Get store by seller ID
  getStoreBySellerId: async (sellerId: string): Promise<ApiResponse<Store>> => {
    try {
      const token = await getStoredToken();
      
      // Construct the API URL with sellerId parameter
      const url = `${API_BASE_URL}/stores/get-stores/${sellerId}`;
      
      console.log('Sending get store by seller ID request to:', url);
      
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
          id: sellerId,
          name: 'Mock Store',
          logo_full_url: 'https://via.placeholder.com/100',
          description: 'Mock store description',
        }
      };
      const response = { data: mockResponse.data };
      
      console.log('Response status (MOCK):', 200);
      console.log('Response data (MOCK):', response.data);
      
      // Check if response data exists
      if (!response.data) {
        return {
          success: false,
          message: 'No store data received',
          data: null as any,
        };
      }
      
      return {
        success: true,
        data: response.data as any,
        message: 'Store retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get store by seller ID error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get store. Status: ${error.response.status}`,
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

  // Get store details by store ID
  getStoreDetails: async (storeId: string): Promise<ApiResponse<Store>> => {
    try {
      const token = await getStoredToken();
      
      // Construct the API URL with storeId parameter
      const url = `${API_BASE_URL}/stores/details/${storeId}`;
      
      console.log('Sending get store details request to:', url);
      
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
          id: storeId,
          name: 'Mock Store',
          logo_full_url: 'https://via.placeholder.com/100',
          description: 'Mock store description',
          rating: 4.5,
        }
      };
      const response = { data: mockResponse.data };
      
      console.log('Response status (MOCK):', 200);
      console.log('Response data (MOCK):', response.data);
      
      // Check if response data exists
      if (!response.data) {
        return {
          success: false,
          message: 'No store data received',
          data: null as any,
        };
      }
      
      // Return mock store data with all required fields
      const mockStoreData = {
        ...response.data,
        phone: '',
        email: '',
        logo: null,
        cover_photo: null,
        latitude: '',
        longitude: '',
        address: null,
        footer_text: null,
        minimum_order: 0,
        comission: null,
        schedule_order: false,
        status: 1,
        user_id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        free_delivery: false,
        rating: [],
        delivery: false,
        take_away: false,
        item_section: false,
        tax: 0,
        zone_id: 0,
        reviews_section: false,
        active: true,
        off_day: '',
        self_delivery_system: 0,
        pos_system: false,
        minimum_shipping_charge: 0,
        delivery_time: '',
        veg: 0,
        non_veg: 0,
        order_count: 0,
        total_order: 0,
        module_id: 0,
        order_place_to_schedule_interval: 0,
        featured: 0,
        per_km_shipping_charge: 0,
        prescription_order: false,
        slug: '',
        maximum_shipping_charge: 0,
        cutlery: false,
        meta_title: null,
        meta_description: null,
        meta_image: null,
        announcement: 0,
        announcement_message: null,
        store_business_model: '',
        package_id: null,
        pickup_zone_id: '',
        comment: null,
        tin: '',
        tin_expire_date: '',
        tin_certificate_image: null,
        gst_status: false,
        gst_code: '',
        logo_full_url: (response.data as any).logo_full_url || null,
        cover_photo_full_url: null,
        meta_image_full_url: null,
        tin_certificate_image_full_url: null,
        translations: [],
        storage: [],
      } as any;
      
      return {
        success: true,
        data: mockStoreData,
        message: 'Store details retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get store details error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get store details. Status: ${error.response.status}`,
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