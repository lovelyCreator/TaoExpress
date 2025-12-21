import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, SCREEN_HEIGHT, STORAGE_KEYS, BORDER_RADIUS } from '../../../constants';
import { RootStackParamList, Product } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { useAppSelector } from '../../../store/hooks';
import { translations } from '../../../i18n/translations';
import { useSocket } from '../../../context/SocketContext';
import { inquiryApi } from '../../../services/inquiryApi';
import { NotificationBadge, ProductCard } from '../../../components';
import { useRecommendationsMutation } from '../../../hooks/useRecommendationsMutation';
import { useWishlistStatus } from '../../../hooks/useWishlistStatus';
import { useAddToWishlistMutation } from '../../../hooks/useAddToWishlistMutation';
import { useDeleteFromWishlistMutation } from '../../../hooks/useDeleteFromWishlistMutation';
import { usePlatformStore } from '../../../store/platformStore';
import HeadsetMicIcon from '../../../assets/icons/HeadsetMicIcon';
import LocationIcon from '../../../assets/icons/LocationIcon';
import SettingsIcon from '../../../assets/icons/SettingsIcon';
import CoinIcon from '../../../assets/icons/CoinIcon';
import CouponIcon from '../../../assets/icons/CouponIcon';
import PointIcon from '../../../assets/icons/PointIcon';
import DeliveryIcon from '../../../assets/icons/DeliveryIcon';
import UndoIcon from '../../../assets/icons/UndoIcon';
import ToPayIcon from '../../../assets/icons/ToPayIcon';
import ToShipIcon from '../../../assets/icons/ToShipIcon';
import ToReviewIcon from '../../../assets/icons/ToReviewIcon';
import HeartIcon from '../../../assets/icons/HeartIcon';
import SupportAgentIcon from '../../../assets/icons/SupportAgentIcon';
import PaymentIcon from '../../../assets/icons/PaymentIcon';
import ProblemProductIcon from '../../../assets/icons/ProblemProductIcon';
import ShareAppIcon from '../../../assets/icons/ShareAppIcon';
import SuggestionIcon from '../../../assets/icons/SuggestionIcon';


