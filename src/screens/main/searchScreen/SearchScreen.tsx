import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  TextInput,
  Animated,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../constants';
import { RootStackParamList, Product } from '../../../types';
import { usePlatformStore } from '../../../store/platformStore';
import { useAppSelector } from '../../../store/hooks';
import { ImagePickerModal, ProductCard, Button, SortDropdown, PriceFilterModal } from '../../../components';
import { translations } from '../../../i18n/translations';
import { useSearchProductsMutation } from '../../../hooks/useSearchProductsMutation';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { useWishlistStatus } from '../../../hooks/useWishlistStatus';
import { useAddToWishlistMutation } from '../../../hooks/useAddToWishlistMutation';
import { useDeleteFromWishlistMutation } from '../../../hooks/useDeleteFromWishlistMutation';
import { useGetSearchHistory, useDeleteSearchKeyword, useClearSearchHistory } from '../../../hooks/useSearchHistoryMutation';
import { useFocusEffect } from '@react-navigation/native';
import ArrowBackIcon from '../../../assets/icons/ArrowBackIcon';
import ViewListIcon from '../../../assets/icons/ViewListIcon';


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.sm) / 2;

type ProductDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

const SearchScreenComponent: React.FC = () => {
  const navigation = useNavigation<ProductDetailNavigationProp>();
  // Search context removed - using local state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('best_match');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  
  // Sort options
  const sortOptions = [
    { label: 'Best Match', value: 'best_match' },
    { label: 'Price High', value: 'price_high' },
    { label: 'Price Low', value: 'price_low' },
    { label: 'High Sales', value: 'high_sales' },
    { label: 'Low Sales', value: 'low_sales' },
  ];
  
  // Map company name to platform/source parameter
  const getPlatformFromCompany = (company: string): string => {
    if (company === 'All') {
      return '1688';
    }
    // Convert company name to lowercase for API (e.g., "Taobao" -> "taobao")
    return company.toLowerCase();
  };
  
  // States
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products for filtering
  const [companies, setCompanies] = useState<string[]>(['All', '1688', 'Taobao', 'wsy', 'Vip', 'VVIC', 'Company Mall']); // Store unique company names
  const [stores, setStores] = useState<any[]>([]); // Store stores data
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(1); // Add offset state
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('All'); // Company filter state
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state
  const [categoryLoading, setCategoryLoading] = useState(false); // Add category loading state
  const [recentSearches, setRecentSearches] = useState<string[]>([]); // Recent searches state
  
  // Refs
  const isLoadingRef = useRef(false);
  const flatListRef = useRef<FlatList>(null); // Change to FlatList ref
  const isRecentSearchClickRef = useRef(false); // Track if search was triggered by recent search click
  
  // Modal states
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [priceFilterModalVisible, setPriceFilterModalVisible] = useState(false);
  
  // Filter states (for price filter modal)
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  // Category state
  const categoryScrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<{ x: number; width: number }[]>([]);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  // Get Zustand store
  const { selectedPlatform, setSelectedPlatform } = usePlatformStore();
  
  // Get locale from Redux store
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';
  const { showToast } = useToast();
  const { isProductLiked, refreshExternalIds, addExternalId, removeExternalId } = useWishlistStatus();
  const { user, isGuest } = useAuth();
  
  // Add to wishlist mutation
  const { mutate: addToWishlist } = useAddToWishlistMutation({
    onSuccess: async (data) => {
      // console.log('Product added to wishlist successfully:', data);
      showToast('Product added to wishlist', 'success');
      // Immediately refresh external IDs to update heart icon color
      await refreshExternalIds();
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
      // Immediately refresh external IDs to update heart icon color
      await refreshExternalIds();
    },
    onError: (error) => {
      // console.error('Failed to remove product from wishlist:', error);
      showToast(error || 'Failed to remove product from wishlist', 'error');
    },
  });

  // Search history hooks
  const { mutate: fetchSearchHistory, data: searchHistoryData } = useGetSearchHistory({
    onSuccess: (data) => {
      setRecentSearches(data || []);
    },
    onError: (error) => {
      // Silently fail - don't show error if user is not authenticated
      if (error !== 'Not authenticated') {
        // console.error('Failed to fetch search history:', error);
      }
    },
  });

  const { mutate: deleteKeyword } = useDeleteSearchKeyword({
    onSuccess: () => {
      // Refresh search history after deletion
      fetchSearchHistory();
    },
    onError: (error) => {
      showToast(error || 'Failed to delete search keyword', 'error');
    },
  });

  const { mutate: clearHistory } = useClearSearchHistory({
    onSuccess: () => {
      setRecentSearches([]);
      showToast('Search history cleared', 'success');
    },
    onError: (error) => {
      showToast(error || 'Failed to clear search history', 'error');
    },
  });

  // Fetch search history when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isGuest && user) {
        fetchSearchHistory();
      }
    }, [fetchSearchHistory, isGuest, user])
  );
  
  // Toggle wishlist function
  const toggleWishlist = async (product: any) => {
    if (!user || isGuest) {
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
  
  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
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

  // Preload recent searches when component mounts
  useEffect(() => {
    loadRecentSearches();
    // Set default sort to "all" if not already set
    if (!selectedSort) {
      setSelectedSort('all');
    }
  }, []);

  // Load recent searches from AsyncStorage
  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      // console.error('Error loading recent searches:', error);
    }
  };

  // Save recent searches to AsyncStorage whenever they change
  useEffect(() => {
    const saveRecentSearches = async () => {
      try {
        await AsyncStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      } catch (error) {
        // console.error('Error saving recent searches:', error);
      }
    };
    saveRecentSearches();
  }, [recentSearches]);

  // Memoize categories for performance
  const memoizedCategories = useMemo(() => categories, [categories]);
  const memoizedCategoryIds = useMemo(() => categoryIds, [categoryIds]);



  // Update indicator position when active category changes
  useEffect(() => {
    if (activeCategoryTab && memoizedCategories.length > 0) {
      const index = memoizedCategories.indexOf(activeCategoryTab);
      if (index !== -1 && tabLayouts.current[index]) {
        const layout = tabLayouts.current[index];
        Animated.parallel([
          Animated.timing(indicatorX, { 
            toValue: layout.x, 
            duration: 150, 
            useNativeDriver: false 
          }),
          Animated.timing(indicatorW, { 
            toValue: layout.width, 
            duration: 150, 
            useNativeDriver: false 
          }),
        ]).start();
      }
    }
  }, [activeCategoryTab, memoizedCategories]);

  // Show first category indicator when entering with search query
  useEffect(() => {
    if (searchQuery && memoizedCategories.length > 0 && !activeCategoryTab && memoizedCategories[0]) {
      // Set first category as active if none is selected and there's a search query
      setActiveCategoryTab(memoizedCategories[0]);
    }
  }, [searchQuery, memoizedCategories, activeCategoryTab]);


  // Debounce search queries
  useEffect(() => {
    // Skip debounce when category changes
    if (activeCategoryTab && !searchQuery) {
      // Reset to first page when category changes
      setOffset(1);
      setHasMore(true);
      return;
    }
    
    // Prevent loading when refreshing
    if (isRefreshingRef.current) {
      // console.log('Skipping search query effect during refresh');
      return;
    }
    
    const handler = setTimeout(() => {
      if (searchQuery && searchQuery.trim()) {
        // Add to recent searches if it's a new search query
        if (searchQuery.trim() !== '' && !recentSearches.includes(searchQuery.trim())) {
          setRecentSearches(prev => [searchQuery.trim(), ...prev].slice(0, 10)); // Keep only last 10 searches
        }
        
        // Reset to first page when search query changes
        setOffset(1);
        setHasMore(true);
        setProducts([]);
        setAllProducts([]);
        // Only reset company filter if search was not triggered by recent search click
        // if (!isRecentSearchClickRef.current) {
        //   setSelectedCompany('All'); // Reset company filter when search changes manually
        // }
        // Reset the ref after using it
        isRecentSearchClickRef.current = false;
        // Load products with search query - don't show loading spinner on initial search
        loadProducts(selectedSort || 'popularity', 1);
      } else {
        // Clear products when search query is empty
        setProducts([]);
        setOffset(1);
        setHasMore(false);
      }
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, activeCategoryTab, selectedSort]);

  // Load more products when offset changes (infinite scroll)
  useEffect(() => {
    // console.log('Offset changed to:', offset);
    // Prevent loading more data when refreshing
    if (isRefreshingRef.current) {
      // console.log('Skipping offset effect during refresh');
      return;
    }
    
    if (offset > 1 && searchQuery && searchQuery.trim()) {
      // console.log('Loading more products for offset:', offset, 'with sort:', selectedSort);
      loadProducts(selectedSort || 'popularity', offset); // Use the selected sort option
    }
  }, [offset, selectedSort, searchQuery]);

  // Memoize stores for performance
  const memoizedStores = useMemo(() => stores, [stores]);


  // Memoize products for performance
  const memoizedProducts = useMemo(() => products, [products]);

  // Add a ref to track if we're currently refreshing
  const isRefreshingRef = useRef(false);
  
  // Ref to store current page offset for use in callbacks
  const currentPageOffsetRef = useRef<number>(1);

  // Search products mutation
  const { mutate: searchProducts, isLoading: isSearching } = useSearchProductsMutation({
    onSuccess: (data) => {
      // console.log('Products fetched successfully:', data);
      isLoadingRef.current = false;
      
      const currentPage = currentPageOffsetRef.current;
      // Only clear loading spinner for first page
      if (currentPage === 1) {
        // Loading spinner removed
      }
      
      if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
        // Map API response to Product format
        const mappedProducts = data.data.products.map((item: any) => {
          const price = parseFloat(item.price || item.wholesalePrice || item.dropshipPrice || 0);
          const originalPrice = parseFloat(item.originalPrice || price);
          const discount = originalPrice > price && originalPrice > 0
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;
          
          const productId = item.id?.toString() || item.externalId?.toString() || '';
          const externalId = item.externalId?.toString() || item.id?.toString() || '';
          const offerId = item.offerId?.toString() || item.externalId?.toString() || item.id?.toString() || '';
          
          return {
            id: productId,
            externalId: externalId,
            offerId: offerId,
            name: item.title || item.titleOriginal || '',
            image: item.image || '',
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            description: '',
            category: { id: '', name: '', icon: '', image: '', subcategories: [] },
            subcategory: '',
            brand: '',
            seller: { 
              id: '', 
              name: item.companyName || item.sellerName || '', 
              avatar: '', 
              rating: 0, 
              reviewCount: 0, 
              isVerified: false, 
              followersCount: 0, 
              description: '', 
              location: '', 
              joinedDate: new Date() 
            },
            rating: item.rating || 0,
            reviewCount: item.sales || 0,
            rating_count: item.sales || 0,
            inStock: true,
            stockCount: 0,
            tags: [],
            isNew: false,
            isFeatured: false,
            isOnSale: discount > 0,
            createdAt: new Date(item.createDate || new Date()),
            updatedAt: new Date(item.modifyDate || new Date()),
            orderCount: item.sales || 0,
            repurchaseRate: item.repurchaseRate || '',
            // Store companyName for filtering
            companyName: item.companyName || item.sellerName || '',
          } as Product & { companyName?: string };
        });
        
        // Check pagination
        const pagination = data.data.pagination;
        const hasMore = pagination && currentPage < pagination.totalPage;
        setHasMore(hasMore || false);
        
        // Extract unique company names from mapped products
        const uniqueCompanies = new Set<string>(['All']);
        mappedProducts.forEach((product: any) => {
          const companyName = product.companyName || product.seller?.name || '';
          if (companyName && companyName.trim()) {
            uniqueCompanies.add(companyName);
          }
        });
        // Sort companies with "All" always first
        const sortedCompanies = Array.from(uniqueCompanies).sort((a, b) => {
          if (a === 'All') return -1;
          if (b === 'All') return 1;
          return a.localeCompare(b);
        });
        // setCompanies(sortedCompanies);
        
        // If it's the first page, replace products, otherwise append
        if (currentPage === 1) {
          setAllProducts(mappedProducts);
          setProducts(mappedProducts);
        } else {
          const updatedProducts = [...allProducts, ...mappedProducts];
          setAllProducts(updatedProducts);
          setProducts(updatedProducts);
        }
      } else {
        // No products found
        if (currentPage === 1) {
          setProducts([]);
        }
        setHasMore(false);
      }
    },
    onError: (error) => {
      // console.error('Failed to fetch products:', error);
      isLoadingRef.current = false;
      
      const currentPage = currentPageOffsetRef.current;
      // Loading spinner removed
      // Clear products on error when on first page
      if (currentPage === 1) {
        setProducts([]);
      }
      setHasMore(false);
    },
  });

  // Load products using search API
  // sortType: The sort parameter to pass to API (popularity, price_high, price_low, newest, rating)
  // pageOffset: The page number (1-based) - API will return sorted results for this page
  // Each page request includes the sort parameter, so sorting is applied per page by the API
  const loadProducts = async (sortType: string = selectedSort || 'popularity', pageOffset: number = offset || 1 ) => {
    // Prevent multiple simultaneous API calls
    if (isLoadingRef.current || isSearching) {
      // console.log('Skipping loadProducts call - already loading', pageOffset);
      return;
    }
    
    // Use searchQuery as keyword
    const searchKeyword = searchQuery?.trim() || '';
    
    if (!searchKeyword) {
      // console.warn('No search keyword available, skipping product load');
      isLoadingRef.current = false;
      return;
    }
      
    // console.log('loadProducts called:', { 
    //   offset: pageOffset, 
    //   searchKeyword, 
    //   minPrice,
    //   maxPrice,
    //   sortType
    // });
    isLoadingRef.current = true;
    // Loading spinner removed
    
    // Map sort type to API sort parameter
    // The API expects: popularity (best match), price_high, price_low, newest, rating
    // This mapping handles all sort types including high_sales, low_sales, price_high, price_low
    let sortParam = '';
    if (sortType === 'Price High to Low' || sortType === 'price_high') {
      sortParam = 'price_high';
    } else if (sortType === 'Price Low to High' || sortType === 'price_low') {
      sortParam = 'price_low';
    } else if (sortType === 'Newest' || sortType === 'newest' || sortType === 'low_sales') {
      // low_sales maps to newest
      sortParam = 'newest';
    } else if (sortType === 'Top' || sortType === 'rating' || sortType === 'high_sales') {
      // high_sales maps to rating
      sortParam = 'rating';
    } else {
      // Default to 'popularity' (best match from API)
      sortParam = 'popularity';
    }
    
    // console.log('Sort mapping:', { sortType, sortParam, pageOffset });
    
    // Convert price strings to numbers
    const priceStart = minPrice ? parseFloat(minPrice) : undefined;
    const priceEnd = maxPrice ? parseFloat(maxPrice) : undefined;
    
    // Store current page offset for use in callbacks
    currentPageOffsetRef.current = pageOffset;
    
    // Get platform from selected company (default to '1688' for 'All')
    const platformSource = getPlatformFromCompany(selectedCompany);
    
    // Call search API
    searchProducts(
      searchKeyword,
      platformSource,
      locale,
      pageOffset,
      20, // pageSize
      sortParam,
      priceStart,
      priceEnd,
      undefined // filter (can be added later if needed)
    );
  };

  // Handle end reached for infinite scroll
  const handleEndReached = () => {
    // console.log('handleEndReached called:', { hasMore, searchQuery, offset });
    // Prevent loading more data when refreshing
    if (isRefreshingRef.current) {
      // console.log('Skipping handleEndReached during refresh');
      return;
    }
    
    if (hasMore && searchQuery) {
      // console.log('Incrementing offset to:', offset + 1);
      setOffset(prev => prev + 1);
    } else {
      // console.log('Not loading more because:', { 
      //   hasMore, 
      //   searchQuery: !!searchQuery,
      //   reason: !hasMore ? 'no more products' : 'no search query'
      // });
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    // Set the refreshing ref to true to prevent end reached during refresh
    isRefreshingRef.current = true;
    setOffset(1);
    setRefreshing(true);
    setHasMore(true);
    // Clear products immediately
    setProducts([]);
    
    // Load products with a small delay to ensure state updates
    setTimeout(async () => {
      try {
        await loadProducts(selectedSort || 'popularity', 1);
      } finally {
        setRefreshing(false);
        // Reset the refreshing ref after refresh is complete
        isRefreshingRef.current = false;
      }
    }, 50);
  };

  // Handle product press
  const handleProductPress = async (product: Product) => {
    // Get source from product data, fallback to selectedPlatform
    const source = (product as any).source || selectedPlatform || '1688';
    await navigateToProductDetail(product.id, source, locale);
  };

  // Handle like press
  const handleLikePress = async (product: Product) => {
    await toggleWishlist(product);
  };

  // Handle store press
  const handleStorePress = (storeId: number) => {
    // Navigate to store profile or detail screen
    // console.log('Store pressed:', storeId);
  };

  // Handle image search
  const handleImageSearch = async () => {
    const ImagePicker = await import('expo-image-picker');
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      alert('Please grant camera and photo library permissions to use image search.');
      return;
    }

    setImagePickerModalVisible(true);
  };

  // Helper function to convert image URI to base64
  const convertUriToBase64 = async (uri: string): Promise<string | null> => {
    try {
      const FileSystem = await import('expo-file-system');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      return base64;
    } catch (error) {
      // console.error('Error converting URI to base64:', error);
      return null;
    }
  };

  const handleTakePhoto = async () => {
    const ImagePicker = await import('expo-image-picker');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImagePickerModalVisible(false);
      let base64Data = result.assets[0].base64;
      
      // If base64 is not available (can happen after cropping), convert from URI
      if (!base64Data && result.assets[0].uri) {
        base64Data = await convertUriToBase64(result.assets[0].uri);
      }
      
      if (!base64Data) {
        showToast('Image data not available. Please try again.', 'error');
        return;
      }
      
      navigation.navigate('ImageSearch', { 
        imageUri: result.assets[0].uri,
        imageBase64: base64Data,
      });
    }
  };

  const handleChooseFromGallery = async () => {
    const ImagePicker = await import('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImagePickerModalVisible(false);
      let base64Data = result.assets[0].base64;
      
      // If base64 is not available (can happen after cropping), convert from URI
      if (!base64Data && result.assets[0].uri) {
        base64Data = await convertUriToBase64(result.assets[0].uri);
      }
      
      if (!base64Data) {
        showToast('Image data not available. Please try again.', 'error');
        return;
      }
      
      navigation.navigate('ImageSearch', { 
        imageUri: result.assets[0].uri,
        imageBase64: base64Data,
      });
    }
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >          
          <ArrowBackIcon width={12} height={20} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.searchButtonContainer}>
          <View style={styles.searchBar}>
            {!searchQuery && (
              <View style={styles.trendingTextContainer} pointerEvents="none">
                <Text style={styles.trendingText}>{t('search.trending')}</Text>
                <Text style={styles.keywordText}>{t('search.keyword')}</Text>
              </View>
            )}
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              // placeholder={!isSearchFocused && !searchQuery ? '' : t('search.placeholder')}
              placeholderTextColor={COLORS.gray[400]}
              returnKeyType="search"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-outline" size={20} color={COLORS.black} />
              </TouchableOpacity>
            ) : null}
            <View style={styles.searchIconContainer}>
              <Ionicons name="search-outline" size={16} color={COLORS.white} style={styles.searchIcon} />
            </View>
          </View>
        </View>
      </View>
      {renderCompanyTabs()}
    </View>
  )

  // Products are already filtered by API based on selectedCompany (platform parameter)
  // No need for client-side filtering since API handles it
  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  // Render company filter tabs
  const renderCompanyTabs = () => {
    // Always show company tabs if there are any companies (at least "All")
    // Show even when search query is cleared
    if (companies.length === 0) return null;
    
    return (
      <View style={styles.companyTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.companyTabs}
        >
          {companies.map((company, index) => {
            const isSelected = selectedCompany === company;
            
            return (
              <TouchableOpacity
                key={`company-${company}-${index}`}
                style={[
                  styles.companyTab,
                  index === companies.length - 1 && { marginRight: SPACING.md },
                  index === 0 && { marginLeft: SPACING.md }
                ]}
                onPress={() => {
                  setSelectedCompany(company);
                  // Update selectedPlatform in store based on selected company
                  const platform = getPlatformFromCompany(company);
                  setSelectedPlatform(platform);
                  // console.log('[SearchScreen] Company selected:', company, 'Platform updated to:', platform);
                  // Reload products when company changes
                  setPage(1);
                  setOffset(1);
                  setHasMore(true);
                  setProducts([]);
                  setTimeout(() => {
                    loadProducts(selectedSort || 'best_match', 1);
                  }, 50);
                }}
              >
                <Text style={[
                  styles.companyTabText,
                  isSelected && styles.activeCompanyTabText
                ]}>
                  {company}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Render sort and filter bar
  const renderSortAndFilter = () => (
    <View style={styles.sortFilterBar}>
      <View style={styles.sortButton}>
        <SortDropdown
          options={sortOptions}
          selectedValue={selectedSort}
          onSelect={(value) => {
            setSelectedSort(value);
            // Reload products with new sort
            setPage(1);
            setHasMore(true);
            setProducts([]);
            setTimeout(() => {
              loadProducts(value, offset);
            }, 50);
          }}
          textColor={COLORS.black}
          iconColor={COLORS.black}
        />
      </View>
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setPriceFilterModalVisible(true)}
      >
        <ViewListIcon width={20} height={20} color={COLORS.black} />
      </TouchableOpacity>
    </View>
  );


  // Render store carousel
  const renderStoreCarousel = () => (
    <View style={styles.storeBannersContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storeBanners}
      >
        {Array.isArray(memoizedStores) && memoizedStores.map((store, index) => (
          <TouchableOpacity key={`store-${store.id || index}`} style={styles.storeBanner}>
            <Image 
              source={store.avatar || (store.logo ? { uri: store.logo } : require('../../../assets/images/avatar.png'))}
              style={styles.storeAvatar}
              resizeMode="cover"
            />
             <Text style={styles.storeName} numberOfLines={2}>{store.name}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render product item using ProductCard with moreToLove variant
  const renderProductItem = ({ item }: { item: any }) => {
    if (!item) {
      return null;
    }
    
    // Parse variation data if it exists
    let price = item.price || 0;
    let productImage = '';
    
    if (item.variation) {
      try {
        const variations = JSON.parse(item.variation);
        if (Array.isArray(variations) && variations.length > 0 && variations[0].options && variations[0].options.length > 0) {
          price = variations[0].options[0].price;
          productImage = variations[0].options[0].image;
        }
      } catch (e) {
        // console.error('Error parsing variations:', e);
      }
    }
    
    // Get image from item - API returns 'image' (singular), Product type expects 'image' (string)
    const itemImage = item.image || item.imageUrl || productImage || '';
    
    // Create Product object
    const productId = item.id?.toString() || item.externalId?.toString() || '';
    const externalId = item.externalId?.toString() || item.id?.toString() || '';
    const offerId = item.offerId?.toString() || item.externalId?.toString() || item.id?.toString() || '';
    
    const product: Product = {
      id: productId,
      externalId: externalId,
      offerId: offerId,
      name: item.name || item.title || 'Unknown Product',
      description: item.description || item.titleOriginal || item.title || '',
      price: price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      image: itemImage,
      category: item.category || { id: '', name: '', icon: '', image: '', subcategories: [] },
      subcategory: item.subcategory || '',
      brand: item.brand || '',
      seller: item.seller || {
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
      rating: item.rating || 0,
      reviewCount: item.reviewCount || item.rating_count || 0,
      rating_count: item.rating_count || 0,
      inStock: item.inStock !== undefined ? item.inStock : true,
      stockCount: item.stockCount || item.stock_count || 0,
      sizes: item.sizes || [],
      colors: item.colors || [],
      tags: item.tags || [],
      isNew: item.isNew !== undefined ? item.isNew : false,
      isFeatured: item.isFeatured !== undefined ? item.isFeatured : false,
      isOnSale: item.isOnSale !== undefined ? item.isOnSale : false,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      orderCount: item.orderCount || item.order_count || 0,
    };
    
    return (
      <ProductCard
        product={product}
        variant="moreToLove"
        onPress={() => handleProductPress(product)}
        onLikePress={() => handleLikePress(product)}
        isLiked={isProductLiked(product)}
        cardWidth={CARD_WIDTH}
      />
    );
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    
    // Reset to first page when filters are cleared
    setOffset(1);
    setHasMore(true);
    setProducts([]); // Clear existing products
    
    // Load products with cleared filters
    setTimeout(() => {
      loadProducts(selectedSort || 'popularity', 1);
    }, 50);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        
        {/* Show content only when there's a search query */}
        {searchQuery ? (
          <View style={styles.contentContainer}>
            {/* Sort and Filter Bar */}
            {renderSortAndFilter()}
            
            {/* Product List */}
            <>
              {/* Category loading overlay */}
              {/* Loading spinner removed */}
              
              {/* Product list with moreToLove variant */}
              <FlatList
              ref={flatListRef}
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item, index) => `product-${item.id?.toString() || index}-${index}`}
              numColumns={2}
              columnWrapperStyle={styles.productGrid}
              contentContainerStyle={styles.productListContent}
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.1}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              updateCellsBatchingPeriod={50}
              extraData={products}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              style={styles.productList}
                />
              </>
          </View>
        ) : (
          <View style={styles.recentSearchesContainer}>
            <View style={styles.recentSearchesHeader}>
              <Text style={styles.recentSearchesTitle}>{t('search.recentSearches')}</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={() => {
                  if (!isGuest && user) {
                    clearHistory();
                  } else {
                    setRecentSearches([]);
                  }
                }}>
                  <Text style={styles.clearAllButton}>{t('search.clean')}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.recentSearchesList}>
              {recentSearches.map((search, index) => (
                <View key={`recent-${index}`} style={styles.recentSearchItemContainer}>
                  <TouchableOpacity
                    style={styles.recentSearchItem}
                    onPress={() => {
                      // Mark that this is a recent search click to preserve selected company
                      isRecentSearchClickRef.current = true;
                      // Set the search query which will trigger the search
                      setSearchQuery(search);
                      // Reset states to ensure fresh search
                      setOffset(1);
                      setHasMore(true);
                      setProducts([]);
                      // Loading spinner removed
                    }}
                  >
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                  {!isGuest && user && (
                    <TouchableOpacity
                      style={styles.deleteKeywordButton}
                      onPress={() => {
                        deleteKeyword(search);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={imagePickerModalVisible}
        onClose={() => setImagePickerModalVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
      />

      {/* Price Filter Modal */}
      <PriceFilterModal
        visible={priceFilterModalVisible}
        onClose={() => setPriceFilterModalVisible(false)}
        onApply={(min, max) => {
          setMinPrice(min);
          setMaxPrice(max);
          // Reset to first page and reload products with new price filter
          setOffset(1);
          setHasMore(true);
          setProducts([]);
          setTimeout(() => {
            loadProducts(selectedSort || 'popularity', 1);
          }, 50);
        }}
        initialMinPrice={minPrice}
        initialMaxPrice={maxPrice}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2.5,
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
    minHeight: 35,
  },
  searchIconContainer: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.full,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    padding: 0,
  },
  trendingTextContainer: {
    position: 'absolute',
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 0,
  },
  trendingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.red,
    fontWeight: '600',
  },
  keywordText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: SPACING.xs,
  },
  cameraButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyTabsContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.md,
  },
  companyTabs: {
    alignItems: 'center',
  },
  companyTab: {
    paddingHorizontal: SPACING.smmd,
    paddingVertical: SPACING.xs,
    // marginRight: SPACING.md,
  },
  companyTabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.black,
    fontWeight: '700',
  },
  activeCompanyTabText: {
    color: COLORS.text.red,
    fontWeight: '600',
  },
  categoryTabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  categoryTabsWrapper: {
    position: 'relative',
  },
  categoryTabs: {
    // paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  categoryTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.lg,
  },
  categoryTabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
  activeCategoryTabText: {
    color: COLORS.black,
    fontWeight: '600',
  },
  categoryBaseline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.gray[200],
  },
  categoryIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: COLORS.black,
    borderRadius: 1.5,
  },
  sortFilterBar: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  sortButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.gray[200],
    marginLeft: SPACING.md,
  },
  filterButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  sortButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.black,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  storeCarousel: {
    backgroundColor: COLORS.white,
  },
  storeCarouselContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginRight: SPACING.md,
    minWidth: 200,
  },
  // Adding store banner styles to match HomeScreen
  storeBannersContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  storeBanners: {
    paddingHorizontal: SPACING.md,
  },
  storeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    marginVertical: SPACING.xs,
    ...SHADOWS.sm,
  },
  storeAvatar: {
    width: 40,
    height: 40,
    // borderRadius: 20,
    marginRight: SPACING.sm,
  },
  storeName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  productGrid: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  productListContent: {
    paddingBottom: 120,
  },
  productList: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImageScrollView: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
  },
  productImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200]
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  likeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Adding trending heart button styles to match HomeScreen
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
  },
  productPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.red,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  soldText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  recentSearchesContainer: {
    padding: SPACING.lg,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recentSearchesTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  clearAllButton: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  recentSearchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  recentSearchItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  recentSearchItem: {
    flex: 1,
  },
  recentSearchText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  deleteKeywordButton: {
    marginLeft: SPACING.xs,
    padding: SPACING.xs,
  },
  filterSection: {
    backgroundColor: COLORS.white,
    flex: 1,
    justifyContent: 'space-between',
  },
  filterMainContent: {
    flexDirection: 'row',
    flex: 1,
  },
  filterLeftColumn: {
    width: 120,
    backgroundColor: COLORS.gray[100],
    borderRightWidth: 1,
    borderRightColor: COLORS.gray[200],
  },
  filterCategoryItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.gray[100],
  },
  filterCategoryItemActive: {
    backgroundColor: COLORS.white,
  },
  filterCategoryText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  filterCategoryTextActive: {
    fontWeight: '600',
    color: COLORS.red,
  },
  filterRightColumn: {
    flex: 1,
    padding: SPACING.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOptionsList: {
    gap: SPACING.sm,
  },
  filterOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionWide: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '45%',
    alignItems: 'center',
  },
  filterOptionFull: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    borderWidth: 2,
    borderColor: 'transparent',
    width: '100%',
  },
  filterOptionSelected: {
    backgroundColor: COLORS.white,
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: FONTS.sizes.md,
  },
  priceInputContainer: {
    padding: SPACING.sm,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    fontSize: FONTS.sizes.md,
    backgroundColor: COLORS.white,
  },
  priceSeparator: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text.secondary,
    marginTop: 20,
  },
  confirmButtonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  confirmButton: {
    backgroundColor: COLORS.transparent,
    borderRadius: 50,
    paddingVertical: SPACING.md + 2,
  },
  confirmButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
  },
});

export default SearchScreenComponent;
