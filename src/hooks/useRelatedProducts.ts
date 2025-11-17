import { useState, useCallback } from 'react';
import { productsApi } from '../services/api';
import { UseRelatedProductsOptions, UseRelatedProductsResult } from '../types';

export const useRelatedProducts = (options?: UseRelatedProductsOptions): UseRelatedProductsResult => {
  const [forYouData, setForYouData] = useState<any[] | null>(null);
  const [newInData, setNewInData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchForYouProducts = useCallback(async (
    categoryIds: number[],
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 9999999999.0,
    search: string = '',
    offset: number = 1, // Add offset parameter
    limit: number = 8,   // Add limit parameter
    append: boolean = false // Add append parameter
  ) => {
    // Only set loading state if not appending
    if (!append) {
      setIsLoading(true);
    }
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Safety check for categoryIds
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        console.warn('No category IDs provided for For You products');
        setForYouData([]);
        setIsLoading(false);
        return;
      }

      const response = await productsApi.getMostReviewedProducts(
        categoryIds, 
        offset, // Use offset instead of hardcoded 1
        limit,  // Use limit instead of hardcoded 8
        type,
        filter,
        ratingCount,
        minPrice,
        maxPrice,
        search
      );
      
      if (response.success && response.data) {
        let parsedData = response.data;
        if (typeof parsedData === 'string') {
          // Check if string is empty or whitespace only
          if (!parsedData.trim()) {
            if (append && forYouData) {
              // If appending and no new data, keep existing data
              setForYouData(forYouData);
            } else {
              setForYouData([]);
            }
            setIsLoading(false);
            return;
          }
          
          try {
            parsedData = JSON.parse(parsedData);
          } catch (parseError) {
            console.error('Error parsing For You products response data:', parseError);
            console.log('Raw response data:', parsedData);
            // Try to handle partial JSON or malformed responses
            if (parsedData.includes('[') && parsedData.includes(']')) {
              // Try to extract array from malformed JSON
              const arrayStart = parsedData.indexOf('[');
              const arrayEnd = parsedData.lastIndexOf(']') + 1;
              if (arrayStart !== -1 && arrayEnd > arrayStart) {
                const arrayString = parsedData.substring(arrayStart, arrayEnd);
                try {
                  parsedData = JSON.parse(arrayString);
                } catch (secondParseError) {
                  console.error('Second parsing attempt failed:', secondParseError);
                  if (append && forYouData) {
                    // If appending and parsing fails, keep existing data
                    setForYouData(forYouData);
                  } else {
                    setForYouData([]);
                  }
                  setIsLoading(false);
                  return;
                }
              } else {
                if (append && forYouData) {
                  // If appending and no valid array, keep existing data
                  setForYouData(forYouData);
                } else {
                  setForYouData([]);
                }
                setIsLoading(false);
                return;
              }
            } else {
              if (append && forYouData) {
                // If appending and no array structure, keep existing data
                setForYouData(forYouData);
              } else {
                setForYouData([]);
              }
              setIsLoading(false);
              return;
            }
          }
        }
        
        const products = parsedData.products || parsedData;
        if (Array.isArray(products)) {
          if (append && forYouData) {
            // Filter out duplicates and append new products
            const existingIds = new Set(forYouData.map((item: any) => item.id));
            const uniqueNewProducts = products.filter((item: any) => !existingIds.has(item.id));
            setForYouData([...forYouData, ...uniqueNewProducts]);
          } else {
            setForYouData(products);
          }
          setIsSuccess(true);
          options?.onSuccess?.(products);
        } else {
          console.warn('Invalid products data format:', products);
          // Try to convert to array if it's an object
          if (products && typeof products === 'object') {
            const productsArray = Object.values(products).filter(item => item && typeof item === 'object');
            if (Array.isArray(productsArray) && productsArray.length > 0) {
              if (append && forYouData) {
                // Filter out duplicates and append new products
                const existingIds = new Set(forYouData.map((item: any) => item.id));
                const uniqueNewProducts = productsArray.filter((item: any) => !existingIds.has(item.id));
                setForYouData([...forYouData, ...uniqueNewProducts]);
              } else {
                setForYouData(productsArray);
              }
              setIsSuccess(true);
              options?.onSuccess?.(productsArray);
            } else {
              if (append && forYouData) {
                // If appending and no valid data, keep existing data
                setForYouData(forYouData);
              } else {
                setForYouData([]);
              }
              setIsSuccess(true);
              options?.onSuccess?.([]);
            }
          } else {
            if (append && forYouData) {
              // If appending and invalid data, keep existing data
              setForYouData(forYouData);
            } else {
              setForYouData([]);
            }
            setIsSuccess(true);
            options?.onSuccess?.([]);
          }
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch For You products';
        console.error('For You products API error:', errorMessage);
        // If appending and API error, keep existing data
        if (append && forYouData) {
          setForYouData(forYouData);
        } else {
          setForYouData([]);
        }
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred while fetching For You products. Please try again.';
      console.error('For You products fetch error:', errorMessage);
      // If appending and error, keep existing data
      if (append && forYouData) {
        setForYouData(forYouData);
      } else {
        setForYouData([]);
      }
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options, forYouData]);

  const fetchNewInProducts = useCallback(async (
    categoryId: number,
    type: string = 'all',
    filter: string = '[]',
    ratingCount: string = '',
    minPrice: number = 0.0,
    maxPrice: number = 999999.0,
    search: string = ''
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      // Validate categoryId
      if (categoryId === undefined || categoryId === null) {
        console.error('Category ID is undefined or null for New In products');
        setNewInData([]);
        setIsLoading(false);
        return;
      }

      const response = await productsApi.getLatestProductsByCategory(
        [categoryId], // Wrap categoryId in an array
        1, 
        13,
        type,
        filter,
        ratingCount,
        minPrice,
        maxPrice,
        search
      );
      
      if (response.success && response.data) {
        let parsedData = response.data;
        if (typeof parsedData === 'string') {
          // Check if string is empty or whitespace only
          if (!parsedData.trim()) {
            setNewInData([]);
            setIsLoading(false);
            return;
          }
          
          try {
            parsedData = JSON.parse(parsedData);
          } catch (parseError) {
            console.error('Error parsing New In products response data:', parseError);
            console.log('Raw response data:', parsedData);
            // Try to handle partial JSON or malformed responses
            if (parsedData.includes('[') && parsedData.includes(']')) {
              // Try to extract array from malformed JSON
              const arrayStart = parsedData.indexOf('[');
              const arrayEnd = parsedData.lastIndexOf(']') + 1;
              if (arrayStart !== -1 && arrayEnd > arrayStart) {
                const arrayString = parsedData.substring(arrayStart, arrayEnd);
                try {
                  parsedData = JSON.parse(arrayString);
                } catch (secondParseError) {
                  console.error('Second parsing attempt failed:', secondParseError);
                  setNewInData([]);
                  setIsLoading(false);
                  return;
                }
              } else {
                setNewInData([]);
                setIsLoading(false);
                return;
              }
            } else {
              setNewInData([]);
              setIsLoading(false);
              return;
            }
          }
        }
        
        const products = parsedData.products || parsedData;
        if (Array.isArray(products)) {
          setNewInData(products);
          setIsSuccess(true);
          options?.onSuccess?.(products);
        } else {
          console.warn('Invalid products data format for New In:', products);
          // Try to convert to array if it's an object
          if (products && typeof products === 'object') {
            const productsArray = Object.values(products).filter(item => item && typeof item === 'object');
            if (Array.isArray(productsArray) && productsArray.length > 0) {
              setNewInData(productsArray);
              setIsSuccess(true);
              options?.onSuccess?.(productsArray);
            } else {
              setNewInData([]);
              setIsSuccess(true);
              options?.onSuccess?.([]);
            }
          } else {
            setNewInData([]);
            setIsSuccess(true);
            options?.onSuccess?.([]);
          }
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch New In products';
        console.error('New In products API error:', errorMessage);
        setError(errorMessage);
        setIsError(true);
        options?.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred while fetching New In products. Please try again.';
      console.error('New In products fetch error:', errorMessage);
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    forYouData,
    newInData,
    isLoading,
    error,
    fetchForYouProducts,
    fetchNewInProducts,
    isSuccess,
    isError,
  };
};