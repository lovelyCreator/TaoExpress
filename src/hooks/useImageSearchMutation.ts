import { useState, useCallback } from 'react';
import { imageSearchApi, ImageSearchRequest, ImageSearchResponse } from '../services/imageSearchApi';
import { Product } from '../types';

interface UseImageSearchMutationOptions {
  onSuccess?: (data: ImageSearchResponse, products: Product[]) => void;
  onError?: (error: Error) => void;
}

export const useImageSearchMutation = (options?: UseImageSearchMutationOptions) => {
  const [data, setData] = useState<ImageSearchResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const mutate = useCallback(async (
    request: ImageSearchRequest,
    page: number = 1,
    append: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await imageSearchApi.searchByImage({
        ...request,
        beginPage: page,
        pageSize: request.pageSize || 20,
      });
      
      setData(response);
      setCurrentPage(page);
      
      // Check if there are more pages
      const totalPages = response.data?.totalPage || 0;
      setHasMore(page < totalPages);
      
      // Transform API response to Product type
      const products: Product[] = (response.data?.data || []).map((item: any) => {
        const price = parseFloat(item.priceInfo?.price || item.priceInfo?.promotionPrice || item.priceInfo?.consignPrice || '0');
        const originalPrice = parseFloat(item.priceInfo?.consignPrice || item.priceInfo?.price || '0');
        const promotionPrice = item.priceInfo?.promotionPrice ? parseFloat(item.priceInfo.promotionPrice) : null;
        const finalPrice = promotionPrice && promotionPrice < price ? promotionPrice : price;
        const discount = originalPrice > finalPrice && originalPrice > 0 
          ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) 
          : 0;
        
        // Handle locale for product name
        const locale = request.country || 'en';
        let productName = '';
        if (locale === 'zh') {
          productName = item.subject || item.subjectTrans || '';
        } else {
          productName = item.subjectTrans || item.subject || '';
        }
        
        return {
          id: item.offerId?.toString() || '',
          name: productName,
          description: item.subjectTrans || item.subject || '',
          price: finalPrice,
          originalPrice: originalPrice > finalPrice ? originalPrice : finalPrice,
          discount: discount,
          image: item.imageUrl || '',
          category: {
            id: item.topCategoryId?.toString() || '',
            name: '',
            icon: '',
            image: '',
            subcategories: [],
          },
          subcategory: '',
          brand: '',
          seller: {
            id: '',
            name: '',
            avatar: '',
            rating: parseFloat(item.sellerDataInfo?.compositeServiceScore || '0'),
            reviewCount: 0,
            isVerified: false,
            followersCount: 0,
            description: '',
            location: '',
            joinedDate: new Date(),
          },
          rating: parseFloat(item.tradeScore || '0'),
          reviewCount: parseInt(item.monthSold?.toString() || '0', 10),
          rating_count: parseInt(item.monthSold?.toString() || '0', 10),
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
          orderCount: parseInt(item.monthSold?.toString() || '0', 10),
          repurchaseRate: item.repurchaseRate || '0%',
          offerId: item.offerId?.toString() || '',
        } as Product;
      });
      
      if (options?.onSuccess) {
        options.onSuccess(response, products);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (options?.onError) {
        options.onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  return {
    mutate,
    data,
    error,
    isLoading,
    currentPage,
    hasMore,
    reset,
  };
};
