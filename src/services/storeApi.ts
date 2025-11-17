import { ApiResponse, StoreResponse, OrderStatsResponse } from '../types';
import { getStoredToken } from './authApi';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://semistiff-vance-doctorly.ngrok-free.dev/api/v1';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await getStoredToken();
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// Mock function to get store ID by user ID (using default value since API is not ready)
export const getStoreByUserId = async (userId: string): Promise<ApiResponse<StoreResponse>> => {
  try {
    // In a real implementation, this would call the actual API:
    console.log("Get Store Data", `${API_BASE_URL}/vendor/my-store/${userId}`);
    const response = await fetch(`${API_BASE_URL}/vendor/my-store/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders()),
      },
    });
    const data = await response.json();
    console.log("Get Store Data", data);
    // return data;

    // For now, we'll return a mock response with default values
    // console.log('Store API: Getting store for user ID:', userId);
    
    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 500));
    
    // // Return mock data with default store_id of 1
    return {
      success: true,
      data: {
        id: data.store_id, // Default store ID as requested
        name: data.store_name,
        phone: '',
        email: '',
        logo: data.store_logo,
        cover_photo: null,
        logo_full_url: null,
        cover_photo_full_url: null,
        address: null,
        delivery_time: '',
        rating: [],
        items_count: 0,
        orders_count: 0,
        reviews_count: 0,
        featured: 0,
        active: true,
        open: 0,
        distance: null,
        canceledCount: data.canceled_count,
        completedCount: data.completed_count,
        confirmedCount: data.confirmed_count,
        followers: data.followers_count,
        following: data.following_count,
      },
      message: 'Store retrieved successfully',
    };
  } catch (error) {
    console.error('Store API: Error getting store:', error);
    return {
      success: false,
      data: null as any,
      message: 'Failed to retrieve store information',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Mock function to get store ID by user ID (using default value since API is not ready)
export const getStoreProfileData = async (): Promise<ApiResponse<Object>> => {
  try {
    // In a real implementation, this would call the actual API:
    console.log("Get Store Data", `${API_BASE_URL}/vendor/profile`);
    const response = await fetch(`${API_BASE_URL}/vendor/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders()),
      },
    });
    const data = await response.json();
    console.log("Get Store Data", data);
    // return data;

    // For now, we'll return a mock response with default values
    // console.log('Store API: Getting store for user ID:', userId);
    
    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 500));
    
    // // Return mock data with default store_id of 1
    return {
      success: true,
      data: {
        name: data.store_name,
        description: data.description,
        logo: data.store_logo,
      },
      message: 'Store retrieved successfully',
    };
  } catch (error) {
    console.error('Store API: Error getting store:', error);
    return {
      success: false,
      data: null as any,
      message: 'Failed to retrieve store information',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Mock function to get order statistics by store ID (using default values since API is not ready)
export const getOrderStatsByStoreId = async (storeId: number): Promise<ApiResponse<OrderStatsResponse>> => {
  try {
    // In a real implementation, this would call the actual API:
    // const response = await fetch(`${API_BASE_URL}/stores/${storeId}/order-stats`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     ...(await getAuthHeaders()),
    //   },
    // });
    // const data = await response.json();
    // return data;

    // For now, we'll return a mock response with default values
    console.log('Store API: Getting order stats for store ID:', storeId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data with default values
    return {
      success: true,
      data: {
        // Define the structure based on your API response
        // For now, we'll use a generic object structure
        need_to_send: 0, // Default value as requested
        cancelled: 0,    // Default value as requested
        returned: 0,     // Default value as requested
      } as OrderStatsResponse,
      message: 'Order statistics retrieved successfully',
    };
  } catch (error) {
    console.error('Store API: Error getting order stats:', error);
    return {
      success: false,
      data: null as any,
      message: 'Failed to retrieve order statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};