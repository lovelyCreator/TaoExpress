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
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://semistiff-vance-doctorly.ngrok-free.dev/api/v1';

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

// Products API
export const productsApi = {
  // Get products with pagination and filters
  getProducts: async (
    page: number = 1,
    limit: number = 20,
    filters?: SearchFilters
  ): Promise<PaginatedResponse<Product>> => {
    return await LocalDB.getProducts(page, limit, filters);
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    const product = await LocalDB.getProductById(id);
    if (!product) {
      return {
        success: false,
        message: 'Product not found',
        data: null as any,
      };
    }
    return {
      success: true,
      data: product,
    };
  },

  // Get "You May Like" products
  getYouMayLikeProducts: async (productId: string, limit: number = 8): Promise<ApiResponse<Product[]>> => {
    const result = await LocalDB.getYouMayLikeProducts(productId, limit);
    return {
      success: true,
      data: result,
    };
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 10): Promise<ApiResponse<Product[]>> => {
    const result = await LocalDB.getFeaturedProducts(limit);
    return {
      success: true,
      data: result.data,
    };
  },

  // Get new products
  getNewProducts: async (limit: number = 10): Promise<ApiResponse<Product[]>> => {
    const result = await LocalDB.getNewProducts(limit);
    return {
      success: true,
      data: result.data,
    };
  },

  // Get sale products
  getSaleProducts: async (limit: number = 10): Promise<ApiResponse<Product[]>> => {
    const result = await LocalDB.getSaleProducts(limit);
    return {
      success: true,
      data: result.data,
    };
  },

  // Search products
  searchProducts: async (
    query: string,
    page: number = 1,
    limit: number = 20,
    filters?: SearchFilters,
    sellerId?: string
  ): Promise<PaginatedResponse<Product>> => {
    return await LocalDB.searchProducts(query, page, limit, filters, sellerId);
  },

  // Create a new product
  createProduct: async (productFormData: FormData): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // console.log('=== CREATE PRODUCT START ===');
      // console.log('Processing product FormData: ' + token);
      
      // Extract data from FormData
      const productData: Partial<ProductCreateData> = {};
      const images: string[] = [];
      const videos: string[] = [];
      let variationsData: string | null = null;
      
      // @ts-ignore
      const entries = [...productFormData.entries()];
      for (const [key, value] of entries) {
        // console.log('FormData key:', key, 'value:', value);
        
        if (key.startsWith('item_images[')) {
          images.push(value as string);
        } else if (key.startsWith('videos[')) {
          videos.push(value as string);
        } else if (key === 'variations') {
          variationsData = value as string;
        } else {
          // Convert string values to appropriate types
          switch (key) {
            case 'category_id':
            case 'store_id':
            case 'shipping_options':
              productData[key as keyof ProductCreateData] = toInteger(value as string);
              break;
            case 'price':
            case 'current_stock':
            case 'weight':
            case 'height':
            case 'width':
            case 'length':
              productData[key as keyof ProductCreateData] = toNumber(value as string);
              break;
            default:
              productData[key as keyof ProductCreateData] = value as any;
              break;
          }
        }
      }
      
      // Add media arrays
      if (images.length > 0) {
        productData.item_images = images;
      }
      
      if (videos.length > 0) {
        productData.videos = videos;
      }
      
      // Parse variations if present
      if (variationsData) {
        try {
          const parsedVariations = JSON.parse(variationsData);
          // Ensure proper typing for variations
          productData.variations = parsedVariations.map((variation: any) => ({
            name: variation.name,
            options: variation.options.map((option: any) => ({
              value: option.value,
              image: option.image || '',
              price: toNumber(option.price),
              stock: toInteger(option.stock),
            }))
          }));
        } catch (parseError) {
          console.error('Error parsing variations data:', parseError);
        }
      }
      
      // console.log('Sending product creation request to:', `${API_BASE_URL}/vendor/item/store`);
      // console.log('Product data:', productData);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.post(
      //   `${API_BASE_URL}/vendor/item/store`,
      //   productData,
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
          id: `product_${Date.now()}`,
          message: 'Product created successfully',
        }
      };
      const response = { data: mockResponse.data };
      
      // console.log('Response status:', response.status);
      // console.log('Response data:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Product created successfully',
      };
    } catch (error: any) {
      console.error('Create product error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to create product. Status: ${error.response.status}`,
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

  // Update an existing product
  updateProduct: async (productFormData: FormData): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // console.log('=== UPDATE PRODUCT START ===');
      // console.log('Processing product FormData');
      
      // Extract data from FormData
      const productData: Partial<ProductUpdateData> = {};
      const images: string[] = [];
      const videos: string[] = [];
      let variationsData: string | null = null;
      
      // @ts-ignore
      const entries = [...productFormData.entries()];
      for (const [key, value] of entries) {
        // console.log('FormData key:', key, 'value:', value);
        
        if (key.startsWith('item_images[')) {
          images.push(value as string);
        } else if (key.startsWith('videos[')) {
          videos.push(value as string);
        } else if (key === 'variations') {
          variationsData = value as string;
        } else {
          // Convert string values to appropriate types
          switch (key) {
            case 'id':
              productData[key as keyof ProductUpdateData] = value as string;
              break;
            case 'category_id':
            case 'store_id':
            case 'shipping_options':
              productData[key as keyof ProductUpdateData] = toInteger(value as string);
              break;
            case 'price':
            case 'current_stock':
            case 'weight':
            case 'height':
            case 'width':
            case 'length':
            case 'discount':
              productData[key as keyof ProductUpdateData] = toNumber(value as string);
              break;
            default:
              productData[key as keyof ProductUpdateData] = value as any;
              break;
          }
        }
      }
      
      // Add media arrays
      if (images.length > 0) {
        productData.item_images = images;
      }
      
      if (videos.length > 0) {
        productData.videos = videos;
      }
      
      // Parse variations if present
      if (variationsData) {
        try {
          const parsedVariations = JSON.parse(variationsData);
          // Ensure proper typing for variations
          if (Array.isArray(parsedVariations)) {
            productData.variations = parsedVariations.map((variation: any) => ({
              name: variation.name,
              options: variation.options.map((option: any) => ({
                value: option.value,
                price: toNumber(option.price),
                stock: toInteger(option.stock),
              }))
            }));
          }
        } catch (parseError) {
          console.error('Error parsing variations data:', parseError);
        }
      }
      
      // console.log('Sending product update request to:', `${API_BASE_URL}/vendor/item/update`);
      // console.log('Product data:', productData);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.put(
      //   `${API_BASE_URL}/vendor/item/update`,
      //   productData,
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
          id: productData.id || `product_${Date.now()}`,
          message: 'Product updated successfully',
        }
      };
      const response = { data: mockResponse.data };
      
      // console.log('Response status:', response.status);
      // console.log('Response data:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Product updated successfully',
      };
    } catch (error: any) {
      console.error('Update product error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to update product. Status: ${error.response.status}`,
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

  // Get product details by ID
  getProductDetails: async (productId: string): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // console.log('Sending product details request to:', `${API_BASE_URL}/items/details/${productId}`);
      console.log('Product Detailes Response data called', productId);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/items/details/${productId}`,
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: [{
          id: productId,
          name: 'Mock Product',
          description: 'This is a mock product for testing',
          price: 99.99,
          images: ['https://via.placeholder.com/400'],
          rating: 4.5,
          reviewCount: 10,
        }]
      };
      const response = { data: mockResponse.data };
      
      // console.log('Response status:', response.status);
      console.log('Product Detailes Response data (MOCK):', response.data[0]);
      
      return {
        success: true,
        data: response.data,
        message: 'Product details retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get product details error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get product details. Status: ${error.response.status}`,
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

  // Get products by store ID
  getProductsByStore: async (storeId: number): Promise<ApiResponse<any[]>> => {
    try {
      const token = await getStoredToken();
      
      console.log('Sending store products request to:', `${API_BASE_URL}/vendor/item/details/${storeId}`);
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/vendor/item/details/${storeId}`,
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
          {
            id: '1',
            name: 'Mock Product 1',
            price: 99.99,
            images: ['https://via.placeholder.com/400'],
          },
          {
            id: '2',
            name: 'Mock Product 2',
            price: 149.99,
            images: ['https://via.placeholder.com/400'],
          },
        ]
      };
      const response = { data: mockResponse.data };
      
      // console.log('Response status:', response.status);
      console.log('Get Product By Store Response data (MOCK):', response);
      
      // The response is an array of products
      // let jsonData = response.data;
      // if (typeof jsonData === 'string') {
      //   console.log('Product.removeFromCart: Response is string, checking for incomplete JSON');
      //   // Check if the string ends with a closing bracket
      //   if (!jsonData.trim().endsWith(']')) {
      //       console.log('Product.removeFromCart: JSON appears to be incomplete, attempting to fix');
      //       // Try to fix incomplete JSON by adding closing brackets
      //       jsonData += ']';
      //   }
      //   jsonData = JSON.parse(jsonData);
      // }
      // const products = Array.isArray(jsonData) ? jsonData : [jsonData];
      console.log("Get Product By Store Response data:", response.data);
      return {
        success: true,
        data: response.data,
        message: 'Products retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get products by store error:', error.message);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to get products. Status: ${error.response.status}`,
          data: [] as any[],
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: [] as any[],
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: [] as any[],
        };
      }
    }
  },

  // Get latest products by category
  getLatestProductsByCategory: async (
    categoryIds: number[],
    offset: number = 1,
    limit: number = 13,
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 999999.0,
    search: string = '',
    sellerId?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // Validate categoryId
      if (categoryIds === undefined || categoryIds === null) {
        console.error('Category ID is undefined or null');
        return {
          success: false,
          message: 'Category ID is required',
          data: null,
        };
      }
      
      // Construct the API URL with all query parameters
      const params = new URLSearchParams({
        category_id: JSON.stringify(categoryIds),
        offset: offset.toString(),
        limit: limit.toString(),
        type,
        filter,
        rating_count: ratingCount,
        min_price: minPrice.toString(),
        max_price: maxPrice.toString(),
        search,
        ...(sellerId && { store_id: sellerId }) // Add sellerId if provided
      });
      
      const url = `${API_BASE_URL}/items/latest?${params.toString()}`;
      
      console.log('Sending get latest products by category request to:', url);
      
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
          products: [],
          categories: [],
        }
      };
      const response = { data: mockResponse.data };
      
      // console.log('Response status:', response.status);
      
      // Check if response data exists and is not empty
      if (!response.data) {
        return {
          success: true,
          data: { products: [], categories: [] },
          message: 'Latest products retrieved successfully from local database',
        };
      }
        
      console.log('Product Detail Latest Response data (MOCK):', response.data);
      
      // Ensure we have the proper structure
      let parsedData: any = response.data;
      if (parsedData && typeof parsedData === 'object' && !parsedData.products) {
        // If we have a flat structure, wrap it properly
        parsedData = {
          products: Array.isArray(parsedData) ? parsedData : [],
          categories: []
        };
      }
      
      return {
        success: true,
        data: parsedData,
        message: 'Latest products retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get latest products by category error:', error);
      
      // Don't fallback to local database
      return {
        success: false,
        message: `Failed to get latest products: ${error.message || 'Unknown error occurred'}`,
        data: { products: [], categories: [] },
      };
    }
  },

  // Get popular products
  getPopularProducts: async (
    categoryIds: number[],
    offset: number = 1,
    limit: number = 10,
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 9999999999.0,
    search: string = '',
    sellerId?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      console.log('getPopularProducts: Using token:', token ? 'Token exists' : 'No token');
      
      // Validate categoryIds
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        // console.warn('No category IDs provided for popular products');
        // Fallback to local database with all products
        const result = await LocalDB.getPopularProducts(
          categoryIds, offset, limit, type, filter, ratingCount, minPrice, maxPrice, search, sellerId
        );
        return {
          success: true,
          data: { products: result.data, categories: [] },
          message: 'Popular products retrieved successfully from local database',
        };
      }
      
      // Filter out invalid category IDs
      const validCategoryIds = categoryIds.filter(id => id !== undefined && id !== null);
      if (validCategoryIds.length === 0) {
        console.warn('No valid category IDs provided for popular products');
        // Fallback to local database
        const result = await LocalDB.getPopularProducts(
          categoryIds, offset, limit, type, filter, ratingCount, minPrice, maxPrice, search, sellerId
        );
        return {
          success: true,
          data: { products: result.data, categories: [] },
          message: 'Popular products retrieved successfully from local database',
        };
      }
      
      // Construct the API URL with all query parameters
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
        type,
        filter,
        rating_count: ratingCount,
        min_price: minPrice.toString(),
        max_price: maxPrice.toString(),
        search,
        category_id: JSON.stringify(validCategoryIds),
        ...(sellerId && { store_id: sellerId }), // Add sellerId if provided
      });
      
      // Add category_ids as JSON string
      console.log("validCategoryIds of Populer:", validCategoryIds, filter);
      
      const url = `${API_BASE_URL}/items/popular?${params.toString()}`;
      
      console.log('Sending get popular products request to:', url);
      
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
          products: [],
          categories: [],
        }
      };
      const response = { data: mockResponse.data };
      
      console.log('Popular Response status (MOCK):', 200);
      console.log('Popular Response data (MOCK):', response.data);
      
      // Check if response data exists and is not empty
      if (!response.data) {
        console.log('No response data received, falling back to local database');
        // Fallback to local database
        const result = await LocalDB.getPopularProducts(
          validCategoryIds, offset, limit, type, filter, ratingCount, minPrice, maxPrice, search, sellerId
        );
        return {
          success: true,
          data: { products: result.data, categories: [] },
          message: 'Popular products retrieved successfully from local database',
        };
      }
      
      // Ensure we have the proper structure
      let parsedData: any = response.data;
      if (parsedData && typeof parsedData === 'object' && !parsedData.products) {
        // If we have a flat structure, wrap it properly
        parsedData = {
          products: Array.isArray(parsedData) ? parsedData : [],
          categories: []
        };
      }
      
      console.log("GET POPULER DATA FROM API (MOCK):", parsedData);
      
      return {
        success: true,
        data: parsedData,
        message: 'Popular products retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get popular products error, falling back to local database:', error);
      
      // Fallback to local database when API fails
      try {
        const result = await LocalDB.getPopularProducts(
          categoryIds, offset, limit, type, filter, ratingCount, minPrice, maxPrice, search, sellerId
        );
        return {
          success: true,
          data: { products: result.data, categories: [] },
          message: 'Popular products retrieved successfully from local database',
        };
      } catch (localError) {
        console.error('Local database error:', localError);
        return {
          success: false,
          message: `Failed to get popular products: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },

  // Get most reviewed products
  getMostReviewedProducts: async (
    categoryIds: number[],
    offset: number = 1,
    limit: number = 25,
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 9999999999.0,
    search: string = '',
    sellerId?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      // console.log('getMostReviewedProducts: Using token:', token ? 'Token exists' : 'No token');
      
      // Validate categoryIds
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        console.warn('No category IDs provided for most reviewed products');
        // Fallback to local database with all products
        const result = await LocalDB.getMostReviewedProducts(
          categoryIds, offset, limit, type, filter, ratingCount, minPrice, maxPrice, search, sellerId
        );
        return {
          success: true,
          data: { products: result.data, categories: [] },
          message: 'Most reviewed products retrieved successfully from local database',
        };
      }
      
      // Filter out invalid category IDs
      const validCategoryIds = categoryIds.filter(id => id !== undefined && id !== null);
      if (validCategoryIds.length === 0) {
        console.warn('No valid category IDs provided for most reviewed products');
        // Fallback to local database
        const result = await LocalDB.getMostReviewedProducts(
          categoryIds, offset, limit, type, filter, ratingCount, minPrice, maxPrice, search, sellerId
        );
        return {
          success: true,
          data: { products: result.data, categories: [] },
          message: 'Most reviewed products retrieved successfully from local database',
        };
      }
      
      // Construct the API URL with all query parameters
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
        type,
        filter,
        rating_count: ratingCount,
        min_price: minPrice.toString(),
        max_price: maxPrice.toString(),
        search,
        ...(sellerId && { seller_id: sellerId }) // Add sellerId if provided
      });
      
      // Add category_ids as JSON string
      params.append('category_ids', JSON.stringify(validCategoryIds));
      
      const url = `${API_BASE_URL}/items/most-reviewed?${params.toString()}`;
      
      console.log('Sending get most reviewed products request to:', url);
      
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
          products: [],
          categories: [],
        }
      };
      const response = { data: mockResponse.data };
      
      // console.log('Response status:', response.status);
      // console.log('Most reviewed Response data:', response.data);
      
      // Check if response data exists and is not empty
      if (!response.data) {
        // Fallback to local database
        const result = await LocalDB.getMostReviewedProducts(
          validCategoryIds, offset, limit, type, filter, ratingCount, minPrice, maxPrice, search, sellerId
        );
        return {
          success: true,
          data: { products: result.data, categories: [] },
          message: 'Most reviewed products retrieved successfully from local database',
        };
      }
      
      // Ensure we have the proper structure
      let parsedData: any = response.data;
      if (parsedData && typeof parsedData === 'object' && !parsedData.products) {
        // If we have a flat structure, wrap it properly
        parsedData = {
          products: Array.isArray(parsedData) ? parsedData : [],
          categories: []
        };
      }
      
      return {
        success: true,
        data: parsedData,
        message: 'Most reviewed products retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get most reviewed products error, falling back to local database:', error);
      
      // Fallback to local database when API fails
      try {
        const result = await LocalDB.getMostReviewedProducts(
          categoryIds, offset, limit, type, filter, ratingCount, minPrice, maxPrice, search, sellerId
        );
        return {
          success: true,
          data: { products: result.data, categories: [] },
          message: 'Most reviewed products retrieved successfully from local database',
        };
      } catch (localError) {
        console.error('Local database error:', localError);
        return {
          success: false,
          message: `Failed to get most reviewed products: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },

  // Delete a product
  deleteProduct: async (productId: string): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // console.log('Sending product delete request to:', `${API_BASE_URL}/vendor/item/delete`);
      // console.log('Product ID:', productId);
      
      // MOCK DATA: Commented out API call
      // const config: AxiosRequestConfig = {
      //   method: 'DELETE',
      //   url: `${API_BASE_URL}/vendor/item/delete`,
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   data: {
      //     id: productId
      //   },
      // };
      // 
      // const response = await axios(config);
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          message: 'Product deleted successfully',
        }
      };
      const response = { data: mockResponse.data };
      
      // console.log('Response status:', response.status);
      // console.log('Response data:', response.data);
      
      // After successful deletion, refresh the products list
      // This will be handled by the onSuccess callback in the mutation
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Product deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete product error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to delete product. Status: ${error.response.status}`,
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
};