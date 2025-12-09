import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';
import { ProductCard } from '../../components';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useRecommendationsMutation } from '../../hooks/useHomeScreenMutations';
import { productsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';
import { FlatList } from 'react-native';

const { width } = Dimensions.get('window');

// Mock cart data
const mockCartData = [
  {
    id: '1',
    sellerId: 'seller_123',
    sellerName: 'bbbxffvwo083i5cyz7jxtprkg',
    items: [
      {
        id: 'cart_item_1',
        productId: 'shoes_001',
        name: 'Shoes',
        color: 'space',
        size: 'M',
        price: 5.99,
        originalPrice: 7.00,
        quantity: 1,
        image: 'https://picsum.photos/seed/shoes1/300/300',
        selected: true,
      }
    ]
  }
];


const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const { likedProductIds, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const [cartData, setCartData] = useState(mockCartData);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(['cart_item_1']));
  const [allSelected, setAllSelected] = useState(true);
  const isFetchingRecommendationsRef = useRef(false);
  const loadedPagesRef = useRef<Set<number>>(new Set());

  // i18n
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Recommendations API hook
  const { 
    mutate: fetchRecommendations, 
    data: recommendationsData, 
    isLoading: recommendationsLoading,
    currentPage: recommendationsPage,
    hasMore: recommendationsHasMore
  } = useRecommendationsMutation({
    onSuccess: (data, page) => {
      isFetchingRecommendationsRef.current = false;
      if (page > 1) {
        loadedPagesRef.current.add(page);
      }
    },
    onError: (error) => {
      console.error('Error fetching recommendations:', error);
      isFetchingRecommendationsRef.current = false;
    }
  });

  // Fetch recommendations on mount
  useEffect(() => {
    if (isAuthenticated) {
      const outMemberId = user?.id || 'dferg0001';
      fetchRecommendations('en', outMemberId, locale, 1, false);
      loadedPagesRef.current.add(1);
    }
  }, [isAuthenticated, user, locale]);

  // Navigate to product detail helper
  const navigateToProductDetail = async (
    productId: string | number,
    source: string = '1688',
    country: string = 'en'
  ) => {
    try {
      // Check product detail API first
      const response = await productsApi.getProductDetail(productId, source, country);
      
      if (response.success && response.data) {
        // API call successful, navigate to product detail
        (navigation as any).navigate('ProductDetail', {
          productId: productId.toString(),
          source: source,
          country: country,
        });
      } else {
        // API call failed, show toast and don't navigate
        showToast('Sorry, product details are not available right now.');
      }
    } catch (error) {
      console.error('Error checking product detail:', error);
      showToast('Sorry, product details are not available right now.');
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <View style={styles.emptyCart}>
          {/* <View style={styles.iconContainer}> */}
            <Image 
              source={require('../../assets/icons/cart_image.png')} 
              style={styles.cartImage}
              resizeMode="contain"
            />
          {/* </View> */}
          <Text style={styles.welcomeText}>Welcome to TodayMall!</Text>
          <Text style={styles.loginPrompt}>
            Login to access your shopping cart
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => (navigation as any).navigate('Auth')}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate totals
  const selectedCartItems = cartData.flatMap(store => 
    store.items.filter(item => selectedItems.has(item.id))
  );
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedCount = selectedCartItems.length;

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    
    // Update all selected state
    const allItemIds = cartData.flatMap(store => store.items.map(item => item.id));
    setAllSelected(newSelected.size === allItemIds.length);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
      setAllSelected(false);
    } else {
      const allItemIds = cartData.flatMap(store => store.items.map(item => item.id));
      setSelectedItems(new Set(allItemIds));
      setAllSelected(true);
    }
  };

  const handleQuantityChange = (itemId: string, increment: boolean) => {
    setCartData(prevData => 
      prevData.map(store => ({
        ...store,
        items: store.items.map(item => {
          if (item.id === itemId) {
            const newQuantity = increment 
              ? item.quantity + 1 
              : Math.max(1, item.quantity - 1);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      }))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartData(prevData => 
      prevData.map(store => ({
        ...store,
        items: store.items.filter(item => item.id !== itemId)
      })).filter(store => store.items.length > 0)
    );
    
    const newSelected = new Set(selectedItems);
    newSelected.delete(itemId);
    setSelectedItems(newSelected);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.black} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>
        Cart ({selectedCount})
      </Text>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => {navigation.navigate('Wishlist' as never)}}>
          <Ionicons name="heart-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="trash-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSellerSection = (store: any) => (
    <View style={styles.sellerSection} key={store.id}>
      <View style={styles.sellerRow}>
        <TouchableOpacity 
          style={styles.sellerCheckbox}
          onPress={() => {
            // Toggle all items in this store
            const storeItemIds = store.items.map((item: any) => item.id);
            const allStoreItemsSelected = storeItemIds.every((id: string) => selectedItems.has(id));
            
            const newSelected = new Set(selectedItems);
            if (allStoreItemsSelected) {
              storeItemIds.forEach((id: string) => newSelected.delete(id));
            } else {
              storeItemIds.forEach((id: string) => newSelected.add(id));
            }
            setSelectedItems(newSelected);
          }}
        >
          <View style={[
            styles.checkbox,
            store.items.every((item: any) => selectedItems.has(item.id)) && styles.checkboxSelected
          ]}>
            {store.items.every((item: any) => selectedItems.has(item.id)) && (
              <Ionicons name="checkmark" size={12} color={COLORS.white} />
            )}
          </View>
        </TouchableOpacity>
        
        <Image 
          source={{ uri: 'https://picsum.photos/seed/seller/40/40' }}
          style={styles.sellerAvatar}
        />
        
        <Text style={styles.sellerName}>{store.sellerName}</Text>
      </View>
    </View>
  );

  const renderCartItem = (item: any) => (
    <View style={styles.cartItem} key={item.id}>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="close" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        <TouchableOpacity 
          style={styles.itemCheckbox}
          onPress={() => handleSelectItem(item.id)}
        >
          <View style={[
            styles.checkbox,
            selectedItems.has(item.id) && styles.checkboxSelected
          ]}>
            {selectedItems.has(item.id) && (
              <Ionicons name="checkmark" size={12} color={COLORS.white} />
            )}
          </View>
        </TouchableOpacity>
        
        <Image 
          source={{ uri: item.image }}
          style={styles.productImage}
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productVariant}>{item.color}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
            )}
          </View>
          
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, false)}
            >
              <Ionicons name="remove" size={16} color={COLORS.black} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, true)}
            >
              <Ionicons name="add" size={16} color={COLORS.black} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMoreToLoveItem = ({ item: product, index }: { item: Product; index: number }) => {
    if (!product || !product.id) {
      return null;
    }
    
    const handleLike = async () => {
      if (!isAuthenticated) {
        showToast(t('home.pleaseLogin'));
        return;
      }
      try {
        await toggleWishlist(product);
      } catch (error) {
        console.error('Error toggling wishlist:', error);
      }
    };

    const handlePress = () => {
      const productIdToUse = (product as any).offerId || product.id;
      const source = '1688'; // Default source
      navigateToProductDetail(productIdToUse, source, 'en');
    };
    
    return (
      <View style={styles.productCardWrapper}>
        <ProductCard
          key={`moretolove-${product.id || index}`}
          product={product}
          variant="moreToLove"
          onPress={handlePress}
          onLikePress={handleLike}
          isLiked={likedProductIds.includes(product.id?.toString())}
          showLikeButton={true}
          showDiscountBadge={true}
          showRating={true}
        />
      </View>
    );
  };

  const renderMoreToLove = () => {
    const productsToDisplay = recommendationsData || [];
    
    if (!Array.isArray(productsToDisplay) || productsToDisplay.length === 0) {
      // Show loading state if fetching
      if (recommendationsLoading) {
        return (
          <View style={styles.moreToLoveSection}>
            <Text style={styles.sectionTitle}>{t('home.moreToLove')}</Text>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('home.loadingRecommendations')}</Text>
            </View>
          </View>
        );
      }
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
          columnWrapperStyle={styles.productsGridRow}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          ListFooterComponent={() => (
            <>
              {/* Loading indicator for pagination */}
              {recommendationsLoading && recommendationsPage > 1 && (
                <View style={styles.loadingMoreContainer}>
                  <Text style={styles.loadingMoreText}>{t('home.loadingMoreRecommendations')}</Text>
                </View>
              )}
              {/* End of list indicator */}
              {!recommendationsHasMore && productsToDisplay.length > 0 && (
                <View style={styles.endOfListContainer}>
                  <Text style={styles.endOfListText}>{t('home.reachedEnd')}</Text>
                </View>
              )}
            </>
          )}
        />
      </View>
    );
  };

  const renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <View style={styles.bottomContent}>
        <TouchableOpacity 
          style={styles.allCheckbox}
          onPress={handleSelectAll}
        >
          <View style={[
            styles.checkbox,
            allSelected && styles.checkboxSelected
          ]}>
            {allSelected && (
              <Ionicons name="checkmark" size={12} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.allText}>All</Text>
        </TouchableOpacity>
        
        <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
        
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => {
            // Navigate to payment screen with selected items
            const paymentItems = selectedCartItems.map(item => ({
              id: item.id,
              name: item.name,
              color: item.color,
              size: item.size,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            }));
            
            (navigation as any).navigate('Payment', {
              items: paymentItems,
              totalAmount: totalPrice,
              fromCart: true,
            });
          }}
        >
          <Text style={styles.payButtonText}>Pay ({selectedCount})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show empty cart if no items
  if (cartData.length === 0 || cartData.every(store => store.items.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.emptyCart}>
          <Image 
            source={require('../../assets/icons/cart_image.png')} 
            style={styles.emptyCartImage}
          />
          <Text style={styles.emptyTitle}>Your Cart is Empty!</Text>
          <Text style={styles.emptySubtitle}>
            Your cart is currently empty.{"\n"}
            Start adding items to it to keep track of your favorites!
          </Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueShoppingButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {cartData.map((store) => (
          <View key={store.id}>
            {renderSellerSection(store)}
            {store.items.map((item) => renderCartItem(item))}
          </View>
        ))}
        
        {renderMoreToLove()}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {renderBottomBar()}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  headerIcon: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  sellerSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerCheckbox: {
    marginRight: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.accentPink,
    borderColor: COLORS.accentPink,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  sellerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  cartItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.lg,
    zIndex: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemCheckbox: {
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.gray[100],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productVariant: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  currentPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginHorizontal: SPACING.md,
    minWidth: 20,
    textAlign: 'center',
  },
  moreToLoveSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productsGridRow: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  loadingMoreContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  endOfListContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  productCardWrapper: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    marginBottom: SPACING.md,
  },
  bottomSpace: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    ...SHADOWS.lg,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  allCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  allText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  totalPrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  payButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyCartImage: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  continueShoppingButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
  },
  continueShoppingButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  cartImage: {
    width: 160,
    height: 200,
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
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#FF0055',
    borderRadius: 9999,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  loginButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default CartScreen;