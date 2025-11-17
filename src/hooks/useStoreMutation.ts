import { useState, useCallback } from 'react';
import { getStoreByUserId, getOrderStatsByStoreId, getStoreProfileData } from '../services/storeApi';
import { ApiResponse, StoreResponse, OrderStatsResponse, UseStoreMutationResult, StoreProfileResponse } from '../types';

/**
 * Custom hook for store-related API calls using a mutation pattern
 * This hook provides a way to fetch store information by user ID and order statistics by store ID
 */
export const useStoreMutation = (): UseStoreMutationResult => {
  const [data, setData] = useState<StoreResponse | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [storeProfileData, setStoreProfileData] = useState<StoreProfileResponse | null>(null);

  /**
   * Fetch store information by user ID
   * @param userId - The ID of the user to get the store for
   * @returns Promise with API response or null if an error occurred
   */
  const getStore = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('useStoreMutation: Fetching store for user ID:', userId);
      const response = await getStoreByUserId(userId);
      
      if (response.success) {
        setData(response.data);
        console.log('useStoreMutation: Store fetched successfully:', response.data);
      } else {
        setError(response.message || 'Failed to fetch store');
        console.error('useStoreMutation: Failed to fetch store:', response.message);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('useStoreMutation: Error fetching store:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch order statistics by store ID
   * @param storeId - The ID of the store to get order statistics for
   * @returns Promise with API response or null if an error occurred
   */
  const getOrderStats = useCallback(async (storeId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('useStoreMutation: Fetching order stats for store ID:', storeId);
      const response = await getOrderStatsByStoreId(storeId);
      
      if (response.success) {
        setOrderStats(response.data);
        console.log('useStoreMutation: Order stats fetched successfully:', response.data);
      } else {
        setError(response.message || 'Failed to fetch order statistics');
        console.error('useStoreMutation: Failed to fetch order stats:', response.message);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('useStoreMutation: Error fetching order stats:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStoreProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('useStoreMutation: Fetching store for Profile:');
      const response = await getStoreProfileData();
      
      if (response.success) {
        setStoreProfileData(response.data as StoreProfileResponse);
        console.log('useStoreMutation: Store fetched successfully:', response.data);
      } else {
        setError(response.message || 'Failed to fetch store');
        console.error('useStoreMutation: Failed to fetch store:', response.message);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('useStoreMutation: Error fetching store:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    data,
    storeProfileData,
    orderStats,
    loading,
    error,
    getStore,
    getOrderStats,
    getStoreProfile,
  };
};