type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, isAuthenticated, isGuest } = useAuth();
  const currentLocale = useAppSelector((state) => state.i18n.locale);
  const { selectedPlatform } = usePlatformStore();
  const badgePulse = useRef(new Animated.Value(1)).current;
  const { unreadCount: socketUnreadCount, onUnreadCountUpdated } = useSocket(); // Get total unread count from socket context
  const [notificationCount, setNotificationCount] = useState(0); // Local state for notification count (from REST API)
  
  // Recommendations state for "More to Love"
  const [recommendationsProducts, setRecommendationsProducts] = useState<Product[]>([]);
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState(true);
  const [isLoadingMoreRecommendations, setIsLoadingMoreRecommendations] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const lastSuccessfulPageRef = useRef(1);
  const lastLoadMoreCallRef = useRef(0); // Track last load more call time for debouncing
  
  // Wishlist hooks
  const { isProductLiked } = useWishlistStatus();
  const { mutate: addToWishlist } = useAddToWishlistMutation();
  const { mutate: deleteFromWishlist } = useDeleteFromWishlistMutation();
  
  // Fetch unread counts from REST API when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchUnreadCounts = async () => {
        try {
          const response = await inquiryApi.getUnreadCounts();
          if (response.success && response.data) {
            setNotificationCount(response.data.totalUnread);
            // Note: onUnreadCountUpdated is a callback registration function, not a direct update function
            // The socket context will handle updates via its own event listeners
          }
        } catch (error) {
          console.error('Failed to fetch unread counts:', error);
        }
      };
      fetchUnreadCounts();
    }, [onUnreadCountUpdated])
  );
  
  // Update notification count from socket events (real-time updates)
  useEffect(() => {
    setNotificationCount(socketUnreadCount);
  }, [socketUnreadCount]);

  // Console log user information from local storage
  useFocusEffect(
    React.useCallback(() => {
      const logUserInfo = async () => {
        try {
          const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            console.log('=== User Information from Local Storage ===');
            console.log('User Data:', JSON.stringify(userData, null, 2));
            console.log('User ID:', userData.id);
            console.log('User Email:', userData.email);
            console.log('User Name:', userData.name);
            console.log('User Phone:', userData.phone);
            console.log('User Avatar:', userData.avatar);
            console.log('User Addresses:', userData.addresses);
            console.log('User Wishlist:', userData.wishlist);
            console.log('User Preferences:', userData.preferences);
            console.log('==========================================');
          } else {
            console.log('No user data found in local storage');
          }
        } catch (error) {
          console.error('Error reading user data from local storage:', error);
        }
      };
      logUserInfo();
    }, [])
  );
  
  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[currentLocale as keyof typeof translations];
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

  useEffect(() => {
    if (notificationCount > 0) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(badgePulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      badgePulse.setValue(1);
    }
  }, [notificationCount]);


  const handleLogin = () => {
    navigation.navigate('Auth');
  };

  const showComingSoon = (feature: string) => {
    console.log(`${feature} feature coming soon`);
    // You can add an alert or toast here if needed
  };

  // Recommendations API mutation
  const { 
    mutate: fetchRecommendations, 
    isLoading: recommendationsLoading, 
    isError: recommendationsError 
  } = useRecommendationsMutation({
    onSuccess: (data) => {
      console.log('📦 [Profile More to Love] API Success - Raw data:', data);
      setIsLoadingMoreRecommendations(false);
      isLoadingMoreRef.current = false;
      
      if (data && data.recommendations && data.recommendations.result && Array.isArray(data.recommendations.result)) {
        const pageSize = data.pageSize || 20;
        const currentPageFromData = data.page || recommendationsPage;
        const hasMore = data.recommendations.result.length >= pageSize;
        const receivedCount = data.recommendations.result.length;
        
        console.log('📦 [Profile More to Love] Processing response:', {
          currentPage: currentPageFromData,
          receivedCount,
          pageSize,
          hasMore,
          totalProductsBefore: recommendationsProducts.length,
        });
        
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
          
          (productData as any).source = selectedPlatform;
          
          return productData;
        });
        
        if (currentPageFromData === 1) {
          console.log('📦 [Profile More to Love] Setting initial products (Page 1):', mappedProducts.length);
          setRecommendationsProducts(mappedProducts);
          lastSuccessfulPageRef.current = 1;
        } else {
          console.log('📦 [Profile More to Love] Appending products (Page', currentPageFromData, '):', mappedProducts.length, 'new products');
          setRecommendationsProducts(prev => {
            const newProducts = [...prev, ...mappedProducts];
            console.log('📦 [Profile More to Love] Total products after append:', newProducts.length);
            return newProducts;
          });
          lastSuccessfulPageRef.current = currentPageFromData;
        }
      } else {
        console.log('⚠️ [Profile More to Love] Invalid data structure:', data);
      }
    },
    onError: (error) => {
      console.error('❌ [Profile More to Love] API Error:', error);
      setIsLoadingMoreRecommendations(false);
      isLoadingMoreRef.current = false;
      setRecommendationsPage(lastSuccessfulPageRef.current);
      setHasMoreRecommendations(false);
    },
  });

  // Fetch recommendations when locale or user changes
  useEffect(() => {
    if (currentLocale) {
      const outMemberId = user?.id?.toString() || 'dferg0001';
      console.log('🔄 [Profile More to Love] Initial fetch triggered:', {
        locale: currentLocale,
        userId: outMemberId,
        page: 1,
      });
      setRecommendationsPage(1);
      lastSuccessfulPageRef.current = 1;
      setHasMoreRecommendations(true);
      setRecommendationsProducts([]);
      fetchRecommendations(currentLocale, outMemberId, 1, 20);
    }
  }, [currentLocale, user?.id]);

  // Load more recommendations (infinite scroll)
  const loadMoreRecommendations = useCallback(() => {
    const now = Date.now();
    const timeSinceLastCall = now - lastLoadMoreCallRef.current;
    const DEBOUNCE_MS = 500; // Minimum 500ms between calls
    
    console.log('📜 [Profile More to Love] loadMoreRecommendations called:', {
      currentPage: recommendationsPage,
      isLoadingMore: isLoadingMoreRef.current,
      isLoadingMoreState: isLoadingMoreRecommendations,
      hasMore: hasMoreRecommendations,
      locale: currentLocale,
      currentProductsCount: recommendationsProducts.length,
      timeSinceLastCall,
    });
    
    // Debounce: prevent calls within 500ms of each other
    if (timeSinceLastCall < DEBOUNCE_MS) {
      console.log('⏸️ [Profile More to Love] Debounced - too soon since last call:', timeSinceLastCall, 'ms');
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingMoreRef.current || isLoadingMoreRecommendations || !hasMoreRecommendations || !currentLocale) {
      console.log('⏸️ [Profile More to Love] loadMoreRecommendations blocked:', {
        isLoadingMoreRef: isLoadingMoreRef.current,
        isLoadingMoreState: isLoadingMoreRecommendations,
        hasMore: hasMoreRecommendations,
        hasLocale: !!currentLocale,
      });
      return;
    }
    
    lastLoadMoreCallRef.current = now;
    isLoadingMoreRef.current = true;
    const nextPage = recommendationsPage + 1;
    console.log('⬇️ [Profile More to Love] Loading more - Next page:', nextPage);
    setIsLoadingMoreRecommendations(true);
    setRecommendationsPage(nextPage);
    
    // Use user ID if available, otherwise use default 'dferg0001'
    const outMemberId = user?.id?.toString() || 'dferg0001';
    console.log('📡 [Profile More to Love] Fetching page', nextPage, 'for user:', outMemberId);
    fetchRecommendations(currentLocale, outMemberId, nextPage, 20);
  }, [recommendationsPage, hasMoreRecommendations, isLoadingMoreRecommendations, currentLocale, user?.id, fetchRecommendations, recommendationsProducts.length]);

  // Toggle wishlist function
  const toggleWishlist = async (product: Product) => {
    if (!user || isGuest) {
      return;
    }

    const externalId = 
      (product as any).externalId?.toString() ||
      (product as any).offerId?.toString() ||
      '';

    if (!externalId) {
      return;
    }

    const isLiked = isProductLiked(product);
    const source = (product as any).source || selectedPlatform || '1688';
    const country = currentLocale || 'en';

    if (isLiked) {
      deleteFromWishlist(externalId);
    } else {
      const imageUrl = product.image || '';
      const price = product.price || 0;
      const title = product.name || '';

      if (!imageUrl || !title || price <= 0) {
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
    country: string = currentLocale
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
    // Get source from product data, fallback to selectedPlatform
    const source = (product as any).source || selectedPlatform || '1688';
    await navigateToProductDetail(productIdToUse, source, currentLocale);
  };

  // Korean favorite colors for menu icons
  const getMenuIconColor = (index: number) => {
    const colors = [
      { bg: '#FFE4E6', icon: '#FF6B9D' }, // Soft pink
      { bg: '#E8F4FD', icon: '#4A90E2' }, // Sky blue
      { bg: '#E8F8F5', icon: '#26D0CE' }, // Mint
      { bg: '#FFF4E6', icon: '#FF9500' }, // Orange
      { bg: '#F3E8FF', icon: '#9C88FF' }, // Lavender
      { bg: '#FFE8E8', icon: '#FF6B6B' }, // Coral
      { bg: '#E8FFE8', icon: '#4CAF50' }, // Green
      { bg: '#FFF0E6', icon: '#FF8A65' }, // Peach
      { bg: '#E6F3FF', icon: '#42A5F5' }, // Light blue
      { bg: '#F0E6FF', icon: '#AB47BC' }, // Purple
      { bg: '#E6FFF0', icon: '#66BB6A' }, // Light green
    ];
    return colors[index % colors.length];
  };

  const renderHeader = () => {
    // Extract first name from full name
    const firstName = user?.name?.split(' ')[0] || user?.name || '';
    const userLabel = (user as any)?.label || 'TM VIP';
    
    return (
      <View style={styles.header}>
        {isAuthenticated && user ? (
          <View style={styles.headerUserInfo}>
            <Image
              source={
                user?.avatar 
                  ? { uri: user.avatar } 
                  : require('../../../assets/images/avatar.png')
              }
              style={styles.headerAvatar}
            />
            <View style={styles.headerUserText}>
              <View style={styles.headerUserTop}>
                <Text style={styles.headerFirstName}>{firstName}</Text>
                <View style={styles.headerLabel}>
                  <Text style={styles.headerLabelText}>{userLabel}</Text>
                </View>
              </View>
              <Text style={styles.headerFullName}>{user.name || ''}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        )}
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => navigation.navigate('LanguageSettings')}
          >
            <LocationIcon width={24} height={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <NotificationBadge
            customIcon={<HeadsetMicIcon width={24} height={24} color={COLORS.text.primary} />}
            count={notificationCount}
            badgeColor={COLORS.red}
            onPress={() => {
              navigation.navigate('CustomerService');
            }}
          />
          {isAuthenticated && (
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => navigation.navigate('ProfileSettings')}
            >
              <SettingsIcon width={24} height={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderUserSection = () => (
    <View style={styles.userSection}>
      <View style={styles.userCard}>
        {isAuthenticated ? (
          <View style={styles.userInfo}>
            {/* <View style={styles.avatarContainer}>
              <Image
                source={
                  user?.avatar 
                    ? { uri: user.avatar } 
                    : require('../../../assets/images/avatar.png')
                }
                style={styles.avatar}
              />
              <View style={styles.avatarBorder} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.name || t('profile.user')}
              </Text>
              <View style={styles.userBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>{t('profile.verifiedMember')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('ProfileSettings')}
              >
                <Ionicons name="pencil" size={14} color={COLORS.primary} />
                <Text style={styles.editText}>{t('profile.editProfile')}</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        ) : (
          <View style={styles.authSection}>
            <Image source={require('../../../assets/icons/logo.png')} style={styles.loginBackground} />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
              <Text style={styles.loginButtonText}>{t('profile.login')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <View style={styles.statsCard}>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Deposit')}
        >
          <View style={[styles.statIconContainer]}>
            <CoinIcon width={30} height={30} color={COLORS.white} />
          </View>
          <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
            <Text style={styles.statValue}>{(user as any)?.deposit ? (user as any).deposit : '0'}</Text>
            <Text style={styles.statLabel}>Deposit</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('PointDetail')}
        >
          <View style={styles.statIconContainer}>
            <PointIcon width={30} height={30} color={COLORS.white} />
          </View>
          <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
            <Text style={styles.statValue}>{(user as any)?.points ? (user as any).points : '0'}</Text>
            <Text style={styles.statLabel}>{t('profile.points')}</Text>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <View style={[styles.statIconContainer, { backgroundColor: '#E8F8F5' }]}>
            <Ionicons name="heart-outline" size={24} color="#26D0CE" />
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>{t('profile.wishlist')}</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} /> */}
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Coupon')}
        >
          <View style={styles.statIconContainer}>
            <CouponIcon width={30} height={30} color={COLORS.white} />
          </View>
          <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
            <Text style={styles.statValue}>{(user as any)?.coupon ? (user as any).coupon : '0'}</Text>
            <Text style={styles.statLabel}>{t('profile.coupons')}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.explanationCard}>        
        <View style={styles.headerLabel}>
          <Text style={styles.headerLabelText}>TM VIP</Text>
        </View>
        <Text style={styles.explanationText}>You have a 685 USD TM VIP Double Holiday voucher waiting ...</Text>
        <Text style={styles.explanationButtonText}>Clamin Now {'>'}</Text>
      </View>
    </View>
  );

  const renderMenuItems = () => {
    // BUYING-RELATED ITEMS (Only show when logged in)
    const buyingMenuItems = [
      // 1. START: Place New Orders
      {
        icon: 'bag-outline',
        title: t('profile.buyOrder'),
        onPress: () => navigation.navigate('BuyList'),
        showBadge: notificationCount > 0, // Show red dot if there are unread messages
      },
      
      // 2. SETUP: Required for Buying (Address & Payment)
      {
        icon: 'location-outline',
        title: t('profile.address'),
        onPress: () => navigation.navigate('AddressBook', { fromShippingSettings: false }),
      },
      {
        icon: 'card-outline',
        title: t('profile.bankCard'),
        onPress: () => navigation.navigate('PaymentMethods' as never),
      },
      
      // 3. ISSUES: Problems with Orders/Products
      {
        icon: 'alert-circle-outline',
        title: t('profile.problemProduct'),
        onPress: () => navigation.navigate('ProblemProduct' as never),
      },
    ];

    // NON-BUYING RELATED ITEMS (Always show regardless of login status)
    const generalMenuItems = [
      // Support & Help
      {
        icon: 'help-circle-outline',
        title: t('profile.helpCenter'),
        onPress: () => navigation.navigate('HelpCenter'),
      },
      
      // Personal Features
      {
        icon: 'document-text-outline',
        title: t('profile.note'),
        onPress: () => navigation.navigate('Note' as never),
      },
      
      // Social Features
      {
        icon: 'share-outline',
        title: t('profile.shareApp'),
        onPress: () => navigation.navigate('ShareApp' as never),
      },
      

    ];

    // Combine items based on authentication status
    const menuItems = [
      ...(isAuthenticated ? buyingMenuItems : []), // Only show buying items when logged in
      ...generalMenuItems // Always show general items
    ];

    return (
      <View style={styles.menuContainer}>
        <View style={styles.myOrder}>
          <TouchableOpacity 
            style={styles.myOrderHeader}
            onPress={() => navigation.navigate('BuyList')}
          >
            <Text style={styles.myOrderHeaderText}>My Orders</Text>
            <Text style={styles.myOrderHeaderTextSub}>View all {'>'}</Text>
          </TouchableOpacity>
          <View style={styles.myOrderContent}>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('BuyList', { initialTab: 'waiting' })}
            >
              <ToPayIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>To pay</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('BuyList', { initialTab: 'progressing' })}
            >
              <ToShipIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>To ship</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('BuyList', { initialTab: 'progressing' })}
            >
              <DeliveryIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Shipped</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('BuyList', { initialTab: 'end' })}
            >
              <ToReviewIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>To review</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('BuyList', { initialTab: 'waiting' })}
            >
              <UndoIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Returns</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.myOrder, { paddingTop: 0}]}>
          <View style={styles.myOrderContent}>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('BuyList', { initialTab: 'waiting' })}
            >
              <ToPayIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('Wishlist')}
            >
              <HeartIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Wishlist</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('Coupon')}
            >
              <CouponIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Coupons</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('AddressBook', { fromShippingSettings: false })}
            >
              <LocationIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Address</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.myOrder, { paddingTop: 0}]}>
          <View style={styles.myOrderContent}>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('HelpCenter' as never)}
            >
              <SupportAgentIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('PaymentMethods' as never)}
            >
              <PaymentIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('ProblemProduct' as never)}
            >
              <ProblemProductIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Problem Product</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('ShareApp' as never)}
            >
              <ShareAppIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Share App</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.myOrderItem}
              onPress={() => navigation.navigate('Note' as never)}
            >
              <SuggestionIcon width={24} height={24} color={COLORS.black} />
              <Text style={styles.myOrderItemText}>Suggestion</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === 0 && styles.firstMenuItem,
              index === menuItems.length - 1 && styles.lastMenuItem
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: getMenuIconColor(index).bg }]}>
                <Ionicons name={item.icon as any} size={22} color={getMenuIconColor(index).icon} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              {(item as any).showBadge && (
                <View style={styles.menuItemBadge}>
                  <View style={styles.menuItemBadgeDot} />
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray[400]} />
          </TouchableOpacity>
        ))} */}
      </View>
    );
  };

  // Render More to Love item
  const renderMoreToLoveItem = useCallback(({ item: product, index }: { item: Product; index: number }) => {
    if (!product || !product.id) {
      return null;
    }
    
    const handleLike = async () => {
      if (!user || isGuest) {
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

  // Render More to Love section
  const renderMoreToLove = () => {
    const productsToDisplay = recommendationsProducts;
    
    console.log('🎨 [Profile More to Love] renderMoreToLove called:', {
      productsCount: productsToDisplay.length,
      isLoading: recommendationsLoading,
      isLoadingMore: isLoadingMoreRecommendations,
      hasError: recommendationsError,
      hasMore: hasMoreRecommendations,
      currentPage: recommendationsPage,
    });
    
    // Show loading state if fetching
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
    
    // Show error state if there's an error
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
            console.log('🔚 [Profile More to Love] onEndReached triggered');
            loadMoreRecommendations();
          }}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => {
            console.log('👣 [Profile More to Love] ListFooterComponent rendered:', {
              isLoadingMore: isLoadingMoreRecommendations,
              hasMore: hasMoreRecommendations,
              productsCount: productsToDisplay.length,
            });
            return (
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
            );
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top half linear gradient background */}
      <LinearGradient
        colors={COLORS.gradients.authBackground}
        style={styles.gradientBackground}
      />
      
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderUserSection()}
        {isAuthenticated && renderStatsSection()}
        {renderMenuItems()}
        {renderMoreToLove()}
      </ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT / 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerUserText: {
    flex: 1,
  },
  headerUserTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerFirstName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginRight: SPACING.xs,
  },
  headerLabel: {
    backgroundColor: '#4E3E01',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  headerLabelText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: '#FFB200',
  },
  headerFullName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  flagCircle: {
    marginLeft: SPACING.md,
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
  headerIcon: {
    padding: SPACING.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
    minHeight: '100%',
  },
  userSection: {
    paddingHorizontal: SPACING.lg,
    // paddingTop: SPACING.lg,
    // paddingBottom: SPACING.xl, // Add bottom padding for spacing
    // marginTop: -20,
  },
  userCard: {
    paddingHorizontal: SPACING.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.lg,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.gray[200],
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FF9A9E', // Korean favorite coral pink
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  verifiedText: {
    fontSize: FONTS.sizes.sm,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E6', // Soft pink background
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  editText: {
    fontSize: FONTS.sizes.sm,
    color: '#FF6B9D', // Pink text
    marginLeft: 4,
    fontWeight: '500',
  },
  authSection: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: SPACING.md,
    gap: SPACING.sm,
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
  loginBackground: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.text.red,
    borderRadius: 9999,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  loginButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  statsSection: {
    marginHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: SPACING.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  statsCard: {
    backgroundColor: COLORS.text.red,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '400',
  },
  explanationCard: {
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  explanationText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '300',
    width: '54%',
  },
  explanationButtonText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '700',
  },
  menuContainer: {
    overflow: 'hidden',
  },
  myOrder: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  myOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  myOrderHeaderText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  myOrderHeaderTextSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: '300',
  },
  myOrderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  myOrderItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    width: 50,
  },
  myOrderItemText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    backgroundColor: COLORS.white,
  },
  firstMenuItem: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  menuItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  menuItemBadge: {
    marginLeft: SPACING.xs,
    position: 'relative',
  },
  menuItemBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },
  moreToLoveSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
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
});

export default ProfileScreen;