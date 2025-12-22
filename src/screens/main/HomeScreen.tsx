import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect, Mask, Circle } from 'react-native-svg';

// Create animated icon component
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { RootStackParamList, Product, NewInProduct, Story } from '../../types';

import { ProductCard, PlatformMenu, SearchButton, NotificationBadge, ImagePickerModal } from '../../components';
import { usePlatformStore } from '../../store/platformStore';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';
import HeadsetMicIcon from '../../assets/icons/HeadsetMicIcon';
import { useNewInProductsMutation } from '../../hooks/useNewInProductsMutation';
import { useRecommendationsMutation } from '../../hooks/useRecommendationsMutation';
import { useWishlistStatus } from '../../hooks/useWishlistStatus';
import { useAddToWishlistMutation } from '../../hooks/useAddToWishlistMutation';
import { useDeleteFromWishlistMutation } from '../../hooks/useDeleteFromWishlistMutation';
import { useSocket } from '../../context/SocketContext';
import { inquiryApi } from '../../services/inquiryApi';
import { useDefaultCategoriesMutation } from '../../hooks/useDefaultCategoriesMutation';

const { width } = Dimensions.get('window');
// New In card sizing: 3 items per line, image should be less than 1/3 of mobile width
// Calculate: (width - left padding - right padding - 2 gaps) / 3
// Using smaller padding and gaps to ensure 3 items fit
const pagePadding = SPACING.sm * 2; // Left + right padding
const gaps = SPACING.xs * 2; // 2 gaps between 3 items
const NEW_IN_CARD_WIDTH = Math.floor((width - pagePadding - gaps) / 3);
const NEW_IN_CARD_HEIGHT = Math.floor(NEW_IN_CARD_WIDTH * 1.55);
const GRID_CARD_WIDTH = (width - SPACING.md * 2 - SPACING.md) / 2;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const { user, isGuest } = useAuth();
  const { showToast } = useToast();
  
  // Use wishlist status hook to check if products are liked based on external IDs
  const { isProductLiked, refreshExternalIds, addExternalId, removeExternalId } = useWishlistStatus();
  
  // Get locale and platform
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';
  const { selectedPlatform, setSelectedPlatform } = usePlatformStore();
  
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
      // Immediately update external IDs to update heart icon color
      await refreshExternalIds();
    },
    onError: (error) => {
      showToast(error || 'Failed to remove product from wishlist', 'error');
    },
  });
  
  // Toggle wishlist function
  const toggleWishlist = async (product: any) => {
    if (!user || isGuest) {
      showToast(t('home.pleaseLogin') || 'Please login first', 'warning');
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
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [newInGridProducts, setNewInGridProducts] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { unreadCount: socketUnreadCount, onUnreadCountUpdated } = useSocket(); // Get total unread count from socket context
  const [unreadCount, setUnreadCount] = useState(0); // Local state for unread count (from REST API)
  const [activeCategoryTab, setActiveCategoryTab] = useState('Woman');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  
  const platforms = ['1688', 'taobao', 'wsy', 'vip', 'vvic', 'myCompany'];
  
  // Fetch unread counts from REST API when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchUnreadCounts = async () => {
        try {
          const response = await inquiryApi.getUnreadCounts();
          if (response.success && response.data) {
            setUnreadCount(response.data.totalUnread);
            // Note: onUnreadCountUpdated is a callback registration function, not a direct update function
            // The socket context will handle updates via its own event listeners
          }
        } catch (error) {
          // Failed to fetch unread counts
        }
      };
      fetchUnreadCounts();
    }, [onUnreadCountUpdated])
  );
  
  // Update unread count from socket events (real-time updates)
  useEffect(() => {
    setUnreadCount(socketUnreadCount);
  }, [socketUnreadCount]);
  
  // Get categories for selected platform (using store instead)
  const getCompanyCategories = () => {
    // Mock data removed - using store instead
    return [];
  };
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [useMockData, setUseMockData] = useState(false); // Use API data instead of mock data
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);

  // Recommendations state for "More to Love"
  const [recommendationsProducts, setRecommendationsProducts] = useState<Product[]>([]);
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState(true);
  const [isLoadingMoreRecommendations, setIsLoadingMoreRecommendations] = useState(false);
  const isLoadingMoreRef = useRef(false); // Ref to prevent multiple simultaneous calls
  const lastSuccessfulPageRef = useRef(1); // Track last successful page to revert on error
  const fetchRecommendationsRef = useRef<((country: string, outMemberId?: string, beginPage?: number, pageSize?: number, platform?: string) => Promise<void>) | null>(null);
  const hasInitialFetchRef = useRef<string | null>(null); // Track locale+user combination for initial fetch
  const lastLoadMoreCallRef = useRef(0); // Track last load more call time for debouncing
  const currentPageRef = useRef(1); // Track current page for pagination (avoids stale closure issues)
  const requestedPageRef = useRef(1); // Track the requested page
  
  // Default categories state
  const [defaultCategories, setDefaultCategories] = useState<any[]>([]);

  // Debug: Log when recommendationsProducts changes
  useEffect(() => {
    console.log('More to Love - recommendationsProducts state changed, count:', recommendationsProducts.length);
    if (recommendationsProducts.length > 0) {
      console.log('More to Love - First product in state:', recommendationsProducts[0]);
    }
  }, [recommendationsProducts]);

  // Recommendations API mutation
  const { 
    mutate: fetchRecommendations, 
    isLoading: recommendationsLoading, 
    isError: recommendationsError 
  } = useRecommendationsMutation({
    onSuccess: (data) => {
      setIsLoadingMoreRecommendations(false);
      isLoadingMoreRef.current = false; // Reset the ref flag
      
      console.log('More to Love API Response - Raw data:', JSON.stringify(data, null, 2));
      
      // Updated API structure: data.products (not data.recommendations)
      const productsArray = data?.products || [];
      const pagination = data?.pagination || {};
      
      console.log('More to Love API Response - products count:', productsArray.length);
      console.log('More to Love API Response - pagination:', pagination);
      console.log('More to Love API Response - First item sample:', productsArray[0]);
      
      if (productsArray.length > 0) {
        console.log('More to Love - Processing', productsArray.length, 'products');
        
        // Use pagination info from API response
        const currentPageFromData = pagination.page || requestedPageRef.current;
        const pageSize = pagination.pageSize || 20;
        const total = pagination.total || 0;
        const totalPages = pagination.totalPages || 0;
        
        // Simple rule: If we got a FULL page (20 items), always try to load next page
        // Only stop if we got LESS than a full page (meaning we've reached the end)
        // This matches the behavior before the API update
        const hasMore = productsArray.length >= pageSize;
        
        console.log('More to Love - Pagination decision:', {
          page: currentPageFromData,
          pageSize,
          productsReceived: productsArray.length,
          hasMore,
          apiHasNext: pagination.hasNext,
          total,
          totalPages
        });
        
        console.log('More to Love - Pagination check:', {
          page: currentPageFromData,
          pageSize,
          total,
          totalPages,
          hasNext: pagination.hasNext,
          calculatedHasMore: hasMore,
          productsReceived: productsArray.length
        });
        
        setHasMoreRecommendations(hasMore);
        
        // Map API response to Product format (updated to match actual API structure)
        const mappedProducts = productsArray.map((item: any): Product => {
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
          (productData as any).source = selectedPlatform;
          
          return productData;
        });
        
        console.log('More to Love Products - MappedProducts count:', mappedProducts.length);
        console.log('More to Love Products - First product sample:', mappedProducts[0]);
        
        // Update currentPageRef to match the page we just received
        currentPageRef.current = currentPageFromData;
        
        // If it's the first page, replace products, otherwise append
        if (currentPageFromData === 1) {
          console.log('More to Love - Setting page 1 products, count:', mappedProducts.length);
          // Use functional update to ensure we're setting the correct state
          setRecommendationsProducts(() => {
            console.log('More to Love - State setter called with products:', mappedProducts.length);
            return mappedProducts;
          });
          lastSuccessfulPageRef.current = 1; // Update last successful page
          
          // Verify state was set (this will log on next render)
          setTimeout(() => {
            console.log('More to Love - State verification (after setState):', mappedProducts.length, 'products');
            console.log('More to Love - Total products at first page:', recommendationsProducts.length);
          }, 100);
        } else {
          console.log(`More to Love - Appending page ${currentPageFromData} products, count:`, mappedProducts.length);
          setRecommendationsProducts(prev => {
            const newProducts = [...prev, ...mappedProducts];
            console.log('More to Love - Total products after append:', newProducts.length);
            return newProducts;
          });
          lastSuccessfulPageRef.current = currentPageFromData; // Update last successful page
          console.log('More to Love - Total products after append:', recommendationsProducts.length);
        }
      } else {
        console.warn('More to Love - Invalid or empty data structure. Data:', data);
        console.warn('More to Love - productsArray length:', productsArray.length);
      }
    },
    onError: (error) => {
      setIsLoadingMoreRecommendations(false);
      isLoadingMoreRef.current = false; // Reset the ref flag on error
      // Reset page number to last successful page on error to prevent incrementing on failures
      setRecommendationsPage(lastSuccessfulPageRef.current);
      // Set hasMoreRecommendations to false to prevent further attempts
      setHasMoreRecommendations(false);
    },
  });

  // Store fetchRecommendations in ref to prevent dependency issues
  // Use useLayoutEffect to update ref synchronously before other effects run
  useLayoutEffect(() => {
    fetchRecommendationsRef.current = fetchRecommendations;
  }, [fetchRecommendations]);
  const recommendationsHasMore = false;
  const [isScrolled, setIsScrolled] = useState(false); // Track if scrolled past threshold
  
  // Update selected category when platform changes
  useEffect(() => {
    // Reset to "All" when platform changes
    setSelectedCategory('all');
  }, [selectedPlatform]);
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const SCROLL_THRESHOLD = 5; // Very fast animated color change
  
  // State for scroll to top button
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollToTopOpacity = useRef(new Animated.Value(0)).current;
  
  // State for new "New In" products
  const [newInProducts, setNewInProducts] = useState<any[]>([]);
  const [currentNewInPage, setCurrentNewInPage] = useState(0);
  const newInScrollRef = useRef<ScrollView>(null);
  
  // Animation values for new in products
  const newInFadeAnim = useRef(new Animated.Value(0)).current;
  const newInScaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // New In Products API mutation
  const { 
    mutate: fetchNewInProducts, 
    isLoading: newInLoading, 
    isError: newInError 
  } = useNewInProductsMutation({
    onSuccess: (data) => {
      if (data && data.products && Array.isArray(data.products)) {
        // Map API response to product format and take only first 9 items
        const mappedProducts = data.products
          .slice(0, 9) // Extract only 9 items
          .map((product: any) => {
            // Use promotionPrice if available and hasPromotion is true, otherwise use price
            const currentPrice = product.hasPromotion && product.promotionPrice 
              ? parseFloat(product.promotionPrice)
              : parseFloat(product.price || product.dropshipPrice || 0);
            const originalPrice = parseFloat(product.originalPrice || product.price || 0);
            // Calculate discount: if originalPrice > currentPrice, show discount
            const discount = originalPrice > currentPrice && originalPrice > 0
              ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
              : 0;
            
            return {
              id: product.externalId?.toString() || product._id?.toString() || '',
              externalId: product.externalId?.toString() || '', // Ensure externalId is preserved
              offerId: product.externalId?.toString() || '', // Also set offerId for compatibility
              name: product.title || product.titleOriginal || '',
              image: product.image || '',
              price: currentPrice,
              originalPrice: originalPrice,
              discount: discount,
              rating: product.rating || 0,
              ratingCount: product.sales || 0,
              orderCount: product.sales || 0,
              source: product.platform || selectedPlatform,
            };
          });
        setNewInProducts(mappedProducts);
      }
    },
    onError: (error) => {
      showToast(error || t('home.loading') || 'Failed to load new products', 'error');
    },
  });

  // Default categories API mutation
  const { 
    mutate: fetchDefaultCategories, 
    isLoading: isLoadingCategories 
  } = useDefaultCategoriesMutation({
    onSuccess: (data) => {
      if (data && data.categories && Array.isArray(data.categories)) {
        setDefaultCategories(data.categories);
      }
    },
    onError: (error) => {
      // Failed to fetch default categories
    },
  });
  
  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Map language codes to flag emojis
  const getLanguageFlag = (locale: string) => {
    const flags: { [key: string]: string } = {
      'en': '🇺🇸',
      'ko': '🇰🇷',
      'zh': '🇨🇳',
    };
    return flags[locale] || '🇺🇸';
  };

  const isFetchingProductDetail = false;

  // Helper function to navigate to product detail
  const navigateToProductDetail = async (
    productId: string | number,
    source: string = selectedPlatform,
    country: string = locale
  ) => {
    // Navigate directly without fetching product detail
    navigation.navigate('ProductDetail', {
      productId: productId.toString(),
      source: source,
      country: country,
    });
  };
  // Helper function to filter mock products by company and category
  const getFilteredMockProducts = (productType: 'newIn' | 'trending' | 'forYou') => {
    // Mock data removed - API removed
    return [];
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch new in products when platform or locale changes
  useEffect(() => {
    if (selectedPlatform && locale) {
      // For Taobao, still use 1688 API for "New In" products
      const platformForNewIn = selectedPlatform === 'taobao' ? '1688' : selectedPlatform;
      fetchNewInProducts(platformForNewIn, locale);
    }
  }, [selectedPlatform, locale]);

  // Fetch default categories when platform changes
  useEffect(() => {
    if (selectedPlatform) {
      fetchDefaultCategories(selectedPlatform, true);
    }
  }, [selectedPlatform]);

  // Fetch recommendations when locale, user, or platform changes (only once per change)
  useEffect(() => {
    if (locale && fetchRecommendationsRef.current) {
      const outMemberId = user?.id?.toString() || 'dferg0001';
      const platform = selectedPlatform || '1688';
      const fetchKey = `${locale}-${outMemberId}-${platform}`;
      
      // Only fetch if locale, user, or platform changed (prevent infinite loops)
      if (!hasInitialFetchRef.current || hasInitialFetchRef.current !== fetchKey) {
        hasInitialFetchRef.current = fetchKey;
        requestedPageRef.current = 1; // Track the requested page
        currentPageRef.current = 1; // Reset current page ref
        setRecommendationsPage(1);
        lastSuccessfulPageRef.current = 1; // Reset last successful page
        setHasMoreRecommendations(true);
        // Clear existing products BEFORE making the API call
        setRecommendationsProducts([]);
        // Use setTimeout to ensure state is cleared before API call
        setTimeout(() => {
          if (fetchRecommendationsRef.current) {
            fetchRecommendationsRef.current(locale, outMemberId, 1, 20, platform);
          }
        }, 0);
      }
    }
    // Only depend on locale, user?.id, and selectedPlatform - not fetchRecommendationsRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, user?.id, selectedPlatform]);

  // Load more recommendations (infinite scroll) - only called at end of scroll
  const loadMoreRecommendations = useCallback(() => {
    // Use refs to get current values (avoid stale closure)
    const currentHasMore = hasMoreRecommendations;
    const currentIsLoading = isLoadingMoreRef.current || isLoadingMoreRecommendations;
    
    // Prevent multiple simultaneous calls
    if (currentIsLoading || !currentHasMore || !locale || !fetchRecommendationsRef.current) {
      console.log('More to Love - Cannot load more:', {
        currentIsLoading,
        currentHasMore,
        locale: !!locale,
        hasFetchFn: !!fetchRecommendationsRef.current
      });
      return;
    }
    
    // Debounce: prevent calls within 500ms of each other (reduced from 1000ms)
    const now = Date.now();
    const timeSinceLastCall = now - lastLoadMoreCallRef.current;
    const DEBOUNCE_MS = 500; // Minimum 500ms between calls
    
    if (timeSinceLastCall < DEBOUNCE_MS) {
      console.log('More to Love - Debouncing load more call, will retry after', DEBOUNCE_MS - timeSinceLastCall, 'ms');
      // Schedule a retry after the debounce period
      setTimeout(() => {
        // Check again after debounce period
        if (!isLoadingMoreRef.current && hasMoreRecommendations && !isLoadingMoreRecommendations) {
          loadMoreRecommendations();
        }
      }, DEBOUNCE_MS - timeSinceLastCall);
      return;
    }
    
    // Calculate next page number from current page ref
    const nextPage = currentPageRef.current + 1;
    console.log('More to Love - Loading page', nextPage, 'from current page', currentPageRef.current);
    
    // Update refs and state BEFORE making the API call
    lastLoadMoreCallRef.current = now;
    isLoadingMoreRef.current = true;
    requestedPageRef.current = nextPage; // Track the requested page
    setIsLoadingMoreRecommendations(true);
    setRecommendationsPage(nextPage);
    
    // Use user ID if available, otherwise use default 'dferg0001'
    const outMemberId = user?.id?.toString() || 'dferg0001';
    const platform = selectedPlatform || '1688';
    
    console.log('More to Love - Calling API with:', {
      locale,
      outMemberId,
      beginPage: nextPage,
      pageSize: 20,
      platform
    });
    
    // Call API with the next page number
    fetchRecommendationsRef.current(locale, outMemberId, nextPage, 20, platform);
  }, [hasMoreRecommendations, isLoadingMoreRecommendations, locale, user?.id, selectedPlatform]);

  // Auto-scroll new in products (3 items per page, longer interval than brand)
  useEffect(() => {
    if (newInProducts.length === 0) return;
    
    const itemsPerPage = 3;
    const totalPages = Math.ceil(newInProducts.length / itemsPerPage);
    if (totalPages <= 1) return; // No need to scroll if only one page
    
    const interval = setInterval(() => {
      setCurrentNewInPage((prevPage) => {
        const nextPage = (prevPage + 1) % totalPages;
        
        // Scroll to the next page (full screen width for each page)
        newInScrollRef.current?.scrollTo({
          x: nextPage * width,
          animated: true,
        });
        
        return nextPage;
      });
    }, 5000); // 5 seconds (longer than brand's 3 seconds)

    return () => clearInterval(interval);
  }, [newInProducts.length]);

  const loadData = async () => {
    try {
      // Set initial loading state
      if (initialLoading) {
        setLoading(true);
      }
      
      // Set empty stories for now
      setStories([]);
    } catch (error) {
      // Error loading home data
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleProductPress = async (product: Product) => {
    // For "more to love" products, use offerId if available
    const offerId = (product as any).offerId;
    const productIdToUse = offerId || product.id;
    // Get source from product data, fallback to selectedPlatform
    const source = (product as any).source || selectedPlatform || '1688';
    await navigateToProductDetail(productIdToUse, source, locale);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImagePickerModalVisible(false);
      navigation.navigate('ImageSearch', { imageUri: result.assets[0].uri });
    }
  };

  const handleChooseFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImagePickerModalVisible(false);
      navigation.navigate('ImageSearch', { imageUri: result.assets[0].uri });
    }
  };

  // const handleAddToCart = (product: Product) => {
  //   // For home screen items, variation ID is 0
  //   // addToCart(product, 1, undefined, undefined, 0);
  // };

  const handleNewInProductPress = async (product: any) => {
    // For new in products, use externalId or id for navigation
    const productId = product.externalId || product.id?.toString() || product._id || '';
    const productPlatform = product.source || product.platform || selectedPlatform;
    await navigateToProductDetail(productId, productPlatform, locale);
  };

  const handleImageSearch = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera and photo library permissions to use image search.');
      return;
    }

    setImagePickerModalVisible(true);
  };


  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" />
          {/* Top Row: Menu Button - Logo (Centered) - Notification Icon */}
          <View style={styles.headerTop}>
            <View style={styles.menuButtonContainer}>
              <PlatformMenu
                platforms={platforms}
                selectedPlatform={selectedPlatform}
                onSelectPlatform={setSelectedPlatform}
                getLabel={(platform) => platform.toUpperCase()}
                textColor={COLORS.text.primary}
                iconColor={COLORS.text.primary}
              />
            </View>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/icons/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                // style={styles.headerIcon}
                onPress={() => navigation.navigate('LanguageSettings' as never)}
              >
                <Text style={styles.flagText}>{getLanguageFlag(locale)}</Text>
              </TouchableOpacity>
              <NotificationBadge
                customIcon={<HeadsetMicIcon width={24} height={24} color={COLORS.text.primary} />}
                count={unreadCount}
                badgeColor={COLORS.red}
                onPress={() => {
                  navigation.navigate('CustomerService' as never);
                }}
              />
            </View>
          </View>
          {/* Search Button Row */}
          <View style={styles.searchButtonContainer}>
            <SearchButton
              placeholder={t('category.searchPlaceholder') || 'Search products...'}
              onPress={() => navigation.navigate('Search' as never)}
              onCameraPress={handleImageSearch}
              style={styles.searchButtonStyle}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderCategories = () => {
    if (isLoadingCategories) {
      return (
        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesLoadingText}>{t('home.loading') || 'Loading...'}</Text>
        </View>
      );
    }

    if (!defaultCategories || defaultCategories.length === 0) {
      return null;
    }

    return (
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {defaultCategories.map((category) => {
            const categoryName = category.name?.[locale] || category.name?.en || category.name || 'Category';
            return (
              <TouchableOpacity
                key={category._id || category.externalId}
                style={styles.categoryItem}
                onPress={() => {
                  // Navigate to SubCategory screen with category info
                  navigation.navigate('SubCategory', {
                    categoryName: categoryName,
                    categoryId: category._id || category.externalId,
                    subcategories: category.children || [],
                  });
                }}
              >
                <Text style={styles.categoryText}>{categoryName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Store category tab layouts for auto-scroll
  const categoryTabLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});
  const categoryScrollViewWidth = useRef(0);

  const renderNewInCards = () => {
    // Add a safety check to ensure products is an array
    if (!Array.isArray(newInProducts) || newInProducts.length === 0) {
      if (newInLoading) {
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.newIn')}</Text>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('home.loading')}</Text>
            </View>
          </View>
        );
      }
      return null;
    }
    
    // Group products into pages of 3 items each
    const itemsPerPage = 3;
    const pages: any[][] = [];
    for (let i = 0; i < newInProducts.length; i += itemsPerPage) {
      pages.push(newInProducts.slice(i, i + itemsPerPage));
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.newIn')}</Text>
        <Animated.View
          style={{
            opacity: newInFadeAnim,
            transform: [{ scale: newInScaleAnim }],
          }}
        >
          <ScrollView 
            ref={newInScrollRef}
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newInContainer}
            onMomentumScrollEnd={(event) => {
              const scrollX = event.nativeEvent.contentOffset.x;
              const pageWidth = width;
              const page = Math.round(scrollX / pageWidth);
              setCurrentNewInPage(page);
            }}
            scrollEventThrottle={16}
          >
          {pages.map((pageProducts, pageIndex) => (
            <View key={`page-${pageIndex}`} style={styles.newInPage}>
              {pageProducts.map((product: any) => {
                // Use discount already calculated in mapping
                const price = product.price || 0;
                const originalPrice = product.originalPrice || price;
                const discount = product.discount || 0;
                
                // Convert to Product type
                const productData: Product = {
                  id: product.id?.toString() || product.externalId?.toString() || '',
                  externalId: product.externalId?.toString() || product.id?.toString() || '',
                  offerId: product.externalId?.toString() || product.id?.toString() || '',
                  name: product.name || '',
                  image: product.image || '',
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
                  rating: product.rating || 0,
                  reviewCount: product.ratingCount || 0,
                  rating_count: product.ratingCount || 0,
                  inStock: true,
                  stockCount: 0,
                  tags: [],
                  isNew: true,
                  isFeatured: false,
                  isOnSale: discount > 0,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  orderCount: product.orderCount || 0,
                };
                
                // Preserve externalId and source for navigation
                if (product.externalId) {
                  (productData as any).offerId = product.externalId;
                }
                (productData as any).source = product.source || selectedPlatform;
                
                const handleLike = async () => {
                  if (!user || isGuest) {
                    alert(t('home.pleaseLogin'));
                    return;
                  }
                  try {
                    await toggleWishlist(productData);
                  } catch (error) {
                    // Error toggling wishlist
                  }
                };
                
                return (
                  <View key={`newin-${product.id || pageIndex}`} style={styles.newInCardWrapper}>
                    <TouchableOpacity
                      style={styles.newInCard}
                      onPress={() => handleNewInProductPress(product)}
                    >
                      <Image
                        source={{ uri: product.image }}
                        style={styles.newInImage}
                        resizeMode="cover"
                      />
                      {discount > 0 && (
                        <View style={styles.newInDiscountBadge}>
                          <Text style={styles.newInDiscountText}>-{discount}%</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.newInLikeButton}
                        onPress={handleLike}
                      >
                        <Ionicons
                          name={isProductLiked(productData) ? 'heart' : 'heart-outline'}
                          size={20}
                          color={isProductLiked(productData) ? COLORS.red : COLORS.white}
                        />
                      </TouchableOpacity>
                      <View style={styles.newInInfo}>
                        <Text style={styles.newInName} numberOfLines={2}>
                          {product.name}
                        </Text>
                        <View style={styles.newInPriceContainer}>
                          {originalPrice > price && (
                            <Text style={styles.newInOriginalPrice}>${originalPrice.toFixed(2)}</Text>
                          )}
                          <Text style={styles.newInPrice}>${price.toFixed(2)}</Text>
                        </View>
                        {product.rating > 0 && (
                          <View style={styles.newInRating}>
                            <Ionicons name="star" size={12} color={COLORS.warning} />
                            <Text style={styles.newInRatingText}>
                              {product.rating.toFixed(1)} ({product.ratingCount || 0})
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
          </ScrollView>
        </Animated.View>
      </View>
    );
  };

  // Brand images for auto-scrolling carousel
  const brandImages = [
    "https://res.cloudinary.com/dkdt9sum4/image/upload/v1765268306/vitaly-gariev-mYFWPgZqz0E-unsplash_wu2lva.jpg",
    "https://res.cloudinary.com/dkdt9sum4/image/upload/v1765268305/rifki-kurniawan-PY2vX1apH3U-unsplash_qd3bf0.jpg",
    "https://res.cloudinary.com/dkdt9sum4/image/upload/v1765268305/freestocks-_3Q3tsJ01nc-unsplash_njtfqm.jpg",
    "https://res.cloudinary.com/dkdt9sum4/image/upload/v1765268305/shutter-speed-BQ9usyzHx_w-unsplash_yzdqip.jpg",
  ];

  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const brandScrollRef = useRef<ScrollView>(null);

  // Auto-scroll brand images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBrandIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % brandImages.length;
        
        // Scroll to the next image
        brandScrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        
        return nextIndex;
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const renderBrandCarousel = () => (
    <View style={styles.brandCarouselContainer}>
      <ScrollView
        ref={brandScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentBrandIndex(newIndex);
        }}
        scrollEventThrottle={16}
      >
        {brandImages.map((imageUrl, index) => (
          <View key={`brand-${index}`} style={styles.brandSlide}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.brandImage}
              resizeMode="cover"
            />
            {/* Pagination dots inside image */}
            <View style={styles.brandPagination}>
              {brandImages.map((_, dotIndex) => (
                <View
                  key={`dot-${dotIndex}`}
                  style={[
                    styles.brandDot,
                    currentBrandIndex === dotIndex && styles.brandDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.eventIcons}>
        <Image source={require('../../assets/icons/todayevent.png')} style={styles.eventIcon} />
        <Image source={require('../../assets/icons/coins.png')} style={styles.eventIcon} />
        <Image source={require('../../assets/icons/live_on.png')} style={styles.eventIcon} />
      </View>
    </View>
  );

  const renderPromoCards = () => {
    return (
      <View style={styles.promoCardsContainer}>
        {/* Live On Card */}
        <TouchableOpacity style={styles.promoCard} activeOpacity={0.9}>
          <Image
            source={require('../../assets/icons/live_on_bg.jpg')}
            style={styles.promoCardBackground}
            resizeMode="cover"
          />
          {/* Radial gradient overlay effect - Blue */}
          <View style={styles.promoCardGradientContainer}>
            <Svg width={width - SPACING.md * 2} height={280} style={StyleSheet.absoluteFillObject}>
              <Defs>
                <SvgRadialGradient id="redGradient" cx="20%" cy="25%" r="80%">
                  <Stop offset="0%" stopColor="#0048FF" stopOpacity="0" />
                  <Stop offset="30%" stopColor="#0048FF" stopOpacity="0.2" />
                  <Stop offset="60%" stopColor="#0048FF" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#0048FF" stopOpacity="0.8" />
                </SvgRadialGradient>
                <Mask id="redMask">
                  <Rect width="100%" height="100%" fill="white" />
                  <Rect 
                    x={SPACING.md} 
                    y={60} 
                    width={width - SPACING.md * 4} 
                    height={160} 
                    rx={BORDER_RADIUS.md} 
                    fill="black" 
                  />
                </Mask>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#redGradient)" mask="url(#redMask)" />
            </Svg>
          </View>
          {/* Inner rectangle - just border */}
          <View style={styles.promoCardInner} />
          {/* Content in outer rectangle */}
          <View style={styles.promoCardContent}>
            {/* Top row: Title and 3 dots */}
            <View style={styles.promoCardHeader}>
              <Text style={styles.promoCardTitle}>Live On</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            {/* Bottom row: Text and arrow button */}
            <View style={styles.promoCardFooter}>
              <Text style={styles.promoCardText}>Up to 50% off ✅</Text>
              <TouchableOpacity style={styles.promoCardButton}>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Coupon Card */}
        <TouchableOpacity style={styles.promoCard} activeOpacity={0.9}>
          <Image
            source={require('../../assets/icons/coupon.jpg')}
            style={styles.promoCardBackground}
            resizeMode="cover"
          />
          {/* Radial gradient overlay effect - Red */}
          <View style={styles.promoCardGradientContainer}>
            <Svg width={width - SPACING.md * 2} height={280} style={StyleSheet.absoluteFillObject}>
              <Defs>
                <SvgRadialGradient id="redGradient" cx="20%" cy="25%" r="80%">
                  <Stop offset="0%" stopColor="#FB00FF" stopOpacity="0" />
                  <Stop offset="30%" stopColor="#FB00FF" stopOpacity="0" />
                  <Stop offset="60%" stopColor="#FB00FF" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#FB00FF" stopOpacity="0.6" />
                </SvgRadialGradient>
                <Mask id="redMask">
                  <Rect width="100%" height="100%" fill="white" />
                  <Rect 
                    x={SPACING.md} 
                    y={60} 
                    width={width - SPACING.md * 4} 
                    height={160} 
                    rx={BORDER_RADIUS.md} 
                    fill="black" 
                  />
                </Mask>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#redGradient)" mask="url(#redMask)" />
            </Svg>
          </View>
          {/* Inner rectangle - just border */}
          <View style={styles.promoCardInner} />
          {/* Content in outer rectangle */}
          <View style={styles.promoCardContent}>
            {/* Top row: Title and 3 dots */}
            <View style={styles.promoCardHeader}>
              <Text style={styles.promoCardTitle}>Coupon</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            {/* Bottom row: Text and arrow button */}
            <View style={styles.promoCardFooter}>
              <Text style={styles.promoCardText}>Get exclusive deals</Text>
              <TouchableOpacity style={styles.promoCardButton}>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTodaysItems = () => {
    // Mock product images - replace with actual product data
    const productImages1688 = [
      require('../../assets/icons/1688_1.png'),
      require('../../assets/icons/1688_2.png'),
      require('../../assets/icons/1688_3.png'),
      require('../../assets/icons/1688_4.png'),
    ];
    
    const productImagesTaobao = [
      require('../../assets/icons/taobao_1.png'),
      require('../../assets/icons/taobao_2.png'),
    ];

    return (
      <View style={styles.todaysItemsContainer}>
        <Text style={styles.todaysItemsTitle}>Today's Items</Text>
        <View style={styles.todaysItemsCards}>
          {/* 1688 Card */}
          <TouchableOpacity style={[styles.todaysItemCard, , {height: 470}]} activeOpacity={0.9}>
            <Image
              source={require('../../assets/icons/1688_back.jpg')}
              style={styles.todaysItemCardBackground}
              resizeMode="cover"
            />
            {/* Radial gradient overlay effect - Blue */}
            <View style={styles.todaysItemGradientContainer}>
              <Svg width={width - SPACING.md * 2} height={470} style={StyleSheet.absoluteFillObject}>
                <Defs>
                  <SvgRadialGradient id="todaysItemBlueGradient" cx="10%" cy="15%" r="60%">
                    <Stop offset="0%" stopColor="#0906BF" stopOpacity="0.1" />
                    <Stop offset="30%" stopColor="#0906BF" stopOpacity="0.3" />
                    <Stop offset="60%" stopColor="#0906BF" stopOpacity="0.6" />
                    <Stop offset="100%" stopColor="#0906BF" stopOpacity="0.8" />
                  </SvgRadialGradient>
                  <Mask id="todaysItemBlueMask">
                    <Rect width="100%" height="100%" fill="white" />
                  </Mask>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#todaysItemBlueGradient)" mask="url(#todaysItemBlueMask)" />
              </Svg>
            </View>
            {/* Product images grid - 2x2 for 1688 */}
            <View style={[styles.todaysItemImagesContainer, styles.todaysItemImagesGrid2x2]}>
              {productImages1688.map((image, index) => (
                <Image
                  key={index}
                  source={image}
                  style={[styles.todaysItemImage, styles.todaysItemImage2x2]}
                  resizeMode="cover"
                />
              ))}
            </View>
            {/* Content in outer rectangle */}
            <View style={styles.todaysItemContent}>
              <View style={styles.todaysItemHeader}>
                <Text style={styles.todaysItemTitle}>1688</Text>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <View style={styles.todaysItemFooter}>
                <Text style={styles.todaysItemText}>Shop now</Text>
                <TouchableOpacity style={styles.todaysItemButton}>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Taobao Card */}
          <TouchableOpacity style={[styles.todaysItemCard, , {height: 300}]} activeOpacity={0.9}>
            <Image
              source={require('../../assets/icons/taobao_back.jpg')}
              style={styles.todaysItemCardBackground}
              resizeMode="cover"
            />
            {/* Radial gradient overlay effect - Red */}
            <View style={styles.todaysItemGradientContainer}>
              <Svg width={width - SPACING.md * 2} height={300} style={StyleSheet.absoluteFillObject}>
                <Defs>
                  <SvgRadialGradient id="todaysItemRedGradient" cx="10%" cy="15%" r="60%">
                    <Stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
                    <Stop offset="30%" stopColor="#000000" stopOpacity="0.3" />
                    <Stop offset="60%" stopColor="#DC1637" stopOpacity="0.5" />
                    <Stop offset="100%" stopColor="#DC1637" stopOpacity="0.8" />
                  </SvgRadialGradient>
                  <Mask id="todaysItemRedMask">
                    <Rect width="100%" height="100%" fill="white" />
                  </Mask>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#todaysItemRedGradient)" mask="url(#todaysItemRedMask)" />
              </Svg>
            </View>
            {/* Product images - 2 images for Taobao */}
            <View style={[styles.todaysItemImagesContainer, styles.todaysItemImagesRow]}>
              {productImagesTaobao.map((image, index) => (
                <Image
                  key={index}
                  source={image}
                  style={[styles.todaysItemImage, styles.todaysItemImageRow]}
                  resizeMode="cover"
                />
              ))}
            </View>
            {/* Content in outer rectangle */}
            <View style={styles.todaysItemContent}>
              <View style={styles.todaysItemHeader}>
                <Text style={styles.todaysItemTitle}>Taobao</Text>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <View style={styles.todaysItemFooter}>
                <Text style={styles.todaysItemText}>Shop now</Text>
                <TouchableOpacity style={styles.todaysItemButton}>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPopularCategories = () => {
    const popularCategories = [
      { id: '1', platform: '1688', name: '1688👔', categoryName: 'Fashion', image: require('../../assets/icons/1688.png'), color: "#FFF8F5" },
      { id: '2', platform: 'taobao', name: 'Taobao💄', categoryName: 'Beauty', image: require('../../assets/icons/taobao.png'), color: "#FFF6FF" },
      { id: '3', platform: 'vip', name: 'Vip🪀', categoryName: 'Toys', image: require('../../assets/icons/vip.png'), color: '#FFF8ED' },
      { id: '4', platform: 'vvic', name: 'VVIC🌵', categoryName: 'Garden', image: require('../../assets/icons/vvic.png'), color: '#F5FFF5'},
      { id: '5', platform: 'wsy', name: 'WSY👟', categoryName: 'Shoes', image: require('../../assets/icons/wsy.png'), color: '#F4F4F4' },
      { id: '6', platform: 'myCompany', name: 'Company mall🛋️', categoryName: 'Home', image: require('../../assets/icons/companymall.png'), color: '#F1FEFF' },
    ];

    // Calculate width for 3 items per row
    const itemWidth = (width - SPACING.md * 2 - SPACING.sm * 2) / 3;

    return (
      <View style={styles.section}>
        <View style={styles.popularCategoriesTitle}>
          <Text style={styles.popularText}>Popular</Text>
          <Text style={styles.categoriesText}>Categories</Text>
          <Text style={styles.fireIcon}>🔥</Text>
        </View>
        <View style={styles.popularCategoriesContainer}>
          {popularCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.popularCategoryItem, { width: itemWidth }]}
              onPress={() => {
                // Navigate to category or platform selection
                setSelectedPlatform(category.platform);
              }}
            >
              <View style={[styles.popularCategoryImageContainer, { backgroundColor: category.color }]}>
                <Image
                  source={category.image}
                  style={styles.popularCategoryImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.popularCategoryPlatform}>{category.name}</Text>
              <Text style={styles.popularCategoryName}>{category.categoryName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderTrendingProducts = () => {
    // Use new in products from API
    const productsToShow = useMockData 
      ? getFilteredMockProducts('newIn')
      : newInProducts;
    
    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.newIn')}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingProductsContainer}
        >
          {productsToShow.map((product: any) => {
            if (!product || !product.id) {
              return null;
            }
            
            // Parse variation data if it exists
            let price = product.price || 0;
            let productImage = product.image || '';
            
            // Convert to Product type for display
            const productData: Product = {
              id: product.id.toString(),
              name: product.name,
              image: productImage,
              externalId: product.externalId?.toString() || '',
              offerId: product.offerId?.toString() || '',
              price: price,
              originalPrice: product.originalPrice,
              discount: product.discount,
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
              rating: product.rating || 0,
              reviewCount: product.ratingCount || 0,
              rating_count: product.ratingCount || 0,
              inStock: true,
              stockCount: 0,
              tags: [],
              isNew: true,
              isFeatured: false,
              isOnSale: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              orderCount: 0,
            };
            
            const handleLike = async () => {
              if (!user || isGuest) {
                alert(t('home.pleaseLogin'));
                return;
              }
              try {
                await toggleWishlist(productData);
              } catch (error) {
                // Error toggling wishlist
              }
            };
            
            return (
              <ProductCard
                key={`newin-${product.id}`}
                product={productData}
                variant="newIn"
                onPress={() => handleNewInProductPress(product)}
                onLikePress={handleLike}
                isLiked={isProductLiked(productData)}
                showLikeButton={true}
                showDiscountBadge={true}
                showRating={true}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Memoize render item for better performance
  const renderMoreToLoveItem = useCallback(({ item: product, index }: { item: Product; index: number }) => {
            if (!product || !product.id) {
              return null;
            }
            
            const handleLike = async () => {
              if (!user || isGuest) {
                alert(t('home.pleaseLogin'));
                return;
              }
              try {
                await toggleWishlist(product);
              } catch (error) {
                // Error toggling wishlist
              }
            };
            return (
              <ProductCard
                key={`moretolove-${product.id || index}`}
                product={product}
                variant="moreToLove"
                onPress={() => handleProductPress(product)}
                onLikePress={handleLike}
                isLiked={isProductLiked(product)}
                showLikeButton={true}
                showDiscountBadge={true}
                showRating={true}
              />
            );
  }, [user, isGuest, toggleWishlist, handleProductPress, isProductLiked]);

  const renderMoreToLove = () => {
    // Use recommendations API data for "More to Love"
    const productsToDisplay = recommendationsProducts;
    // Show loading state if fetching
    if (recommendationsLoading && productsToDisplay.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.moreToLove')}</Text>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      );
    }
    
    // Show error state if there's an error
    if (recommendationsError && productsToDisplay.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.moreToLove')}</Text>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Failed to load recommendations</Text>
          </View>
        </View>
      );
    }
    
    if (!Array.isArray(productsToDisplay) || productsToDisplay.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.moreToLove')}</Text>
        <FlatList
          data={productsToDisplay}
          renderItem={renderMoreToLoveItem}
          keyExtractor={(item, index) => `moretolove-${item.id?.toString() || index}-${index}`}
          numColumns={2}
          scrollEnabled={false}
          nestedScrollEnabled={true}
          columnWrapperStyle={styles.newInGridContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          onEndReached={() => {
            // For nested FlatList with scrollEnabled={false}, onEndReached may not fire reliably
            // Rely on parent ScrollView scroll detection instead
            // This is kept as a backup but parent scroll detection is primary
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            <>
          {/* Loading indicator for pagination */}
          {isLoadingMoreRecommendations && (
            <View style={styles.loadingMoreContainer}>
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

  // Handle scroll event to detect when user reaches the end
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        // Safety check for event
        if (!event || !event.nativeEvent) return;
        
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        
        // Safety checks for scroll properties
        if (!layoutMeasurement || !contentOffset || !contentSize) return;
        
        // Show/hide scroll to top button based on scroll position
        const scrollPosition = contentOffset.y;
        
        // Update isScrolled state based on threshold
        if (scrollPosition > SCROLL_THRESHOLD && !isScrolled) {
          setIsScrolled(true);
        } else if (scrollPosition <= SCROLL_THRESHOLD && isScrolled) {
          setIsScrolled(false);
        }
        
        // Detect when user scrolls to the end for infinite scroll
        // Only trigger when actually at or very close to the bottom (within 200px for better UX)
        const paddingToBottom = 200;
        const scrollBottomPosition = layoutMeasurement.height + contentOffset.y;
        const isAtBottom = scrollBottomPosition >= contentSize.height - paddingToBottom;
        
        // Only load more if we're at the bottom, have more to load, and not already loading
        // Let loadMoreRecommendations handle debouncing internally
        if (isAtBottom && hasMoreRecommendations && !isLoadingMoreRecommendations && !isLoadingMoreRef.current) {
          console.log('More to Love - Scroll detected at bottom, calling loadMoreRecommendations...', {
            hasMoreRecommendations,
            isLoadingMoreRecommendations,
            isLoadingMoreRef: isLoadingMoreRef.current,
            currentPage: currentPageRef.current
          });
          loadMoreRecommendations();
        } else if (isAtBottom) {
          console.log('More to Love - At bottom but not loading:', {
            hasMoreRecommendations,
            isLoadingMoreRecommendations,
            isLoadingMoreRef: isLoadingMoreRef.current,
            isAtBottom,
            currentPage: currentPageRef.current
          });
        }
        
        if (scrollPosition > 300 && !showScrollToTop) {
          setShowScrollToTop(true);
          Animated.timing(scrollToTopOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else if (scrollPosition <= 300 && showScrollToTop) {
          Animated.timing(scrollToTopOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setShowScrollToTop(false));
        }
        
      }
    }
  );

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>{t('home.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fixedTopBars}>
        {renderHeader()}
        {renderCategories()}
        {/* {renderCategoryTabs()} */}
      </View>
      
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.contentWrapper}>
          {/* {renderQuickCategories()} */}
          {renderBrandCarousel()}
          {renderTrendingProducts()}
          {renderPopularCategories()}
          {renderPromoCards()}
          {renderTodaysItems()}
          {/* {renderNewInCards()} */}
          {renderMoreToLove()}
        </View>
      </Animated.ScrollView>
      
      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Animated.View
          style={[
            styles.scrollToTopButton,
            { opacity: scrollToTopOpacity }
          ]}
        >
          <TouchableOpacity
            onPress={scrollToTop}
            style={styles.scrollToTopTouchable}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-up" size={28} color={COLORS.text.primary} />
          </TouchableOpacity>
        </Animated.View>
      )}
      
      <ImagePickerModal
        visible={imagePickerModalVisible}
        onClose={() => setImagePickerModalVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackgroundFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350, // Shorter gradient coverage
    zIndex: 0,
  },
  gradientFill: {
    flex: 1,
  },
  scrollView: {
    // flex: 1,
    minHeight: '100%',
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  fixedTopBars: {
    backgroundColor: 'transparent',
    zIndex: 10,
    // marginBottom: -80,
  },
  headerPlaceholder: {
    backgroundColor: COLORS.white,
  },
  contentWrapper: {
    backgroundColor: 'transparent',
    // minHeight: '100%',
    marginBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
    marginTop: SPACING.md,
  },
  header: {
    zIndex: 10,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    paddingBottom: SPACING.sm,
  },
  headerContent: {
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  menuButtonContainer: {
    width: 80, // Fixed width to balance with right side
    alignItems: 'flex-start',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerPlatformMenu: {
    marginLeft: SPACING.md,
  },
  headerSpacer: {
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    padding: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    height: 36,
  },
  flagText: {
    fontSize: 24,
  },
  searchButtonContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  searchButtonStyle: {
    flex: 1,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
  },
  platformButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  categoryTabsContainer: {
    backgroundColor: 'transparent',
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    zIndex: 9,
  },
  categoryTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  categoryScrollView: {
    flex: 1,
  },
  categoryTabs: {
    paddingHorizontal: SPACING.sm,
  },
  categoryTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    // marginRight: SPACING.sm,
    position: 'relative',
  },
  categoryTabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '400',
  },
  activeCategoryTabText: {
    color: COLORS.white,
    fontWeight: '800',
  },
  categoryUnderline: {
    position: 'absolute',
    bottom: 0,
    left: SPACING.md,
    right: SPACING.md,
    height: 4,
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  quickCategoriesContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  quickCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  quickCategoryItem: {
    width: (width - SPACING.lg * 2 - SPACING.sm * 4) / 5,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickCategoryImage: {
    width: (width - SPACING.md * 2 - SPACING.sm * 4) / 5,
    height: (width - SPACING.md * 2 - SPACING.sm * 4) / 5,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  quickCategoryName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    backgroundColor: COLORS.background,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.smmd,
    textAlign: 'center',
  },
  newInContainer: {
    // No padding here, handled by page container
  },
  newInPage: {
    width: width,
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  newInCardWrapper: {
    width: NEW_IN_CARD_WIDTH,
    flexShrink: 0,
  },
  newInCard: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    position: 'relative',
  },
  newInImage: {
    width: '100%',
    height: NEW_IN_CARD_HEIGHT,
    borderRadius: 8,
  },
  newInDiscountBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.red,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newInDiscountText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  newInLikeButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newInInfo: {
    padding: SPACING.xs,
  },
  newInName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    minHeight: 36,
  },
  newInPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  newInPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  newInOriginalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  newInRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newInRatingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
  },
  newInOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // height: 48,
    paddingHorizontal: SPACING.md,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  newInTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '400',
    color: COLORS.text.primary,
  },
  newInTitleOverlay: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: COLORS.white,
  },
  newInPreviewRow: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  previewOuterCircle: {
    width: (width - SPACING.md * 2 - SPACING.sm * 2) / 4,
    height: (width - SPACING.md * 2 - SPACING.sm * 2) / 4,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
  },
  previewOuterCircleGray: {
    width: (width - SPACING.md * 2 - SPACING.sm * 2) / 4,
    height: (width - SPACING.md * 2 - SPACING.sm * 2) / 4,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
  },
  previewInnerCircle: {
    width: (width - SPACING.md * 3 - SPACING.sm * 5) / 4,
    height: (width - SPACING.md * 3 - SPACING.sm * 5) / 4,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInnerCircleGray: {
    width: (width - SPACING.md * 3 - SPACING.sm * 5) / 4,
    height: (width - SPACING.md * 3 - SPACING.sm * 5) / 4,
    borderRadius: 50,
    backgroundColor: COLORS.gray[50],
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  brandCarouselContainer: {
    backgroundColor: 'transparent',
    paddingBottom: SPACING.sm,
    position: 'relative',
  },
  brandSlide: {
    width: width,
    // paddingHorizontal: SPACING.md,
    position: 'relative',
  },
  brandImage: {
    width: width,
    height: 170,
    // borderRadius: BORDER_RADIUS.lg,
  },
  brandPagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: 4,
  },
  brandDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  eventIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  eventIcon: {
  },
  trendingProductsContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
   trendingProductCard: {
     width: GRID_CARD_WIDTH,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    // padding: SPACING.sm,
    // ...SHADOWS.md,
  },
  trendingImageWrap: { position: 'relative' },
   trendingProductImage: {
     width: GRID_CARD_WIDTH - SPACING.sm * 2,
     height: (GRID_CARD_WIDTH - SPACING.sm * 2) * 1.2,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    marginRight: 0,
  },
  discountBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  trendingHeartBtn: {
    position: 'absolute',
    right: 8,
    bottom: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  trendingHeartBtnActive: {
    position: 'absolute',
    right: 8,
    bottom: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor: COLORS.red,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  trendingProductInfo: {
    flex: 1,
  },
  trendingProductName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  trendingProductPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  trendingProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
   newInGridContainer: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
   },
   newInGridCard: {
     width: GRID_CARD_WIDTH,
     marginBottom: SPACING.md,
     backgroundColor: COLORS.white,
     borderRadius: 12,
   },
   newInGridImage: {
     width: GRID_CARD_WIDTH - SPACING.sm * 2,
     height: (GRID_CARD_WIDTH - SPACING.sm * 2) * 1.2,
     borderRadius: 8,
     marginBottom: SPACING.sm,
   },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  soldText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  playIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingMoreContainer: {
    width: '100%',
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  endOfListContainer: {
    width: '100%',
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfListText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '400',
  },

  scrollToTopButton: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 100,
    zIndex: 999,
  },
  scrollToTopTouchable: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    elevation: 8,
  },
  categoriesContainer: {
    paddingVertical: SPACING.xs,
    // paddingHorizontal: SPACING.md,
    backgroundColor: 'transparent',
  },
  categoriesScrollContent: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryItem: {
    backgroundColor: COLORS.white,
    marginRight: SPACING.sm,
  },
  categoryText: {
    fontSize: FONTS.sizes.smmd,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  categoriesLoadingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
  popularCategoriesTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  popularText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.red,
  },
  categoriesText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  fireIcon: {
    fontSize: FONTS.sizes.xl,
  },
  popularCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  popularCategoryImageContainer: {
    width: (width - SPACING.md * 4)/3,
    height: (width - SPACING.md * 4)/4,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularCategoryItem: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  popularCategoryImage: {
    width: (width - SPACING.md * 4)/6,
    height: (width - SPACING.md * 4)/6,
    resizeMode: 'contain',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  popularCategoryPlatform: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.red,
    marginBottom: SPACING.xs / 2,
    textAlign: 'center',
  },
  popularCategoryName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  promoCardsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  promoCard: {
    height: 280,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  promoCardBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  promoCardGradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  promoCardInner: {
    position: 'absolute',
    top: 60,
    left: '50%',
    marginLeft: -(width - SPACING.md * 4) / 2, // Half of width (240/2)
    width: width - SPACING.md * 4,
    height: 160,
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  promoCardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  promoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoCardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  promoCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#FFFFFF33',
  },
  promoCardText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    flex: 1,
  },
  promoCardButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    // backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  todaysItemsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  todaysItemsTitle: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  todaysItemsCards: {
    gap: SPACING.md,
  },
  todaysItemCard: {
    height: 240,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  todaysItemCardBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  todaysItemGradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  todaysItemImagesContainer: {
    position: 'absolute',
    top: 65,
    left: SPACING.md,
    right: SPACING.md,
    height: width - SPACING.md * 2,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  todaysItemImagesGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.smmd,
  },
  todaysItemImagesRow: {
    flexDirection: 'row',
    gap: SPACING.smmd,
  },
  todaysItemImage: {
    borderRadius: BORDER_RADIUS.lg,
  },
  todaysItemImage2x2: {
    width: (width - SPACING.md * 4 - SPACING.smmd) / 2,
    height: (width - SPACING.md * 4) / 2,
  },
  todaysItemImageRow: {
    flex: 1,
    height: (width - SPACING.md * 4) / 2,
  },
  todaysItemContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  todaysItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todaysItemTitle: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.white,
  },
  todaysItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF33',
  },
  todaysItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    flex: 1,
  },
  todaysItemButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    // backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
});

export default HomeScreen;