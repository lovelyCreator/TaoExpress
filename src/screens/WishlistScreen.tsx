import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import mockProducts from '../data/mockProducts.json';

const { width } = Dimensions.get('window');

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isAddToCartLoading } = useCart();
  const { wishlistItems, refreshWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const { showToast } = useToast();
  
  const [refreshing, setRefreshing] = useState(false);

  // Sample wishlist items for testing (when logged out or no items)
  const sampleWishlistItems = [
    {
      id: 'sample-1',
      name: 'Shoes',
      price: 5.99,
      image: 'https://picsum.photos/seed/shoes1/300/300',
      brand: 'Nike',
    },
    {
      id: 'sample-2', 
      name: 'Wireless Headphones',
      price: 89.99,
      image: 'https://picsum.photos/seed/headphones/300/300',
      brand: 'Sony',
    },
    {
      id: 'sample-3',
      name: 'Summer Dress',
      price: 45.50,
      image: 'https://picsum.photos/seed/dress/300/300',
      brand: 'Zara',
    },
  ];

  // Use sample items if not authenticated or no wishlist items
  const displayItems = (!isAuthenticated || wishlistItems.length === 0) ? sampleWishlistItems : wishlistItems;

  useEffect(() => {
    // Refresh wishlist data when the screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      refreshWishlist();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWishlist();
    setRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('ProductDetail', { product });
  };

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      // For wishlist items, variation ID is 0
      const variationId = 0;
      
      // Convert product ID to number
      const itemId = parseInt(product.id, 10);
      
      if (isNaN(itemId)) {
        showToast('Invalid product ID', 'error');
        return;
      }
      
      // Add to cart using the cart API
      await addToCart(product, quantity, 0, 0);
      showToast('Product added to bag!', 'success');
    } catch (error) {
      showToast('Failed to add product to bag', 'error');
    }
  };



  const handleRemoveFromWishlist = async (product: any) => {
    if (!isAuthenticated) {
      showToast('Please login to manage wishlist', 'warning');
      return;
    }
    
    try {
      toggleWishlist(product);
      showToast('Item removed from wishlist', 'success');
    } catch (error) {
      showToast('Failed to remove item from wishlist', 'error');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.black} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>WishList</Text>
      <TouchableOpacity 
        style={styles.cartButton}
        onPress={() => (navigation as any).navigate('Cart')}
      >
        <Ionicons name="cart-outline" size={20} color={COLORS.black} />
      </TouchableOpacity>
    </View>
  );

  const renderActionBar = () => {
    return null; // Remove action bar for cleaner design
  };

  const renderProductItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.productCard}>
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.productImage}
          />
        </TouchableOpacity>
        
        <View style={styles.productInfo}>
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
          <Text style={styles.productPrice}>${item.price}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(item)}
        >
          <Ionicons name="close" size={20} color={COLORS.black} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(item, 1)}
        >
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={16} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.calendarIcon}>
          <Image source={require('../assets/icons/wishlist.png')} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>Nothing in Wishlist</Text>
      <Text style={styles.emptySubtitle}>
        Tap start exploring button to start save your favorite items
      </Text>
      <TouchableOpacity
        style={styles.startExploringButton}
        onPress={() => navigation.navigate('Main' as never)}
      >
        <Text style={styles.startExploringButtonText}>Start Exploring</Text>
      </TouchableOpacity>
    </View>
  );

  // Only show full-screen loading when wishlist data is loading, not when adding to cart
  if (wishlistLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderActionBar()}
      
      {displayItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={displayItems}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => (item && item.id ? item.id.toString() : `wishlist-item-${index}`)}
          style={styles.productsList}
          contentContainerStyle={styles.productsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  productsList: {
    flex: 1,
  },
  productsListContent: {
    padding: SPACING.lg,
  },
  productCard: {
    position: 'relative',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[200],
    marginRight: SPACING.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.accentPink,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
  },
  cartIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  calendarIcon: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  startExploringButton: {
    backgroundColor: COLORS.black,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  startExploringButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    color: COLORS.white,
  },
});

export default WishlistScreen;