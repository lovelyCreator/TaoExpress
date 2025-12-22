import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePlatformStore } from '../../store/platformStore';
import { useAppSelector } from '../../store/hooks';
import { useGetWishlistMutation } from '../../hooks/useGetWishlistMutation';
import { useDeleteFromWishlistMutation } from '../../hooks/useDeleteFromWishlistMutation';
import { useWishlistStatus } from '../../hooks/useWishlistStatus';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Wishlist state and API
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasProcessedProductDetail, setHasProcessedProductDetail] = useState(false);
  const hasFetchedRef = useRef(false);
  
  const { refreshExternalIds } = useWishlistStatus();
  const { showToast } = useToast();
  
  // Cart context removed - stub functions
  const isAddToCartLoading = false;
  const addToCart = async (_product: any, _quantity?: number, _color?: string, _size?: string) => {
    // Cart API removed
  };
  
  // Get wishlist mutation
  const { mutate: fetchWishlist, isLoading: wishlistLoading } = useGetWishlistMutation({
    onSuccess: (data) => {
      // console.log('Wishlist fetched successfully:', data);
      if (data && data.wishlist) {
        // Map API response to Product format
        const mappedItems = data.wishlist.map((item: any) => ({
          id: item.externalId?.toString() || item._id?.toString() || '',
          externalId: item.externalId?.toString() || '', // Always use externalId from API
          offerId: item.externalId?.toString() || '',
          name: item.title || '',
          title: item.title || '',
          image: item.imageUrl || '',
          images: item.imageUrl ? [item.imageUrl] : [],
          price: item.price || 0,
          originalPrice: item.price || 0,
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
          isOnSale: false,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          orderCount: 0,
          source: '1688', // Default source
        }));
        setWishlistItems(mappedItems);
      } else {
        setWishlistItems([]);
      }
    },
    onError: (error) => {
      // console.error('Failed to fetch wishlist:', error);
      showToast(error || 'Failed to fetch wishlist', 'error');
    },
  });

  // Delete from wishlist mutation
  const { mutate: deleteFromWishlist } = useDeleteFromWishlistMutation({
    onSuccess: (data) => {
      // console.log('Product removed from wishlist successfully:', data);
      showToast('Product removed from wishlist', 'success');
      refreshExternalIds();
      // Refresh wishlist after deletion
      fetchWishlist();
    },
    onError: (error) => {
      // console.error('Failed to remove product from wishlist:', error);
      showToast(error || 'Failed to remove product from wishlist', 'error');
    },
  });

  const refreshWishlist = () => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  };

  const toggleWishlist = async (product: any) => {
    if (!isAuthenticated) {
      return;
    }
    
    // Always use externalId for deletion (not MongoDB _id)
    // In WishlistScreen, externalId comes from the API response item.externalId
    const externalId = 
      (product as any).externalId?.toString() ||
      (product as any).offerId?.toString() ||
      '';

    if (!externalId) {
      // console.error('No externalId found for product:', product);
      showToast('Invalid product ID', 'error');
      return;
    }

    // console.log('Deleting wishlist item with externalId:', externalId);
    // Remove from wishlist using externalId
    deleteFromWishlist(externalId);
  };
  
  // Get platform and locale
  const { selectedPlatform } = usePlatformStore();
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';
  
  // Product detail mutation removed - stub functions
  const productDetailData = null;
  const productDetailLoading = false;
  const productDetailError = false;
  const productDetailErrorData = null;
  const fetchProductDetail = (_productId: string) => {
    // Product detail API removed
  };
  const fetchProductDetailForNavigation = (productId: string, _source?: string, _country?: string) => {
    // Product detail API removed - navigate directly
    (navigation as any).navigate('ProductDetail', {
      productId: productId,
      source: _source || selectedPlatform,
      country: _country || (locale === 'zh' ? 'zh' : locale === 'ko' ? 'ko' : 'en'),
    });
  };

  // Fetch wishlist only once when component mounts
  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      // console.log('📱 WishlistScreen: Fetching wishlist on mount');
      fetchWishlist();
      hasFetchedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only depend on isAuthenticated, not fetchWishlist to prevent re-fetching

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wishlist</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          {/* <View style={styles.iconContainer}> */}
            <Image 
              source={require('../../assets/icons/wishlist.png')} 
              style={styles.wishlistImage}
              resizeMode="contain"
            />
          {/* </View> */}
          <Text style={styles.welcomeText}>Welcome to TodayMall!</Text>
          <Text style={styles.loginPrompt}>
            Login to access your wishlist
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => (navigation as any).navigate('Auth')}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    // Fetch product detail first, then navigate
    const productId = (product as any).offerId || (product as any).externalId || product.id;
    const source = (product as any).source || selectedPlatform || '1688';
    const country = locale === 'zh' ? 'zh' : locale === 'ko' ? 'ko' : 'en';
    fetchProductDetailForNavigation(productId, source, country);
  };

  const handleAddToCartClick = async (product: Product) => {
    // Reset processed flag for new product
    // setHasProcessedProductDetail(false);
    
    // Get product ID (offerId or externalId or id)
    const productId = (product as any).offerId || (product as any).externalId || product.id;
    // const source = (product as any).source || selectedPlatform || '1688';
    // const country = locale === 'zh' ? 'zh' : locale === 'ko' ? 'ko' : 'en';
    
    // if (!productId) {
    //   showToast('This product isn\'t available to add cart now', 'error');
    //   return;
    // }
    
    // Fetch product detail to get variation data
    // fetchProductDetail(productId, source, country);
  };
  
  // Handle product detail data when it's fetched (only process once per fetch)
  // Just add to cart directly without showing modal
  useEffect(() => {
    // Only proceed if product detail is fully loaded (not loading and has data)
    if (!productDetailLoading && productDetailData && !hasProcessedProductDetail) {
      // console.log('Wishlist: Product detail fetched', productDetailData);
      
      // Mark as processed to prevent infinite loop
      setHasProcessedProductDetail(true);
      
      // Add directly to cart without showing variation modal
      // console.log('Wishlist: Adding product to cart directly');
      handleAddToCart(productDetailData, 1);
    }
  }, [productDetailData, productDetailLoading, hasProcessedProductDetail]);
  
  // Handle error state (only show toast once per error)
  // Note: Error toast is already shown in onError callback, this is just a safety check
  useEffect(() => {
    if (productDetailError && !productDetailLoading && !hasProcessedProductDetail) {
      // console.error('Wishlist: Product detail fetch failed (useEffect)', productDetailError);
      // Toast already shown in onError callback, just mark as processed
      setHasProcessedProductDetail(true); // Mark as processed to prevent infinite loop
    }
  }, [productDetailError, productDetailLoading, hasProcessedProductDetail]);

  const handleAddToCart = async (product: Product, quantity: number = 1, selectedColor?: string, selectedSize?: string) => {
    try {
      await addToCart(product, quantity, selectedColor, selectedSize);
      // showToast('Product added to bag!', 'success');
      // Reset processed flag so next product can be added
      setHasProcessedProductDetail(false);
    } catch (error) {
      // showToast('Failed to add product to bag', 'error');
      // Reset processed flag on error so user can retry
      setHasProcessedProductDetail(false);
    }
  };



  const handleRemoveFromWishlist = async (product: any) => {
    if (!isAuthenticated) {
      // showToast('Please login to manage wishlist', 'warning');
      return;
    }
    
    try {
      toggleWishlist(product);
      // showToast('Item removed from wishlist', 'success');
    } catch (error) {
      // showToast('Failed to remove item from wishlist', 'error');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.black} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>WishList</Text>
      <TouchableOpacity 
        style={styles.cartButton}
        onPress={() => (navigation as any).navigate('Cart')}
      >
        <Ionicons name="cart-outline" size={20} color={COLORS.black} />
      </TouchableOpacity>
    </View>
  );

  const renderActionBar = () => {
    return null; // Remove action bar for cleaner design
  };

  const renderProductItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.productCard}>
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          <Image 
            source={{ uri: item.image || item.imageUrl }} 
            style={styles.productImage}
          />
        </TouchableOpacity>
        
        <View style={styles.productInfo}>
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name || item.title}
            </Text>
          </TouchableOpacity>
          <Text style={styles.productPrice}>¥{item.price?.toFixed(2) || '0.00'}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(item)}
        >
          <Ionicons name="close" size={20} color={COLORS.black} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCartClick(item)}
        >
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={16} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.calendarIcon}>
          <Image source={require('../../assets/icons/wishlist.png')} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>Nothing in Wishlist</Text>
      <Text style={styles.emptySubtitle}>
        Tap start exploring button to start save your favorite items
      </Text>
      <TouchableOpacity
        style={styles.startExploringButton}
        onPress={() => navigation.navigate('Main' as never)}
      >
        <Text style={styles.startExploringButtonText}>Start Exploring</Text>
      </TouchableOpacity>
    </View>
  );

  // Only show full-screen loading when wishlist data is loading, not when adding to cart
  if (wishlistLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderActionBar()}
      
      {wishlistItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => (item && item.id ? item.id.toString() : `wishlist-item-${index}`)}
          style={styles.productsList}
          contentContainerStyle={styles.productsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      
      {/* Variation Selection Modal removed - adding to cart directly without modal */}
      
      {/* Loading indicator when fetching product detail */}
      {productDetailLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    paddingTop: SPACING['2xl'],
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  productsList: {
    flex: 1,
  },
  productsListContent: {
    padding: SPACING.lg,
  },
  productCard: {
    position: 'relative',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[200],
    marginRight: SPACING.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.red,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
  },
  cartIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  calendarIcon: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  startExploringButton: {
    backgroundColor: COLORS.black,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  startExploringButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  wishlistImage: {
    width: 160,
    height: 200,
  },
  welcomeText: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  loginPrompt: {
    fontSize: FONTS.sizes.md,
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
  placeholder: {
    width: 40,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default WishlistScreen;