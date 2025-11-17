import { useState, useCallback } from 'react';
import { productsApi } from '../services/api';
import { Product, PaginatedResponse, UseSearchMutationOptions, UseSearchProductsMutationResult, UseSortProductsMutationResult } from '../types';

// Hook for searching products
export const useSearchProductsMutation = (options?: UseSearchMutationOptions): UseSearchProductsMutationResult => {
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (query: string, page: number = 1, limit: number = 20, filters?: any, sellerId?: string) => {
    // setIsLoading(true); // Removed loading state
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Call the actual API endpoint instead of local database
      const response: PaginatedResponse<Product> = await productsApi.searchProducts(query, page, limit, filters, sellerId);
      
      if (response.data) {
        let products = response.data;
        
        // Handle case where data might be a string (stringified JSON)
        if (typeof products === 'string') {
          const productsString = products as string;
          // Check if string is empty or whitespace only
          if (!productsString || !productsString.trim()) {
            products = [];
          } else {
            try {
              // Parse the stringified JSON
              const parsedData = JSON.parse(productsString);
              // Extract products array if it exists in the parsed data
              if (parsedData && typeof parsedData === 'object' && parsedData.products) {
                products = parsedData.products;
              } else {
                products = parsedData;
              }
            } catch (parseError) {
              products = [];
            }
          }
        }
        
        // Handle case where products might be in a pagination structure with products property
        if (products && typeof products === 'object' && !Array.isArray(products) && (products as { products?: any }).products) {
          products = (products as { products: Product[] }).products;
        }
        
        // Ensure products is an array
        if (!Array.isArray(products)) {
          products = [];
        }
        
        setData(products);
        setIsSuccess(true);
        options?.onSuccess?.(products);
      } else {
        const errorMessage = 'Failed to search products';
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
      // setIsLoading(false); // Removed loading state
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    // isLoading, // Removed loading state
    isSuccess,
    isError,
  };
};

// Hook for sorting products
export const useSortProductsMutation = (options?: UseSearchMutationOptions): UseSortProductsMutationResult => {
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState<boolean>(false); // Removed loading state
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mutate = useCallback(async (
    sortBy: string, 
    categoryIds?: number[], 
    page: number = 1, 
    limit: number = 20,
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 9999999999.0,
    search: string = '',
    sellerId?: string
  ) => {
    // setIsLoading(true); // Removed loading state
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      let response: any;
      
      // Map sort options to actual API calls
      switch (sortBy) {
        case 'Popularity':
          // Use popular products API directly
          response = await productsApi.getPopularProducts(
            categoryIds && categoryIds.length > 0 ? categoryIds : [4], 
            page, 
            limit,
            type,
            filter,
            ratingCount,
            minPrice,
            maxPrice,
            search,
            sellerId
          );
          break;
          
        case 'Top':
          // Use most reviewed products API directly
          response = await productsApi.getMostReviewedProducts(
            categoryIds && categoryIds.length > 0 ? categoryIds : [4], 
            page, 
            limit,
            type,
            filter,
            ratingCount,
            minPrice,
            maxPrice,
            search,
            sellerId
          );
          break;
          
        case 'Newest':
          // Use latest products API directly
          // Validate category ID before calling the API
          const categoryIdForLatest = (categoryIds && categoryIds.length > 0) ? categoryIds[0] : 4;
          response = await productsApi.getLatestProductsByCategory(
            categoryIds ? categoryIds : [], // Pass as array to match API expectation
            page, 
            limit,
            type,
            filter,
            ratingCount,
            minPrice,
            maxPrice,
            search,
            sellerId
          );
          break;
          
        case 'Price High to Low':
          // For price sorting, we'll use the popular products API with filter parameter set to ["hight"]
          response = await productsApi.getPopularProducts(
            categoryIds && categoryIds.length > 0 ? categoryIds : [1], 
            page, 
            limit,
            type,
            JSON.stringify(["high"]), // Set filter to ["hight"]
            ratingCount,
            minPrice,
            maxPrice,
            search,
            sellerId
          );
          break;
          
        case 'Price Low to High':
          // For price sorting, we'll use the popular products API with filter parameter set to ["low"]
          response = await productsApi.getPopularProducts(
            categoryIds && categoryIds.length > 0 ? categoryIds : [1], 
            page, 
            limit,
            type,
            JSON.stringify(["low"]), // Set filter to ["low"]
            ratingCount,
            minPrice,
            maxPrice,
            search,
            sellerId
          );
          break;
          
        case 'Review Count':
          // For review count sorting, we'll use the popular products API with ratingCount parameter
          response = await productsApi.getPopularProducts(
            categoryIds && categoryIds.length > 0 ? categoryIds : [1], 
            page, 
            limit,
            type,
            filter, // Keep existing filter
            'review_count', // Set ratingCount to 'review_count'
            minPrice,
            maxPrice,
            search,
            sellerId
          );
          break;
          
        case 'Discount':
          // For discount sorting, we'll use the searchProducts API with onSale parameter
          response = await productsApi.searchProducts(
            search, // query
            page, 
            limit, 
            { onSale: true, sortBy: 'price_high' }, // Sort by price high to low for discount items
            sellerId
          );
          break;
          
        default:
          // Default to popular products
          response = await productsApi.getPopularProducts(
            categoryIds && categoryIds.length > 0 ? categoryIds : [1], 
            page, 
            limit,
            type,
            filter,
            ratingCount,
            minPrice,
            maxPrice,
            search,
            sellerId
          );
      }
      
      // Handle response regardless of success flag
      if (response.data) {
        let products: any = response.data;
        
        // Handle case where data might be a string (stringified JSON)
        if (typeof products === 'string') {
          const productsString = products as string;
          // Check if string is empty or whitespace only
          if (!productsString || !productsString.trim()) {
            products = [];
          } else {
            try {
              // Parse the stringified JSON
              let parsedData = JSON.parse(productsString);
              // Extract products array if it exists in the parsed data
              if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData) && 'products' in parsedData) {
                products = parsedData.products;
              } else {
                products = parsedData;
              }
            } catch (parseError) {
              // Try to handle partial JSON or malformed responses
              if (productsString.includes('[') && productsString.includes(']')) {
                // Try to extract array from malformed JSON
                const arrayStart = productsString.indexOf('[');
                const arrayEnd = productsString.lastIndexOf(']') + 1;
                if (arrayStart !== -1 && arrayEnd > arrayStart) {
                  const arrayString = productsString.substring(arrayStart, arrayEnd);
                  try {
                    const parsedData = JSON.parse(arrayString);
                    products = parsedData;
                  } catch (secondParseError) {
                    products = [];
                  }
                } else {
                  products = [];
                }
              } else {
                products = [];
              }
            }
          }
        }
        
        // Handle case where products might be in a pagination structure with products property
        if (products && typeof products === 'object' && !Array.isArray(products) && 'products' in products) {
          products = products.products;
        }
        
        // Ensure products is an array
        if (!Array.isArray(products)) {
          // Try to convert to array if it's an object
          if (products && typeof products === 'object') {
            products = Object.values(products);
          } else {
            products = [];
          }
        }
        
        setData(products);
        setIsSuccess(true);
        options?.onSuccess?.(products);
      } else {
        const errorMessage = response.message || `Failed to sort products by ${sortBy}`;
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || `An unexpected error occurred while sorting by ${sortBy}. Please try again.`;
      setError(errorMessage);
      setIsError(true);
      // Ensure we still call onSuccess with empty array to clear loading state
      options?.onSuccess?.([]);
      options?.onError?.(errorMessage);
    } finally {
      // setIsLoading(false); // Removed loading state
    }
  }, [options]);

  return {
    mutate,
    data,
    error,
    // isLoading, // Removed loading state
    isSuccess,
    isError,
  };
};