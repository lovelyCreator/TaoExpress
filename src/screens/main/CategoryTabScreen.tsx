import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList, Product } from '../../types';
import { SearchButton, NotificationBadge, ProductCard, ImagePickerModal } from '../../components';
import { useAuth } from '../../context/AuthContext';

import { useToast } from '../../context/ToastContext';
import { usePlatformStore } from '../../store/platformStore';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';
import { useCategoryTreeMutation } from '../../hooks/useCategoryTreeMutation';
import { useSearchProductsMutation } from '../../hooks/useSearchProductsMutation';
import { useWishlistStatus } from '../../hooks/useWishlistStatus';
import { useAddToWishlistMutation } from '../../hooks/useAddToWishlistMutation';
import { useDeleteFromWishlistMutation } from '../../hooks/useDeleteFromWishlistMutation';

const { width } = Dimensions.get('window');

type CategoryTabScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Category'>;

// Calculate card width for right column (accounting for left column width of 90)
const LEFT_COLUMN_WIDTH = 90;
const RIGHT_COLUMN_WIDTH = width - LEFT_COLUMN_WIDTH - SPACING.md * 3; // 3 spacings: left, middle, right
const FOR_YOU_CARD_WIDTH = (RIGHT_COLUMN_WIDTH - SPACING.sm * 3) / 2; // 2 cards per row with spacing

