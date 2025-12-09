import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList, Product } from '../../types';
import { useCategoriesMutation, useCategoriesTreeMutation } from '../../hooks/useCategories';
import { useSearchProductsByKeywordMutation } from '../../hooks/useHomeScreenMutations';
import { PlatformMenu, SearchButton, NotificationBadge, ProductCard, ImagePickerModal } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { usePlatformStore } from '../../store/platformStore';
import { useAppSelector } from '../../store/hooks';
import { productsApi } from '../../services/api';
import { translations } from '../../i18n/translations';

const { width } = Dimensions.get('window');

type CategoryTabScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Category'>;

// Calculate card width for right column (accounting for left column width of 90)
const LEFT_COLUMN_WIDTH = 90;
const RIGHT_COLUMN_WIDTH = width - LEFT_COLUMN_WIDTH - SPACING.md * 3; // 3 spacings: left, middle, right
const FOR_YOU_CARD_WIDTH = (RIGHT_COLUMN_WIDTH - SPACING.sm * 3) / 2; // 2 cards per row with spacing

const CategoryTabScreen: React.FC = () => {
  const navigation = useNavigation<CategoryTabScreenNavigationProp>();
  const { user, isGuest } = useAuth();
  const { likedProductIds, toggleWishlist } = useWishlist();
  
  // Zustand store
  const { 
    selectedPlatform, 
    selectedCategory,
    setSelectedPlatform, 
    setSelectedCategory,
    setCategoriesTree,
    getCompanyCategories,
    getRecommendedSubcategories
  } = usePlatformStore();
  const { showToast } = useToast();
  
  // i18n
  const locale = useAppSelector((s) => s.i18n.locale);

  // Helper function to navigate to product detail after checking API
  const navigateToProductDetail = async (
    productId: string | number,
    source: string = selectedPlatform,
    country: string = locale as string
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
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(25);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [showRecommended, setShowRecommended] = useState(true);

  const platforms = ['1688', 'taobao', 'wsy', 'vip', 'vvic', 'myCompany'];

  // Use the categories mutation hook to fetch categories from backend
  const { mutate: fetchCategories, data: categoriesData, isLoading: isCategoriesLoading, isError } = useCategoriesMutation();
  
  // Use the categories tree API hook
  const { mutate: fetchCategoriesTree, data: categoriesTreeData, isLoading: categoriesTreeLoading } = useCategoriesTreeMutation({
    onSuccess: (data) => {
      // Store categories tree in Zustand
      setCategoriesTree(data);
    },
    onError: (error) => {
      console.error('Error fetching categories tree:', error);
    }
  });

  // Get company categories from Zustand (with locale support)
  // This will be recalculated when locale changes
  const companyCategories = getCompanyCategories(locale);

  // Get selected category name for search
  const selectedCategoryData = companyCategories.find(cat => cat.id === selectedCategory);
  const searchKeyword = selectedCategoryData?.name || '';

  // Use search products by keyword mutation hook for "For You" section
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

  useEffect(() => {
    fetchCategories();
    // Fetch categories tree for the selected platform
    fetchCategoriesTree(selectedPlatform);
  }, []);
  
  // Fetch categories tree when platform changes
  useEffect(() => {
    fetchCategoriesTree(selectedPlatform);
  }, [selectedPlatform]);

  // Set first category as selected when platform changes
  useEffect(() => {
    if (companyCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(companyCategories[0].id);
    }
  }, [selectedPlatform, companyCategories]);

  // Fetch products when category or platform or locale changes
  useEffect(() => {
    if (searchKeyword && selectedPlatform) {
      searchProductsByKeyword(searchKeyword, selectedPlatform, locale as 'en' | 'zh' | 'ko', 1, 20);
    }
  }, [selectedCategory, selectedPlatform, locale, searchKeyword]);
  
  // Refresh categories when locale changes
  useEffect(() => {
    // Categories will automatically update because getCompanyCategories uses locale
    // This effect ensures the component re-renders when locale changes
  }, [locale]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    await fetchCategoriesTree(selectedPlatform);
    // Refresh search products
    if (searchKeyword && selectedPlatform) {
      searchProductsByKeyword(searchKeyword, selectedPlatform, locale as 'en' | 'zh' | 'ko', 1, 20);
    }
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
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

  const handleProductPress = async (product: Product) => {
    await navigateToProductDetail(product.id, selectedPlatform, locale as string);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.headerRow}>
        <PlatformMenu
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          getLabel={(platform) => t(`home.platforms.${platform}`)}
          textColor={COLORS.text.primary}
          iconColor={COLORS.text.primary}
        />
        
        <SearchButton
          placeholder={t('category.searchPlaceholder')}
          onPress={() => navigation.navigate('Search' as never)}
          onCameraPress={handleImageSearch}
        />
        
        {/* <NotificationBadge
          icon="headset-outline"
          iconSize={28}
          iconColor={COLORS.text.primary}
          count={unreadCount}
          onPress={() => navigation.navigate('CustomerService' as never)}
        /> */}
      </View>
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
          
          // Always go directly to ProductDiscovery
          navigation.navigate('ProductDiscovery', { 
            subCategoryName: item.name,
            categoryId: selectedCategory,
            categoryName: selectedCategoryData?.name,
            subcategoryId: item.id,
            subsubcategories: localizedSubSubCategories
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
    const products = searchProductsData || [];
    
    // Show loading state
    if (searchProductsLoading) {
      return (
        <View style={styles.forYouSection}>
          <View style={styles.forYouHeader}>
            <Text style={styles.forYouTitle}>For you</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        </View>
      );
    }

    // Show error state
    if (searchProductsError) {
      return (
        <View style={styles.forYouSection}>
          <View style={styles.forYouHeader}>
            <Text style={styles.forYouTitle}>For you</Text>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Failed to load products</Text>
          </View>
        </View>
      );
    }

    // Show empty state
    if (!Array.isArray(products) || products.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.forYouSection}>
        <View style={styles.forYouHeader}>
          <Text style={styles.forYouTitle}>For you</Text>
        </View>
        <View style={styles.forYouGrid}>
          {products.map((product: Product, index: number) => {
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
                isLiked={likedProductIds.includes(product.id?.toString() || '')}
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
                <Text style={styles.recommendedTitle}>Recommended</Text>
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mainContent: {
    // flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    minHeight: '100%',
    paddingBottom: 100
  },
  leftColumn: {
    width: 90,
    backgroundColor: COLORS.gray[100],
  },
  rightColumn: {
    flex: 1,
  },
  categoryItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.gray[100],
  },
  categoryItemActive: {
    backgroundColor: COLORS.white,
  },
  categoryName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryNameActive: {
    fontWeight: '600',
    color: COLORS.accentPink,
  },
  recommendedSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.sm,
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
    width: (width - 90 - SPACING.md * 3 - SPACING.sm * 2) / 3,
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
    padding: SPACING.md,
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
});

export default CategoryTabScreen;