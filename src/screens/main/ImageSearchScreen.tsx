import React, { useState, useEffect } from 'react';
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

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { RootStackParamList, Product } from '../../types';
import { ProductCard } from '../../components';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useImageSearchMutation } from '../../hooks/useImageSearchMutation';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

type ImageSearchScreenRouteProp = RouteProp<RootStackParamList, 'ImageSearch'>;
type ImageSearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ImageSearch'>;

const ImageSearchScreen: React.FC = () => {
  const navigation = useNavigation<ImageSearchScreenNavigationProp>();
  const route = useRoute<ImageSearchScreenRouteProp>();
  
  console.log('ImageSearchScreen mounted, navigation available:', !!navigation);
  const { likedProductIds, toggleWishlist } = useWishlist();
  const { user, isGuest } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('1688');

  const platforms = ['1688', 'taobao', 'wsy', 'VVIC'];

  // Use mutation hook for image search
  const { mutate: searchByImage, isLoading } = useImageSearchMutation({
    onSuccess: (data) => {
      // Transform API response to Product type
      const transformedProducts: Product[] = data.products.map((item: any) => ({
        id: item.id?.toString() || '',
        name: item.name || 'Product',
        description: item.description || '',
        price: item.price || 0,
        originalPrice: item.originalPrice || item.price * 1.2,
        discount: item.discount || 0,
        images: item.images || [],
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
          joinedDate: new Date(),
        },
        rating: item.rating || 0,
        reviewCount: item.reviewCount || item.rating_count || 0,
        rating_count: item.rating_count || 0,
        inStock: item.inStock !== undefined ? item.inStock : true,
        stockCount: item.stockCount || 0,
        sizes: item.sizes || [],
        colors: item.colors || [],
        tags: item.tags || [],
        isNew: item.isNew || false,
        isFeatured: item.isFeatured || false,
        isOnSale: item.isOnSale || false,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        orderCount: item.orderCount || 0,
      }));
      setProducts(transformedProducts);
    },
    onError: (error) => {
      console.error('Image search error:', error);
      alert('Failed to search by image. Please try again.');
    },
  });

  useEffect(() => {
    if (route.params?.imageUri) {
      searchByImage({
        imageUri: route.params.imageUri,
        platform: selectedPlatform,
      });
    }
  }, [route.params?.imageUri]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleLikePress = async (product: Product) => {
    if (!user || isGuest) {
      alert('Please login first');
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
      <Text style={styles.headerTitle}>Product Lists</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderPlatformTabs = () => (
    <View style={styles.platformTabsContainer}>
      {platforms.map((platform) => (
        <TouchableOpacity
          key={platform}
          style={[
            styles.platformTab,
            selectedPlatform === platform && styles.platformTabActive,
          ]}
          onPress={() => setSelectedPlatform(platform)}
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

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderPlatformTabs()}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching for similar products...</Text>
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
    width: 0,
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
