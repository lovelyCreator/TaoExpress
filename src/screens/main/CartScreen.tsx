import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { usePlatformStore } from '../../store/platformStore';
import { translations } from '../../i18n/translations';
import { ProductCard } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useGetCartMutation } from '../../hooks/useGetCartMutation';
import { useUpdateCartItemMutation } from '../../hooks/useUpdateCartItemMutation';
import { useDeleteCartItemMutation } from '../../hooks/useDeleteCartItemMutation';
import { useClearCartMutation } from '../../hooks/useClearCartMutation';
import { useDeleteCartBatchMutation } from '../../hooks/useDeleteCartBatchMutation';
import { useWishlistStatus } from '../../hooks/useWishlistStatus';
import { useAddToWishlistMutation } from '../../hooks/useAddToWishlistMutation';
import { useDeleteFromWishlistMutation } from '../../hooks/useDeleteFromWishlistMutation';
import { useRecommendationsMutation } from '../../hooks/useRecommendationsMutation';
import { Product } from '../../types';
import { FlatList } from 'react-native';
import PrivacyIcon from '../../assets/icons/PrivacyIcon';
import PackageIcon from '../../assets/icons/PackageIcon';
import ThickCheckIcon from '../../assets/icons/ThickCheckIcon';
import HeartIcon from '../../assets/icons/HeartIcon';
import DeleteIcon from '../../assets/icons/DeleteIcon';
import PlusIcon from '../../assets/icons/PlusIcon';
import MinusIcon from '../../assets/icons/MinusIcon';

const { width } = Dimensions.get('window');

// Mock cart data
const mockCartData = [
  {
    id: '1',
    sellerId: 'seller_123',
    sellerName: 'bbbxffvwo083i5cyz7jxtprkg',
    items: [
      {
        id: 'cart_item_1',
        productId: 'shoes_001',
        name: 'Shoes',
        color: 'space',
        size: 'M',
        price: 5.99,
        originalPrice: 7.00,
        quantity: 1,
        image: 'https://picsum.photos/seed/shoes1/300/300',
        selected: true,
      }
    ]
  }
];


