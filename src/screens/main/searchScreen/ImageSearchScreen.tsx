import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector } from '../../../store/hooks';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../constants';
import { RootStackParamList, Product } from '../../../types';
import { ProductCard, SortDropdown, PriceFilterModal } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import { translations } from '../../../i18n/translations';
import { productsApi } from '../../../services/productsApi';
import ArrowBackIcon from '../../../assets/icons/ArrowBackIcon';
import ViewListIcon from '../../../assets/icons/ViewListIcon';
import { useToast } from '../../../context/ToastContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

type ImageSearchScreenRouteProp = RouteProp<RootStackParamList, 'ImageSearch'>;
type ImageSearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ImageSearch'>;

const ImageSearchScreen: React.FC = () => {
  const navigation = useNavigation<ImageSearchScreenNavigationProp>();
  const route = useRoute<ImageSearchScreenRouteProp>();
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';
  
  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  // Wishlist context removed - using local state
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const toggleWishlist = async (product: Product) => {
    // Wishlist API removed
    const productId = product.id?.toString() || '';
    setLikedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  const { user, isGuest } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('1688');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [priceFilterModalVisible, setPriceFilterModalVisible] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('best_match');
  
  // Sort options
  const sortOptions = [
    { label: 'Best Match', value: 'best_match' },
    { label: 'Price High', value: 'price_high' },
    { label: 'Price Low', value: 'price_low' },
    { label: 'High Sales', value: 'high_sales' },
    { label: 'Low Sales', value: 'low_sales' },
  ];
  
  const { showToast } = useToast();
  
  const isFetchingRef = useRef(false);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const platforms = ['1688', 'taobao', 'wsy', 'VVIC'];
  const [imageBase64, setImageBase64] = useState<string | null>(route.params?.imageBase64 || null);

  // Helper function to navigate to product detail after checking API
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

  const loadProducts = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (isFetchingRef.current) return;
      if (!route.params?.imageUri && !imageBase64) return;

      // For now Taobao image search does not support pagination, so only first page
      if (page > 1) {
        return;
      }

      try {
        isFetchingRef.current = true;
        setIsLoading(!append);
        setLoadingMore(append);

        // Ensure we have base64 of the image
        // Use base64 from navigation params (provided by ImagePicker) to avoid deprecated file APIs
        let base64 = imageBase64;
        if (!base64 && route.params?.imageBase64) {
          base64 = route.params.imageBase64;
          setImageBase64(base64);
        }
        if (!base64) {
          // If no base64 data, navigate back with error message
          setIsLoading(false);
          setLoadingMore(false);
          setHasMore(false);
          alert(t('imageSearch.noImageData') || 'Image data not available. Please try again.');
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
          return;
        }

        // Only Taobao image search is supported per requirements
        if (selectedPlatform !== 'taobao') {
          console.warn('Image search is currently only supported for Taobao platform.');
          setIsLoading(false);
          setLoadingMore(false);
          setHasMore(false);
          return;
        }

        const language =
          locale === 'ko' ? 'ko' :
          locale === 'zh' ? 'zh' :
          'en';

        const response = await productsApi.imageSearchTaobao(language, base64);

        if (!response.success || !response.data || !Array.isArray(response.data.products)) {
          console.error('ImageSearchScreen: Taobao image search failed:', response.message);
          setProducts([]);
          setHasMore(false);
          return;
        }

        const mappedProducts: Product[] = response.data.products.map((item: any): Product => {
          const price = parseFloat(item.price || item.wholesalePrice || item.dropshipPrice || 0);
          const originalPrice = parseFloat(item.originalPrice || price);
          const discount =
            originalPrice > price && originalPrice > 0
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : 0;

          // As requested: only show title, price, image (other fields are filled with defaults)
          return {
            id: item.id?.toString() || '',
            externalId: item.externalId?.toString() || item.id?.toString() || '',
            offerId: item.offerId?.toString() || item.externalId?.toString() || item.id?.toString() || '',
            name: item.title || item.titleOriginal || '',
            image: item.image || '',
            price,
            originalPrice,
            discount,
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
            orderCount: 0,
            repurchaseRate: '',
          };
        });

        // Image search currently returns a single page
        setHasMore(false);
        loadedPagesRef.current.add(1);

        if (append) {
          setProducts(prev => [...prev, ...mappedProducts]);
        } else {
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('ImageSearchScreen: Failed to load image search products:', error);
        setProducts([]);
        setHasMore(false);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [route.params?.imageUri, locale, selectedPlatform, imageBase64]
  );

  useEffect(() => {
    if (route.params?.imageUri) {
      setCurrentPage(1);
      setProducts([]);
      loadedPagesRef.current.clear();
      loadProducts(1, false);
    }
  }, [route.params?.imageUri, selectedPlatform, loadProducts]);

  const handleProductPress = async (product: Product) => {
    // Get source from product data, fallback to selectedPlatform
    const source = (product as any).source || selectedPlatform || '1688';
    await navigateToProductDetail(product.id, source, locale);
  };

  const handleLoadMore = useCallback(() => {
    // Prevent multiple calls
    if (isFetchingRef.current || loadingMore || !hasMore || isLoading) {
      return;
    }
    
    const nextPage = currentPage + 1;
    
    // Prevent loading the same page
    if (loadedPagesRef.current.has(nextPage)) {
      return;
    }
    
    setCurrentPage(nextPage);
    loadProducts(nextPage, true);
  }, [currentPage, hasMore, isLoading, loadingMore, loadProducts]);

  const handleLikePress = async (product: Product) => {
    if (!user || isGuest) {
      alert(t('imageSearch.pleaseLogin'));
      return;
    }
    await toggleWishlist(product);
  };

  const handleGoBack = () => {
    console.log('Back button pressed - attempting to go back');
    try {
      navigation.goBack();
      console.log('Navigation goBack called successfully');
    } catch (error) {
      console.error('Error going back:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >          
          <ArrowBackIcon width={12} height={20} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.searchButtonContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchPlaceholderText}>{t('imageSearch.title')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Render sort and filter bar
  const renderSortAndFilter = () => (
    <View style={styles.sortFilterBar}>
      <View style={styles.sortButton}>
        <SortDropdown
          options={sortOptions}
          selectedValue={selectedSort}
          onSelect={(value) => {
            setSelectedSort(value);
            // Note: Image search doesn't support sorting, but we keep the UI consistent
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

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    if (route.params?.imageUri) {
      setCurrentPage(1);
      setProducts([]);
      loadedPagesRef.current.clear();
      loadProducts(1, false);
    }
  };

  const renderPlatformTabs = () => (
    <View style={styles.platformTabsContainer}>
      {platforms.map((platform) => (
        <TouchableOpacity
          key={platform}
          style={[
            styles.platformTab,
            selectedPlatform === platform && styles.platformTabActive,
          ]}
          onPress={() => handlePlatformChange(platform)}
        >
          <Text
            style={[
              styles.platformTabText,
              selectedPlatform === platform && styles.platformTabTextActive,
            ]}
          >
            {platform}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      variant="moreToLove"
      onPress={() => handleProductPress(item)}
      onLikePress={() => handleLikePress(item)}
      isLiked={likedProductIds.includes(item.id)}
      cardWidth={CARD_WIDTH}
    />
  );


  const renderFooter = () => {
    if (!loadingMore) {
      if (!hasMore && products.length > 0) {
        return (
          <View style={styles.footerLoader}>
            <Text style={styles.endOfListText}>{t('imageSearch.noMoreProducts')}</Text>
          </View>
        );
      }
      return null;
    }
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingMoreText}>{t('imageSearch.loadingMore')}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderPlatformTabs()}
      {renderSortAndFilter()}
      
      <PriceFilterModal
        visible={priceFilterModalVisible}
        onClose={() => setPriceFilterModalVisible(false)}
        onApply={(min, max) => {
          setMinPrice(min);
          setMaxPrice(max);
          // Note: Image search API may not support price filtering, but we keep the UI consistent
          showToast('Price filter applied', 'success');
        }}
        initialMinPrice={minPrice}
        initialMaxPrice={maxPrice}
      />

      {isLoading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('imageSearch.searching')}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productGrid}
          contentContainerStyle={styles.productListContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
        />
      )}
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
  searchPlaceholderText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  sortFilterBar: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
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
    borderColor: COLORS.gray[200],
  },
  filterButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingMoreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  endOfListText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  platformTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  platformTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  platformTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.red,
  },
  platformTabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  platformTabTextActive: {
    color: COLORS.red,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  productGrid: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  productListContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});

export default ImageSearchScreen;
