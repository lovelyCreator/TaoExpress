import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList, Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useSearch } from '../../context/SearchContext';
import { useToast } from '../../context/ToastContext';
import { useCategoriesMutation, useCategoriesTreeMutation } from '../../hooks/useCategories';
import { useSortProductsMutation } from '../../hooks/useSearchMutations';
import { useStoresMutation, useSearchProductsByKeywordMutation } from '../../hooks/useHomeScreenMutations';
import { SortModal, ProductCard, Button } from '../../components';
import { usePlatformStore } from '../../store/platformStore';
import { useAppSelector } from '../../store/hooks';
import { productsApi } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.sm) / 2;

type ProductDiscoveryScreenRouteProp = RouteProp<RootStackParamList, 'ProductDiscovery'>;
type ProductDiscoveryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDiscovery'>;

const ProductDiscoveryScreen: React.FC = () => {
  const route = useRoute<ProductDiscoveryScreenRouteProp>();
  const navigation = useNavigation<ProductDiscoveryScreenNavigationProp>();
  const { likedProductIds, toggleWishlist, refreshWishlist } = useWishlist();
  const { searchQuery, setSearchQuery, selectedSort, setSelectedSort } = useSearch();
  
  const { subCategoryName, categoryId, categoryName, subcategoryId, subsubcategories: passedSubSubCategories } = route.params;
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<string | null>(null);
  const [displaySubSubCategories, setDisplaySubSubCategories] = useState<any[]>([]);
  
  // Get Zustand store
  const { getCompanyCategories, getSubSubcategoriesFromTree, selectedPlatform, setCategoriesTree } = usePlatformStore();
  const { showToast } = useToast();
  
  // Get locale from Redux store
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';

  // Helper function to navigate to product detail after checking API
  const navigateToProductDetail = async (
    productId: string | number,
    source: string = selectedPlatform,
    country: string = locale
  ) => {
    try {
      // Check product detail API first
      const response = await productsApi.getProductDetail(productId, source, country);
      
      if (response.success && response.data) {
        // API call successful, navigate to product detail
        navigation.navigate('ProductDetail', { 
          productId: productId.toString(),
          source: source,
        });
      } else {
        // API call failed, show toast and don't navigate
        showToast('Sorry, product details are not available right now.', 'error');
      }
    } catch (error) {
      // Error occurred, show toast and don't navigate
      console.error('Error checking product detail:', error);
      showToast('Sorry, product details are not available right now.', 'error');
    }
  };
  
  // Use the categories tree API hook
  const { mutate: fetchCategoriesTree } = useCategoriesTreeMutation({
    onSuccess: (data) => {
      // Store categories tree in Zustand
      setCategoriesTree(data);
    },
    onError: (error) => {
      console.error('Error fetching categories tree:', error);
    }
  });
  
  // Fetch categories tree when component mounts
  useEffect(() => {
    fetchCategoriesTree(selectedPlatform);
  }, [selectedPlatform]);

  // Load subsubcategories based on navigation params
  useEffect(() => {
    if (passedSubSubCategories && passedSubSubCategories.length > 0) {
      // Coming from a specific subcategory with subsubcategories
      // Ensure names are in the correct locale
      const localizedSubSubCategories = passedSubSubCategories.map((subSubCat: any) => {
        // If name is an object with zh, en, ko, extract the correct locale
        if (subSubCat.name && typeof subSubCat.name === 'object') {
          return {
            ...subSubCat,
            name: subSubCat.name[locale] || subSubCat.name.en || subSubCat.name
          };
        }
        // If it's already a string, use it as is
        return subSubCat;
      });
      setDisplaySubSubCategories(localizedSubSubCategories);
    } else if (categoryId && subcategoryId) {
      // Coming from a specific subcategory - get subsubcategories from tree
      try {
        const subSubCategories = getSubSubcategoriesFromTree(categoryId, subcategoryId, locale);
        if (subSubCategories && subSubCategories.length > 0) {
          setDisplaySubSubCategories(subSubCategories);
        } else {
          // No subsubcategories found, show "All" item
          setDisplaySubSubCategories([{
            id: 'all',
            name: 'All',
          }]);
        }
      } catch (error) {
        console.error('Error getting subsubcategories:', error);
        // On error, show "All" item
        setDisplaySubSubCategories([{
          id: 'all',
          name: 'All',
        }]);
      }
    } else if (categoryId) {
      // Coming from "All categories" - get all subsubcategories from the category
      try {
        const companyCategories = getCompanyCategories(locale);
        const category = companyCategories.find((cat: any) => cat.id === categoryId);
        
        if (category && category.children) {
          // Collect all subsubcategories from all subcategories using tree structure
          const allSubSubCategories: any[] = [];
          category.children.forEach((subcat: any) => {
            if (subcat.children && subcat.children.length > 0) {
              allSubSubCategories.push(...subcat.children.map((item: any) => ({
                id: item._id || item.id,
                name: item.name?.[locale] || item.name?.en || item.name,
              })));
            }
          });
          if (allSubSubCategories.length > 0) {
            setDisplaySubSubCategories(allSubSubCategories);
          } else {
            // No subsubcategories found, show "All" item
            setDisplaySubSubCategories([{
              id: 'all',
              name: 'All',
            }]);
          }
        } else {
          // No category found, show "All" item
          setDisplaySubSubCategories([{
            id: 'all',
            name: 'All',
          }]);
        }
      } catch (error) {
        console.error('Error getting subsubcategories from category:', error);
        // On error, show "All" item
        setDisplaySubSubCategories([{
          id: 'all',
          name: 'All',
        }]);
      }
    } else {
      // No category or subcategory provided, show "All" item
      setDisplaySubSubCategories([{
        id: 'all',
        name: 'All',
      }]);
    }
  }, [categoryId, subcategoryId, passedSubSubCategories, locale]);
  
  // Auto-select "All" when it's the only option
  useEffect(() => {
    if (displaySubSubCategories.length === 1 && displaySubSubCategories[0]?.id === 'all') {
      setSelectedSubSubCategory(null); // null means "All" is selected
      // Set searchQuery to subcategory name when "All" is auto-selected
      const categoryNameToUse = subCategoryName || categoryName || '';
      if (categoryNameToUse) {
        setSearchQuery(categoryNameToUse);
      }
    }
  }, [displaySubSubCategories, subCategoryName, categoryName]);
  
  // Search products by keyword mutation
  const {
    mutate: searchProductsByKeyword,
    data: searchProductsData,
    isLoading: searchProductsLoading,
    error: searchProductsError
  } = useSearchProductsByKeywordMutation({
    onSuccess: (data) => {
      console.log('Search products fetched successfully:', data?.length, 'items');
    },
    onError: (error) => {
      console.error('Search products fetch error:', error);
    }
  });

  // States
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<any[]>([]); // Store stores data
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(1); // Use offset instead of page
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(subCategoryName === 'View All' ? null : subCategoryName);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state
  const [categoryLoading, setCategoryLoading] = useState(false); // Add category loading state
  
  // Refs
  const isLoadingRef = useRef(false);
  const flatListRef = useRef<FlatList>(null); // Add FlatList ref
  const isRefreshingRef = useRef(false); // Add refreshing ref
  
  // Modal states
  const [sortModalVisible, setSortModalVisible] = useState(false);
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
  }, []);

  // Add useEffect to refresh wishlist when component mounts
  useEffect(() => {
    // Refresh wishlist data when screen is loaded
    refreshWishlist();
  }, []);

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
  
  // Load products when subcategory is available and there are no subsubcategories
  useEffect(() => {
    // If we have a subcategoryId, no subsubcategories, and no products yet, load products for the subcategory
    if (subcategoryId && displaySubSubCategories.length === 0 && products.length === 0 && !categoryLoading && !isLoadingRef.current) {
      console.log('Loading products for subcategory (no subsubcategories):', subcategoryId);
      // Small delay to ensure state updates
      setTimeout(() => {
        setCategoryLoading(true);
        loadProducts(selectedSort || 'Popularity', 1);
      }, 100);
    }
  }, [subcategoryId, displaySubSubCategories.length, products.length, categoryLoading]);

  // Load products when selectedSubSubCategory changes or on initial load
  useEffect(() => {
    if (subCategoryName) {
      // Reset to first page and reload products when subsubcategory selection changes
      setOffset(1);
      setHasMore(true);
      setProducts([]);
      setCategoryLoading(true);
      setTimeout(() => {
        loadProducts(selectedSort || 'Popularity', 1);
      }, 50);
    }
  }, [selectedSubSubCategory, subCategoryName, displaySubSubCategories]);

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
      if (activeCategoryTab) {
        // Reset to first page when category changes
        setOffset(1);
        setHasMore(true);
        setCategoryLoading(true); // Show loading indicator
        loadProducts(selectedSort, offset); // Use the sort from context
      } else {
        // Load all products when no category is selected
        setOffset(1);
        setHasMore(true);
        setCategoryLoading(true); // Show loading indicator
        loadProducts(selectedSort, offset); // Load all products
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
    
    if (offset > 1) {
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

  // Update products when search results are fetched
  useEffect(() => {
    if (searchProductsData && Array.isArray(searchProductsData)) {
      if (offset === 1) {
        // First page, replace existing data
        setProducts(searchProductsData);
      } else {
        // Subsequent pages, append to existing data
        const uniqueNewProducts = searchProductsData.filter((newProduct: any) => 
          !products.some((existingProduct: any) => existingProduct.id === newProduct.id)
        );
        setProducts(prev => [...prev, ...uniqueNewProducts]);
      }
      // Set hasMore based on whether we got a full page
      setHasMore(searchProductsData.length >= 20);
      setCategoryLoading(false);
      isLoadingRef.current = false;
    }
  }, [searchProductsData, offset]);

  // Memoize products for performance
  const memoizedProducts = useMemo(() => products, [products]);

  // Load products using search API
  const loadProducts = async (sortType: string = selectedSort || 'Popularity', pageOffset: number = offset || 1 ) => {
    // Prevent multiple simultaneous API calls
    if (isLoadingRef.current) {
      console.log('Skipping loadProducts call - already loading', pageOffset);
      return;
    }
    
    // Use searchQuery if available, otherwise determine search keyword based on selected subsubcategory
    let searchKeyword = searchQuery || '';
    
    if (!searchKeyword) {
      // Fallback: Determine search keyword based on selected subsubcategory
      if (selectedSubSubCategory && selectedSubSubCategory !== 'all') {
        // If a subsubcategory is selected, use its name
        const selectedSubSubCat = displaySubSubCategories.find((cat: any) => {
          if (!cat || !cat.id) return false;
          const catId = String(cat.id).trim();
          const selectedId = String(selectedSubSubCategory).trim();
          return catId === selectedId;
        });
        if (selectedSubSubCat && selectedSubSubCat.name) {
          searchKeyword = selectedSubSubCat.name;
        }
      } else {
        // If "All" is selected, use the subcategory name
        searchKeyword = subCategoryName || '';
      }
    }
    
    if (!searchKeyword) {
      console.warn('No search keyword available, skipping product load');
      isLoadingRef.current = false;
      return;
    }
    
    console.log('loadProducts called:', { 
      offset: pageOffset, 
      searchKeyword, 
      searchQuery,
      selectedSubSubCategory,
      subCategoryName 
    });
    isLoadingRef.current = true;
    setCategoryLoading(true);
    
    try {
      // Use search API with keyword, platform, locale, page, pageSize
      // Note: The API uses page (1-based) not offset, so we use pageOffset directly
      searchProductsByKeyword(
        searchKeyword,
        selectedPlatform,
        locale,
        pageOffset,
        20 // pageSize - same as "For you" section
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
      setCategoryLoading(false);
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
    
    if (hasMore) {
      console.log('Incrementing offset to:', offset + 1);
      setOffset(prev => prev + 1);
    } else {
      console.log('Not loading more because:', { 
        hasMore, 
        reason: 'no more products'
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
          placeholder={subCategoryName || "Search products"}
          placeholderTextColor={COLORS.gray[400]}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color={COLORS.black} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )



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

  // Render subsubcategories horizontal scroll
  const renderSubSubCategories = () => {
    if (!displaySubSubCategories || displaySubSubCategories.length === 0) return null;

    return (
      <View style={styles.subSubCategoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subSubCategoriesContent}
        >
          {displaySubSubCategories.map((subSubCat: any, index: number) => {
            const isAllItem = subSubCat.id === 'all';
            return (
              <TouchableOpacity
                key={subSubCat.id || index}
                style={styles.subSubCategoryItem}
                onPress={() => {
                  if (isAllItem) {
                    // For "All" item, clear the selection to show all products
                    setSelectedSubSubCategory(null);
                    // Set searchQuery to subcategory name for "All"
                    const categoryNameToUse = subCategoryName || categoryName || '';
                    console.log('Setting searchQuery to subcategory name for "All":', categoryNameToUse);
                    setSearchQuery(categoryNameToUse);
                  } else {
                    // Always select the pressed item (no toggle - always set to the item's id)
                    // Ensure ID is stored as string for consistent comparison
                    setSelectedSubSubCategory(subSubCat.name);
                    // Update searchQuery to the subsubcategory name
                    setSearchQuery(subSubCat.name || '');
                  }
                  // Reload products for this subsubcategory
                  setOffset(1);
                  setHasMore(true);
                  setProducts([]);
                  setCategoryLoading(true);
                  setTimeout(() => {
                    loadProducts(selectedSort || 'Popularity', 1);
                  }, 50);
                }}
              >
                <View style={[
                  styles.subSubCategoryImageContainer,
                  (searchQuery === subSubCat.name) && styles.subSubCategoryImageContainerSelected
                ]}>
                  {!isAllItem && subSubCat.image ? (
                    <Image 
                      source={{ uri: subSubCat.image }} 
                      style={styles.subSubCategoryImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image 
                      source={require('../../assets/icons/logo.png')} 
                      style={styles.subSubCategoryLogo}
                      resizeMode="contain"
                    />
                  )}
                </View>
                <Text style={[
                  styles.subSubCategoryName,
                  (searchQuery === subSubCat.name) && styles.subSubCategoryNameSelected
                ]} numberOfLines={2}>
                  {subSubCat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Render inline filter section (matching SearchScreen)
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



  // Product press handlers
  const handleProductPress = async (product: Product) => {
    await navigateToProductDetail(product.id, selectedPlatform, locale);
  };

  const handleLikePress = async (product: Product) => {
    await toggleWishlist(product);
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
        
        {/* Show content always - matching SearchScreen design */}
        <View style={{flex: 1}}>
          {renderSortAndFilter()}
          {renderSubSubCategories()}
          
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
              
              {/* Show products list using ProductCard like SearchScreen */}
              <FlatList
                ref={flatListRef}
                data={memoizedProducts}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    variant="moreToLove"
                    onPress={() => handleProductPress(item)}
                    onLikePress={() => handleLikePress(item)}
                    isLiked={likedProductIds.includes(item.id?.toString())}
                  />
                )}
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
                extraData={memoizedProducts}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                style={styles.productList}
              />
            </>
          )}
        </View>
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
              sortType = 'Popularity';
              break;
            case 'high_sales':
              sortType = 'Top'; // High sales
              break;
            case 'low_sales':
              sortType = 'Newest'; // Low sales
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
          setSortModalVisible(false);
        }}
        selectedValue={selectedSort || "all"}
        options={[
          { label: 'All', value: 'all', icon: 'apps', color: '#3B82F6' },
          { label: 'High Sales', value: 'high_sales', icon: 'trending-up', color: '#10B981' },
          { label: 'Low Sales', value: 'low_sales', icon: 'trending-down', color: '#F59E0B' },
          { label: 'High Price', value: 'price_high', icon: 'arrow-up-circle', color: '#EF4444' },
          { label: 'Low Price', value: 'price_low', icon: 'arrow-down-circle', color: '#8B5CF6' },
        ]}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['2xl'],
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
    width: '80%',
    textAlign: 'left',
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
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
  subSubCategoriesContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  subSubCategoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  subSubCategoryItem: {
    alignItems: 'center',
    width: 80,
  },
  subSubCategoryImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  subSubCategoryImageContainerSelected: {
    borderColor: COLORS.accentPink,
    backgroundColor: COLORS.white,
  },
  subSubCategoryImage: {
    width: '100%',
    height: '100%',
  },
  subSubCategoryLogo: {
    width: '50%',
    height: '50%',
  },
  subSubCategoryName: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  subSubCategoryNameSelected: {
    color: COLORS.accentPink,
    fontWeight: '600',
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
  filterSection: {
    backgroundColor: COLORS.white,
    flex: 1,
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
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOptionsList: {
    gap: SPACING.sm,
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

export default ProductDiscoveryScreen;