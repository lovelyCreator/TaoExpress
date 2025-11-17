import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useGetWishlistMutation, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../hooks/useWishlistMutations';
import { Product } from '../types';
import Toast from '../components/Toast'; // Add Toast import

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
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  // Add toast state to context
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
  const [loading, setLoading] = useState(false);
  // Add toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  // Wishlist mutations
  const getWishlistMutation = useGetWishlistMutation({
    onSuccess: (data) => {
      // Add null check for data
      if (!data || !Array.isArray(data)) {
        setWishlistItems([]);
        setLikedProductIds([]);
        return;
      }
      
      // Extract products from the wishlist items response with proper null checks
      const products = data
        .filter((wishlistItem: WishlistItem) => wishlistItem && wishlistItem.item)
        .map((wishlistItem: WishlistItem) => wishlistItem.item);
      
      setWishlistItems(products);
      
      // Extract item IDs and set them as liked product IDs with proper null checks
      const itemIds = data
        .filter((wishlistItem: WishlistItem) => wishlistItem && wishlistItem.item_id)
        .map((wishlistItem: WishlistItem) => wishlistItem.item_id.toString());
      
      setLikedProductIds(itemIds);
      console.log('Updated likedProductIds:', itemIds);
    },
    onError: (error) => {
      console.error('Error loading wishlist:', error);
      showToast('Failed to load wishlist', 'error');
    }
  });

  const addToWishlistMutation = useAddToWishlistMutation({
    onSuccess: (data) => {
      console.log('Item added to wishlist:', data.message);
      showToast('Item added to wishlist', 'success');
    },
    onError: (error) => {
      console.error('Error adding to wishlist:', error);
      showToast('Failed to add item to wishlist', 'error');
    }
  });

  const removeFromWishlistMutation = useRemoveFromWishlistMutation({
    onSuccess: (data) => {
      console.log('Item removed from wishlist:', data.message);
      showToast('Item removed from wishlist', 'success');
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
      const isCurrentlyInWishlist = likedProductIds.includes(product.id);
      
      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        await removeFromWishlistMutation.mutate(product.id);
        setWishlistItems(prev => prev.filter(item => item.id !== product.id));
        setLikedProductIds(prev => prev.filter(id => id !== product.id));
      } else {
        // Add to wishlist
        await addToWishlistMutation.mutate(product.id);
        setWishlistItems(prev => [...prev, product]);
        setLikedProductIds(prev => [...prev, product.id]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showToast('Failed to update wishlist', 'error');
    }
  };

  const isInWishlist = (productId: string) => {
    return likedProductIds.includes(productId);
  };

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  // Toast functions
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
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    // Instead of throwing an error, return a default context
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