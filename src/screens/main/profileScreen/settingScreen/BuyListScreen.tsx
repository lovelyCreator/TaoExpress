import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../../../constants';
import { RootStackParamList, Product } from '../../../../types';
import { ProductCard } from '../../../../components';
import { OrderFilterModal } from '../../../../components';
import { useGetOrdersMutation } from '../../../../hooks/useGetOrdersMutation';
import { Order as ApiOrder } from '../../../../services/orderApi';
import { useToast } from '../../../../context/ToastContext';
import { useRecommendationsMutation } from '../../../../hooks/useRecommendationsMutation';
import { useWishlistStatus } from '../../../../hooks/useWishlistStatus';
import { useAddToWishlistMutation } from '../../../../hooks/useAddToWishlistMutation';
import { useDeleteFromWishlistMutation } from '../../../../hooks/useDeleteFromWishlistMutation';
import { useAuth } from '../../../../context/AuthContext';
import { usePlatformStore } from '../../../../store/platformStore';
import { useAppSelector } from '../../../../store/hooks';
import { translations } from '../../../../i18n/translations';
import { inquiryApi } from '../../../../services/inquiryApi';
import { useSocket } from '../../../../context/SocketContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../../constants';

type BuyListScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type BuyListScreenRouteProp = RouteProp<RootStackParamList, 'BuyList'>;

