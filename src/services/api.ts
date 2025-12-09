import { 
  Product, 
  Category, 
  Seller, 
  Review, 
  Story, 
  Notification, 
  User, 
  Order, 
  CartItem,
  SearchFilters, 
  ApiResponse, 
  PaginatedResponse,
  VariationData,
  ShippingService,
  ProductCreateData,
  ProductUpdateData,
  CustomerOrderDetails,
  CustomerOrderResponse
} from '../types';
import * as LocalDB from './localDatabase';
import { getStoredToken } from './authApi';
import axios, { AxiosRequestConfig } from 'axios';
import { uploadToCloudinary, uploadVideoToCloudinary } from './cloudinary';

// Import the separated API modules
import { productsApi } from './productsApi';
import { categoriesApi } from './categoriesApi';
import { usersApi } from './usersApi';
import { sellersApi } from './sellersApi';
import { ordersApi } from './ordersApi';
import { storesApi } from './storesApi';
import { shippingServicesApi } from './shippingServicesApi';
import { cartApi } from './cartApi';
import { followsApi } from './followsApi';
import { reviewsApi } from './reviewsApi';
import { customerOrdersApi } from './customerOrdersApi';

// Export all the separated APIs
export { 
  productsApi,
  categoriesApi,
  usersApi,
  sellersApi,
  ordersApi,
  storesApi,
  shippingServicesApi,
  cartApi,
  followsApi,
  reviewsApi,
  customerOrdersApi
};

// Initialize local database on app start
// Initialize local database with a small delay to prevent race conditions
setTimeout(() => {
  LocalDB.initializeLocalDatabase().catch(error => {
    console.error('Failed to initialize local database:', error);
  });
}, 100);

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await getStoredToken();
  return {
    'Authorization': `Bearer ${token}`,
  };
};

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

// Export utility functions that might be used by other modules
export {
  getAuthHeaders,
  toNumber,
  toInteger,
  API_BASE_URL
};

// Export types that might be used by other modules
export type {
  ProductCreateData,
  ProductUpdateData,
  CustomerOrderDetails,
  CustomerOrderResponse
};