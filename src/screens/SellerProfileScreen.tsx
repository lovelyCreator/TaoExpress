import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../constants';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components';
import mockProducts from '../data/mockProducts.json';

const { width } = Dimensions.get('window');


const SellerProfileScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { sellerId } = route.params;
  const { likedProductIds, toggleWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  
  // State for scroll to top button
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollToTopOpacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const storeData = {
    id: sellerId,
    name: 'bsbsrfywoo888Boy zTaylorkng',
    image: 'https://picsum.photos/seed/store123/400/400',
    rating: 5.0,
    reviewCount: '1.3K+',
    soldCount: '1.3K+',
  };

  useEffect(() => {
    const products = [
      ...mockProducts.newIn,
      ...mockProducts.trending,
      ...mockProducts.forYou,
    ];
    setAllProducts(products);
    setFilteredProducts(products);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, allProducts]);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const scrollPosition = contentOffset.y;
    
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
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={COLORS.gray[400]} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search in store"
              placeholderTextColor={COLORS.gray[400]}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={20} color={COLORS.black} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.storeInfoContainer}>
          <Image
            source={{ uri: storeData.image }}
            style={styles.storeImage}
          />
          <Text style={styles.storeName}>{storeData.name}</Text>
          <View style={styles.storeStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{storeData.rating} Review</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statText}>{storeData.soldCount} Sold</Text>
            </View>
          </View>
        </View>

        <View style={styles.productsSection}>
          <View style={styles.productsGrid}>
            {filteredProducts.map((product: any, index: number) => (
              <View key={product.id + index} style={styles.productItem}>
                <ProductCard
                  product={product}
                  variant="moreToLove"
                  onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                  onLikePress={() => toggleWishlist(product)}
                  isLiked={likedProductIds.includes(product.id)}
                />
              </View>
            ))}
          </View>
        </View>
        
        {/* End of list indicator */}
        {filteredProducts.length > 0 && (
          <View style={styles.endOfListContainer}>
            <Text style={styles.endOfListText}>You've reached the end</Text>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
      
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
            <Ionicons name="chevron-up" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeArea: {
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
    ...SHADOWS.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderRadius: 40,
    paddingHorizontal: SPACING.md,
    marginLeft: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  storeInfoContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  storeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.gray[100],
  },
  storeName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: SPACING.md,
  },
  statText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  productsSection: {
    padding: SPACING.lg,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  productItem: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
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
    backgroundColor: COLORS.accentPink,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    elevation: 8,
  },
});

export default SellerProfileScreen;