interface Order {
  id: string;
  orderId?: string; // Order ID from API
  orderNumber: string;
  date: string;
  status: 'category' | 'waiting' | 'end' | 'progressing';
  items: {
    productName: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  totalAmount: number;
  inquiryId?: string; // Inquiry ID if inquiry exists for this order
  unreadCount?: number; // Unread message count for this inquiry
}

// Map API order status to tab status
const mapOrderStatusToTab = (order: ApiOrder): 'category' | 'waiting' | 'end' | 'progressing' => {
  // Map based on progressStatus and orderStatus
  if (order.progressStatus === 'BUY_PAY_WAIT' || order.paymentStatus === 'pending') {
    return 'waiting';
  }
  if (order.orderStatus === 'completed' || order.shippingStatus === 'delivered') {
    return 'end';
  }
  if (order.shippingStatus === 'shipped' || order.warehouseStatus === 'warehoused') {
    return 'progressing';
  }
  return 'category';
};

const BuyListScreen = () => {
  const navigation = useNavigation<BuyListScreenNavigationProp>();
  const route = useRoute<BuyListScreenRouteProp>();
  const { showToast } = useToast();
  const { user, isGuest } = useAuth();
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';
  const { selectedPlatform } = usePlatformStore();
  const { isProductLiked } = useWishlistStatus();
  const { onMessageReceived, isConnected, connect } = useSocket();
  
  // Get initial tab from route params, default to 'category'
  const initialTab = route.params?.initialTab || 'category';
  const [activeTab, setActiveTab] = useState<'category' | 'waiting' | 'end' | 'progressing'>(initialTab);
  
  // Update active tab when route params change
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);
  const [unreadCounts, setUnreadCounts] = useState<{ [inquiryId: string]: number }>({}); // Track unread counts per inquiry
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<{ orderNumber: string; startDate: Date | null; endDate: Date | null }>({
    orderNumber: '',
    startDate: null,
    endDate: null,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const hasFetchedOrdersRef = useRef(false); // Track if orders have been fetched

  // Recommendations state for "More to Love" (same as HomeScreen)
  const [recommendationsProducts, setRecommendationsProducts] = useState<Product[]>([]);
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState(true);
  const [isLoadingMoreRecommendations, setIsLoadingMoreRecommendations] = useState(false);
  const isLoadingMoreRef = React.useRef(false);
  const lastSuccessfulPageRef = React.useRef(1);
  const lastLoadMoreCallRef = React.useRef(0); // Track last load more call time for debouncing
  const currentPageRef = React.useRef(1); // Track current page for pagination (avoids stale closure issues)

  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Add to wishlist mutation
  const { mutate: addToWishlist } = useAddToWishlistMutation({
    onSuccess: async (data) => {
      // console.log('Product added to wishlist successfully:', data);
      showToast('Product added to wishlist', 'success');
    },
    onError: (error) => {
      // console.error('Failed to add product to wishlist:', error);
      showToast(error || 'Failed to add product to wishlist', 'error');
    },
  });

  // Delete from wishlist mutation
  const { mutate: deleteFromWishlist } = useDeleteFromWishlistMutation({
    onSuccess: async (data) => {
      // console.log('Product removed from wishlist successfully:', data);
      showToast('Product removed from wishlist', 'success');
    },
    onError: (error) => {
      // console.error('Failed to remove product from wishlist:', error);
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
      deleteFromWishlist(externalId);
    } else {
      const imageUrl = product.image || product.images?.[0] || '';
      const price = product.price || 0;
      const title = product.name || product.title || '';

      if (!imageUrl || !title || price <= 0) {
        showToast('Invalid product data', 'error');
        return;
      }

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

  // Helper function to navigate to product detail
  const navigateToProductDetail = async (
    productId: string | number,
    source: string = selectedPlatform,
    country: string = locale
  ) => {
    navigation.navigate('ProductDetail', {
      productId: productId.toString(),
      source: source,
      country: country,
    });
  };

  const handleProductPress = async (product: Product) => {
    const offerId = (product as any).offerId;
    const productIdToUse = offerId || product.id;
    await navigateToProductDetail(productIdToUse, selectedPlatform, locale);
  };

  // Recommendations API mutation (same as HomeScreen)
  const { 
    mutate: fetchRecommendations, 
    isLoading: recommendationsLoading, 
    isError: recommendationsError 
  } = useRecommendationsMutation({
    onSuccess: (data) => {
      // console.log('Recommendations API success, data:', data);
      setIsLoadingMoreRecommendations(false);
      isLoadingMoreRef.current = false;
      
      // Updated API structure: data.products (not data.recommendations)
      const productsArray = data?.products || [];
      const pagination = data?.pagination || {};
      
      if (productsArray.length > 0) {
        // Use pagination info from API response
        const currentPageFromData = pagination.page || recommendationsPage;
        const pageSize = pagination.pageSize || 20;
        const total = pagination.total || 0;
        const totalPages = pagination.totalPages || 0;
        
        // Update currentPageRef to match the page we just received
        currentPageRef.current = currentPageFromData;
        
        // Simple rule: If we got a FULL page (20 items), always try to load next page
        // Only stop if we got LESS than a full page (meaning we've reached the end)
        // This matches the behavior before the API update
        const hasMore = productsArray.length >= pageSize;
        
        setHasMoreRecommendations(hasMore);
        
        // Map API response to Product format
        const mappedProducts = productsArray.map((item: any) => {
          const price = parseFloat(item.priceInfo?.price || item.priceInfo?.consignPrice || 0);
          const originalPrice = parseFloat(item.priceInfo?.consignPrice || item.priceInfo?.price || 0);
          const discount = originalPrice > price && originalPrice > 0
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;
          
          const productData: Product & { source?: string } = {
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
              joinedDate: new Date(),
            },
            rating: 0,
            rating_count: 0,
            reviewCount: 0,
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
            source: selectedPlatform,
          };
          
          return productData;
        });
        
        if (currentPageFromData === 1) {
          setRecommendationsProducts(mappedProducts);
          lastSuccessfulPageRef.current = 1;
        } else {
          setRecommendationsProducts(prev => [...prev, ...mappedProducts]);
          lastSuccessfulPageRef.current = currentPageFromData;
        }
      }
    },
    onError: (error) => {
      // console.error('Failed to fetch recommendations:', error);
      setIsLoadingMoreRecommendations(false);
      isLoadingMoreRef.current = false;
      setRecommendationsPage(lastSuccessfulPageRef.current);
      setHasMoreRecommendations(false);
    },
  });

  // Track if initial fetch has been done (prevent real-time updates)
  const hasInitialFetchRef = useRef<string | null>(null);

  // Load more recommendations (infinite scroll) - only called at end of scroll
  const loadMoreRecommendations = React.useCallback(() => {
    // Use refs to get current values (avoid stale closure)
    const currentHasMore = hasMoreRecommendations;
    const currentIsLoading = isLoadingMoreRef.current || isLoadingMoreRecommendations;
    
    // Prevent multiple simultaneous calls
    if (currentIsLoading || !currentHasMore || !locale || !fetchRecommendations) {
      return;
    }
    
    // Debounce: prevent calls within 500ms of each other (reduced from 1000ms)
    const now = Date.now();
    const timeSinceLastCall = now - lastLoadMoreCallRef.current;
    const DEBOUNCE_MS = 500; // Minimum 500ms between calls
    
    if (timeSinceLastCall < DEBOUNCE_MS) {
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
    
    // Update refs and state BEFORE making the API call
    lastLoadMoreCallRef.current = now;
    isLoadingMoreRef.current = true;
    setIsLoadingMoreRecommendations(true);
    setRecommendationsPage(nextPage);
    
    // Use user ID if available, otherwise use default 'dferg0001'
    const outMemberId = user?.id?.toString() || 'dferg0001';
    fetchRecommendations(locale, outMemberId, nextPage, 20, selectedPlatform || '1688');
  }, [hasMoreRecommendations, isLoadingMoreRecommendations, locale, user?.id, selectedPlatform, fetchRecommendations]);

  // Fetch recommendations only once on mount or when locale/user/platform changes (not real-time)
  useEffect(() => {
    if (locale) {
      const outMemberId = user?.id?.toString() || 'dferg0001';
      const fetchKey = `${locale}-${outMemberId}-${selectedPlatform || '1688'}`;
      
      // Only fetch if this is the first time or locale/user/platform changed
      if (!hasInitialFetchRef.current || hasInitialFetchRef.current !== fetchKey) {
        hasInitialFetchRef.current = fetchKey;
        currentPageRef.current = 1; // Reset current page ref
        setRecommendationsPage(1);
        lastSuccessfulPageRef.current = 1;
        setHasMoreRecommendations(true);
        setRecommendationsProducts([]);
        fetchRecommendations(locale, outMemberId, 1, 20, selectedPlatform || '1688');
      }
    }
  }, [locale, user?.id, selectedPlatform, fetchRecommendations]);

  // Get orders mutation
  const { mutate: getOrders, isLoading } = useGetOrdersMutation({
    onSuccess: async (data) => {
      // console.log('Orders fetched successfully:', data);
      
      // Check if data and orders exist
      if (!data || !data.orders || !Array.isArray(data.orders)) {
        // console.error('Invalid orders data:', data);
        setOrders([]);
        return;
      }
      
      const mappedOrders = data.orders.map((order) => ({
        id: order.id,
        orderId: order.id, // Use order.id as orderId for API calls
        orderNumber: order.orderNumber,
        date: new Date(order.createdAt).toISOString().split('T')[0],
        status: mapOrderStatusToTab(order),
        items: order.items.map((item) => ({
          productName: item.subjectTrans || item.subject,
          quantity: item.quantity,
          price: item.price,
          image: item.imageUrl,
        })),
        totalAmount: order.totalAmount,
      }));
      
      // Set orders first (even if inquiries fail)
      setOrders(mappedOrders);
      setHasMore(data.pagination?.page < data.pagination?.totalPages);
      
      // Fetch inquiries list and unread counts, then match with orders (non-blocking)
      try {
        // Fetch inquiries and unread counts in parallel
        const [inquiriesResponse, unreadCountsResponse] = await Promise.all([
          inquiryApi.getInquiries(),
          inquiryApi.getUnreadCounts(),
        ]);
        
        // Process inquiries
        const inquiryMap = new Map<string, string>();
        if (inquiriesResponse.success && inquiriesResponse.data?.inquiries) {
          const inquiries = inquiriesResponse.data.inquiries;
          inquiries.forEach((inquiry: any) => {
            // Check if inquiry has order field with _id
            if (inquiry.order?._id) {
              inquiryMap.set(inquiry.order._id, inquiry._id);
            }
          });
        }
        
        // Process unread counts from API
        let unreadCountsMap: { [inquiryId: string]: number } = {};
        if (unreadCountsResponse.success && unreadCountsResponse.data) {
          const { totalUnread, inquiries: unreadInquiries } = unreadCountsResponse.data;
          // console.log('📊 BuyListScreen: Unread counts from API:', {
          //   totalUnread,
          //   inquiries: unreadInquiries,
          // });
          
          // Create a map of inquiryId -> unreadCount
          unreadInquiries.forEach((item) => {
            unreadCountsMap[item.inquiryId] = item.unreadCount;
          });
          
          // Update unreadCounts state
          setUnreadCounts(unreadCountsMap);
          
          // Save to AsyncStorage for offline access
          AsyncStorage.setItem(STORAGE_KEYS.INQUIRY_UNREAD_COUNTS, JSON.stringify(unreadCountsMap))
            .catch((error) => {
              // console.error('Failed to save unread counts:', error);
            });
        }
        
        // Add inquiryId and unreadCount to orders
        const ordersWithInquiries = mappedOrders.map((order) => {
          const inquiryId = inquiryMap.get(order.id);
          const unreadCount = inquiryId ? (unreadCountsMap[inquiryId] || 0) : 0;
          return {
            ...order,
            inquiryId,
            unreadCount,
          };
        });
        
        setOrders(ordersWithInquiries);
      } catch (error) {
        // console.error('Failed to fetch inquiries or unread counts:', error);
        // Orders are already set, so we can continue
      }
    },
    onError: (error) => {
      // console.error('Failed to fetch orders:', error);
      showToast(error || 'Failed to fetch orders', 'error');
      setOrders([]);
    },
  });

  // Ensure socket is connected (socket should be connected globally, but ensure it here too)
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  // Fetch orders once on mount (unread counts are fetched together with orders)
  useEffect(() => {
    if (!hasFetchedOrdersRef.current) {
      hasFetchedOrdersRef.current = true;
      getOrders(1, 10);
    }
  }, []); // Empty dependency array - only run once on mount

  // Listen to socket events for new messages (works globally, not just in ChatScreen)
  useEffect(() => {
    // console.log('BuyListScreen: Setting up message received listener');
    
    const handleMessageReceived = (data: { 
      message: any; 
      inquiryId: string; 
      unreadCount?: number; 
      totalUnreadCount?: number;
    }) => {
      // console.log('🔔 BuyListScreen: NEW MESSAGE RECEIVED!', {
      //   inquiryId: data.inquiryId,
      //   messageText: data.message?.message || data.message?.text || 'N/A',
      //   unreadCount: data.unreadCount,
      //   totalUnreadCount: data.totalUnreadCount,
      //   fullData: data,
      // });
      
      // Update unread count for this inquiry
      if (data.inquiryId) {
        // If unreadCount is provided, use it; otherwise increment existing count
        setUnreadCounts(prev => {
          const currentCount = prev[data.inquiryId] || 0;
          const newCount = data.unreadCount !== undefined 
            ? data.unreadCount 
            : currentCount + 1;
          
          // console.log(`📊 BuyListScreen: Updating unread count for inquiry ${data.inquiryId}:`, {
          //   previousCount: currentCount,
          //   newCount: newCount,
          //   providedUnreadCount: data.unreadCount,
          // });
          
          const updatedCounts = {
            ...prev,
            [data.inquiryId]: newCount,
          };
          
          // Save to AsyncStorage
          AsyncStorage.setItem(STORAGE_KEYS.INQUIRY_UNREAD_COUNTS, JSON.stringify(updatedCounts))
            .then(() => {
              // console.log('💾 BuyListScreen: Saved unread counts to AsyncStorage');
            })
            .catch((error) => {
              // console.error('Failed to save unread counts:', error);
            });
          
          return updatedCounts;
        });
        
        // Update orders with new unread count
        setOrders(prevOrders => {
          const updatedOrders = prevOrders.map(order => {
            if (order.inquiryId === data.inquiryId) {
              const currentCount = order.unreadCount || 0;
              const newCount = data.unreadCount !== undefined 
                ? data.unreadCount 
                : currentCount + 1;
              // console.log(`✅ BuyListScreen: Updated order ${order.orderNumber} unread count:`, {
              //   previousCount: currentCount,
              //   newCount: newCount,
              // });
              return { ...order, unreadCount: newCount };
            }
            return order;
          });
          return updatedOrders;
        });
      } else {
        // console.warn('⚠️ BuyListScreen: Message received but no inquiryId provided', data);
      }
    };

    onMessageReceived(handleMessageReceived);
    // console.log('✅ BuyListScreen: Message received listener registered');
    
    // Cleanup - note: onMessageReceived doesn't have cleanup, but the callback ref will be replaced
    return () => {
      // console.log('BuyListScreen: Cleaning up message received listener');
    };
  }, [onMessageReceived]);

  // Render More to Love item (same as HomeScreen)
  const renderMoreToLoveItem = React.useCallback(({ item: product, index }: { item: Product; index: number }) => {
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
        // console.error('Error toggling wishlist:', error);
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

  // Render More to Love section (same as HomeScreen)
  const renderMoreToLove = () => {
    const productsToDisplay = recommendationsProducts;
    
    if (recommendationsLoading && productsToDisplay.length === 0) {
      return (
        <View style={styles.moreToLoveSection}>
          <Text style={styles.sectionTitle}>{t('home.moreToLove')}</Text>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      );
    }
    
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
          columnWrapperStyle={styles.productRow}
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

  // Sample order data with images (kept for reference, will be replaced by API data)
  const sampleOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: '2024-11-18',
      status: 'category',
      items: [
        { 
          productName: 'Wireless Headphones', 
          quantity: 1, 
          price: 49.99,
          image: 'https://picsum.photos/seed/headphones/400/500'
        },
        { 
          productName: 'Phone Case', 
          quantity: 2, 
          price: 15.99,
          image: 'https://picsum.photos/seed/case/400/500'
        },
      ],
      totalAmount: 81.97,
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: '2024-11-17',
      status: 'waiting',
      items: [
        { 
          productName: 'Smart Watch', 
          quantity: 1, 
          price: 199.99,
          image: 'https://picsum.photos/seed/watch/400/500'
        },
      ],
      totalAmount: 199.99,
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      date: '2024-11-15',
      status: 'progressing',
      items: [
        { 
          productName: 'Laptop Stand', 
          quantity: 1, 
          price: 35.99,
          image: 'https://picsum.photos/seed/stand/400/500'
        },
        { 
          productName: 'USB Cable Set', 
          quantity: 3, 
          price: 9.99,
          image: 'https://picsum.photos/seed/cable/400/500'
        },
      ],
      totalAmount: 65.96,
    },
  ];

  // Sample products for "More to love" section
  const recommendedProducts: Partial<Product>[] = [
    {
      id: '1',
      name: 'Summer Floral Dress',
      price: 45.99,
      originalPrice: 65.99,
      discount: 30,
      rating: 4.5,
      rating_count: 128,
      image: 'https://picsum.photos/seed/dress1/400/500',
      orderCount: 456,
    },
    {
      id: '2',
      name: 'Wireless Headphones',
      price: 89.99,
      originalPrice: 129.99,
      discount: 31,
      rating: 4.8,
      rating_count: 256,
      image: 'https://picsum.photos/seed/headphones/400/500',
      orderCount: 789,
    },
    {
      id: '3',
      name: 'Smart Watch',
      price: 199.99,
      originalPrice: 299.99,
      discount: 33,
      rating: 4.7,
      rating_count: 512,
      image: 'https://picsum.photos/seed/watch/400/500',
      orderCount: 1234,
    },
    {
      id: '4',
      name: 'Laptop Stand',
      price: 35.99,
      originalPrice: 49.99,
      discount: 28,
      rating: 4.6,
      rating_count: 89,
      image: 'https://picsum.photos/seed/stand/400/500',
      orderCount: 345,
    },
    {
      id: '5',
      name: 'Phone Case',
      price: 15.99,
      originalPrice: 24.99,
      discount: 36,
      rating: 4.9,
      rating_count: 678,
      image: 'https://picsum.photos/seed/case/400/500',
      orderCount: 2345,
    },
    {
      id: '6',
      name: 'USB Cable Set',
      price: 12.99,
      originalPrice: 19.99,
      discount: 35,
      rating: 4.4,
      rating_count: 234,
      image: 'https://picsum.photos/seed/cable/400/500',
      orderCount: 567,
    },
  ];

  const handleApplyFilters = (newFilters: { orderNumber: string; startDate: Date | null; endDate: Date | null }) => {
    setFilters(newFilters);
    // console.log('Filters applied:', newFilters);
    // Here you would filter the orders based on the filters
  };

  // Check if a tab has orders with unread messages
  const hasUnreadInTab = (tab: 'category' | 'waiting' | 'end' | 'progressing'): boolean => {
    return orders.some(order => 
      order.status === tab && (order.unreadCount || 0) > 0
    );
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy List</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          
          // Check if user has scrolled near the bottom (within 200px)
          const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          
          // Load more if near bottom, has more items, and not already loading
          // Let loadMoreRecommendations handle debouncing internally
          if (isNearBottom && hasMoreRecommendations && !isLoadingMoreRecommendations && !isLoadingMoreRef.current) {
            loadMoreRecommendations();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.content}>
          {/* Tab Navigation */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabScrollContent}
          >
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'category' && styles.tabActive]}
                onPress={() => setActiveTab('category')}
              >
                <View style={styles.tabContent}>
                  <Text style={[styles.tabText, activeTab === 'category' && styles.tabTextActive]}>
                    Category
                  </Text>
                  {hasUnreadInTab('category') && (
                    <View style={styles.tabUnreadDot} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'waiting' && styles.tabActive]}
                onPress={() => setActiveTab('waiting')}
              >
                <View style={styles.tabContent}>
                  <Text style={[styles.tabText, activeTab === 'waiting' && styles.tabTextActive]}>
                    Waiting
                  </Text>
                  {hasUnreadInTab('waiting') && (
                    <View style={styles.tabUnreadDot} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'end' && styles.tabActive]}
                onPress={() => setActiveTab('end')}
              >
                <View style={styles.tabContent}>
                  <Text style={[styles.tabText, activeTab === 'end' && styles.tabTextActive]}>
                    End
                  </Text>
                  {hasUnreadInTab('end') && (
                    <View style={styles.tabUnreadDot} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'progressing' && styles.tabActive]}
                onPress={() => setActiveTab('progressing')}
              >
                <View style={styles.tabContent}>
                  <Text style={[styles.tabText, activeTab === 'progressing' && styles.tabTextActive]}>
                    Progressing
                  </Text>
                  {hasUnreadInTab('progressing') && (
                    <View style={styles.tabUnreadDot} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Loading State */}
          {isLoading && orders.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : (
            <>
              {/* Orders List or Empty State */}
              {orders.filter(order => order.status === activeTab).length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="basket-outline" size={80} color="#CCC" />
                  <Text style={styles.emptyTitle}>No orders</Text>
                  <Text style={styles.emptySubtitle}>You don't have any orders in this category</Text>
                </View>
              ) : (
                <View style={styles.ordersContainer}>
                  {orders.filter(order => order.status === activeTab).map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderNumberContainer}>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      {(order.unreadCount || 0) > 0 && (
                        <View style={styles.orderUnreadBadge}>
                          <View style={styles.orderUnreadDot} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                  
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.orderItemImage}
                        resizeMode="cover"
                      />
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
                          {item.productName}
                        </Text>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.orderFooter}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
                  </View>
                  
                  {/* Order Inquiry Button */}
                  <TouchableOpacity
                    style={styles.inquiryButton}
                    onPress={() => {
                      // Only navigate if inquiryId exists
                      if (order.inquiryId) {
                        // Clear unread count when opening chat
                        setUnreadCounts(prev => {
                          const newCounts = { ...prev };
                          delete newCounts[order.inquiryId!];
                          
                          // Save to AsyncStorage
                          AsyncStorage.setItem(STORAGE_KEYS.INQUIRY_UNREAD_COUNTS, JSON.stringify(newCounts))
                            .catch((error) => {
                              // console.error('Failed to save unread counts:', error);
                            });
                          
                          return newCounts;
                        });
                        setOrders(prevOrders => 
                          prevOrders.map(o => 
                            o.inquiryId === order.inquiryId
                              ? { ...o, unreadCount: 0 }
                              : o
                          )
                        );
                        
                        navigation.navigate('Chat', { 
                          inquiryId: order.inquiryId,
                          orderNumber: order.orderNumber
                        });
                      } else {
                        // If no inquiry exists, create inquiry and navigate to chat
                        const createInquiryAndNavigate = async () => {
                          try {
                            // Create inquiry with a default message
                            const response = await inquiryApi.createInquiry(
                              order.id, // orderId
                              'Order inquiry', // default message
                              [] // no attachments
                            );
                            
                            if (response.success && response.data?.inquiry) {
                              const newInquiryId = response.data.inquiry._id;
                              
                              // Update order with new inquiryId
                              setOrders(prevOrders => 
                                prevOrders.map(o => 
                                  o.id === order.id
                                    ? { ...o, inquiryId: newInquiryId, unreadCount: 0 }
                                    : o
                                )
                              );
                              
                              // Navigate to chat screen
                              navigation.navigate('Chat', { 
                                inquiryId: newInquiryId,
                                orderNumber: order.orderNumber
                              });
                            } else {
                              showToast(response.error || 'Failed to create inquiry', 'error');
                            }
                          } catch (error: any) {
                            // console.error('Failed to create inquiry:', error);
                            showToast(error.message || 'Failed to create inquiry', 'error');
                          }
                        };
                        
                        createInquiryAndNavigate();
                      }
                    }}
                  >
                    <View style={styles.inquiryButtonContent}>
                      <Ionicons name="help-circle-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.inquiryButtonText}>Order Inquiry</Text>
                      {(order.unreadCount || 0) > 0 && (
                        <View style={styles.unreadBadge}>
                          <View style={styles.unreadDot} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
                </View>
              )}
            </>
          )}

          {/* More to Love Section */}
          {renderMoreToLove()}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <OrderFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingTop: SPACING['2xl'],
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  tabScrollView: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  tabScrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tabActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    position: 'relative',
  },
  tabUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.red,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  ordersContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderNumber: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  orderDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  orderItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  itemPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalAmount: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: '#4A90E2',
  },
  inquiryButton: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    position: 'relative',
  },
  inquiryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  inquiryButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    position: 'relative',
  },
  orderUnreadBadge: {
    position: 'relative',
  },
  orderUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },
  unreadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },
  loadingMoreContainer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  endOfListContainer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfListText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  moreToLoveSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  productGrid: {
    paddingBottom: SPACING.lg,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
});

export default BuyListScreen;
