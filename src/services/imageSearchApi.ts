import api from './api';
import mockProductsData from '../data/mockProducts.json';

export interface ImageSearchRequest {
  imageUri: string;
  platform?: string;
}

export interface ImageSearchResponse {
  products: any[];
  success: boolean;
}

export const imageSearchApi = {
  searchByImage: async (data: ImageSearchRequest): Promise<ImageSearchResponse> => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.post('/image-search', {
      //   image: data.imageUri, // or base64 if needed
      //   platform: data.platform,
      // });
      // return response.data;

      // Mock implementation - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get random products from mockProducts.json
      const allProducts = mockProductsData.products || [];
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, 10);
      
      return {
        products: selectedProducts,
        success: true,
      };
    } catch (error) {
      console.error('Image search API error:', error);
      throw error;
    }
  },
};
