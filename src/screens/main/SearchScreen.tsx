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

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList, Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useSearch } from '../../context/SearchContext';
import { useCategoriesMutation } from '../../hooks/useCategories';
import { useSortProductsMutation } from '../../hooks/useSearchMutations';
import { useStoresMutation } from '../../hooks/useHomeScreenMutations';
import { SortModal, FilterModal, ImagePickerModal, ProductCard, Button } from '../../components';
import { SubFilterModal, SearchInput, FilterItem } from '../../components';


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.sm) / 2;

type ProductDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

const SearchScreenComponent: React.FC = () => {
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const { likedProductIds, toggleWishlist } = useWishlist();
  const { searchQuery, setSearchQuery, selectedSort, setSelectedSort } = useSearch();
  
  // States
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<any[]>([]); // Store stores data
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(1); // Add offset state
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state
  const [categoryLoading, setCategoryLoading] = useState(false); // Add category loading state
  const [recentSearches, setRecentSearches] = useState<string[]>(['cloths', 'caps']); // Recent searches state
  
  // Refs
  const isLoadingRef = useRef(false);
  const flatListRef = useRef<FlatList>(null); // Change to FlatList ref
  
  // Modal states
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [showFilterSection, setShowFilterSection] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('Platform');
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFactoryRatings, setSelectedFactoryRatings] = useState<string[]>([]);
  const [selectedImplementations, setSelectedImplementations] = useState<string[]>([]);
  
  // Category state
  const categoryScrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<{ x: number; width: number }[]>([]);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  // Hooks
  const { mutate: fetchCategories, data: categoriesData } = useCategoriesMutation();
  const { 
    mutate: sortProductsMutation, 
    data: sortResults,
    // isLoading: isSortingProducts - removed loading state
  } = useSortProductsMutation({
    onSuccess: (data) => {
      console.log('Sort success, received data:', data);
      console.log('Current offset:', offset);
      
      if (offset === 1) {
        // First page, replace existing data
        console.log('Setting first page of products');
        setProducts(data);
      } else {
        // Subsequent pages, append to existing data
        console.log('Appending to existing products');
        // Filter out any products that already exist in the current list
        const uniqueNewProducts = data.filter((newProduct: any) => 
          !products.some((existingProduct: any) => existingProduct.id === newProduct.id)
        );
        setProducts(prev => [...prev, ...uniqueNewProducts]);
      }
      // Set hasMore based on pagination information in the response
      // If we have pagination info, use it to determine if there are more products
      // Otherwise, fallback to checking if we received the full limit of products
      if (data && typeof data === 'object' && 'pagination' in data) {
        // Cast to any to access pagination property, then check hasNext
        setHasMore((data as any).pagination?.hasNext || false);
      } else {
        // Fallback to previous logic
        setHasMore(data.length >= 25 * offset); // Changed from 4 to 25 to match new limit
      }
    },
    onError: (error) => {
      console.error('Sort error:', error);
      // Even on error, we should clear products when changing categories
      if (offset === 1) {
        setProducts([]);
      }
    }
  });
  
  const { mutate: fetchStores, data: storesData } = useStoresMutation({
    onSuccess: (data) => {
      setStores(data || []);
    },
    onError: (error) => {
      console.error('Stores fetch error:', error);
    }
  });

  // Preload categories and stores when component mounts
  useEffect(() => {
    fetchCategories();
    fetchStores();
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
      console.error('Error loading recent searches:', error);
    }
  };

  // Save recent searches to AsyncStorage whenever they change
  useEffect(() => {
    const saveRecentSearches = async () => {
      try {
        await AsyncStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      } catch (error) {
        console.error('Error saving recent searches:', error);
      }
    };
    saveRecentSearches();
  }, [recentSearches]);

  // Memoize categories for performance
  const memoizedCategories = useMemo(() => categories, [categories]);
  const memoizedCategoryIds = useMemo(() => categoryIds, [categoryIds]);

  // Update categories when data is fetched
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      const categoryNames = categoriesData.map((cat: any) => cat.name);
      setCategories(categoryNames);
      
      const ids = categoriesData.map((cat: any) => cat.id);
      setCategoryIds(ids);
      
      // Set first category as active if none is selected
      if (!activeCategoryTab && categoryNames.length > 0) {
        setActiveCategoryTab(categoryNames[0]);
        // Set default sort to popularity when first category is selected
        if (!selectedSort) {
          setSelectedSort('popularity');
        }
      }
    }
  }, [categoriesData]);

  // Load products when categories are loaded and active category is set
  useEffect(() => {
    // Only load products if we have categories data, an active tab, and no products yet
    if (categoriesData && categoriesData.length > 0 && activeCategoryTab && products.length === 0) {
      // Small delay to ensure state updates
      setTimeout(() => {
        loadProducts(selectedSort, offset); // Load all products on initial load
      }, 50);
    }
  }, [categoriesData, activeCategoryTab, products.length]);

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

  // Synchronize selectedCategories with activeCategoryTab
  useEffect(() => {
    if (activeCategoryTab && categoriesData && categoriesData.length > 0 && selectedCategories.length === 0) {
      // If we have an active tab but no selected categories, set the active tab's category as selected
      const activeCategory = categoriesData.find((cat: any) => cat.name === activeCategoryTab);
      if (activeCategory && activeCategory.id) {
        setSelectedCategories([activeCategory.id]);
      }
    } else if (activeCategoryTab && categoriesData && categoriesData.length > 0 && selectedCategories.length > 0) {
      // If we have an active tab and selected categories, ensure the active tab matches the first selected category
      const firstSelectedCategory = categoriesData.find((cat: any) => cat.id === selectedCategories[0]);
      if (firstSelectedCategory && firstSelectedCategory.name !== activeCategoryTab) {
        setActiveCategoryTab(firstSelectedCategory.name);
      }
    }
  }, [activeCategoryTab, categoriesData, selectedCategories]);

  // Debounce search queries to avoid excessive API calls
  useEffect(() => {
    // Skip debounce when category changes
    if (activeCategoryTab && !searchQuery) {
      // Reset to first page when category changes
      setOffset(1);
      setHasMore(true);
      // Don't call loadProducts here as it's called in the category change effect
      return;
    }
    
    // Prevent loading when refreshing
    if (isRefreshingRef.current) {
      console.log('Skipping search query effect during refresh');
      return;
    }
    
    const handler = setTimeout(() => {
      if (searchQuery || activeCategoryTab) {
        // Add to recent searches if it's a new search query
        if (searchQuery && searchQuery.trim() !== '' && !recentSearches.includes(searchQuery.trim())) {
          setRecentSearches(prev => [searchQuery.trim(), ...prev].slice(0, 10)); // Keep only last 10 searches
        }
        
        // Reset to first page when search query or category changes
        setOffset(1);
        setHasMore(true);
        setCategoryLoading(true); // Show loading indicator
        loadProducts(selectedSort, offset); // Use the sort from context
      } else {
        // Clear products when search query is empty and no category is selected
        setProducts([]);
        setOffset(1);
        setHasMore(true);
      }
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, activeCategoryTab, selectedSort]);

  // Load more products when offset changes (infinite scroll)
  useEffect(() => {
    console.log('Offset changed to:', offset);
    // Prevent loading more data when refreshing
    if (isRefreshingRef.current) {
      console.log('Skipping offset effect during refresh');
      return;
    }
    
    if (offset > 1 && searchQuery) {
      console.log('Loading more products for offset:', offset);
      loadProducts(selectedSort, offset); // Use the sort from context
    }
  }, [offset, selectedSort]);

  // Trigger product load when active category changes
  useEffect(() => {
    // Prevent loading when refreshing
    if (isRefreshingRef.current) {
      console.log('Skipping category change effect during refresh');
      return;
    }
    
    if (activeCategoryTab && categoriesData && categoriesData.length > 0) {
      // Only trigger if we have categories data and an active tab
      const hasCategoryData = categoriesData.some((cat: any) => cat.name === activeCategoryTab);
      if (hasCategoryData) {
        setOffset(1);
        setHasMore(true);
        setProducts([]); // Clear existing products immediately
        setCategoryLoading(true); // Show loading indicator
        // Small delay to ensure state updates
        setTimeout(() => {
          loadProducts(selectedSort || 'Popularity', 1); // Use the sort from context
        }, 50);
      }
    }
  }, [activeCategoryTab, categoriesData, selectedSort]);

  // Memoize stores for performance
  const memoizedStores = useMemo(() => stores, [stores]);

  // Update stores when data is fetched
  useEffect(() => {
    if (storesData) {
      setStores(storesData);
    }
  }, [storesData]);

  // Memoize products for performance
  const memoizedProducts = useMemo(() => products, [products]);

  // Add a ref to track if we're currently refreshing
  const isRefreshingRef = useRef(false);

  // Load products
  const loadProducts = async (sortType: string = selectedSort || 'Popularity', pageOffset: number = offset || 1 ) => {
    // Prevent multiple simultaneous API calls
    if (isLoadingRef.current) {
      console.log('Skipping loadProducts call - already loading', pageOffset);
      return;
    }
    
    console.log('loadProducts called:', { offset: pageOffset, searchQuery, activeCategoryTab, sortType });
    isLoadingRef.current = true;
    
    try {
      let categoryIdsToUse: number[] = [];
      
      if (selectedCategories.length > 0) {
        // Use explicitly selected categories
        categoryIdsToUse = selectedCategories;
        console.log('Using selected category IDs:', selectedCategories);
      } else if (activeCategoryTab && categoriesData && categoriesData.length > 0) {
        // Use active category tab if no categories explicitly selected
        const selectedCategory = categoriesData.find((cat: any) => cat.name === activeCategoryTab);
        console.log('Selected category data:', selectedCategory);
        if (selectedCategory && selectedCategory.id !== undefined) {
          categoryIdsToUse = [selectedCategory.id];
          console.log('Using specific category ID:', selectedCategory.id);
        } else {
          // Fallback to first category if selected category not found
          const firstCategory = categoriesData[0];
          if (firstCategory && firstCategory.id !== undefined) {
            categoryIdsToUse = [firstCategory.id];
            console.log('Fallback to first category ID:', firstCategory.id);
          } else {
            categoryIdsToUse = [1]; // Ultimate fallback
            console.log('Using ultimate fallback category ID: 1');
          }
        }
      } else if (categoryIds.length > 0) {
        // Use stored category IDs
        categoryIdsToUse = categoryIds;
        console.log('Using stored category IDs:', categoryIds);
      } else {
        categoryIdsToUse = [1]; // Fallback
        console.log('Using fallback category ID: 1');
      }
      
      console.log('Final category IDs to use:', categoryIdsToUse);
      
      // Prepare filter parameter as JSON string
      let filterParam = '[]';
      const filters: any[] = [];
      
      // Add category filter if selected
      if (selectedCategories.length > 0) {
        filters.push({ categories: selectedCategories });
      }
      
      // Add rating filter if selected
      if (selectedRating !== null) {
        filters.push({ minRating: selectedRating });
      }
      
      if (filters.length > 0) {
        filterParam = JSON.stringify(filters);
      }
      
      // Convert price strings to numbers
      const minPriceNum = minPrice ? parseFloat(minPrice) : 0.0;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice) : 999999.0;
      
      // Validate category IDs before passing to sortProductsMutation
      const validCategoryIds = categoryIdsToUse.filter(id => id !== undefined && id !== null);
      if (validCategoryIds.length === 0) {
        console.warn('No valid category IDs found, using fallback ID 1');
        validCategoryIds.push(1);
      }
      
      console.log('Calling sortProductsMutation with:', {
        sort: sortType,
        categoryIds: validCategoryIds,
        offset: pageOffset, // Use pageOffset instead of offset
        limit: 25,
        type: 'all',
        filter: filterParam,
        ratingCount: selectedRating !== null ? selectedRating.toString() : '', // Pass rating_count parameter
        minPrice: isNaN(minPriceNum) ? 0.0 : minPriceNum,
        maxPrice: isNaN(maxPriceNum) ? 999999.0 : maxPriceNum,
        search: searchQuery
      });
      
      // Pass all parameters to the sortProductsMutation
      await sortProductsMutation(
        sortType, 
        validCategoryIds, 
        pageOffset, // Use pageOffset instead of offset
        25,          // limit - changed from 4 to 25
        'all',       // type
        filterParam, // filter - now using our filters
        selectedRating !== null ? selectedRating.toString() : '', // rating_count - pass selected rating
        isNaN(minPriceNum) ? 0.0 : minPriceNum,         // min_price
        isNaN(maxPriceNum) ? 999999.0 : maxPriceNum,    // max_price
        searchQuery  // search
      );
    } catch (error) {
      console.error('Error loading products:', error);
      // Clear products on error when on first page
      if (pageOffset === 1) {
        setProducts([]);
      }
    } finally {
      // Reset loading state
      isLoadingRef.current = false;
      setCategoryLoading(false); // Reset category loading state
      // Remove loading state references since we're not showing loading indicators
    }
  };

  // Handle end reached for infinite scroll
  const handleEndReached = () => {
    console.log('handleEndReached called:', { hasMore, searchQuery, offset });
    // Prevent loading more data when refreshing
    if (isRefreshingRef.current) {
      console.log('Skipping handleEndReached during refresh');
      return;
    }
    
    if (hasMore && searchQuery) {
      console.log('Incrementing offset to:', offset + 1);
      setOffset(prev => prev + 1);
    } else {
      console.log('Not loading more because:', { 
        hasMore, 
        searchQuery: !!searchQuery,
        reason: !hasMore ? 'no more products' : 'no search query'
      });
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
        await loadProducts(selectedSort || 'Popularity', 1);
      } finally {
        setRefreshing(false);
        // Reset the refreshing ref after refresh is complete
        isRefreshingRef.current = false;
      }
    }, 50);
  };

  // Handle product press
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  // Handle like press
  const handleLikePress = async (product: Product) => {
    await toggleWishlist(product);
  };

  // Handle store press
  const handleStorePress = (storeId: number) => {
    // Navigate to store profile or detail screen
    console.log('Store pressed:', storeId);
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

  const handleTakePhoto = async () => {
    const ImagePicker = await import('expo-image-picker');
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
    const ImagePicker = await import('expo-image-picker');
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

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.black} />
      </TouchableOpacity>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.gray[400]} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search"
          placeholderTextColor={COLORS.gray[400]}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color={COLORS.black} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleImageSearch}>
            <Ionicons name="camera-outline" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  // Render category tabs
  const renderCategoryTabs = () => (
    <View style={styles.categoryTabsContainer}>
      <View style={styles.categoryTabsWrapper}>
        <Animated.ScrollView 
          ref={categoryScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
        >
          {memoizedCategories.map((category, index) => {
            const categoryData = categoriesData?.[index];
            const categoryId = categoryData?.id;
            // Check if this category is selected (either as active tab or in selected categories)
            // When multiple categories are selected, mark the first one as active
            const isSelected = activeCategoryTab === category || 
                             (selectedCategories.length > 0 && selectedCategories[0] === categoryId);
            
            return (
              <TouchableOpacity
                key={`category-${category}-${index}`}
                style={[
                  styles.categoryTab, 
                  index === memoizedCategories.length-1 && {marginRight: 0}
                ]}
                onLayout={(e) => {
                  const { x, width } = e.nativeEvent.layout;
                  tabLayouts.current[index] = { x, width };
                }}
                onPress={() => {
                  console.log('Category selected:', category, 'ID:', categoryId);
                  // Always trigger load when category is selected, regardless of whether it's the same category
                  setActiveCategoryTab(category);
                  
                  // Also update selected categories for filter modal synchronization
                  if (categoryId) {
                    setSelectedCategories([categoryId]);
                  }
                  
                  // Update indicator position immediately
                  if (tabLayouts.current[index]) {
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
                  
                  // Trigger product load immediately when category changes
                  setPage(1); // Reset to first page when category changes
                  setHasMore(true);
                  setProducts([]); // Clear existing products immediately
                  setCategoryLoading(true); // Set loading state
                  setTimeout(() => {
                    loadProducts(selectedSort || 'Popularity', offset); // Use the selected sort option
                  }, 50); // Small delay to ensure state is updated
                }}
              >
                <Text style={[
                  styles.categoryTabText,
                  isSelected && styles.activeCategoryTabText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.ScrollView>
        <View style={styles.categoryBaseline} />
        <Animated.View style={[
          styles.categoryIndicator,
          { left: Animated.subtract(indicatorX, scrollX), width: indicatorW }
        ]} />
      </View>
    </View>
  );

  // Render sort and filter bar
  const renderSortAndFilter = () => (
    <View style={styles.sortFilterBar}>
      <TouchableOpacity 
        style={styles.sortButton}
        onPress={() => setSortModalVisible(true)}
      >
        <Text style={styles.sortButtonText}>Sort by</Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.black} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.sortButton, {borderRightWidth: 0}]}
        onPress={() => setShowFilterSection(!showFilterSection)}
      >
        <Text style={styles.sortButtonText}>Filter</Text>
        <Ionicons name={showFilterSection ? "chevron-up" : "chevron-down"} size={16} color={COLORS.black} />
      </TouchableOpacity>
    </View>
  );

  // Render inline filter section
  const renderFilterSection = () => {
    if (!showFilterSection) return null;

    const platforms = ['1688', 'taobao', 'wsy', 'vip', 'vvic', 'myCompany'];
    const filterCategories = ['Platform', 'Price', 'Factory', 'Implementation'];
    
    // Only show Factory and Implementation for 1688
    const show1688Only = selectedPlatforms.includes('1688') || selectedPlatforms.length === 0;
    let visibleCategories = filterCategories;
    if (!show1688Only) {
      visibleCategories = filterCategories.filter(c => c !== 'Factory' && c !== 'Implementation');
    }
    
    const factoryRatings = [
      'Certified factory',
      '5-star rating',
      '4.5 stars',
      '4 star rating',
      'Rating below 4 starts'
    ];
    
    const implementations = [
      '7 days without reason',
      'Same-day shipping from supplier',
      'Supplier ships within 24hours',
      'Supplier ships within 48 hours',
      'Individual delivery support',
      'Individually shipped',
      'Free shipping'
    ];
    
    const renderRightContent = () => {
      switch (activeFilterCategory) {
        case 'Platform':
          return (
            <View style={styles.filterOptionsGrid}>
              {platforms.map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.filterOptionWide,
                    selectedPlatforms.includes(platform) && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    // Single selection - radio button behavior
                    if (selectedPlatforms.includes(platform)) {
                      setSelectedPlatforms([]);
                    } else {
                      setSelectedPlatforms([platform]);
                    }
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedPlatforms.includes(platform) && styles.filterOptionTextSelected
                  ]}>
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        
        case 'Price':
          return (
            <View style={styles.priceInputContainer}>
              <View style={styles.priceInputRow}>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceInputLabel}>Min Price</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                </View>
                <Text style={styles.priceSeparator}>-</Text>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceInputLabel}>Max Price</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="999999"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>
            </View>
          );
        
        case 'Factory':
          return (
            <View style={styles.filterOptionsList}>
              {factoryRatings.map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.filterOptionFull,
                    selectedFactoryRatings.includes(rating) && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    if (selectedFactoryRatings.includes(rating)) {
                      setSelectedFactoryRatings(selectedFactoryRatings.filter(r => r !== rating));
                    } else {
                      setSelectedFactoryRatings([...selectedFactoryRatings, rating]);
                    }
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFactoryRatings.includes(rating) && styles.filterOptionTextSelected
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        
        case 'Implementation':
          return (
            <View style={styles.filterOptionsList}>
              {implementations.map((impl) => (
                <TouchableOpacity
                  key={impl}
                  style={[
                    styles.filterOptionFull,
                    selectedImplementations.includes(impl) && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    if (selectedImplementations.includes(impl)) {
                      setSelectedImplementations(selectedImplementations.filter(i => i !== impl));
                    } else {
                      setSelectedImplementations([...selectedImplementations, impl]);
                    }
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedImplementations.includes(impl) && styles.filterOptionTextSelected
                  ]}>
                    {impl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        
        default:
          return null;
      }
    };
    
    return (
      <View style={styles.filterSection}>
        <View style={styles.filterMainContent}>
          {/* Left Categories */}
          <View style={styles.filterLeftColumn}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {visibleCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterCategoryItem,
                    activeFilterCategory === category && styles.filterCategoryItemActive
                  ]}
                  onPress={() => setActiveFilterCategory(category)}
                >
                  <Text style={[
                    styles.filterCategoryText,
                    activeFilterCategory === category && styles.filterCategoryTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Right Content */}
          <View style={styles.filterRightColumn}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderRightContent()}
            </ScrollView>
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.confirmButtonContainer}>
          <Button
            title="Confirm"
            onPress={() => {
              setShowFilterSection(false);
              // Apply filters
              handleApplyFilters();
            }}
            variant="primary"
            size="large"
            style={styles.confirmButton}
            textStyle={styles.confirmButtonText}
          />
        </View>
      </View>
    );
  };

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
              source={store.avatar || (store.logo ? { uri: store.logo } : require('../../assets/images/avatar.png'))}
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
        console.error('Error parsing variations:', e);
      }
    }
    
    // Create Product object
    const product: Product = {
      id: item.id?.toString() || '',
      name: item.name || 'Unknown Product',
      description: item.description || '',
      price: price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      images: item.images || [productImage || ''],
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
        isLiked={likedProductIds.includes(product.id)}
        cardWidth={CARD_WIDTH}
      />
    );
  };
  
  // Handle apply filters
  const handleApplyFilters = () => {
    console.log('Applying filters:', {
      categories: selectedCategories,
      minPrice,
      maxPrice,
      rating: selectedRating
    });
    
    // Update categoryIds state with selected categories
    if (selectedCategories.length > 0) {
      setCategoryIds(selectedCategories);
      // Also update active category tab to match the first selected category
      if (categoriesData) {
        const firstSelectedCategory = categoriesData.find((cat: any) => cat.id === selectedCategories[0]);
        if (firstSelectedCategory) {
          setActiveCategoryTab(firstSelectedCategory.name);
        }
      }
    } else if (activeCategoryTab && categoriesData) {
      // If no categories selected, use the active category tab
      const activeCategory = categoriesData.find((cat: any) => cat.name === activeCategoryTab);
      if (activeCategory) {
        setCategoryIds([activeCategory.id]);
      }
    }
    
    // Update rating_count parameter
    // When I select 1 stars & up, the rating_count is 1, etc.
    // This will be passed to the API in the loadProducts function
    
    // Reset to first page when filters change
    setOffset(1);
    setHasMore(true);
    setProducts([]); // Clear existing products
    setCategoryLoading(true); // Show loading indicator
    
    // Load products with current filters
    setTimeout(() => {
      loadProducts(selectedSort || 'Popularity', 1);
    }, 50);
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating(null);
    
    // Reset categoryIds to match active category tab
    if (activeCategoryTab && categoriesData) {
      const activeCategory = categoriesData.find((cat: any) => cat.name === activeCategoryTab);
      if (activeCategory) {
        setCategoryIds([activeCategory.id]);
      }
    }
    
    // Reset to first page when filters are cleared
    setOffset(1);
    setHasMore(true);
    setProducts([]); // Clear existing products
    setCategoryLoading(true); // Show loading indicator
    
    // Load products with cleared filters
    setTimeout(() => {
      loadProducts(selectedSort || 'Popularity', 1);
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
            
            {/* Inline Filter Section or Product List */}
            {showFilterSection ? (
              renderFilterSection()
            ) : (
              <>
                {/* Category loading overlay */}
                {categoryLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  </View>
                )}
                
                {/* Product list with moreToLove variant */}
                <FlatList
              ref={flatListRef}
              data={products}
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
            )}
          </View>
        ) : (
          <View style={styles.recentSearchesContainer}>
            <View style={styles.recentSearchesHeader}>
              <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={() => setRecentSearches([])}>
                  <Text style={styles.clearButton}>Clean</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.recentSearchesList}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={`recent-${index}`}
                  style={styles.recentSearchItem}
                  onPress={() => {
                    // Set the search query which will trigger the search
                    setSearchQuery(search);
                    // Reset states to ensure fresh search
                    setOffset(1);
                    setHasMore(true);
                    setProducts([]);
                    setCategoryLoading(true);
                  }}
                >
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>
      
      {/* Sort Modal */}
      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        onSelect={(value) => {
          console.log('Selected sort option:', value);
          // Save the selected sort to context
          setSelectedSort(value);
          
          // Handle sort selection by triggering loadProducts with the appropriate sort parameter
          setOffset(1);
          setHasMore(true);
          setProducts([]); // Clear existing products
          setCategoryLoading(true); // Show loading indicator
          
          // Map the sort value to the appropriate API call
          let sortType = 'Popularity';
          switch (value) {
            case 'all':
              sortType = 'Popularity'; // All/Default
              break;
            case 'high_sales':
              sortType = 'Top'; // High sales (most ordered)
              break;
            case 'low_sales':
              sortType = 'Newest'; // Low sales (newest/least ordered)
              break;
            case 'price_high':
              sortType = 'Price High to Low';
              break;
            case 'price_low':
              sortType = 'Price Low to High';
              break;
            default:
              sortType = 'Popularity';
          }
          
          // Update the sort in the mutation and reload products
          setTimeout(() => {
            loadProducts(sortType, 1);
          }, 50); // Small delay to ensure state is updated
        }}
        selectedValue={selectedSort || "all"}
      />

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={imagePickerModalVisible}
        onClose={() => setImagePickerModalVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeArea: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderRadius: 40,
    paddingHorizontal: SPACING.md,
    marginLeft: SPACING.sm,
  },
  searchInput: {
    flexDirection: 'row',
    flex: 1,
    textAlign: 'left',
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.gray[200],
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
    color: COLORS.accentPink,
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
  clearButton: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  recentSearchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  recentSearchItem: {
    backgroundColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  recentSearchText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
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
    color: COLORS.accentPink,
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
    backgroundColor: '#00BCD4',
    borderRadius: 50,
    paddingVertical: SPACING.md + 2,
  },
  confirmButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
  },
});

export default SearchScreenComponent;
