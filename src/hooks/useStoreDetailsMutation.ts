import { useState, useCallback } from 'react';
import { storesApi } from '../services/storesApi';
import { ApiResponse, Store, UseStoreDetailsMutationResult } from '../types';

/**
 * Custom hook for fetching store details using a mutation pattern
 * This hook provides a way to fetch detailed store information by store ID
 */
export const useStoreDetailsMutation = (): UseStoreDetailsMutationResult => {
  const [data, setData] = useState<Store | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch store details by store ID
   * @param storeId - The ID of the store to get details for
   * @returns Promise with API response or null if an error occurred
   */
  const getStoreDetails = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('useStoreDetailsMutation: Fetching store details for store ID:', storeId);
      const response = await storesApi.getStoreDetails(storeId);
      
      if (response.success) {
        setData(response.data);
        console.log('useStoreDetailsMutation: Store details fetched successfully:', response.data);
      } else {
        setError(response.message || 'Failed to fetch store details');
        console.error('useStoreDetailsMutation: Failed to fetch store details:', response.message);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('useStoreDetailsMutation: Error fetching store details:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    getStoreDetails,
  };
};