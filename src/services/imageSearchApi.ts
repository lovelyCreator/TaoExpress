import * as FileSystem from 'expo-file-system/legacy';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

export interface ImageSearchRequest {
  imageUri: string;
  platform?: string;
  outMemberId?: string;
  beginPage?: number;
  pageSize?: number;
  country?: string;
  region?: string;
  filter?: string;
  sort?: string;
  priceStart?: string;
  priceEnd?: string;
  categoryId?: number;
  keyword?: string;
  auxiliaryText?: string;
  productCollectionId?: string;
  keywordTranslate?: boolean;
}

export interface ImageSearchResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    totalRecords: number;
    totalPage: number;
    pageSize: number;
    currentPage: number;
    data: any[];
    picRegionInfo?: {
      currentRegion: string;
      yoloCropRegion: string;
    };
  };
  timestamp: string;
}

// Helper function to convert image URI to base64
const convertImageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    // Read file as base64 using legacy API
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Determine MIME type from URI
    let mimeType = 'image/jpeg';
    if (imageUri.toLowerCase().includes('.png')) {
      mimeType = 'image/png';
    } else if (imageUri.toLowerCase().includes('.gif')) {
      mimeType = 'image/gif';
    } else if (imageUri.toLowerCase().includes('.webp')) {
      mimeType = 'image/webp';
    }
    
    // Return data URI format
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
};

export const imageSearchApi = {
  searchByImage: async (data: ImageSearchRequest): Promise<ImageSearchResponse> => {
    try {
      const token = await getStoredToken();
      
      // Convert image URI to base64
      const imageBase64 = await convertImageToBase64(data.imageUri);
      
      // Prepare request body - only send required fields
      const requestBody: any = {
        imageBase64: imageBase64,
        beginPage: data.beginPage || 1,
        pageSize: data.pageSize || 20,
        country: data.country || 'en',
      };
      
      // Only add price range if provided
      if (data.priceStart) {
        requestBody.priceStart = data.priceStart;
      }
      if (data.priceEnd) {
        requestBody.priceEnd = data.priceEnd;
      }
      
      const url = `${API_BASE_URL}/products/image-search`;
      
      console.log('Sending image search request to:', url);
      
      const response = await axios.post(url, requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Image search response:', response.data);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to search by image');
      }
    } catch (error: any) {
      console.error('Image search API error:', error);
      
      if (error.response) {
        throw new Error(error.response.data?.message || `Failed to search by image. Status: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred. Please try again.');
      }
    }
  },
};
