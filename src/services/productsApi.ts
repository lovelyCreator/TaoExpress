import { 
  Product, 
  SearchFilters, 
  ApiResponse, 
  PaginatedResponse,
  VariationData,
  ProductCreateData,
  ProductUpdateData,
  CategoriesTreeResponse
} from '../types';
import { getStoredToken } from './authApi';
import axios, { AxiosRequestConfig } from 'axios';
import { uploadToCloudinary, uploadVideoToCloudinary } from './cloudinary';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Products API
export const productsApi = {

  // Image search for Taobao
  imageSearchTaobao: async (
    language: string,
    imageBase64: string
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      const url = `${API_BASE_URL}/products/taobao-global/image-search`;

      const response = await axios.post(url, {
        language,
        image_base64: imageBase64,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const taobaoData = response.data;

      // Based on backend spec: code === '0' indicates success
      if (!taobaoData || taobaoData.code !== '0' || !taobaoData.data || !Array.isArray(taobaoData.data)) {
        return {
          success: false,
          message: 'No Taobao image search data received',
          data: null,
        };
      }

      const items = taobaoData.data;

      // Normalize Taobao response to match a simple product structure
      const normalizedProducts = items.map((item: any) => {
        const price = parseFloat(item.price || '0');

        return {
          id: item.item_id?.toString() || '',
          title: item.multi_language_info?.title || item.title || '',
          titleOriginal: item.title || '',
          image: item.main_image_url || '',
          price: price,
          originalPrice: price,
          wholesalePrice: price,
          dropshipPrice: price,
          sales: 0,
          rating: 0,
          repurchaseRate: '',
          createDate: new Date().toISOString(),
          modifyDate: new Date().toISOString(),
        };
      });

      return {
        success: true,
        data: { products: normalizedProducts },
        message: 'Taobao image search products retrieved successfully',
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.biz_error_msg ||
        error.response?.data?.message ||
        error.message ||
        'Failed to perform Taobao image search';

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  // Search products by keyword
  searchProductsByKeyword: async (
    keyword: string,
    source: string = '1688',
    country: string = 'en',
    page: number = 1,
    pageSize: number = 20,
    sort?: string,
    priceStart?: number,
    priceEnd?: number,
    filter?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();

      // Special handling for Taobao search - use dedicated Taobao Global endpoint
      if (source === 'taobao') {
        const language =
          country === 'ko' ? 'ko' :
          country === 'zh' ? 'zh' :
          'en';

        const taobaoParams = new URLSearchParams({
          keyword,
          page_no: page.toString(),
          page_size: pageSize.toString(),
          language,
        });

        const taobaoUrl = `${API_BASE_URL}/products/taobao-global/search?${taobaoParams.toString()}`;

        console.log('🔍 [Taobao Search API] Request:', {
          url: taobaoUrl,
          keyword,
          page,
          pageSize,
          language,
          source,
          country,
        });

        const taobaoResponse = await axios.get(taobaoUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const taobaoData = taobaoResponse.data;

        console.log('🔍 [Taobao Search API] Response:', {
          status: taobaoResponse.status,
          statusText: taobaoResponse.statusText,
          dataStructure: {
            hasData: !!taobaoData?.data,
            isArray: Array.isArray(taobaoData?.data),
            hasNestedData: !!taobaoData?.data?.data,
            isNestedArray: Array.isArray(taobaoData?.data?.data),
            hasStatus: !!taobaoData?.status,
            status: taobaoData?.status,
          },
          firstItem: taobaoData?.data?.[0] || taobaoData?.data?.data?.[0] || null,
          itemCount: taobaoData?.data?.length || taobaoData?.data?.data?.length || 0,
        });

        // Handle different possible response structures
        // Structure 1: { status: 'success', data: { data: [...] } }
        // Structure 2: { data: [...] } (direct array)
        // Structure 3: { data: { data: [...] } } (nested)
        let items: any[] = [];
        
        if (taobaoData?.status === 'success' && taobaoData?.data?.data && Array.isArray(taobaoData.data.data)) {
          items = taobaoData.data.data;
        } else if (Array.isArray(taobaoData?.data)) {
          items = taobaoData.data;
        } else if (Array.isArray(taobaoData)) {
          items = taobaoData;
        } else if (taobaoData?.data?.data && Array.isArray(taobaoData.data.data)) {
          items = taobaoData.data.data;
        } else {
          console.error('Taobao search API - Unexpected response structure:', taobaoData);
          return {
            success: false,
            message: 'No Taobao search data received or invalid response structure',
            data: null,
          };
        }

        // Normalize Taobao response to match existing search structure:
        // data.data.products + data.data.pagination so Search screens keep working.
        const normalizedProducts = items.map((item: any) => {
          const price = parseFloat(item.price || '0');

          return {
            id: item.item_id?.toString() || '',
            // Use localized title if available, otherwise fallback to original title
            title: item.multi_language_info?.title || item.title || '',
            titleOriginal: item.title || '',
            image: item.main_image_url || '',
            price: price,
            originalPrice: price,
            wholesalePrice: price,
            dropshipPrice: price,
            sales: 0,
            rating: 0,
            repurchaseRate: '',
            createDate: new Date().toISOString(),
            modifyDate: new Date().toISOString(),
          };
        });

        // Extract pagination info from response (handle different structures)
        const pageNo = taobaoData?.data?.page_no || taobaoData?.page_no || page;
        const pageSizeResp = taobaoData?.data?.page_size || taobaoData?.page_size || pageSize;

        const normalizedData = {
          data: {
            products: normalizedProducts,
            pagination: {
              page: pageNo,
              pageSize: pageSizeResp,
              totalPage: null, // Taobao API doesn't provide total pages
            },
          },
        };

        return {
          success: true,
          data: normalizedData,
          message: 'Taobao products retrieved successfully',
        };
      }
      
      // Default 1688 (and other platforms) search
      const params = new URLSearchParams({
        keyword,
        source,
        country,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      // Add optional parameters
      if (sort) params.append('sort', sort);
      if (priceStart !== undefined) params.append('priceStart', priceStart.toString());
      if (priceEnd !== undefined) params.append('priceEnd', priceEnd.toString());
      if (filter) params.append('filter', filter);
      
      const url = `${API_BASE_URL}/products/search?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response data exists
      if (!response.data || !response.data.data || !response.data.data.products) {
        return {
          success: false,
          message: 'No products data received',
          data: null,
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Products retrieved successfully',
      };
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || `Failed to search products. Status: ${error.response.status}`,
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

  // Get new in products
  getNewInProducts: async (
    platform: string = '1688',
    country: string = 'en'
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      const url = `${API_BASE_URL}/products/newin?platform=${platform}&country=${country}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.data || response.data.status !== 'success' || !response.data.data) {
        return {
          success: false,
          message: 'No products data received',
          data: null,
        };
      }
      
      return {
        success: true,
        data: response.data.data,
        message: 'New in products retrieved successfully',
      };
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || `Failed to get new in products. Status: ${error.response.status}`,
          data: null,
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null,
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },

  // Get product recommendations
  getRecommendations: async (
    country: string = 'en',
    outMemberId: string = 'dferg0001',
    beginPage: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      
      // Build query parameters (outMemberId is required)
      const params = new URLSearchParams({
        country,
        outMemberId: outMemberId || 'dferg0001', // Default to 'dferg0001' if not provided
        beginPage: beginPage.toString(),
        pageSize: pageSize.toString(),
      });
      
      const url = `${API_BASE_URL}/products/recommendations?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.data || response.data.status !== 'success' || !response.data.data) {
        return {
          success: false,
          message: 'No recommendations data received',
          data: null,
        };
      }
      
      return {
        success: true,
        data: response.data.data,
        message: 'Recommendations retrieved successfully',
      };
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || `Failed to get recommendations. Status: ${error.response.status}`,
          data: null,
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null,
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },

  // Get category tree
  getCategoryTree: async (
    platform: string = '1688'
  ): Promise<ApiResponse<CategoriesTreeResponse | null>> => {
    try {
      const token = await getStoredToken();
      const url = `${API_BASE_URL}/categories/tree?platform=${platform}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: 'Category tree retrieved successfully',
        };
      }
      
      return {
        success: false,
        message: 'No category tree data received',
        data: null,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get category tree';
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  // Get default categories
  getDefaultCategories: async (
    platform: string = '1688',
    skipCache: boolean = true
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();
      const url = `${API_BASE_URL}/categories/default?platform=${platform}&skipCache=${skipCache}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: 'Default categories retrieved successfully',
        };
      }
      
      return {
        success: false,
        message: 'No default categories data received',
        data: null,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get default categories';
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  // Get product detail
  getProductDetail: async (
    productId: string,
    source: string = '1688',
    country: string = 'en'
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();

      // Special handling for Taobao product detail - use dedicated Taobao Global endpoint
      if (source === 'taobao') {
        const language =
          country === 'ko' ? 'ko' :
          country === 'zh' ? 'zh' :
          'en';

        const taobaoUrl = `${API_BASE_URL}/products/taobao-global/${productId}/detail?item_resource=Taobao&language=${language}`;

        console.log('📦 [Taobao Product Detail API] Request:', {
          url: taobaoUrl,
          productId,
          productIdType: typeof productId,
          source,
          country,
          language,
        });

        const taobaoResponse = await axios.get(taobaoUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          console.error('📦 [Taobao Product Detail API] Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            productId,
          });
          throw error;
        });

        const taobaoData = taobaoResponse.data;

        console.log('📦 [Taobao Product Detail API] Response:', {
          status: taobaoResponse.status,
          statusText: taobaoResponse.statusText,
          hasData: !!taobaoData,
          biz_error_code: taobaoData?.biz_error_code,
          biz_error_msg: taobaoData?.biz_error_msg,
          hasDataField: !!taobaoData?.data,
          dataKeys: taobaoData?.data ? Object.keys(taobaoData.data) : [],
        });

        if (!taobaoData || taobaoData.biz_error_code !== null || !taobaoData.data) {
          console.error('📦 [Taobao Product Detail API] Validation failed:', {
            hasData: !!taobaoData,
            biz_error_code: taobaoData?.biz_error_code,
            biz_error_msg: taobaoData?.biz_error_msg,
            hasDataField: !!taobaoData?.data,
          });
          return {
            success: false,
            message: taobaoData?.biz_error_msg || 'Failed to get Taobao product detail',
            data: null,
          };
        }

        // Return raw Taobao detail data; normalization is handled in ProductDetailScreen
        return {
          success: true,
          data: taobaoData.data,
          message: 'Taobao product detail retrieved successfully',
        };
      }

      // Default 1688 (and other platforms) product detail
      const params = new URLSearchParams({
        productId,
        source,
        country,
      });
      
      const url = `${API_BASE_URL}/products/detail?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response data exists
      if (!response.data || !response.data.data || !response.data.data.product) {
        return {
          success: false,
          message: 'No product detail data received',
          data: null,
        };
      }
      
      return {
        success: true,
        data: response.data.data,
        message: 'Product detail retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get product detail error:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || `Failed to get product detail. Status: ${error.response.status}`,
          data: null,
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null,
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },

  // Get related recommendations
  getRelatedRecommendations: async (
    productId: string,
    pageNo: number = 1,
    pageSize: number = 10,
    language: string = 'en',
    source: string = '1688'
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getStoredToken();

      let url: string;
      let response;

      if (source === 'taobao') {
        // Taobao related recommend API:
        // GET /products/taobao-global/recommend-similar?itemId=xxx&language=ko
        const params = new URLSearchParams({
          itemId: productId,
          language,
        });
        url = `${API_BASE_URL}/products/taobao-global/recommend-similar?${params.toString()}`;

        response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const taobaoData = response.data;

        if (!Array.isArray(taobaoData)) {
          return {
            success: false,
            message: 'No related recommendations data received',
            data: null,
          };
        }

        // Normalize Taobao response to a common shape
        return {
          success: true,
          data: {
            recommendations: taobaoData,
            pagination: {
              pageNo: 1,
              pageSize: taobaoData.length,
              totalRecords: taobaoData.length,
            },
          },
          message: 'Related recommendations retrieved successfully',
        };
      }

      // Default 1688 / other platforms
      const params = new URLSearchParams({
        pageNo: pageNo.toString(),
        pageSize: pageSize.toString(),
        language,
      });

      url = `${API_BASE_URL}/products/${productId}/related-recommendations?${params.toString()}`;

      response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response data exists
      if (!response.data || !response.data.data || !response.data.data.recommendations) {
        return {
          success: false,
          message: 'No related recommendations data received',
          data: null,
        };
      }
      
      return {
        success: true,
        data: response.data.data,
        message: 'Related recommendations retrieved successfully',
      };
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || `Failed to get related recommendations. Status: ${error.response.status}`,
          data: null,
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
          data: null,
        };
      } else {
        return {
          success: false,
          message: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
          data: null,
        };
      }
    }
  },
};