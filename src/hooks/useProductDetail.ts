import { useState, useCallback } from 'react';
import { productsApi } from '../services/api';
import { Product, UseProductDetailOptions, UseProductDetailResult } from '../types';

export const useProductDetail = (options?: UseProductDetailOptions): UseProductDetailResult => {
  const [data, setData] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchProductDetail = useCallback(async (productId: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      const response = await productsApi.getProductDetails(productId);
      
      if (response.success && response.data) {
        // Transform API response to Product type
        const apiProduct = response.data;
        
        console.log("After receiveing ApiProduct Data from api: ", apiProduct);
        // Parse category_ids if it's a string
        let categoryIds = [];
        if (typeof apiProduct.category_ids === 'string') {
          try {
            categoryIds = JSON.parse(apiProduct.category_ids);
          } catch (e) {
            console.error('Error parsing category_ids:', e);
          }
        } else if (Array.isArray(apiProduct.category_ids)) {
          categoryIds = apiProduct.category_ids;
        }
        const variations = JSON.parse(apiProduct.variations || '[]');
        console.log("After receiveing Variations Data from api: ", response.data.price);
        
        // Create Product object
        const productData: Product = {
          id: apiProduct.id?.toString() || '',
          name: apiProduct.name || 'Unknown Product',
          description: apiProduct.description || '',
          price: variations[0].options[0].price || 0,
          originalPrice: apiProduct.originalPrice || apiProduct.price,
          discount: apiProduct.discount || 0,
          images: apiProduct.images || [],
          videos: apiProduct.video || [],
          category: {
            id: apiProduct.category_id?.toString() || '',
            name: apiProduct.category_name || 'Unknown Category',
            icon: '',
            image: '',
            subcategories: [],
            productCount: 0
          },
          subcategory: '',
          brand: apiProduct.brand || 'Unknown Brand',
          seller: {
            id: apiProduct.store_details?.id?.toString() || '1',
            name: apiProduct.store_details?.name || 'User',
            avatar: apiProduct.store_details?.logo || '',
            rating: apiProduct.store_details?.avg_rating || 0,
            reviewCount: apiProduct.store_details?.rating_count || 0,
            orderCount: apiProduct.store_details?.order_count || 0,
            isVerified: true,
            followersCount: 0,
            description: '',
            location: '',
            joinedDate: new Date()
          },
          rating: apiProduct.avg_rating || 0,
          reviewCount: apiProduct.rating_count || 0,
          inStock: apiProduct.stock > 0,
          stockCount: apiProduct.stock || 0,
          sizes: [],
          colors: [],
          tags: [],
          isNew: false,
          isFeatured: apiProduct.featured === 1,
          isOnSale: (apiProduct.discount || 0) > 0,
          createdAt: new Date(apiProduct.created_at),
          updatedAt: new Date(apiProduct.updated_at),
          orderCount: apiProduct.order_count || 0,
          variations: variations,
          rating_count: 0
        };
        console.log("After receiveing Product Data from api: ", productData.variations);
        setData(productData);
        setIsSuccess(true);
        options?.onSuccess?.(productData);
      } else {
        const errorMessage = response.message || 'Failed to fetch product details';
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
    data,
    isLoading,
    error,
    fetchProductDetail,
    isSuccess,
    isError,
  };
};