import { useState, useCallback } from 'react';
import { productsApi, storesApi } from '../services/api';
import { Product, Store, HomeUseMutationOptions, NewInProduct, TrendingProduct, ForYouProduct, UseNewInProductsMutationResult, UseTrendingProductsMutationResult, UseForYouProductsMutationResult, UseStoresMutationResult } from '../types';
import mockProductsData from '../data/mockProducts.json';

// Toggle this to switch between mock and real API
const USE_MOCK_DATA = false;

// Hook for fetching "New In" products
export const useNewInProductsMutation = (options?: HomeUseMutationOptions): UseNewInProductsMutationResult => {
  const [data, setData] = useState<NewInProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    platform: string = '1688',
    country: string = 'en'
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockData = mockProductsData.newIn as any[];
        setData(mockData);
        setIsSuccess(true);
        options?.onSuccess?.(mockData);
        setIsLoading(false);
        return;
      }

      const response = await productsApi.getNewInProducts(platform, country);
      
      if (response.success && response.data) {
        const productsData = response.data.products || [];
        
        // Transform API response to NewInProduct format
        // API Response Structure: { _id, externalId, title, titleOriginal, image, price, originalPrice, sales, rating, ... }
        const transformedProducts: NewInProduct[] = productsData.map((item: any) => {
          const price = parseFloat(item.price || item.dropshipPrice || item.wholesalePrice || '0');
          const originalPrice = parseFloat(item.originalPrice || item.price || '0');
          const discount = originalPrice > price && originalPrice > 0 
            ? Math.round(((originalPrice - price) / originalPrice) * 100) 
            : 0;
          
          return {
            id: item.externalId || item._id || '',
            name: item.title || item.titleOriginal || '',
            image: item.image || '',
            video: '', // API doesn't provide video in this response
            price: price,
            originalPrice: originalPrice > price ? originalPrice : price,
            discount: discount,
            rating: parseFloat(item.rating || '0'),
            ratingCount: parseInt(item.sales?.toString() || '0', 10),
            sales: parseInt(item.sales?.toString() || '0', 10),
            offerId: item.externalId || item._id || '',
          };
        });
        
        if (Array.isArray(transformedProducts)) {
          setData(transformedProducts);
          setIsSuccess(true);
          options?.onSuccess?.(transformedProducts);
        } else {
          throw new Error('Invalid products data format');
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch new in products';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Hook for fetching "Trending" products
export const useTrendingProductsMutation = (options?: HomeUseMutationOptions): UseTrendingProductsMutationResult => {
  const [data, setData] = useState<TrendingProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    categoryIds: number[],
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 9999999999.0,
    search: string = '',
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockData = mockProductsData.trending as any[];
        setData(mockData);
        setIsSuccess(true);
        options?.onSuccess?.(mockData);
        setIsLoading(false);
        return;
      }

      // Safety check for categoryIds
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new Error('Category IDs are required');
      }

      const response = await productsApi.getPopularProducts(
        categoryIds,
        1,
        25,
        type,
        filter,
        ratingCount,
        minPrice,
        maxPrice,
        search
      );
      
      if (response.success && response.data) {
        // Check if data is a string and parse it
        let parsedData = response.data;
        if (typeof parsedData === 'string') {
          // Check if string is empty or whitespace only
          if (!parsedData.trim()) {
            setData([]);
            setIsLoading(false);
            return;
          }
          
          try {
            parsedData = JSON.parse(parsedData);
          } catch (parseError) {
            console.error('Error parsing trending products response data:', parseError);
            throw parseError;
          }
        }
        console.log("Product Data from Trending Products", parsedData);
        // Check if products array exists and is valid
        const products = parsedData.products || parsedData;
        if (Array.isArray(products)) {
          setData(products);
          setIsSuccess(true);
          options?.onSuccess?.(products);
        } else {
          throw new Error('Invalid products data format');
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch trending products';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      console.error('Trending products fetch error:', errorMessage);
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Hook for fetching "For You" products
export const useForYouProductsMutation = (options?: HomeUseMutationOptions): UseForYouProductsMutationResult => {
  const [data, setData] = useState<ForYouProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    categoryIds: number[], 
    offset: number = 1, 
    limit: number = 25,
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 9999999999.0,
    search: string = ''
  ) => {
    // Don't reset data on subsequent calls, only set loading state
    if (offset === 1) {
      // Reset data only for first page
      setData(null);
    }
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockData = mockProductsData.forYou as any[];
        setData(mockData);
        setIsSuccess(true);
        options?.onSuccess?.(mockData, offset);
        setIsLoading(false);
        return;
      }

      // Safety check for categoryIds
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new Error('Category IDs are required');
      }

      const response = await productsApi.getMostReviewedProducts(
        categoryIds,
        offset,
        limit,
        type,
        filter,
        ratingCount,
        minPrice,
        maxPrice,
        search
      );
      
      if (response.success && response.data) {
        // Check if data is a string and parse it
        let parsedData = response.data;
        if (typeof parsedData === 'string') {
          // Check if string is empty or whitespace only
          if (!parsedData.trim()) {
            if (offset === 1) {
              setData([]);
            }
            setIsLoading(false);
            return;
          }
          
          try {
            parsedData = JSON.parse(parsedData);
          } catch (parseError) {
            console.error('Error parsing for you products response data:', parseError);
            throw parseError;
          }
        }
        
        // Check if products array exists and is valid
        const products = parsedData.products || parsedData;
        if (Array.isArray(products)) {
          setData(products);
          setIsSuccess(true);
          // Pass the offset information to the onSuccess callback
          options?.onSuccess?.(products, offset);
        } else {
          throw new Error('Invalid products data format');
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch for you products';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Hook for fetching stores
export const useStoresMutation = (options?: HomeUseMutationOptions): UseStoresMutationResult => {
  const [data, setData] = useState<Store[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (storeType: string = 'all', offset: number = 1, limit: number = 25) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await storesApi.getAllStores(storeType, offset, limit);
      
      if (response.success && response.data) {
        // Check if data is a string and parse it
        let parsedData: any = response.data;
        if (typeof parsedData === 'string') {
          // Check if string is empty or whitespace only
          if (!parsedData.trim()) {
            setData([]);
            setIsLoading(false);
            return;
          }
          
          try {
            parsedData = JSON.parse(parsedData);
          } catch (parseError) {
            console.error('Error parsing stores response data:', parseError);
            throw parseError;
          }
        }
        
        // Check if stores array exists and is valid
        const stores = parsedData.stores || parsedData;
        if (Array.isArray(stores)) {
          // Format stores to match search page store array style
          const formattedStores = stores.map((store: any) => ({
            id: store.id?.toString() || '',
            name: store.name || 'Unknown Store',
            // Add avatar property to match SearchResultsScreen format
            avatar: store.logo_full_url ? { uri: store.logo_full_url } : require('../assets/images/avatar.png'),
            // Keep all other properties
            ...store
          }));
          
          setData(formattedStores);
          setIsSuccess(true);
          options?.onSuccess?.(formattedStores);
        } else {
          throw new Error('Invalid stores data format');
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch stores';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Hook for fetching product recommendations
export const useRecommendationsMutation = (options?: HomeUseMutationOptions) => {
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const mutate = useCallback(async (
    country: string = 'en',
    outMemberId: string = 'dferg0001',
    locale: 'en' | 'zh' | 'ko' = 'en',
    beginPage: number = 1,
    append: boolean = false
  ) => {
    // Don't reset data on subsequent calls if appending
    if (beginPage === 1 && !append) {
      setData(null);
      setCurrentPage(1);
      setHasMore(true);
    }
    
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.getRecommendations(country, outMemberId, beginPage, 20);
      
      if (response.success && response.data) {
        const recommendationsData = response.data.data?.recommendations?.result || [];
        const responsePage = response.data.data?.page || beginPage;
        const responsePageSize = response.data.data?.pageSize || 20;
        
        // Check if there are more pages - use hasMore from response if available, otherwise check if we got a full page
        const hasMoreFromResponse = response.data.data?.hasMore;
        const hasMorePages = hasMoreFromResponse !== undefined 
          ? hasMoreFromResponse 
          : recommendationsData.length >= responsePageSize;
        
        setHasMore(hasMorePages);
        setCurrentPage(responsePage);
        
        console.log('Recommendations pagination:', {
          beginPage: beginPage,
          page: responsePage,
          itemsReceived: recommendationsData.length,
          pageSize: responsePageSize,
          hasMore: hasMorePages,
          hasMoreFromResponse
        });
        
        // Convert recommendations to Product format
        // API Response Structure: Each item has imageUrl (singular), not imageUrls
        // API Response: { imageUrl: string, subject: string, subjectTrans: string, priceInfo: {...}, offerId: number, ... }
        const products: Product[] = recommendationsData.map((item: any) => {
          // Handle language logic: Chinese uses subject, English uses subjectTrans, Korean uses subjectTrans (or could translate)
          let productName = '';
          if (locale === 'zh') {
            productName = item.subject || item.subjectTrans || '';
          } else if (locale === 'ko') {
            // For Korean, we could translate subject, but for now use subjectTrans as fallback
            // In a real implementation, you might want to use a translation service
            productName = item.subjectTrans || item.subject || '';
          } else {
            // English (default)
            productName = item.subjectTrans || item.subject || '';
          }
          
          const price = parseFloat(item.priceInfo?.price || item.priceInfo?.consignPrice || '0');
          const originalPrice = parseFloat(item.priceInfo?.consignPrice || item.priceInfo?.price || '0');
          const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
          
          const product: Product = {
            id: item.offerId?.toString() || '',
            name: productName,
            description: item.subjectTrans || item.subject || '',
            price: price,
            originalPrice: originalPrice > price ? originalPrice : price,
            discount: discount,
            // API provides imageUrl (singular), convert to images array for Product type
            image: item.imageUrl ? item.imageUrl : '',
            category: { id: '', name: '', icon: '', image: '', subcategories: [] },
            subcategory: '',
            brand: '',
            seller: {
              id: '',
              name: '',
              avatar: '',
              rating: 0,
              reviewCount: 0,
              isVerified: false,
              followersCount: 0,
              description: '',
              location: '',
              joinedDate: new Date(),
            },
            rating: 0,
            reviewCount: 0,
            rating_count: 0,
            inStock: true,
            stockCount: 0,
            sizes: [],
            colors: [],
            tags: [],
            isNew: false,
            isFeatured: false,
            isOnSale: discount > 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            orderCount: item.monthSold || 0,
            // Store additional data for reference
            repurchaseRate: item.repurchaseRate || '0%',
            promotionURL: item.promotionURL || '',
            traceInfo: item.traceInfo || '',
          } as Product & {
            // Store offerId separately for "more to love" products
            offerId?: string | number;
            source?: string;
          };
          
          // Store offerId and source for use in product detail API and wishlist
          (product as any).offerId = item.offerId;
          (product as any).source = '1688'; // Default source for recommendations
          
          return product;
        });
        
        // Append or replace data based on page using functional update to avoid stale closure
        if (append) {
          setData((prevData) => {
            if (prevData) {
              return [...prevData, ...products];
            }
            return products;
          });
        } else {
          setData(products);
        }
        
        setIsSuccess(true);
        options?.onSuccess?.(products, beginPage);
      } else {
        const errorMessage = response.message || 'Failed to fetch recommendations';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Reset function to reset pagination state
  const reset = useCallback(() => {
    setData(null);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    currentPage,
    hasMore,
    reset,
  };
};

// Hook for fetching related product recommendations
export const useRelatedRecommendationsMutation = (options?: HomeUseMutationOptions) => {
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const mutate = useCallback(async (
    productId: string | number,
    pageNo: number = 1,
    pageSize: number = 20,
    language: 'en' | 'zh' | 'ko' = 'en'
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.getRelatedRecommendations(productId, pageNo, pageSize, language);
      
      if (response.success && response.data) {
        const recommendationsData = response.data.data?.recommendations || [];
        const pagination = response.data.data?.pagination || {};
        const responsePage = pagination.pageNo || pageNo;
        const responsePageSize = pagination.pageSize || pageSize;
        const totalRecords = pagination.totalRecords || 0;
        
        // Check if there are more pages
        const hasMorePages = (responsePage * responsePageSize) < totalRecords;
        setHasMore(hasMorePages);
        setCurrentPage(responsePage);
        
        console.log('Related Recommendations pagination:', {
          pageNo: pageNo,
          page: responsePage,
          itemsReceived: recommendationsData.length,
          pageSize: responsePageSize,
          totalRecords: totalRecords,
          hasMore: hasMorePages,
        });
        
        // Convert recommendations to Product format
        // API Response Structure: { imageUrl, subject, subjectTrans, priceInfo: { price }, offerId, ... }
        const products: Product[] = recommendationsData.map((item: any) => {
          // Handle language logic: Chinese uses subject, English/Korean use subjectTrans
          let productName = '';
          if (language === 'zh') {
            productName = item.subject || item.subjectTrans || '';
          } else {
            // English or Korean
            productName = item.subjectTrans || item.subject || '';
          }
          
          const price = parseFloat(item.priceInfo?.price || '0');
          
          return {
            id: item.offerId?.toString() || '',
            name: productName,
            description: item.subjectTrans || item.subject || '',
            price: price,
            originalPrice: price, // No original price in response, use same as price
            discount: 0,
            // API provides imageUrl (singular)
            image: item.imageUrl || '',
            category: { id: '', name: '', icon: '', image: '', subcategories: [] },
            subcategory: '',
            brand: '',
            seller: {
              id: '',
              name: '',
              avatar: '',
              rating: 0,
              reviewCount: 0,
              isVerified: false,
              followersCount: 0,
              description: '',
              location: '',
              joinedDate: new Date(),
            },
            rating: 0,
            reviewCount: 0,
            rating_count: 0,
            inStock: true,
            stockCount: 0,
            sizes: [],
            colors: [],
            tags: [],
            isNew: false,
            isFeatured: false,
            isOnSale: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            orderCount: 0,
            // Store additional data for reference
            topCategoryId: item.topCategoryId,
            secondCategoryId: item.secondCategoryId,
            thirdCategoryId: item.thirdCategoryId,
            sellerIdentities: item.sellerIdentities || [],
            offerIdentities: item.offerIdentities || [],
          } as Product;
        });
        
        setData(products);
        setIsSuccess(true);
        options?.onSuccess?.(products, pageNo);
      } else {
        const errorMessage = response.message || 'Failed to fetch related recommendations';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Reset function to reset state
  const reset = useCallback(() => {
    setData(null);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    currentPage,
    hasMore,
    reset,
  };
};

// Hook for searching products by keyword
export const useSearchProductsByKeywordMutation = (options?: HomeUseMutationOptions) => {
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    keyword: string,
    source: string = '1688',
    country: string = 'en',
    page: number = 1,
    pageSize: number = 20
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.searchProductsByKeyword(keyword, source, country, page, pageSize);
      
      if (response.success && response.data) {
        const productsData = response.data.data?.products || [];
        
        console.log('Search products by keyword success:', productsData.length, 'items');
        
        // Convert API response to Product format
        const products: Product[] = productsData.map((item: any) => {
          const price = parseFloat(item.price || item.dropshipPrice || item.wholesalePrice || '0');
          const originalPrice = parseFloat(item.originalPrice || price);
          const promotionPrice = item.promotionPrice ? parseFloat(item.promotionPrice) : null;
          const finalPrice = promotionPrice && promotionPrice < price ? promotionPrice : price;
          const discount = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;
          
          return {
            id: item.id?.toString() || item.externalId?.toString() || '',
            name: item.title || item.titleOriginal || '',
            description: item.titleOriginal || item.title || '',
            price: finalPrice,
            originalPrice: originalPrice > finalPrice ? originalPrice : finalPrice,
            discount: discount,
            image: item.image || '',
            category: { id: '', name: '', icon: '', image: '', subcategories: [] },
            subcategory: '',
            brand: '',
            seller: {
              id: '',
              name: '',
              avatar: '',
              rating: item.sellerData?.compositeServiceScore || 0,
              reviewCount: 0,
              isVerified: false,
              followersCount: 0,
              description: '',
              location: '',
              joinedDate: new Date(),
            },
            rating: item.rating || 0,
            reviewCount: 0,
            rating_count: 0,
            inStock: true,
            stockCount: 0,
            sizes: [],
            colors: [],
            tags: [],
            isNew: false,
            isFeatured: false,
            isOnSale: discount > 0,
            createdAt: item.createDate ? new Date(item.createDate) : new Date(),
            updatedAt: item.modifyDate ? new Date(item.modifyDate) : new Date(),
            orderCount: item.sales || 0,
            // Store additional data
            source: item.source,
            externalId: item.externalId,
            promotionURL: item.promotionURL,
            traceInfo: item.traceInfo,
            repurchaseRate: item.repurchaseRate || '0%',
            sellerIdentities: item.sellerIdentities || [],
            offerIdentities: item.offerIdentities || [],
            categoryId: item.categoryId,
            categoryId2: item.categoryId2,
            categoryId3: item.categoryId3,
          } as Product;
        });
        
        setData(products);
        setIsSuccess(true);
        options?.onSuccess?.(products, page);
      } else {
        const errorMessage = response.message || 'Failed to search products';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Reset function to reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    reset,
  };
};

// Hook for fetching product detail
export const useProductDetailMutation = (options?: HomeUseMutationOptions) => {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    productId: string | number,
    source: string = '1688',
    country: string = 'en'
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.getProductDetail(productId, source, country);
      
      if (response.success && response.data) {
        const productData = response.data.data?.product;
        
        if (productData) {
          // Transform API response to Product format
          const transformedProduct: Product = {
            id: productData.externalId?.toString() || productData._id?.toString() || '',
            name: productData.title || '',
            description: productData.description || '',
            price: parseFloat(productData.price?.toString() || '0'),
            originalPrice: parseFloat(productData.originalPrice?.toString() || productData.price?.toString() || '0'),
            discount: productData.originalPrice && productData.price 
              ? Math.round(((parseFloat(productData.originalPrice.toString()) - parseFloat(productData.price.toString())) / parseFloat(productData.originalPrice.toString())) * 100)
              : 0,
            image: productData.images?.[0] || '',
            category: {
              id: productData.metadata?.original1688Data?.categoryId?.toString() || '',
              name: productData.category || 'Uncategorized',
              icon: '',
              image: '',
              subcategories: [],
            },
            subcategory: '',
            brand: '',
            seller: {
              id: productData.metadata?.original1688Data?.sellerOpenId || '',
              name: productData.metadata?.original1688Data?.companyName || '',
              avatar: '',
              rating: parseFloat(productData.metadata?.original1688Data?.sellerDataInfo?.compositeServiceScore || '0'),
              reviewCount: productData.reviewCount || 0,
              isVerified: false,
              followersCount: 0,
              description: '',
              location: productData.metadata?.original1688Data?.productShippingInfo?.sendGoodsAddressText || '',
              joinedDate: productData.metadata?.original1688Data?.createDate ? new Date(productData.metadata.original1688Data.createDate) : new Date(),
            },
            rating: parseFloat(productData.metadata?.original1688Data?.tradeScore || '0'),
            reviewCount: productData.reviewCount || 0,
            rating_count: productData.reviewCount || 0,
            inStock: (productData.stock || 0) > 0,
            stockCount: productData.stock || 0,
            // Extract unique sizes from variants
            sizes: (() => {
              const sizeSet = new Set<string>();
              productData.variants?.forEach((v: any) => {
                // Parse variation name by splitting with "/"
                // Format: "Color:Black / Size:L"
                const parts = v.name?.split('/').map((p: string) => p.trim()) || [];
                const sizePart = parts.find((p: string) => p.startsWith('Size:'));
                if (sizePart) {
                  const size = sizePart.replace('Size:', '').trim();
                  if (size) sizeSet.add(size);
                } else {
                  // Fallback to regex if format is different
                  const sizeMatch = v.name?.match(/Size:(\w+)/);
                  if (sizeMatch && sizeMatch[1]) {
                    sizeSet.add(sizeMatch[1]);
                  }
                }
              });
              return Array.from(sizeSet);
            })(),
            // Extract unique colors from variants
            colors: (() => {
              const colorMap = new Map<string, { name: string; hex: string; image?: string }>();
              productData.variants?.forEach((v: any) => {
                // Parse variation name by splitting with "/"
                // Format: "Color:Black / Size:L"
                const parts = v.name?.split('/').map((p: string) => p.trim()) || [];
                const colorPart = parts.find((p: string) => p.startsWith('Color:'));
                if (colorPart) {
                  const colorName = colorPart.replace('Color:', '').trim();
                  if (colorName && !colorMap.has(colorName)) {
                    colorMap.set(colorName, {
                      name: colorName,
                      hex: '', // Color hex code (can be empty if not available)
                      image: v.image || '',
                    });
                  }
                } else {
                  // Fallback to regex if format is different
                  const colorMatch = v.name?.match(/Color:([^/]+)/);
                  if (colorMatch) {
                    const colorName = colorMatch[1].trim();
                    if (colorName && !colorMap.has(colorName)) {
                      colorMap.set(colorName, {
                        name: colorName,
                        hex: '', // Color hex code (can be empty if not available)
                        image: v.image || '',
                      });
                    }
                  }
                }
              });
              return Array.from(colorMap.values());
            })(),
            tags: productData.tags || [],
            isNew: false,
            isFeatured: false,
            isOnSale: productData.metadata?.original1688Data?.promotionModel?.hasPromotion || false,
            createdAt: productData.createdAt ? new Date(productData.createdAt) : new Date(),
            updatedAt: productData.updatedAt ? new Date(productData.updatedAt) : new Date(),
            orderCount: productData.soldCount || 0,
            variations: productData.variants?.map((variant: any) => ({
              name: variant.name || '',
              options: [{
                value: variant.name || '',
                price: parseFloat(variant.price?.toString() || '0'),
                stock: variant.stock || 0,
                image: variant.image || '',
                sku: variant.sku || variant._id || '',
              }],
            })) || [],
          } as Product & {
            // Additional fields that may be used but not in Product type
            specifications?: any;
            minOrderQuantity?: number;
            shippingWeight?: number;
            currency?: string;
            source?: string;
            externalId?: string;
            images?: string[];
          };
          
          // Add additional fields to the transformed product
          // Convert specifications from Map to plain object if needed
          let specifications = {};
          if (productData.specifications) {
            if (productData.specifications instanceof Map) {
              // Convert Map to plain object
              specifications = Object.fromEntries(productData.specifications);
            } else if (typeof productData.specifications === 'object') {
              specifications = productData.specifications;
            }
          }
          (transformedProduct as any).specifications = specifications;
          (transformedProduct as any).minOrderQuantity = productData.minOrderQuantity || 1;
          (transformedProduct as any).shippingWeight = productData.shippingWeight || 0;
          (transformedProduct as any).currency = productData.currency || 'CNY';
          (transformedProduct as any).source = productData.source || '1688';
          (transformedProduct as any).externalId = productData.externalId || '';
          (transformedProduct as any).images = productData.images || [];
          // Add soldOut from API metadata
          (transformedProduct as any).soldOut = productData.metadata?.original1688Data?.soldOut || '0';
          
          setData(transformedProduct);
          setIsSuccess(true);
          options?.onSuccess?.(transformedProduct);
        } else {
          const errorMessage = 'Product data not found in response';
          setError(errorMessage);
          setIsError(true);
          options?.onError?.(errorMessage);
        }
      } else {
        const errorMessage = response.message || 'Failed to get product detail';
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Reset function to reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    reset,
  };
};