const CategoryTabScreen: React.FC = () => {
  const navigation = useNavigation<CategoryTabScreenNavigationProp>();
  const { user, isGuest } = useAuth();
  // Use wishlist status hook to check if products are liked based on external IDs
  const { isProductLiked, refreshExternalIds, addExternalId, removeExternalId } = useWishlistStatus();
  
  // Add to wishlist mutation
  const { mutate: addToWishlist } = useAddToWishlistMutation({
    onSuccess: async (data) => {
      console.log('Product added to wishlist successfully:', data);
      showToast('Product added to wishlist', 'success');
      // Immediately refresh external IDs to update heart icon color
      await refreshExternalIds();
    },
    onError: (error) => {
      console.error('Failed to add product to wishlist:', error);
      showToast(error || 'Failed to add product to wishlist', 'error');
    },
  });

  // Delete from wishlist mutation
  const { mutate: deleteFromWishlist } = useDeleteFromWishlistMutation({
    onSuccess: async (data) => {
      console.log('Product removed from wishlist successfully:', data);
      showToast('Product removed from wishlist', 'success');
      // Immediately refresh external IDs to update heart icon color
      await refreshExternalIds();
    },
    onError: (error) => {
      console.error('Failed to remove product from wishlist:', error);
      showToast(error || 'Failed to remove product from wishlist', 'error');
    },
  });
  
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
  
  // Zustand store
  const { 
    selectedPlatform, 
    selectedCategory,
    setSelectedPlatform, 
    setSelectedCategory,
    setCategoriesTree,
    getCompanyCategories,
    getRecommendedSubcategories,
    getSubcategoriesFromTree
  } = usePlatformStore();
  
  // i18n
  const locale = useAppSelector((s) => s.i18n.locale);
  const { showToast } = useToast();

  // Helper function to navigate to product detail
  const navigateToProductDetail = async (
    productId: string | number,
    source: string = selectedPlatform,
    country: string = locale as string
  ) => {
    navigation.navigate('ProductDetail', {
      productId: productId.toString(),
      source: source,
      country: country,
    });
  };
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  // Map company name to platform/source parameter
  const getPlatformFromCompany = (company: string): string => {
    if (company === 'All') {
      return '1688';
    }
    // Convert company name to lowercase for API (e.g., "Taobao" -> "taobao")
    return company.toLowerCase();
  };
  
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(25);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [showRecommended, setShowRecommended] = useState(true);
  const [forYouProducts, setForYouProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<string[]>(['All', '1688', 'Taobao', 'wsy', 'Vip', 'VVIC', 'Company Mall']);
  const [selectedCompany, setSelectedCompany] = useState<string>('All');

  const platforms = ['1688', 'taobao', 'wsy', 'vip', 'vvic', 'myCompany'];

  // Get categories tree from store to check if already loaded
  const { categoriesTree } = usePlatformStore();
  const hasFetchedRef = useRef<string | null>(null); // Track which platform we've fetched
  const hasFetchedForYouRef = useRef<string | null>(null); // Track which category we've fetched for "For You"
  const lastPlatformForCategoryRef = useRef<string | null>(null); // Track which platform we last set category for

  // Category tree mutation
  const { mutate: fetchCategoryTree, isLoading: isLoadingCategories } = useCategoryTreeMutation({
    onSuccess: (data) => {
      console.log('Category tree fetched successfully:', data);
      // Store category tree in Zustand store
      setCategoriesTree(data);
      // Mark this platform as fetched
      hasFetchedRef.current = data.platform;
    },
    onError: (error) => {
      console.error('Failed to fetch category tree:', error);
      // Reset ref on error so we can retry
      hasFetchedRef.current = null;
      showToast(error || 'Failed to load categories', 'error');
    },
  });

  // Fetch category tree when selected company changes
  // Platform parameter is determined by selected company (All = 1688)
  useEffect(() => {
    if (selectedCompany) {
      // Get platform from selected company
      const platformForCompany = getPlatformFromCompany(selectedCompany);
      
      // Check if we already have category tree data for this platform
      const hasDataForPlatform = categoriesTree && categoriesTree.platform === platformForCompany;
      const alreadyFetched = hasFetchedRef.current === platformForCompany;
      
      // Only fetch if we don't have data, haven't fetched yet, and not currently loading
      if (!hasDataForPlatform && !alreadyFetched && !isLoadingCategories) {
        hasFetchedRef.current = platformForCompany; // Mark as fetching
        fetchCategoryTree(platformForCompany);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany]); // Depend on selectedCompany instead of selectedPlatform

  // Get company categories from Zustand (with locale support)
  // This will be recalculated when locale changes
  const companyCategories = getCompanyCategories(locale);

  // Set first category as selected when company changes or when categories are loaded
  useEffect(() => {
    if (companyCategories.length > 0) {
      // Reset category selection when company changes to show first category
      const platformForCompany = getPlatformFromCompany(selectedCompany);
      const hasDataForPlatform = categoriesTree && categoriesTree.platform === platformForCompany;
      
      // Only set category if we have data for this platform and haven't set it for this platform yet
      if (hasDataForPlatform && lastPlatformForCategoryRef.current !== platformForCompany) {
        const firstCategoryId = companyCategories[0].id;
        // Only set if it's different from current selection or if no category is selected
        if (!selectedCategory || selectedCategory !== firstCategoryId) {
          setSelectedCategory(firstCategoryId);
          lastPlatformForCategoryRef.current = platformForCompany;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany, companyCategories, categoriesTree]);
  
  // Refresh categories when locale changes
  useEffect(() => {
    // Categories will automatically update because getCompanyCategories uses locale
    // This effect ensures the component re-renders when locale changes
  }, [locale]);

  // Search products mutation for "For You" section
  const { mutate: searchForYouProducts, isLoading: isLoadingForYou } = useSearchProductsMutation({
    onSuccess: (data) => {
      console.log('For You products fetched successfully:', data);
      if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
        // Map API response to Product format
        const mappedProducts = data.data.products.map((item: any) => {
          const price = parseFloat(item.price || item.wholesalePrice || item.dropshipPrice || 0);
          const originalPrice = parseFloat(item.originalPrice || price);
          const discount = originalPrice > price && originalPrice > 0
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;
          
          return {
            id: item.id?.toString() || item.externalId?.toString() || '',
            externalId: item.externalId?.toString() || item.id?.toString() || '',
            offerId: item.offerId?.toString() || item.externalId?.toString() || item.id?.toString() || '',
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
          } as Product;
        });
        setForYouProducts(mappedProducts);
        
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
        
        // Mark this category as fetched
        if (selectedCategory) {
          hasFetchedForYouRef.current = selectedCategory;
        }
      }
    },
    onError: (error) => {
      console.error('Failed to fetch For You products:', error);
      setForYouProducts([]);
      // Reset ref on error so we can retry
      hasFetchedForYouRef.current = null;
      showToast(error || 'Failed to load products', 'error');
    },
  });

  // Fetch "For You" products when category or company is selected
  useEffect(() => {
    if (locale && selectedCategory) {
      // Create a unique key for this combination of category and company
      const fetchKey = `${selectedCategory}-${selectedCompany}`;
      const alreadyFetched = hasFetchedForYouRef.current === fetchKey;
      
      // Only fetch if we haven't fetched for this combination yet and not currently loading
      if (!alreadyFetched && !isLoadingForYou) {
        // Find the selected category to get its name
        const selectedCategoryData = companyCategories.find((cat: any) => cat.id === selectedCategory);
        
        if (selectedCategoryData) {
          // Mark as fetching with the combination key
          hasFetchedForYouRef.current = fetchKey;
          
          // Get localized category name
          const categoryName = typeof selectedCategoryData.name === 'object' 
            ? (selectedCategoryData.name[locale] || selectedCategoryData.name.en || selectedCategoryData.name)
            : selectedCategoryData.name;
          
          // Use category name as keyword
          // Get platform from selected company (default to '1688' for 'All')
          const platformSource = getPlatformFromCompany(selectedCompany);
          searchForYouProducts(
            categoryName,
            platformSource,
            locale,
            1,
            20,
            '', // sort
            undefined, // priceStart
            undefined, // priceEnd
            'isQqyx' // filter
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedCompany]); // Depend on both selectedCategory and selectedCompany

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh For You products
    if (selectedPlatform && locale && selectedCategory) {
      const selectedCategoryData = companyCategories.find((cat: any) => cat.id === selectedCategory);
      
      if (selectedCategoryData) {
        const categoryName = typeof selectedCategoryData.name === 'object' 
          ? (selectedCategoryData.name[locale] || selectedCategoryData.name.en || selectedCategoryData.name)
          : selectedCategoryData.name;
        
        // Get platform from selected company (default to '1688' for 'All')
        const platformSource = getPlatformFromCompany(selectedCompany);
        searchForYouProducts(
          categoryName,
          platformSource,
          locale,
          1,
          20,
          '',
          undefined,
          undefined,
          'isQqyx'
        );
      }
    }
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string) => {
    // Just select the category - recommended subcategories will show automatically
    setSelectedCategory(categoryId);
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
      console.error('Error converting URI to base64:', error);
      return null;
    }
  };

  const handleImageSearch = async () => {
    // Request permissions
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

  const handleProductPress = async (product: Product) => {
    // Get source from product data, fallback to selectedPlatform (which is now updated when company is selected)
    const source = (product as any).source || selectedPlatform || '1688';
    await navigateToProductDetail(product.id, source, locale as string);
  };

  // Render company filter tabs
  const renderCompanyTabs = () => {
    // Always show company tabs if there are any companies (at least "All")
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
                  console.log('[CategoryTabScreen] Company selected:', company, 'Platform updated to:', platform);
                  // Reset fetch refs to allow refetch with new company
                  hasFetchedRef.current = null; // Reset category tree fetch ref
                  hasFetchedForYouRef.current = null; // Reset products fetch ref
                  lastPlatformForCategoryRef.current = null; // Reset platform ref so category gets set for new company
                  setForYouProducts([]);
                  // The useEffect will automatically set first category and refetch category tree and products when selectedCompany changes
                }}
              >
                <Text style={[
                  styles.companyTabText,
                  isSelected && styles.companyTabTextSelected
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

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.headerRow}>
        <SearchButton
          placeholder={t('category.searchPlaceholder')}
          onPress={() => navigation.navigate('Search' as never)}
          onCameraPress={handleImageSearch}
          style={styles.searchButton}
        />
        
        <NotificationBadge
          icon="notifications-outline"
          iconSize={28}
          iconColor={COLORS.text.primary}
          count={unreadCount}
          onPress={() => {
            // Navigate to notifications or customer service
            // navigation.navigate('CustomerService' as never);
          }}
        />
      </View>
      {renderCompanyTabs()}
    </View>
  );

  const renderCategoryItem = ({ item }: { item: any }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && styles.categoryItemActive
        ]}
        onPress={() => handleCategoryPress(item.id)}
      >
        <Text style={[
          styles.categoryName,
          isSelected && styles.categoryNameActive
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRecommendedItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.recommendedItem}
        onPress={() => {
          // Get the selected category to pass along
          const selectedCategoryData = companyCategories.find(cat => cat.id === selectedCategory);
          
          // Convert subsubcategories to correct locale if they exist
          let localizedSubSubCategories: any[] = [];
          if (item.subsubcategories && item.subsubcategories.length > 0) {
            localizedSubSubCategories = item.subsubcategories.map((subSubCat: any) => {
              // If subSubCat.name is an object with zh, en, ko, extract the correct locale
              if (subSubCat.name && typeof subSubCat.name === 'object') {
                return {
                  ...subSubCat,
                  name: subSubCat.name[locale] || subSubCat.name.en || subSubCat.name
                };
              }
              // If it's already a string, use it as is
              return subSubCat;
            });
          }
          
          // Get platform from selected company
          const platform = getPlatformFromCompany(selectedCompany);
          
          // Always go directly to ProductDiscovery
          navigation.navigate('ProductDiscovery', { 
            subCategoryName: item.name,
            categoryId: selectedCategory,
            categoryName: selectedCategoryData?.name,
            subcategoryId: item.id,
            subsubcategories: localizedSubSubCategories,
            source: platform, // Pass the current platform/company selection
          });
        }}
      >
        <View style={styles.recommendedImageContainer}>
          {item.image ? (
            <Image 
              source={{ uri: item.image }} 
              style={styles.recommendedImage}
              resizeMode="cover"
            />
          ) : (
            <Image 
              source={require('../../assets/icons/logo.png')} 
              style={styles.recommendedLogo}
              resizeMode="contain"
            />
          )}
        </View>
        <Text style={styles.recommendedName} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderForYouProducts = () => {
    // Show loading state
    if (isLoadingForYou) {
      return (
        <View style={styles.forYouSection}>
          <View style={styles.forYouHeader}>
            <Text style={styles.forYouTitle}>{t('home.forYou')}</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        </View>
      );
    }

    // Show empty state
    if (!Array.isArray(forYouProducts) || forYouProducts.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.forYouSection}>
        <View style={styles.forYouHeader}>
          <Text style={styles.forYouTitle}>{t('home.forYou')}</Text>
        </View>
        <View style={styles.forYouGrid}>
          {forYouProducts.map((product: Product, index: number) => {
            const handleLike = async () => {
              if (!user || isGuest) {
                alert('Please login first');
                return;
              }
              try {
                await toggleWishlist(product);
              } catch (error) {
                console.error('Error toggling wishlist:', error);
              }
            };

            return (
              <ProductCard
                key={`foryou-${product.id || index}`}
                product={product}
                variant="simple"
                onPress={() => handleProductPress(product)}
                onLikePress={handleLike}
                isLiked={isProductLiked(product)}
                showLikeButton={true}
                cardWidth={FOR_YOU_CARD_WIDTH}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // Use company categories for left column (with locale support)
  const categoriesToDisplay = getCompanyCategories(locale);
  
  // Get subcategories for recommended section (with locale support)
  const allRecommendedItems = getRecommendedSubcategories(locale);
  
  // Show only first 9 subcategories as recommended
  const recommendedItems = allRecommendedItems.slice(0, 9);
  
  // Check if there are more than 9 subcategories to show the "Show more" button
  const hasMoreSubcategories = allRecommendedItems.length > 9;

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <View style={styles.mainContent}>
        <View style={styles.leftColumn}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <FlatList
              data={categoriesToDisplay}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => `category-${item.id || item.name}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              style={{minHeight: '100%'}}
            />
          </ScrollView>
        </View>
        
        <View style={styles.rightColumn}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Recommended Section */}
            <View style={styles.recommendedSection}>
              <TouchableOpacity 
                style={styles.recommendedHeader}
                onPress={() => setShowRecommended(!showRecommended)}
              >
                <Text style={styles.recommendedTitle}>{t('home.recommended')}</Text>
                <Ionicons 
                  name={showRecommended ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={COLORS.text.primary} 
                />
              </TouchableOpacity>
              {showRecommended && (
                <>
                  <View style={styles.recommendedGrid}>
                    {recommendedItems.map((item, index) => (
                      <View key={`rec-${item.id || index}`}>
                        {renderRecommendedItem({ item })}
                      </View>
                    ))}
                  </View>
                  {hasMoreSubcategories && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => {
                        // Get the selected category to pass along
                        const selectedCategoryData = companyCategories.find(cat => cat.id === selectedCategory);
                        
                        // Get all subcategories for the selected category
                        const allSubcategories = allRecommendedItems;
                        
                        // Navigate to SubCategory screen to show all subcategories
                        // Convert categoryId to number if it's a valid number string, otherwise keep as string or pass as is
                        let categoryIdToPass: number | undefined;
                        if (selectedCategory) {
                          if (typeof selectedCategory === 'string') {
                            const numValue = Number(selectedCategory);
                            categoryIdToPass = isNaN(numValue) ? undefined : numValue;
                          } else if (typeof selectedCategory === 'number') {
                            categoryIdToPass = selectedCategory;
                          }
                        }
                        
                        navigation.navigate('SubCategory', { 
                          categoryName: selectedCategoryData?.name || 'All Subcategories',
                          categoryId: categoryIdToPass,
                          subcategories: allSubcategories,
                        });
                      }}
                    >
                      <Text style={styles.showMoreText}>Show more</Text>
                      <Ionicons 
                        name="chevron-forward" 
                        size={16} 
                        color={COLORS.primary} 
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
            
            {/* For You Section */}
            {renderForYouProducts()}
          </ScrollView>
        </View>
      </View>
      
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
  header: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.xl,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray[200],
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  searchButton: {
    borderRadius: BORDER_RADIUS.full,
    width: '90%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flexDirection: 'row',
    minHeight: '100%',
    paddingBottom: 100
  },
  leftColumn: {
    width: 120,
    backgroundColor: COLORS.gray[100],
  },
  rightColumn: {
    flex: 1,
  },
  categoryItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  categoryItemActive: {
    backgroundColor: COLORS.white,
  },
  categoryName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryNameActive: {
    fontWeight: '600',
    color: COLORS.red,
  },
  recommendedSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    borderBottomWidth: 5,
    paddingHorizontal: SPACING.sm,
    borderBottomColor: COLORS.gray[200],
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  recommendedTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  recommendedItem: {
    width: (width - 120 - SPACING.sm * 5) / 3,
    alignItems: 'center',
    padding: SPACING.sm,
  },
  recommendedImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  recommendedLogo: {
    width: '60%',
    height: '60%',
  },
  recommendedName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  forYouSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  forYouHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  forYouTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  forYouGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  showMoreText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  companyTabsContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
  },
  companyTabs: {
    alignItems: 'center',
  },
  companyTab: {
    paddingHorizontal: SPACING.smmd,
    paddingVertical: SPACING.xs,
  },
  companyTabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.black,
    fontWeight: '700',
  },
  companyTabTextSelected: {
    color: COLORS.text.red,
    fontWeight: '600',
  },
});

export default CategoryTabScreen;