const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  // Use wishlist status hook to check if products are liked based on external IDs
  const { isProductLiked, refreshExternalIds, addExternalId, removeExternalId } = useWishlistStatus();
  const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);
  
  // Add to wishlist mutation
  const { mutate: addToWishlist } = useAddToWishlistMutation({
    onSuccess: async (data) => {
      showToast('Product added to wishlist', 'success');
      // Immediately refresh external IDs to update heart icon color
      await refreshExternalIds();
    },
    onError: (error) => {
      showToast(error || 'Failed to add product to wishlist', 'error');
    },
  });

  // Delete from wishlist mutation
  const { mutate: deleteFromWishlist } = useDeleteFromWishlistMutation({
    onSuccess: async (data) => {
      showToast('Product removed from wishlist', 'success');
      // Immediately refresh external IDs to update heart icon color
      await refreshExternalIds();
    },
    onError: (error) => {
      showToast(error || 'Failed to remove product from wishlist', 'error');
    },
  });
  
  // Toggle wishlist function
  const toggleWishlist = async (product: any) => {
    if (!isAuthenticated || !user) {
      showToast('Please login first', 'warning');
      return;
    }

    // Get product external ID - prioritize externalId, never use MongoDB _id
    const externalId = 
      (product as any).externalId?.toString() ||
      (product as any).offerId?.toString() ||
      '';

    if (!externalId) {
      showToast('Invalid product ID', 'error');
      return;
    }

    const isLiked = isProductLiked(product);
    const source = (product as any).source || selectedPlatform || '1688';
    const country = locale || 'en';

    if (isLiked) {
      // Remove from wishlist - optimistic update (removes from state and AsyncStorage immediately)
      await removeExternalId(externalId);
      deleteFromWishlist(externalId);
    } else {
      // Add to wishlist - extract required fields from product
      const imageUrl = product.image || product.images?.[0] || '';
      const price = product.price || 0;
      const title = product.name || product.title || '';

      if (!imageUrl || !title || price <= 0) {
        showToast('Invalid product data', 'error');
        return;
      }

      // Optimistic update - add to state and AsyncStorage immediately
      await addExternalId(externalId);
      addToWishlist({
        externalId,
        source,
        country,
        imageUrl,
        price,
        title,
      });
    }
  };
  // Cart context removed - using local state
  const [cart, setCart] = useState({ items: [] as any[], totalAmount: 0, totalItems: 0, currency: 'CNY' });
  const { showToast } = useToast();
  
  // i18n - define t function early so it can be used in callbacks
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';
  const t = useCallback((key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }, [locale]);
  
  // Helper function to map cart data from API response
  const mapCartData = useCallback((data: any) => {
    if (data && data.cart) {
      // Map API response to cart format
      const mappedItems = (data.cart.items || []).map((item: any) => {
        // Extract variations from skuAttributes
        const variations = (item.skuInfo?.skuAttributes || []).map((attr: any) => ({
          name: attr.attributeNameTrans || attr.attributeName || '',
          value: attr.valueTrans || attr.value || '',
        }));
        
        // Get price from skuInfo
        const price = parseFloat(item.skuInfo?.price || item.skuInfo?.consignPrice || '0');
        
        return {
          id: item._id || item.offerId?.toString() || '',
          _id: item._id,
          offerId: item.offerId,
          productId: item.offerId?.toString() || '',
          name: item.subjectTrans || item.subject || '',
          image: item.imageUrl || '',
          price: price,
          quantity: item.quantity || 1,
          variant: variations,
          source: item.source || '1688',
          companyName: item.companyName || '',
          // Store original data for reference
          originalData: item,
        };
      });
      
      setCart({
        items: mappedItems,
        totalAmount: data.cart.totalAmount || 0,
        totalItems: data.cart.totalItems || mappedItems.length,
        currency: data.cart.currency || 'CNY',
      });
    }
  }, []);

  // Memoize callbacks to prevent fetchCart from being recreated
  const handleCartSuccess = useCallback((data: any) => {
    console.log('Cart fetched successfully:', data);
    mapCartData(data);
  }, [mapCartData]);

  const handleCartError = useCallback((error: string) => {
    console.error('Failed to fetch cart:', error);
    showToast(error || t('cart.failedToLoad'), 'error');
    setCart({ items: [], totalAmount: 0, totalItems: 0, currency: 'CNY' });
  }, [showToast, t]);

  const { mutate: fetchCart, isLoading: cartLoading } = useGetCartMutation({
    onSuccess: handleCartSuccess,
    onError: handleCartError,
  });
  
  const { mutate: updateCartItem } = useUpdateCartItemMutation({
    onSuccess: (data) => {
      console.log('Cart item updated successfully:', data);
      mapCartData(data);
      showToast(t('cart.quantityUpdated'), 'success');
    },
    onError: (error) => {
      console.error('Failed to update cart item:', error);
      showToast(error || t('cart.failedToUpdateQuantity'), 'error');
    },
  });

  const { mutate: deleteCartItem } = useDeleteCartItemMutation({
    onSuccess: (data) => {
      console.log('Cart item deleted successfully:', data);
      mapCartData(data);
      showToast(t('cart.itemRemoved'), 'success');
    },
    onError: (error) => {
      console.error('Failed to delete cart item:', error);
      showToast(error || t('cart.failedToRemove'), 'error');
    },
  });

  const { mutate: clearCart } = useClearCartMutation({
    onSuccess: (data) => {
      console.log('Cart cleared successfully:', data);
      mapCartData(data);
      showToast(t('cart.cartCleared'), 'success');
      setSelectedItems(new Set());
      setAllSelected(false);
    },
    onError: (error) => {
      console.error('Failed to clear cart:', error);
      showToast(error || t('cart.failedToClear'), 'error');
    },
  });

  const { mutate: deleteCartBatch } = useDeleteCartBatchMutation({
    onSuccess: (data) => {
      console.log('Cart items deleted successfully:', data);
      mapCartData(data);
      showToast(t('cart.itemsRemoved'), 'success');
      setSelectedItems(new Set());
      setAllSelected(false);
    },
    onError: (error) => {
      console.error('Failed to delete cart items:', error);
      showToast(error || t('cart.failedToDelete'), 'error');
    },
  });
  
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const isFetchingRecommendationsRef = useRef(false);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const lastFetchTimeRef = useRef<number>(0);
  const FETCH_DEBOUNCE_MS = 1000; // Only fetch if at least 1 second has passed since last fetch
  
  // Recommendations state for "More to Love"
  const [recommendationsProducts, setRecommendationsProducts] = useState<Product[]>([]);
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState(true);
  const [isLoadingMoreRecommendations, setIsLoadingMoreRecommendations] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const lastSuccessfulPageRef = useRef(1); // Track last successful page to revert on error
  
  // Store fetchCart in a ref to avoid dependency issues
  const fetchCartRef = useRef(fetchCart);
  useEffect(() => {
    fetchCartRef.current = fetchCart;
  }, [fetchCart]);

  // Recommendations mutation
  const {
    mutate: fetchRecommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError,
  } = useRecommendationsMutation({
    onSuccess: (data) => {
      setIsLoadingMoreRecommendations(false);
      isLoadingMoreRef.current = false;
      
      if (data && data.recommendations && data.recommendations.result && Array.isArray(data.recommendations.result)) {
        
        const pageSize = data.pageSize || 20;
        const currentPageFromData = data.page || recommendationsPage;
        const hasMore = data.recommendations.result.length >= pageSize;
        setHasMoreRecommendations(hasMore);
        
        // Map API response to Product format
        const mappedProducts = data.recommendations.result.map((item: any): Product => {
          const price = parseFloat(item.priceInfo?.price || item.priceInfo?.consignPrice || 0);
          const originalPrice = parseFloat(item.priceInfo?.consignPrice || item.priceInfo?.price || 0);
          const discount = originalPrice > price && originalPrice > 0
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;
          
          const productData: Product = {
            id: item.offerId?.toString() || '',
            externalId: item.offerId?.toString() || '',
            offerId: item.offerId?.toString() || '',
            name: item.subjectTrans || item.subject || '',
            image: item.imageUrl || '',
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            description: '',
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
              joinedDate: new Date() 
            },
            rating: 0,
            reviewCount: 0,
            rating_count: 0,
            inStock: true,
            stockCount: 0,
            tags: [],
            isNew: false,
            isFeatured: false,
            isOnSale: discount > 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            orderCount: item.monthSold || 0,
            repurchaseRate: item.repurchaseRate || '',
          };
          
          // Preserve non-typed fields for navigation / tracking
          (productData as any).source = selectedPlatform || '1688';
          
          return productData;
        });
        
        // If it's the first page, replace products, otherwise append
        if (currentPageFromData === 1) {
          setRecommendationsProducts(mappedProducts);
          lastSuccessfulPageRef.current = 1; // Update last successful page
          setRecommendationsPage(1);
        } else {
          setRecommendationsProducts(prev => [...prev, ...mappedProducts]);
          lastSuccessfulPageRef.current = currentPageFromData; // Update last successful page
          setRecommendationsPage(currentPageFromData);
        }
      } else {
        setRecommendationsProducts([]);
        setHasMoreRecommendations(false);
      }
    },
    onError: (error) => {
      setIsLoadingMoreRecommendations(false);
      isLoadingMoreRef.current = false;
      // Reset page number to last successful page on error to prevent incrementing on failures
      setRecommendationsPage(lastSuccessfulPageRef.current);
      // Set hasMoreRecommendations to false to prevent further attempts
      setHasMoreRecommendations(false);
    },
  });

  // Load more recommendations function
  const loadMoreRecommendations = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isLoadingMoreRef.current || isLoadingMoreRecommendations || !hasMoreRecommendations || !locale) {
      return;
    }
    
    isLoadingMoreRef.current = true;
    const nextPage = recommendationsPage + 1;
    setIsLoadingMoreRecommendations(true);
    setRecommendationsPage(nextPage);
    
    // Use user ID if available, otherwise use default 'dferg0001'
    const outMemberId = user?.id?.toString() || 'dferg0001';
    fetchRecommendations(locale || 'en', outMemberId, nextPage, 20);
  }, [recommendationsPage, hasMoreRecommendations, isLoadingMoreRecommendations, locale, user?.id, fetchRecommendations]);

  // Fetch recommendations when screen comes into focus (works for both authenticated and unauthenticated users)
  useFocusEffect(
    useCallback(() => {
      if (recommendationsProducts.length === 0 && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true;
        setIsLoadingMoreRecommendations(true);
        setRecommendationsPage(1);
        // Use user ID if authenticated, otherwise use default 'dferg0001' or undefined
        const outMemberId = isAuthenticated ? user?.id : 'dferg0001';
        fetchRecommendations(locale || 'en', outMemberId, 1, 20);
      }
    }, [isAuthenticated, locale, user?.id, recommendationsProducts.length, fetchRecommendations])
  );

  // Fetch cart status when screen comes into focus (but debounced to prevent too frequent calls)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTimeRef.current;
        
        // Only fetch if enough time has passed since last fetch
        if (timeSinceLastFetch >= FETCH_DEBOUNCE_MS) {
          lastFetchTimeRef.current = now;
          fetchCartRef.current();
        }
      } else {
        // Reset cart when user is not authenticated
        setCart({ items: [], totalAmount: 0, totalItems: 0, currency: 'CNY' });
        setSelectedItems(new Set());
        setAllSelected(false);
        lastFetchTimeRef.current = 0;
      }
    }, [isAuthenticated]) // Removed fetchCart from dependencies
  );


  // Navigate to product detail helper
  const navigateToProductDetail = async (
    productId: string | number,
    source: string = '1688',
    country: string = 'en'
  ) => {
    (navigation as any).navigate('ProductDetail', {
      productId: productId.toString(),
      source: source,
      country: country,
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        // onPress={() => navigation.goBack()}
      >
        {/* <Ionicons name="arrow-back" size={24} color={COLORS.black} /> */}
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>
        {t('cart.title')} { selectedCount > 0 ? `(${selectedCount})` : '(0)' }
      </Text>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => {navigation.navigate('Wishlist' as never)}}>
          <HeartIcon width={24} height={24} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerIcon} 
          onPress={handleDeleteSelected}
          disabled={cart.items.length === 0}
        >
          <DeleteIcon 
            width={24} 
            height={24} 
            color={cart.items.length === 0 ? COLORS.gray[300] : COLORS.black} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMoreToLoveItem = ({ item: product, index }: { item: Product; index: number }) => {
    if (!product || !product.id) {
      return null;
    }
    
    const handleLike = async () => {
      if (!isAuthenticated) {
        // showToast(t('home.pleaseLogin'));
        return;
      }
      try {
        await toggleWishlist(product);
      } catch (error) {
        // Error toggling wishlist
      }
    };

    const handlePress = () => {
      const productIdToUse = (product as any).offerId || product.id;
      const source = '1688'; // Default source
      navigateToProductDetail(productIdToUse, source, 'en');
    };
    
    return (
      <View style={styles.productCardWrapper}>
        <ProductCard
          key={`moretolove-${product.id || index}`}
          product={product}
          variant="moreToLove"
          onPress={handlePress}
          onLikePress={handleLike}
          isLiked={isProductLiked(product)}
          showLikeButton={true}
          showDiscountBadge={true}
          showRating={true}
        />
      </View>
    );
  };

  const renderMoreToLove = () => {
    const productsToDisplay = recommendationsProducts;
    
    // Show loading state if fetching
    if (recommendationsLoading && productsToDisplay.length === 0) {
      return (
        <View style={styles.moreToLoveSection}>
          <Text style={styles.sectionTitle}>{t('home.moreToLove')}</Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      );
    }
    
    // Show error state
    if (recommendationsError && productsToDisplay.length === 0) {
      return (
        <View style={styles.moreToLoveSection}>
          <Text style={styles.sectionTitle}>{t('home.moreToLove')}</Text>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Failed to load recommendations</Text>
          </View>
        </View>
      );
    }
    
    // Don't show section if no products
    if (!Array.isArray(productsToDisplay) || productsToDisplay.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.moreToLoveSection}>
        <Text style={styles.sectionTitle}>{t('home.moreToLove')}</Text>
        <FlatList
          data={productsToDisplay}
          renderItem={renderMoreToLoveItem}
          keyExtractor={(item, index) => `moretolove-${item.id?.toString() || index}-${index}`}
          numColumns={2}
          scrollEnabled={false}
          nestedScrollEnabled={true}
          columnWrapperStyle={styles.productsGridRow}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          ListFooterComponent={() => (
            <>
              {/* Loading indicator for pagination */}
              {isLoadingMoreRecommendations && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View>
              )}
              {/* End of list indicator */}
              {!hasMoreRecommendations && productsToDisplay.length > 0 && (
                <View style={styles.endOfListContainer}>
                  <Text style={styles.endOfListText}>No more products</Text>
                </View>
              )}
            </>
          )}
        />
      </View>
    );
  };
  
  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            
            // Check if user has scrolled near the bottom (within 200px)
            const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
            
            // Load more if near bottom, has more items, and not already loading
            if (isNearBottom && hasMoreRecommendations && !isLoadingMoreRecommendations && !isLoadingMoreRef.current) {
              loadMoreRecommendations();
            }
          }}
          scrollEventThrottle={400}
        >
          <View style={styles.emptyCart}>
            <Image 
              source={require('../../assets/icons/cart_empty.png')} 
              style={styles.emptyCartImage}
            />
            <Text style={styles.welcomeText}>{t('cart.welcome')}</Text>
            <Text style={styles.loginPrompt}>
              {t('cart.loginPrompt')}
            </Text>
            {/* <Text style={styles.emptySubtitle}>
              {t('cart.emptySubtitle')}
            </Text> */}
            <TouchableOpacity
              style={[styles.continueShoppingButton, {backgroundColor: COLORS.text.red, marginBottom: SPACING.sm}]}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.continueShoppingButtonText}>{t('cart.login')}</Text>
            </TouchableOpacity>
          </View>
          {renderMoreToLove()}
          
          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Calculate totals from cart items
  const selectedCartItems = cart.items.filter(item => selectedItems.has(item.id));
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedCount = selectedCartItems.length;

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    
    // Update all selected state
    const allItemIds = cart.items.map(item => item.id);
    setAllSelected(newSelected.size === allItemIds.length && allItemIds.length > 0);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
      setAllSelected(false);
    } else {
      const allItemIds = cart.items.map(item => item.id);
      setSelectedItems(new Set(allItemIds));
      setAllSelected(true);
    }
  };

  const handleQuantityChange = async (itemId: string, increment: boolean) => {
    const item = cart.items.find(i => i.id === itemId);
    if (!item) return;
    
    const newQuantity = increment 
      ? item.quantity + 1 
      : Math.max(1, item.quantity - 1);
    
    // Update quantity via API - use cartItemId from item._id
    const cartItemId = (item as any)._id || itemId;
    if (!cartItemId) {
      showToast(t('cart.invalidCartItem'), 'error');
      return;
    }
    
    updateCartItem(cartItemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    const item = cart.items.find(i => i.id === itemId);
    if (!item) return;
    
    const cartItemId = (item as any)._id || itemId;
    if (!cartItemId) {
      showToast(t('cart.invalidCartItem'), 'error');
      return;
    }
    
    deleteCartItem(cartItemId);
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      // If no items selected, clear entire cart
      if (cart.items.length > 0) {
        clearCart();
      }
      return;
    }

    // Delete selected items in batch
    const selectedCartItems = cart.items.filter(item => selectedItems.has(item.id));
    const itemIds = selectedCartItems.map(item => (item as any)._id || item.id).filter(id => id);
    
    if (itemIds.length > 0) {
      deleteCartBatch(itemIds);
    } else {
      showToast(t('cart.noValidItems'), 'warning');
    }
  };


  // Group cart items by source and companyName
  const groupCartItemsBySourceAndCompany = (items: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    items.forEach((item) => {
      const source = item.source || '1688';
      const companyName = item.companyName || '';
      const key = `${source}_${companyName}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    // Convert to array format with source and companyName
    return Object.keys(grouped).map((key) => {
      const [source, ...companyParts] = key.split('_');
      const companyName = companyParts.join('_');
      return {
        source,
        companyName,
        items: grouped[key],
      };
    });
  };

  const renderCartItem = (item: any) => {
    // Get variations from item.variant array
    const variations = (item as any).variant || [];
    // Show only values, not "Product Specification" text
    const variationText = variations.map((v: any) => v.value).filter(Boolean).join(', ');
    
    // Get image from item.image
    const itemImage = item.image || '';
    
    // Get source from item for navigation
    const itemSource = item.source || '1688';
    
    return (
      <View style={styles.cartItem} key={item.id}>
        {/* <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Ionicons name="close" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity> */}
        
        <View style={styles.itemContent}>
          <TouchableOpacity 
            style={styles.itemCheckbox}
            onPress={() => handleSelectItem(item.id)}
          >
            <View style={[
              styles.checkbox,
              selectedItems.has(item.id) && styles.checkboxSelected
            ]}>
              {selectedItems.has(item.id) && (
                <ThickCheckIcon size={12} color={COLORS.white} />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              if (item.offerId) {
                navigateToProductDetail(item.offerId, itemSource, locale);
              }
            }}
          >
            <Image 
              source={{ uri: itemImage }}
              style={styles.productImage}
            />
          </TouchableOpacity>
          
          <View style={styles.productInfo}>
            <TouchableOpacity
              onPress={() => {
                if (item.offerId) {
                  navigateToProductDetail(item.offerId, itemSource, locale);
                }
              }}
            >
              <Text style={styles.productName} numberOfLines={1}>{item.name || 'Unknown Item'}</Text>
            </TouchableOpacity>
            {variationText && (
              <Text style={styles.productVariant} numberOfLines={1}>{variationText}</Text>
            )}
            
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>¥{item.price.toFixed(2)}</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, false)}
                >
                  <MinusIcon width={16} height={16} color={COLORS.black} />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, true)}
                >
                  <PlusIcon width={16} height={16} color={COLORS.black} />
                </TouchableOpacity>
              </View>
            </View>
            
          </View>
        </View>
      </View>
    );
  };

  // Check if all items in a group are selected
  const isGroupSelected = (groupItems: any[]) => {
    if (groupItems.length === 0) return false;
    return groupItems.every(item => selectedItems.has(item.id));
  };

  // Handle group selection/deselection
  const handleGroupSelect = (groupItems: any[]) => {
    const allSelected = isGroupSelected(groupItems);
    const newSelected = new Set(selectedItems);
    
    if (allSelected) {
      // Deselect all items in the group
      groupItems.forEach(item => newSelected.delete(item.id));
    } else {
      // Select all items in the group
      groupItems.forEach(item => newSelected.add(item.id));
    }
    
    setSelectedItems(newSelected);
    
    // Update all selected state
    const allItemIds = cart.items.map(item => item.id);
    setAllSelected(newSelected.size === allItemIds.length && allItemIds.length > 0);
  };

  const renderGroupedCartItems = () => {
    const groupedItems = groupCartItemsBySourceAndCompany(cart.items);
    
    return groupedItems.map((group, groupIndex) => {
      const groupSelected = isGroupSelected(group.items);
      
      return (
        <View key={`group-${groupIndex}`} style={styles.groupContainer}>
          <View style={styles.groupHeader}>
            <TouchableOpacity 
              style={styles.groupCheckbox}
              onPress={() => handleGroupSelect(group.items)}
            >
              <View style={[
                styles.checkbox,
                groupSelected && styles.checkboxSelected
              ]}>
                {groupSelected && (
                  <ThickCheckIcon size={12} color={COLORS.white} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.groupHeaderText}>
              <Text style={{color: COLORS.text.red}}>{group.source} </Text> {group.companyName}
            </Text>
          </View>
          {group.items.map((item) => renderCartItem(item))}
        </View>
      );
    });
  };


  const renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <View style={styles.bottomContent}>
        <TouchableOpacity 
          style={styles.allCheckbox}
          onPress={handleSelectAll}
        >
          <View style={[
            styles.checkbox,
            allSelected && styles.checkboxSelected
          ]}>
            {allSelected && (
              <ThickCheckIcon size={12} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.allText}>{t('cart.all')}</Text>
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
          <TouchableOpacity 
          style={styles.payButton}
          onPress={() => {
            // Navigate to payment screen with selected items
            const paymentItems = selectedCartItems.map(item => ({
              id: item.id,
              _id: (item as any)._id, // Include cart item ID from backend
              name: item.name,
              color: item.color,
              size: item.size,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            }));
            
            (navigation as any).navigate('Payment', {
              items: paymentItems,
              totalAmount: totalPrice,
              fromCart: true,
            });
          }}
        >
          <Text style={styles.payButtonText}>{t('cart.pay')} ({selectedCount})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Show loading only on initial load (when cart is empty and loading)
  // Don't show loading during updates/deletes
  const isInitialLoad = cartLoading && (!cart.items || cart.items.length === 0);
  
  if (isInitialLoad) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: SPACING.md, color: COLORS.text.secondary }}>{t('cart.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            
            // Check if user has scrolled near the bottom (within 200px)
            const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
            
            // Load more if near bottom, has more items, and not already loading
            if (isNearBottom && hasMoreRecommendations && !isLoadingMoreRecommendations && !isLoadingMoreRef.current) {
              loadMoreRecommendations();
            }
          }}
          scrollEventThrottle={400}
        >
          <View style={styles.emptyCart}>
            <Image 
              source={require('../../assets/icons/cart_empty.png')} 
              style={styles.emptyCartImage}
            />
            <Text style={styles.emptyTitle}>{t('cart.emptyTitle')}</Text>
            {/* <Text style={styles.emptySubtitle}>
              {t('cart.emptySubtitle')}
            </Text> */}
            <TouchableOpacity
              style={[styles.continueShoppingButton, {backgroundColor: COLORS.text.red, marginBottom: SPACING.sm}]}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.continueShoppingButtonText}>{t('cart.login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.continueShoppingButtonText}>{t('cart.continueShopping')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.helpCenter} >
            <View style={styles.helpCenterItem} >
              <View style={styles.helpCenterItemHeader} >
                <PackageIcon />
                <Text style={styles.helpCenterTitle}>{t('cart.helpCenter')}</Text>
              </View>
              <Text style={styles.helpCenterSubTitle}>{t('cart.helpCenterSubTitle')}</Text>
            </View>
            <View style={styles.helpCenterItem} >
              <View style={styles.helpCenterItemHeader} >
                <PrivacyIcon />
                <Text style={styles.helpCenterTitle}>{t('cart.helpCenter2')}</Text>
              </View>
              <Text style={styles.helpCenterSubTitle}>{t('cart.helpCenterSubTitle2')}</Text>
            </View>
          </View>
          
          {renderMoreToLove()}
          
          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          
          // Check if user has scrolled near the bottom (within 200px)
          const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          
          // Load more if near bottom, has more items, and not already loading
          if (isNearBottom && hasMoreRecommendations && !isLoadingMoreRecommendations && !isLoadingMoreRef.current) {
            loadMoreRecommendations();
          }
        }}
        scrollEventThrottle={400}
      >
        {renderGroupedCartItems()}
        
        {renderMoreToLove()}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {renderBottomBar()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
    width: 48
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  headerIcon: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  groupContainer: {
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  groupCheckbox: {
    marginRight: SPACING.md,
  },
  groupHeaderText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  sellerSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerCheckbox: {
    marginRight: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.text.red,
    borderColor: COLORS.text.red,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  sellerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  cartItem: {
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.lg,
    zIndex: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemCheckbox: {
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.gray[100],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productVariant: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  currentPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  quantityButton: {
    width: 28,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginHorizontal: SPACING.md,
    minWidth: 20,
    textAlign: 'center',
  },
  moreToLoveSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productsGridRow: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  loadingMoreContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  endOfListContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  productCardWrapper: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    marginBottom: SPACING.md,
  },
  bottomSpace: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#0000000D',
    ...SHADOWS.lg,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  allCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  allText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  totalPrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginRight: SPACING.md,
  },
  payButton: {
    backgroundColor: COLORS.text.red,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  payButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyCart: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#FFF4EF',
  },
  emptyCartImage: {
    width: 80,
    height: 80,
    marginVertical: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  continueShoppingButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    width: '85%',
  },
  continueShoppingButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  helpCenter: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.md,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: '#0000000D',
    gap: SPACING.sm,
  },
  helpCenterItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    backgroundColor: '#FAFAFA',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  helpCenterItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  helpCenterTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  helpCenterSubTitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  cartImage: {
    width: 160,
    height: 200,
  },
  welcomeText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  loginPrompt: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#FF0055',
    borderRadius: 9999,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  loginButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default CartScreen;