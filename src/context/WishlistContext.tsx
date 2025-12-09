import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useGetWishlistMutation, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../hooks/useWishlistMutations';
import { Product } from '../types';
import Toast from '../components/Toast';
import { STORAGE_KEYS } from '../constants';

// Define the wishlist item structure from the API response
interface WishlistItem {
  id: number;
  user_id: number;
  item_id: number;
  created_at: string;
  updated_at: string;
  store_id: number | null;
  item: Product;
}

interface WishlistContextType {
  wishlistItems: Product[];
  likedProductIds: string[];
  loading: boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string, product?: Product) => boolean;
  refreshWishlist: () => Promise<void>;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const authContext = useAuth();
  const { user } = authContext || {};
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [externalIds, setExternalIds] = useState<string[]>([]); // Store externalIds from login
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  // Load externalIds from AsyncStorage on mount and when user changes
  useEffect(() => {
    const loadExternalIds = async () => {
      try {
        const storedExternalIds = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST_EXTERNAL_IDS);
        if (storedExternalIds) {
          const parsedIds = JSON.parse(storedExternalIds);
          setExternalIds(Array.isArray(parsedIds) ? parsedIds : []);
          console.log('Loaded externalIds from AsyncStorage:', parsedIds);
        } else {
          setExternalIds([]);
        }
      } catch (error) {
        console.error('Error loading externalIds from AsyncStorage:', error);
        setExternalIds([]);
      }
    };

    loadExternalIds();
  }, [user]);

  // Wishlist mutations
  const getWishlistMutation = useGetWishlistMutation({
    onSuccess: (data) => {
      if (!data || !Array.isArray(data)) {
        setWishlistItems([]);
        setLikedProductIds([]);
        // Clear externalIds if no wishlist data
        updateExternalIdsInStorage([]);
        return;
      }
      
      const products = data
        .filter((wishlistItem: WishlistItem) => wishlistItem && wishlistItem.item)
        .map((wishlistItem: WishlistItem) => wishlistItem.item);
      
      setWishlistItems(products);
      
      const itemIds: string[] = [];
      const externalIdList: string[] = [];
      products.forEach((product: Product) => {
        if (product && product.id) {
          itemIds.push(product.id.toString());
          externalIdList.push(product.id.toString());
          const offerId = (product as any).offerId;
          if (offerId && offerId.toString() !== product.id.toString()) {
            itemIds.push(offerId.toString());
            externalIdList.push(offerId.toString());
          }
        }
      });
      
      setLikedProductIds(itemIds);
      // Sync externalIds with API wishlist
      updateExternalIdsInStorage(externalIdList);
    },
    onError: (error) => {
      console.error('Error loading wishlist:', error);
      showToast('Failed to load wishlist', 'error');
    }
  });

  const addToWishlistMutation = useAddToWishlistMutation({
    onSuccess: async (data: any) => {
      if (data?.message) {
        showToast(data.message, 'success');
      } else {
        showToast('Item added to wishlist', 'success');
      }
      
      // Save the response's wishlistItem.externalId to externalIds in AsyncStorage
      if (data?.response?.data?.wishlistItem?.externalId) {
        const responseExternalId = data.response.data.wishlistItem.externalId;
        const updatedExternalIds = [...externalIds];
        if (!updatedExternalIds.includes(responseExternalId)) {
          updatedExternalIds.push(responseExternalId);
        }
        await updateExternalIdsInStorage(updatedExternalIds);
        console.log('Saved response externalId to AsyncStorage:', responseExternalId);
      }
    },
    onError: (error) => {
      const errorMessage = error?.toString() || '';
      if (!errorMessage.includes('already in wishlist') && !errorMessage.includes('PRODUCT_ALREADY_IN_WISHLIST')) {
        showToast(error || 'Failed to add item to wishlist', 'error');
      }
    }
  });

  // Helper function to update externalIds in AsyncStorage
  const updateExternalIdsInStorage = async (newExternalIds: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_EXTERNAL_IDS, JSON.stringify(newExternalIds));
      setExternalIds(newExternalIds);
    } catch (error) {
      console.error('Error updating externalIds in AsyncStorage:', error);
    }
  };

  const removeFromWishlistMutation = useRemoveFromWishlistMutation({
    onSuccess: (data) => {
      if (data?.message) {
        showToast(data.message, 'success');
      } else {
        showToast('Item removed from wishlist', 'success');
      }
    },
    onError: (error) => {
      console.error('Error removing from wishlist:', error);
      showToast('Failed to remove item from wishlist', 'error');
    }
  });

  const loadWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setLikedProductIds([]);
      return;
    }
    
    try {
      setLoading(true);
      await getWishlistMutation.mutate();
    } catch (error) {
      console.error('Error loading wishlist:', error);
      showToast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      showToast('Please login to add items to wishlist', 'warning');
      return;
    }

    try {
      const offerId = (product as any).offerId;
      const externalId = offerId ? offerId.toString() : product.id;
      const source = (product as any).source || '1688';
      const country = 'en';
      
      const isCurrentlyInWishlist = likedProductIds.includes(product.id) || 
                                    likedProductIds.includes(externalId) ||
                                    externalIds.includes(product.id) ||
                                    externalIds.includes(externalId) ||
                                    (externalId !== product.id && isInWishlist(externalId));
      
      if (isCurrentlyInWishlist) {
        const previousLikedIds = [...likedProductIds];
        const previousWishlistItems = [...wishlistItems];
        
        setLikedProductIds(prev => prev.filter(id => id !== product.id && id !== externalId));
        setWishlistItems(prev => prev.filter(item => item.id !== product.id && item.id !== externalId));
        
        try {
          await removeFromWishlistMutation.mutate(externalId);
          // Remove from externalIds
          const updatedExternalIds = externalIds.filter(id => id !== product.id && id !== externalId);
          await updateExternalIdsInStorage(updatedExternalIds);
          await loadWishlist();
        } catch (removeError) {
          setLikedProductIds(previousLikedIds);
          setWishlistItems(previousWishlistItems);
          throw removeError;
        }
      } else {
        const previousLikedIds = [...likedProductIds];
        const previousWishlistItems = [...wishlistItems];
        
        const newLikedIds = [...likedProductIds];
        if (!newLikedIds.includes(product.id)) newLikedIds.push(product.id);
        if (externalId !== product.id && !newLikedIds.includes(externalId)) newLikedIds.push(externalId);
        setLikedProductIds(newLikedIds);
        setWishlistItems(prev => {
          if (prev.some(item => item.id === product.id || item.id === externalId)) {
            return prev;
          }
          return [...prev, product];
        });
        
        try {
          // Get product image, price, and title for the API
          const imageUrl = product.image || '';
          const price = product.price || 0;
          const title = product.name || '';
          
          await addToWishlistMutation.mutate(imageUrl, externalId, price, title);
          // The response externalId will be saved in the mutation's onSuccess callback
          await loadWishlist();
        } catch (addError) {
          setLikedProductIds(previousLikedIds);
          setWishlistItems(previousWishlistItems);
          throw addError;
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('already in wishlist') || errorMessage.includes('PRODUCT_ALREADY_IN_WISHLIST')) {
        showToast('Product already in wishlist', 'info');
        await loadWishlist();
      } else {
        if (errorMessage.includes('Cast to Map failed') || errorMessage.includes('specifications') || errorMessage.includes('Product data format error')) {
          showToast('Product data format error. Please try again later.', 'error');
        } else {
          showToast(errorMessage || 'Failed to update wishlist', 'error');
        }
      }
    }
  };

  const isInWishlist = (productId: string, product?: Product) => {
    // First check likedProductIds (from API wishlist)
    if (likedProductIds.includes(productId)) {
      return true;
    }
    
    // Check if productId is in externalIds (from login response)
    if (externalIds.includes(productId)) {
      return true;
    }
    
    // Check offerId if product has it
    if (product && (product as any).offerId) {
      const offerId = (product as any).offerId.toString();
      if (likedProductIds.includes(offerId)) {
        return true;
      }
      // Also check if offerId is in externalIds
      if (externalIds.includes(offerId)) {
        return true;
      }
    }
    
    // Check if product.id matches any externalId
    if (externalIds.includes(productId)) {
      return true;
    }
    
    return false;
  };

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({
      visible: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      likedProductIds,
      loading,
      toggleWishlist,
      isInWishlist,
      refreshWishlist,
      toast,
      showToast,
      hideToast,
    }}>
      {children}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type === 'warning' ? 'info' : toast.type}
          onHide={hideToast}
        />
      )}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    console.warn('useWishlist must be used within a WishlistProvider. Returning default context.');
    return {
      wishlistItems: [],
      likedProductIds: [],
      loading: false,
      toggleWishlist: async () => {},
      isInWishlist: () => false,
      refreshWishlist: async () => {},
      toast: {
        visible: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
      },
      showToast: () => {},
      hideToast: () => {},
    };
  }
  return context;
};
