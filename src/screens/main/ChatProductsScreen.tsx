import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { RootStackParamList, Product } from '../../types';
import { useSortProductsMutation } from '../../hooks/useSearchMutations';

type ChatProductsScreenRouteProp = RouteProp<RootStackParamList, 'ChatProducts'>;
type ChatProductsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ChatProductsScreen: React.FC = () => {
  const route = useRoute<ChatProductsScreenRouteProp>();
  const navigation = useNavigation<ChatProductsScreenNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Get sellerId from route params
  const { sellerId } = route.params || {};

  const { 
    mutate: sortProductsMutation, 
    data: sortResults,
  } = useSortProductsMutation({
    onSuccess: (data) => {
      console.log('Products loaded successfully:', data);
      setProducts(data || []);
      setLoading(false);
    },
    onError: (error) => {
      console.error('Error loading products:', error);
      setProducts([]);
      setLoading(false);
    }
  });

  useEffect(() => {
    loadProducts();
  }, [sellerId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Use the sortProductsMutation to fetch products from backend
      // We'll use "Newest" sort as default, similar to SellerProfileScreen
      sortProductsMutation(
        "Newest",     // sortBy
        undefined,    // categoryIds
        1,            // page
        25,           // limit
        undefined,    // type
        undefined,    // filter
        undefined,    // ratingCount
        undefined,    // minPrice
        undefined,    // maxPrice
        undefined,    // search
        sellerId      // sellerId - this is the key parameter for fetching products by store
      );
    } catch (error) {
      console.error('Error loading products:', error);
      setLoading(false);
    }
  };

  const handleAskPress = (product: Product) => {
    // Navigate back to chat screen with the selected product and seller info
    navigation.navigate('Chat', { 
      productId: product.id,
      storeId: product.seller?.id || '1'
    });
  };

  const renderProductItem = ({ item }: { item: Product & { localImage?: any } }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {item.isNew && (
          <View style={styles.hotBadge}>
            <Ionicons name="flame" size={8} color={COLORS.white} />
            <Text style={styles.hotText}>HOT</Text>
          </View>
        )}
        <Image
          source={item.localImage || { uri: item.images[0] || 'https://via.placeholder.com/80' }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.priceRow}>
            {item.originalPrice && item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
            )}
            <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
            {item.discount && (
              <Text style={styles.discountText}>-{item.discount}%</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.askButton}
            onPress={() => handleAskPress(item)}
          >
            <Text style={styles.askButtonText}>Ask</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Products</Text>
      <View style={styles.placeholder} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accentPink} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        }
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.white,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
  },
  productsList: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
  },
  hotBadge: {
    position: 'absolute',
    top: -18,
    left: -18,
    backgroundColor: COLORS.accentPink,
    borderRadius: 10,
    paddingRight: 4,
    paddingLeft: 12,
    paddingTop: 12,
    paddingBottom: 2,

    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  hotText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  productInfo: {
    flex: 1,
    minWidth: 0, // Ensures proper text wrapping
  },
  productName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '400',
    color: COLORS.text.primary,
    // marginBottom: SPACING.sm,
    // lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
  },
  currentPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.accentPink,
    marginRight: SPACING.xs,
  },
  discountText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    fontWeight: '600',
  },
  askButton: {
    backgroundColor: COLORS.accentPink,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    flexShrink: 0,
  },
  askButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
});

export default ChatProductsScreen;