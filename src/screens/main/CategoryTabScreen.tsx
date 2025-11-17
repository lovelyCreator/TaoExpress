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
import { useCategoriesMutation } from '../../hooks/useCategories';
import { PlatformMenu, SearchButton, NotificationBadge, ProductCard, ImagePickerModal } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { usePlatformStore } from '../../store/platformStore';
import { useAppSelector } from '../../store/hooks';
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
    getCompanyCategories,
    getRecommendedSubcategories,
    getFilteredProducts
  } = usePlatformStore();
  
  // i18n
  const locale = useAppSelector((s) => s.i18n.locale);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  // Get company categories from Zustand
  const companyCategories = getCompanyCategories();

  // Set first category as selected when platform changes
  useEffect(() => {
    if (companyCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(companyCategories[0].id);
    }
  }, [selectedPlatform, companyCategories]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
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

  // Get filtered products for "For You" section using Zustand
  const getForYouProducts = () => {
    return getFilteredProducts('forYou');
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
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
          placeholder="Search"
          onPress={() => navigation.navigate('Search' as never)}
          onCameraPress={handleImageSearch}
        />
        
        <NotificationBadge
          icon="headset-outline"
          iconSize={28}
          iconColor={COLORS.text.primary}
          count={unreadCount}
          onPress={() => navigation.navigate('CustomerService' as never)}
        />
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
          
          // Always go directly to ProductDiscovery
          navigation.navigate('ProductDiscovery', { 
            subCategoryName: item.name,
            categoryId: selectedCategory,
            categoryName: selectedCategoryData?.name,
            subcategoryId: item.id,
            subsubcategories: item.subsubcategories || []
          });
        }}
      >
        <View style={styles.recommendedImageContainer}>
          <Ionicons name="shirt-outline" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.recommendedName} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderForYouProducts = () => {
    const products = getForYouProducts();
    
    return (
      <View style={styles.forYouSection}>
        <View style={styles.forYouHeader}>
          <Text style={styles.forYouTitle}>For you</Text>
        </View>
        <View style={styles.forYouGrid}>
          {products.map((product: any, index: number) => {
            const productData: Product = {
              id: product.id,
              name: product.name,
              images: [product.image],
              price: product.price,
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
              isNew: false,
              isFeatured: false,
              isOnSale: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              orderCount: product.orderCount || 0,
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
                key={`foryou-${product.id}`}
                product={productData}
                variant="simple"
                onPress={() => handleProductPress(productData)}
                cardWidth={FOR_YOU_CARD_WIDTH}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // Use company categories for left column
  const categoriesToDisplay = companyCategories;
  
  // Get subcategories for recommended section
  const recommendedItems = getRecommendedSubcategories();
  
  // Add "All categories" as the first item
  const allCategoriesItem = { id: 'all', name: 'All categories' };
  const subcategoriesWithAll = [allCategoriesItem, ...recommendedItems];

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
                <View style={styles.recommendedGrid}>
                  {subcategoriesWithAll.map((item, index) => (
                    <View key={`rec-${index}`}>
                      {renderRecommendedItem({ item })}
                    </View>
                  ))}
                </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
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
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
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
});

export default CategoryTabScreen;