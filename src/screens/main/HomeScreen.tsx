import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Create animated icon component
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useForYou } from '../../context/ForYouContext';
import { RootStackParamList, Product, NewInProduct, Store, Story } from '../../types';

import companiesData from '../../data/mockCompanies.json';
import mockProductsData from '../../data/mockProducts.json';
import { productsApi, storesApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { ProductCard, PlatformMenu, SearchButton, NotificationBadge, ImagePickerModal } from '../../components';
import { useCategoriesMutation } from '../../hooks/useCategories';
import { useNewInProductsMutation, useTrendingProductsMutation, useForYouProductsMutation, useStoresMutation } from '../../hooks/useHomeScreenMutations';
import { useGetWishlistMutation } from '../../hooks/useWishlistMutations'; // Add this import

const { width } = Dimensions.get('window');
// New In card sizing: width < 1/3 of screen, height ~1.7x width
const NEW_IN_CARD_WIDTH = Math.floor(width * 0.28);
const NEW_IN_CARD_HEIGHT = Math.floor(NEW_IN_CARD_WIDTH * 1.55);
 const GRID_CARD_WIDTH = (width - SPACING.md * 2 - SPACING.md) / 2;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Access cart context directly since we've fixed the provider
  const { addToCart } = useCart();
  const { user, isGuest } = useAuth();
  

  const { likedProductIds, toggleWishlist, isInWishlist, refreshWishlist } = useWishlist();
  const { 
    products: forYouProducts, 
    offset: forYouOffset, 
    hasMore: forYouHasMore, 
    isLoading: forYouLoading,
    error: forYouError,
    appendProducts,
    setProducts,
    setOffset,
    setHasMore,
    setLoading: setForYouLoading,
    setError: setForYouError,
    clearProducts
  } = useForYou();
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [newInGridProducts, setNewInGridProducts] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [apiStores, setApiStores] = useState<Store[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeCategoryTab, setActiveCategoryTab] = useState('Woman');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState('1688');
  
  const platforms = ['1688', 'taobao', 'wsy', 'vip', 'vvic', 'myCompany'];
  
  // Get categories for selected platform
  const getCompanyCategories = () => {
    const company = companiesData.companies.find(c => c.id === selectedPlatform);
    return company?.categories || [];
  };
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [useMockData, setUseMockData] = useState(true); // Use mock data for filtering demo
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // Track if scrolled past threshold
  
  // Update selected category when platform changes
  useEffect(() => {
    // Reset to "All" when platform changes
    setSelectedCategory('all');
  }, [selectedPlatform]);
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<{ x: number; width: number }[]>([]);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const categoryContainerWidthRef = useRef(0);
  const categoryContentWidthRef = useRef(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_TOP_HEIGHT = 100; // Height of logo and notification row
  const SCROLL_THRESHOLD = 5; // Very fast animated color change
  
  // State for scroll to top button
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollToTopOpacity = useRef(new Animated.Value(0)).current;
  
  // Interpolate header translation directly from scrollY
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_TOP_HEIGHT],
    outputRange: [0, -HEADER_TOP_HEIGHT],
    extrapolate: 'clamp',
  });
  
  // Immediate color change - step function (0 or 1, no gradual transition)
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  // State for new "New In" products
  const [newInProducts, setNewInProducts] = useState<NewInProduct[]>([]);
  
  // Debug effect to monitor newInProducts state changes
  useEffect(() => {
    // console.log('newInProducts state changed:', newInProducts);
  }, [newInProducts]);
  
  // Debug effect to monitor forYouProducts state changes
  useEffect(() => {
    // console.log('forYouProducts state changed:', forYouProducts);
  }, [forYouProducts]);
  
  // Debug effect to monitor pagination state changes
  useEffect(() => {
    // console.log('forYouOffset changed:', forYouOffset);
    // console.log('forYouHasMore changed:', forYouHasMore);
    // console.log('forYouLoading changed:', forYouLoading);
  }, [forYouOffset, forYouHasMore, forYouLoading]);
  
  // Debug effect to monitor trendingProducts state changes
  useEffect(() => {
    console.log('trendingProducts state changed:', trendingProducts);
  }, [trendingProducts]);
  
  // Use the categories API hook
  const { mutate: fetchCategories, data: categoriesData, isLoading: categoriesLoading } = useCategoriesMutation();
  
  // Use the wishlist API hook to fetch initial wishlist data
  const { mutate: fetchWishlist } = useGetWishlistMutation({
    onSuccess: (data) => {
      // The wishlist context will automatically update likedProductIds
      // We don't need to manually set them here as the context handles it
      console.log('Wishlist data loaded successfully');
    },
    onError: (error) => {
      console.error('Error loading wishlist:', error);
    }
  });
  
  // Use the new home screen mutation hooks
  const { mutate: fetchNewInProducts, data: newInData } = useNewInProductsMutation({
    onSuccess: (data) => {
      setNewInProducts(data);
    }
  });
  
  const { mutate: fetchTrendingProducts, data: trendingData, error: trendingError } = useTrendingProductsMutation({
    onSuccess: (data) => {
      console.log('Trending products fetch success:', data);
      setTrendingProducts(data);
    },
    onError: (error) => {
      console.error('Trending products fetch error:', error);
      setTrendingProducts([]);
    }
  });
  
  const { mutate: fetchForYouProducts, data: forYouData, error: forYouFetchError } = useForYouProductsMutation({
    onSuccess: (data, offset) => {
      console.log('For You products fetch success:', data);
      console.log('Current forYouProducts:', forYouProducts);
      console.log('Current forYouOffset:', forYouOffset);
      console.log('Fetched offset:', offset);
      
      if (offset === 1) {
        // First page, replace existing data
        console.log('Setting first page of For You products');
        setProducts(data);
      } else {
        // Subsequent pages, append to existing data
        console.log('Appending to existing For You products');
        appendProducts(data);
      }
      
      // Update pagination state
      setForYouLoading(false);
      // Check if there are more products to fetch (based on the response structure)
      if (data && Array.isArray(data)) {
        // If we got less than the requested limit, there are no more products
        setHasMore(data.length >= 10); // Using 10 since that's the limit we're requesting
      } else {
        setHasMore(false);
      }
    },
    onError: (error) => {
      console.error('For You products fetch error:', error);
      setForYouLoading(false);
      // Don't reset the existing products on error, just stop loading
    }
  });

  const { mutate: fetchStores, data: storesData } = useStoresMutation({
    onSuccess: (data) => {
      setApiStores(data);
    }
  });
  
  // Initialize with default categories, will be replaced by API data
  const [categories, setCategories] = useState<string[]>([]);
  
  // Fetch categories and wishlist from API when component mounts
  useEffect(() => {
    fetchCategories();
    // Fetch wishlist data when the screen loads
    if (user && !isGuest) {
      refreshWishlist(); // Use refreshWishlist from context instead of fetchWishlist
    }
  }, [user, isGuest]);

  // Update categories state when API data is received and fetch initial products
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      // Transform API data to extract category names and IDs
      // Handle cases where categories might not have both id and name
      const categoryNames = categoriesData
        .filter((category: any) => category && (category.name || category.id))
        .map((category: any) => {
          if (category.name) return category.name;
          if (category.id) return `Category ${category.id}`;
          return 'Unknown Category';
        });
      setCategories(categoryNames as string[]);
      
      // Only clear For You products when categories change if we're on the first page
      // This prevents clearing when we're just appending data
      if (forYouOffset === 1) {
        clearProducts();
      }
      
      // Set the first category as active if none is selected
      if (categoryNames.length > 0 && activeCategoryTab === 'Woman') {
        setActiveCategoryTab(categoryNames[0]);
        // Fetch new in products for the first category
        // Handle cases where the first category might not have an id
        const firstCategory = categoriesData.find((cat: any) => cat && (cat.name || cat.id));
        const firstCategoryId = firstCategory?.id;
        if (firstCategoryId !== undefined) {
          fetchNewInProducts(
            firstCategoryId,
            'all',    // type
            '[]',     // filter
            '',       // rating_count
            0.0,      // min_price
            999999.0, // max_price
            ''        // search
          );
        }
      }
      
      // Fetch trending products with all category IDs
      // Filter out categories without IDs
      const categoryIds = categoriesData
        .map((cat: any) => cat.id)
        .filter((id: any) => id !== undefined && id !== null);
      
      if (categoryIds.length > 0) {
        fetchTrendingProducts(
          categoryIds,
          'all',        // type
          '[]',         // filter
          '',           // rating_count
          0.0,          // min_price
          9999999999.0, // max_price
          ''            // search
        ).catch(error => {
          console.error('Error fetching trending products:', error);
        });
        
        // Only reset pagination and fetch For You products if we're on the first page
        if (forYouOffset === 1) {
          setOffset(1);
          setHasMore(true);
          fetchForYouProducts(
            categoryIds, 
            1, 
            10,
            'all',        // type
            '[]',         // filter
            '',           // rating_count
            0.0,          // min_price
            9999999999.0, // max_price
            ''            // search
          ); // Fetch For You products
        }
      }
    }
  }, [categoriesData, forYouOffset]);

  // Fetch new in products when active category changes
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0 && activeCategoryTab !== 'Woman') {
      // Find the category ID for the active category
      const activeCategory = categoriesData.find((category: any) => category.name === activeCategoryTab);
      if (activeCategory && activeCategory.id !== undefined) {
        fetchNewInProducts(
          activeCategory.id,
          'all',    // type
          '[]',     // filter
          '',       // rating_count
          0.0,      // min_price
          999999.0, // max_price
          ''        // search
        );
      } else if (activeCategory) {
        // console.log('Active category found but does not have an ID:', activeCategory);
      } else {
        // console.log('Active category not found in categoriesData');
      }
    }
  }, [activeCategoryTab, categoriesData]);

  // Helper function to filter mock products by company and category
  const getFilteredMockProducts = (productType: 'newIn' | 'trending' | 'forYou') => {
    const products = mockProductsData[productType] as any[];
    
    return products.filter((product: any) => {
      // Filter by company (platform)
      const matchesCompany = product.company === selectedPlatform;
      
      // Filter by category
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesCompany && matchesCategory;
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Set a default unread count for now
    setUnreadCount(25);
  }, [user?.id]);

  const loadData = async () => {
    try {
      // Set initial loading state
      if (initialLoading) {
        setLoading(true);
      }
      
      const [featuredRes, newRes, saleRes] = await Promise.all([
        productsApi.getFeaturedProducts(8),
        productsApi.getNewProducts(12),
        productsApi.getSaleProducts(6),
      ]);

      if (featuredRes.success) setFeaturedProducts(featuredRes.data);
      if (newRes.success) setNewProducts(newRes.data);
      if (saleRes.success) setSaleProducts(saleRes.data);
      // Set empty stories for now
      setStories([]);

      // Fetch stores using the mutation
      fetchStores('all', 1, 12);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    
    // Clear and fetch For You products when refreshing
    clearProducts();
    
    if (categoriesData && categoriesData.length > 0) {
      // Filter out categories without IDs
      const categoryIds = categoriesData
        .map((cat: any) => cat.id)
        .filter((id: any) => id !== undefined);
      
      if (categoryIds.length > 0) {
        setOffset(1);
        setHasMore(true);
        fetchForYouProducts(
          categoryIds, 
          1, 
          10,
          'all',        // type
          '[]',         // filter
          '',           // rating_count
          0.0,          // min_price
          9999999999.0, // max_price
          ''            // search
        );
      } else {
        // console.log('No valid category IDs found during refresh, skipping For You products fetch');
      }
    }
    
    // Refresh wishlist data on pull to refresh
    if (user && !isGuest) {
      refreshWishlist();
    }
    
    setRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleImageSearch = async () => {
    // Request permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera and photo library permissions to use image search.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Show the beautiful modal
    setImagePickerModalVisible(true);
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

  const handleNewInProductPress = (product: NewInProduct) => {
    // Convert NewInProduct to a basic Product object for navigation
    const basicProduct: Partial<Product> = {
      id: product.id.toString(),
      name: product.name,
      images: [product.image],
      // Add other required properties with default values
      description: '',
      price: 0,
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
      inStock: true,
      stockCount: 0,
      tags: [],
      isNew: true,
      isFeatured: false,
      isOnSale: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    navigation.navigate('ProductDetail', { productId: product.id.toString() });
  };

  const handleStoryPress = (story: Story) => {
    // Navigate to story viewer with product ID
    console.log("Story pressed: ", story.product?.id);
    navigation.navigate('StoryView', { 
      storyIndex: 0,
      productId: story.product?.id
    });
  };

  const renderHeader = () => {
    // Animated icon color (white to black)
    const animatedIconColor = scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View 
        style={[
          styles.header,
          { 
            transform: [{ translateY: headerTranslateY }],
          }
        ]}
      >
        <View style={styles.headerContent}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" />
          {/* Logo and Notification */}
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              {/* Logo hidden */}
            </View>
            <View style={styles.headerSpacer} />
            <NotificationBadge
              icon="headset-outline"
              iconSize={36}
              iconColor={COLORS.white}
              count={unreadCount}
              badgeColor="#fa9d24ff"
              onPress={() => {
                navigation.navigate('CustomerService' as never);
              }}
            />
          </View>
          
          {/* Search Bar and Platform Menu */}
          <View style={styles.searchRow}>
            <View style={styles.platformButton}>
              <PlatformMenu
                platforms={platforms}
                selectedPlatform={selectedPlatform}
                onSelectPlatform={setSelectedPlatform}
                getLabel={(platform) => platform.toUpperCase()}
                textColor={COLORS.white}
                iconColor={COLORS.white}
              />
            </View>
            
            <SearchButton
              placeholder="Search products..."
              onPress={() => navigation.navigate('Search' as never)}
              onCameraPress={handleImageSearch}
            />
          </View>
        </View>
      </Animated.View>
    );
  };

  // Store category tab layouts for auto-scroll
  const categoryTabLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});
  const categoryScrollViewWidth = useRef(0);

  const renderCategoryTabs = () => {
    const companyCategories = getCompanyCategories();
    // Add "All" as the first category
    const allCategories = [
      { id: 'all', name: 'All' },
      ...companyCategories
    ];
    
    // Animated text color (white to black)
    const animatedTextColor = scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View 
        style={[
          styles.categoryTabsContainer,
          { 
            transform: [{ translateY: headerTranslateY }],
          }
        ]}
        onLayout={(e) => {
          categoryScrollViewWidth.current = e.nativeEvent.layout.width;
        }}
      >
        <ScrollView 
          ref={categoryScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
          scrollEventThrottle={16}
        >
          {allCategories.map((category, index) => (
            <TouchableOpacity
              key={`category-${category.id}`}
              style={styles.categoryTab}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                categoryTabLayouts.current[category.id] = { x, width };
              }}
              onPress={() => {
                setSelectedCategory(category.id);
                
                // Auto-scroll to show the selected category
                const layout = categoryTabLayouts.current[category.id];
                if (layout && categoryScrollRef.current) {
                  const scrollViewWidth = categoryScrollViewWidth.current;
                  const itemX = layout.x;
                  const itemWidth = layout.width;
                  
                  // Calculate the scroll position to center the item
                  const scrollToX = itemX - (scrollViewWidth / 2) + (itemWidth / 2);
                  
                  categoryScrollRef.current.scrollTo({
                    x: Math.max(0, scrollToX),
                    animated: true,
                  });
                }
                
                // Refetch products for the selected category
                console.log('Selected category:', category.name);
                
                // Clear existing products
                setNewInProducts([]);
                setTrendingProducts([]);
                clearProducts();
                
                // Fetch products based on selected category
                if (categoriesData && categoriesData.length > 0) {
                  const categoryIds = category.id === 'all' 
                    ? categoriesData.map((cat: any) => cat.id).filter((id: any) => id !== undefined)
                    : categoriesData
                        .filter((cat: any) => cat.name === category.name)
                        .map((cat: any) => cat.id)
                        .filter((id: any) => id !== undefined);
                  
                  if (categoryIds.length > 0) {
                    // Fetch New In products
                    if (category.id === 'all') {
                      const firstCategory = categoriesData.find((cat: any) => cat && (cat.name || cat.id));
                      const firstCategoryId = firstCategory?.id;
                      if (firstCategoryId !== undefined) {
                        fetchNewInProducts(firstCategoryId, 'all', '[]', '', 0.0, 999999.0, '');
                      }
                    } else {
                      const matchedCategory = categoriesData.find((cat: any) => cat.name === category.name);
                      if (matchedCategory && matchedCategory.id !== undefined) {
                        fetchNewInProducts(matchedCategory.id, 'all', '[]', '', 0.0, 999999.0, '');
                      }
                    }
                    
                    // Fetch Trending products
                    fetchTrendingProducts(categoryIds, 'all', '[]', '', 0.0, 9999999999.0, '');
                    
                    // Fetch For You products
                    setOffset(1);
                    setHasMore(true);
                    fetchForYouProducts(categoryIds, 1, 10, 'all', '[]', '', 0.0, 9999999999.0, '');
                  }
                }
              }}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.activeCategoryTabText,
              ]}>
                {category.name}
              </Text>
              {selectedCategory === category.id && (
                <View style={styles.categoryUnderline} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderQuickCategories = () => (
    <View style={styles.quickCategoriesContainer}>
      {/* <View style={styles.quickCategoriesGrid}>
        {Array.isArray(quickCategories) && quickCategories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.quickCategoryItem}
            onPress={() => navigation.navigate('Category', { categoryId: category.id })}
          >
            <Image 
              source={typeof category.image === 'string' ? { uri: category.image } : category.image}
              style={styles.quickCategoryImage}
              resizeMode="cover"
            />
            <Text style={styles.quickCategoryName} numberOfLines={2}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View> */}
    </View>
  );

  // const renderProductCard = (product: Product) => (
  //   <ProductCard
  //     product={product}
  //     variant="default"
  //     onAddToCart={handleAddToCart}
  //     showQuickAdd={true}
  //     showWishlistButton={true}
  //   />
  // );

  const renderNewInCards = () => {
    // Use filtered mock data for demo
    const productsToShow = useMockData 
      ? getFilteredMockProducts('newIn')
      : newInProducts;
    
    // Add a safety check to ensure products is an array
    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today Deals</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newInContainer}
        >
          {productsToShow.map((product: any) => {
            // Parse variation data if it exists
            let price = product.price || 0;
            let productImage = product.image;
            
            // Convert to Product type
            const productData: Product = {
              id: product.id.toString(),
              name: product.name,
              images: [productImage],
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
                alert('Please login first');
                return;
              }
              try {
                await toggleWishlist(productData);
              } catch (error) {
                console.error('Error toggling wishlist:', error);
              }
            };
            
            return (
              <ProductCard
                key={`newincard-${product.id}`}
                product={productData}
                variant="horizontal"
                onPress={() => handleNewInProductPress(product)}
                onLikePress={handleLike}
                isLiked={likedProductIds.includes(product.id.toString())}
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

  // Brand images for auto-scrolling carousel
  const brandImages = [
    "https://picsum.photos/seed/fashion-sale/800/220",
    "https://picsum.photos/seed/summer-collection/800/220", 
    "https://picsum.photos/seed/new-arrivals/800/220",
    "https://picsum.photos/seed/electronics-deal/800/220",
    "https://picsum.photos/seed/beauty-brands/800/220",
    "https://picsum.photos/seed/home-decor/800/220",
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
    </View>
  );

  const renderTrendingProducts = () => {
    // Use filtered mock data for demo
    const productsToShow = useMockData 
      ? getFilteredMockProducts('trending')
      : trendingProducts;
    
    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New In</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingProductsContainer}
        >
          {productsToShow.slice(0, 6).map((product: any) => {
            if (!product || !product.id) {
              return null;
            }
            
            // Parse variation data if it exists
            let price = product.price || 0;
            let productImage = '';
            
            if (product.variation) {
              try {
                const variations = JSON.parse(product.variation);
                if (Array.isArray(variations) && variations.length > 0 && variations[0].options && variations[0].options.length > 0) {
                  price = variations[0].options[0].price;
                  productImage = variations[0].options[0].image;
                }
              } catch (e) {
                console.error('Error parsing variations:', e);
              }
            }
            
            // Create a proper Product object
            const productData: Product = {
              id: product.id?.toString() || '',
              name: product.name || 'Unknown Product',
              description: product.description || '',
              price: price,
              originalPrice: product.originalPrice,
              discount: product.discount,
              images: product.images && product.images.length > 0 
                ? product.images 
                : productImage 
                  ? [productImage]
                  : [`https://picsum.photos/seed/trending${product.id}/400/500`],
              category: product.category || { id: '', name: '', icon: '', image: '', subcategories: [] },
              subcategory: product.subcategory || '',
              brand: product.brand || '',
              seller: product.seller || {
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
              reviewCount: product.reviewCount || product.rating_count || 0,
              inStock: product.inStock !== undefined ? product.inStock : true,
              stockCount: product.stockCount || product.stock_count || 0,
              sizes: product.sizes || [],
              colors: product.colors || [],
              tags: product.tags || [],
              isNew: product.isNew !== undefined ? product.isNew : false,
              isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
              isOnSale: product.isOnSale !== undefined ? product.isOnSale : false,
              createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
              updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
              rating_count: product.rating_count || 0,
              orderCount: (product as any).order_count || 0,
            };
            
            const handleLike = async () => {
              if (!user || isGuest) {
                alert('Please login first');
                return;
              }
              try {
                await toggleWishlist(productData);
              } catch (error) {
                console.error('Error toggling wishlist:', error);
              }
            };
            
            return (
              <ProductCard
                key={`trending-${product.id}`}
                product={productData}
                variant="horizontal"
                onPress={() => handleProductPress(productData)}
                onLikePress={handleLike}
                isLiked={likedProductIds.includes(product.id.toString())}
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

  const renderMoreToLove = () => {
    // Use filtered mock data for demo
    const productsToDisplay = useMockData 
      ? getFilteredMockProducts('forYou')
      : forYouProducts || [];
    
    if (!Array.isArray(productsToDisplay) || productsToDisplay.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>More to Love</Text>
        <View style={styles.newInGridContainer}>
          {productsToDisplay.map((product, index) => {
            if (!product || !product.id) {
              return null;
            }
            
            // Parse variation data if it exists
            let price = product.price || 0;
            let productImage = '';
            
            if (product.variation) {
              try {
                const variations = JSON.parse(product.variation);
                if (Array.isArray(variations) && variations.length > 0 && variations[0].options && variations[0].options.length > 0) {
                  price = variations[0].options[0].price;
                  productImage = variations[0].options[0].image;
                }
              } catch (e) {
                console.error('Error parsing variations:', e);
              }
            }
            
            // Create a proper Product object
            const productData: Product = {
              id: product.id?.toString() || '',
              name: product.name || 'Unknown Product',
              description: product.description || '',
              price: price,
              originalPrice: product.originalPrice,
              discount: product.discount,
              images: product.images && product.images.length > 0 
                ? product.images 
                : productImage 
                  ? [productImage]
                  : [`https://picsum.photos/seed/foryou${product.id || index}/400/500`],
              category: product.category || { id: '', name: '', icon: '', image: '', subcategories: [] },
              subcategory: product.subcategory || '',
              brand: product.brand || '',
              seller: product.seller || {
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
              reviewCount: product.reviewCount || product.rating_count || 0,
              inStock: product.inStock !== undefined ? product.inStock : true,
              stockCount: product.stockCount || product.stock_count || 0,
              sizes: product.sizes || [],
              colors: product.colors || [],
              tags: product.tags || [],
              isNew: product.isNew !== undefined ? product.isNew : false,
              isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
              isOnSale: product.isOnSale !== undefined ? product.isOnSale : false,
              createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
              updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
              rating_count: product.rating_count || 0,
              orderCount: (product as any).order_count || 0,
            };
            
            const handleLike = async () => {
              if (!user || isGuest) {
                alert('Please login first');
                return;
              }
              try {
                await toggleWishlist(productData);
              } catch (error) {
                console.error('Error toggling wishlist:', error);
              }
            };
            
            return (
              <ProductCard
                key={`moretolove-${product.id || index}`}
                product={productData}
                variant="moreToLove"
                onPress={() => handleProductPress(productData)}
                onLikePress={handleLike}
                isLiked={likedProductIds.includes(product.id?.toString())}
                showLikeButton={true}
                showDiscountBadge={true}
                showRating={true}
              />
            );
          })}
          {/* Loading indicator for pagination */}
          {forYouLoading && forYouOffset > 1 && (
            <View style={styles.loadingMoreContainer}>
              <Text style={styles.loadingMoreText}>Loading more products...</Text>
            </View>
          )}
          {/* End of list indicator */}
          {!forYouHasMore && productsToDisplay.length > 0 && (
            <View style={styles.endOfListContainer}>
              <Text style={styles.endOfListText}>You've reached the end</Text>
            </View>
          )}
        </View>
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
        
        const paddingToEnd = 20;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToEnd;
        
        // If user is close to bottom and there are more products to fetch
        if (isCloseToBottom && forYouHasMore && !forYouLoading) {
          // Get category IDs
          const categoryIds = categoriesData ? categoriesData.map((cat: any) => cat.id) : [];
          if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            console.log('Fetching more For You products, offset:', forYouOffset + 1); // Debug log
            setForYouLoading(true);
            // Update offset and fetch in the same tick to ensure consistency
            const newOffset = forYouOffset + 1;
            setOffset(newOffset);
            fetchForYouProducts(
              categoryIds, 
              newOffset, 
              10,
              'all',        // type
              '[]',         // filter
              '',           // rating_count
              0.0,          // min_price
              9999999999.0, // max_price
              ''            // search
            );
          }
        }
      }
    }
  );

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.gradientBackgroundFixed,
          { transform: [{ translateY: headerTranslateY }] }
        ]}
      >
        <LinearGradient
          colors={['#FF0055', '#ff8676ff', '#fca8afff', '#FFFFFF']}
          locations={[0, 0.4, 0.45, 0.7, 1]}
          style={styles.gradientFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>
      
      <View style={styles.fixedTopBars}>
        {renderHeader()}
        {renderCategoryTabs()}
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
          {renderNewInCards()}
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
    backgroundColor: COLORS.white,
  },
  gradientBackgroundFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 550, // Shorter gradient coverage
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
    paddingTop: 90,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  fixedTopBars: {
    backgroundColor: 'transparent',
    zIndex: 10,
    marginBottom: -80,
  },
  headerPlaceholder: {
    backgroundColor: COLORS.white,
  },
  contentWrapper: {
    backgroundColor: 'transparent',
    // minHeight: '100%',
    marginBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    zIndex: 10,
    paddingHorizontal: SPACING.lg,
    // paddingTop: Platform.OS === 'ios' ? 30 : 20,
    paddingBottom: SPACING.sm,
  },
  headerContent: {
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  logoContainer: {
    // No background needed
  },
  logo: {
    width: 160,
    height: 80,
  },
  headerSpacer: {
    flex: 1,
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
  categoryTabs: {
    paddingHorizontal: SPACING.md,
  },
  categoryTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    // marginRight: SPACING.sm,
    position: 'relative',
  },
  categoryTabText: {
    fontSize: FONTS.sizes.lg,
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
    backgroundColor: COLORS.white,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.smmd,
  },
  newInContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  newInCard: {
    width: NEW_IN_CARD_WIDTH,
    marginRight: SPACING.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  newInImage: {
    width: '100%',
    height: NEW_IN_CARD_HEIGHT,
    borderRadius: 8,
    marginBottom: SPACING.sm,
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
    borderColor: COLORS.accentPink,
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
    paddingBottom: SPACING.md,
    position: 'relative',
  },
  brandSlide: {
    width: width,
    paddingHorizontal: SPACING.md,
    position: 'relative',
  },
  brandImage: {
    width: width - SPACING.md * 2,
    height: 220,
    borderRadius: BORDER_RADIUS.lg,
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
    // backgroundColor: COLORS.accentPink,
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
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
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
});

export default HomeScreen;