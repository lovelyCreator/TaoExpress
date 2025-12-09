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
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector } from '../../store/hooks';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { RootStackParamList, Product } from '../../types';
import { ProductCard } from '../../components';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useImageSearchMutation } from '../../hooks/useImageSearchMutation';
import { useToast } from '../../context/ToastContext';
import { productsApi } from '../../services/api';
import { translations } from '../../i18n/translations';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

type ImageSearchScreenRouteProp = RouteProp<RootStackParamList, 'ImageSearch'>;
type ImageSearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ImageSearch'>;

const ImageSearchScreen: React.FC = () => {
  const navigation = useNavigation<ImageSearchScreenNavigationProp>();
  const route = useRoute<ImageSearchScreenRouteProp>();
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';
  const { showToast } = useToast();
  
  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  const { likedProductIds, toggleWishlist } = useWishlist();
  const { user, isGuest } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('1688');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>('');
  
  const isFetchingRef = useRef(false);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const platforms = ['1688', 'taobao', 'wsy', 'VVIC'];

  // Helper function to navigate to product detail after checking API
  const navigateToProductDetail = async (
    productId: string | number,
    source: string = selectedPlatform,
    country: string = locale
  ) => {
    try {
      const response = await productsApi.getProductDetail(productId, source, country);
      if (response && response.data) {
        navigation.navigate('ProductDetail', { 
          productId: productId.toString(),
          source,
          country 
        });
      } else {
        showToast(t('imageSearch.productDetailsError'), 'error');
      }
    } catch (error) {
      console.error('Error fetching product detail:', error);
      showToast(t('imageSearch.productDetailsError'), 'error');
    }
  };

  // Use mutation hook for image search
  const { mutate: searchByImage, isLoading, hasMore: hookHasMore, reset } = useImageSearchMutation({
    onSuccess: (data, transformedProducts) => {
      const page = data.data?.currentPage || currentPage;
      
      // Mark this page as loaded
      loadedPagesRef.current.add(page);
      
      // Check if there are more pages before updating products
      const totalPages = data.data?.totalPage || 0;
      const totalRecords = data.data?.totalRecords || 0;
      const pageSize = data.data?.pageSize || 20;
      
      if (page === 1) {
        // First page - replace all products
        setProducts(transformedProducts);
        loadedPagesRef.current.clear();
        loadedPagesRef.current.add(1);
        
        // Set hasMore for first page
        if (totalPages > 0) {
          setHasMore(page < totalPages);
        } else if (totalRecords > 0) {
          setHasMore(transformedProducts.length < totalRecords);
        } else {
          setHasMore(transformedProducts.length >= pageSize);
        }
      } else {
        // Append new products, avoiding duplicates
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = transformedProducts.filter(p => !existingIds.has(p.id));
          const updatedProducts = [...prev, ...newProducts];
          
          // Set hasMore based on updated products count
          if (totalPages > 0) {
            setHasMore(page < totalPages);
          } else if (totalRecords > 0) {
            setHasMore(updatedProducts.length < totalRecords);
          } else {
            setHasMore(transformedProducts.length >= pageSize);
          }
          
          return updatedProducts;
        });
      }
      
      setLoadingMore(false);
      isFetchingRef.current = false;
    },
    onError: (error) => {
      console.error('Image search error:', error);
      showToast(t('imageSearch.searchError'), 'error');
      setLoadingMore(false);
      isFetchingRef.current = false;
    },
  });

  const loadProducts = useCallback((page: number = 1, append: boolean = false) => {
    if (isFetchingRef.current || (!route.params?.imageUri && page === 1)) return;
    
    // Prevent loading the same page twice
    if (loadedPagesRef.current.has(page)) {
      return;
    }
    
    isFetchingRef.current = true;
    if (append) {
      setLoadingMore(true);
    }
    
    searchByImage(
      {
        imageUri: route.params?.imageUri || '',
        country: locale,
        pageSize: 20,
        priceStart: appliedMinPrice || undefined,
        priceEnd: appliedMaxPrice || undefined,
      },
      page,
      append
    );
  }, [route.params?.imageUri, locale, appliedMinPrice, appliedMaxPrice, searchByImage]);

  useEffect(() => {
    if (route.params?.imageUri) {
      reset();
      setCurrentPage(1);
      setProducts([]);
      loadedPagesRef.current.clear();
      loadProducts(1, false);
    }
  }, [route.params?.imageUri, selectedPlatform]);

  const handleProductPress = async (product: Product) => {
    const productIdToUse = product.offerId || product.id;
    await navigateToProductDetail(productIdToUse, selectedPlatform, locale);
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.black} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('imageSearch.title')}</Text>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="filter" size={20} color={COLORS.black} />
      </TouchableOpacity>
    </View>
  );

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    if (route.params?.imageUri) {
      reset();
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

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('imageSearch.priceFilter')}</Text>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceInputContainer}>
            <View style={styles.priceInputRow}>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceInputLabel}>{t('search.minPrice')}</Text>
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
                <Text style={styles.priceInputLabel}>{t('search.maxPrice')}</Text>
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

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.clearButton]}
              onPress={() => {
                setMinPrice('');
                setMaxPrice('');
                setAppliedMinPrice('');
                setAppliedMaxPrice('');
                setShowFilterModal(false);
                // Reset and reload without price filters
                reset();
                setCurrentPage(1);
                setProducts([]);
                loadedPagesRef.current.clear();
                loadProducts(1, false);
              }}
            >
              <Text style={styles.clearButtonText}>{t('search.clean')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.applyButton]}
              onPress={() => {
                // Apply the price filters
                setAppliedMinPrice(minPrice);
                setAppliedMaxPrice(maxPrice);
                setShowFilterModal(false);
                // Reset and reload with new price filters
                reset();
                setCurrentPage(1);
                setProducts([]);
                loadedPagesRef.current.clear();
                loadProducts(1, false);
              }}
            >
              <Text style={styles.applyButtonText}>{t('search.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
      {renderFilterModal()}

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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    // marginLeft: -32,
  },
  placeholder: {
    width: 32,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  priceInputContainer: {
    padding: SPACING.lg,
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
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: COLORS.gray[100],
  },
  clearButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  applyButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
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
    borderBottomColor: COLORS.accentPink,
  },
  platformTabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  platformTabTextActive: {
    color: COLORS.accentPink,
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
