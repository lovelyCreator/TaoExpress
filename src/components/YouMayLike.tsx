import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Dimensions } from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';
import { RootStackParamList, Product } from '../types';

type YouMayLikeNavigationProp = StackNavigationProp<RootStackParamList>;

interface YouMayLikeProps {
  products: Product[];
  title?: string;
}

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - SPACING.md * 2 - SPACING.md) / 2;

const YouMayLike: React.FC<YouMayLikeProps> = ({
  products,
  title = 'You May Like',
}) => {
  const navigation = useNavigation<YouMayLikeNavigationProp>();
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleLikeToggle = (productId: string) => {
    setLikedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>{title}</Text>
      <View style={styles.youGridContainer}>
        {products.map((product, index) => (
          <TouchableOpacity
            key={product.id || `product-${index}`}
            style={styles.youCard}
            activeOpacity={0.9}
            onPress={() => handleProductPress(product)}
          >
            <View style={styles.trendingImageWrap}>
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                {[
                  require('../assets/images/sample_newin.jpg'),
                  require('../assets/images/heels.png'),
                  require('../assets/images/sneakers.png'),
                ].map((img, idx) => (
                  <Image key={`product-image-${product.id || index}-${idx}`} source={img as any} style={styles.youImage} resizeMode="cover" />
                ))}
              </ScrollView>
              {!!(product.discountPercentage || product.discount) && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{`${product.discountPercentage || product.discount}% OFF`}</Text>
                </View>
              )}
              <TouchableOpacity 
                style={likedProductIds.includes(product.id) ? styles.trendingHeartBtnActive : styles.trendingHeartBtn}
                onPress={() => handleLikeToggle(product.id)}
              >
                <Ionicons 
                  name={likedProductIds.includes(product.id) ? 'heart' : 'heart-outline'} 
                  size={18} 
                  color={likedProductIds.includes(product.id) ? COLORS.accentPink : COLORS.white} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.trendingProductInfo}>
              <Text style={styles.trendingProductName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.trendingProductPrice}>${product.price.toFixed(2)}</Text>
              <View style={styles.trendingProductRating}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>5 (5.9K)</Text>
                <Text style={styles.soldText}>10k+ sold</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingBottom: 130,
    marginHorizontal: SPACING.md,
    borderTopColor: COLORS.gray[200],
    borderTopWidth: 1,
    paddingTop: SPACING.smmd,
  },
  sectionHeading: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  youGridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  youCard: {
    width: GRID_CARD_WIDTH,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  trendingImageWrap: { position: 'relative' },
  youImage: {
    width: GRID_CARD_WIDTH,
    height: GRID_CARD_WIDTH * 1.2,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  discountBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: { 
    color: COLORS.white, 
    fontSize: 10, 
    fontWeight: '700' 
  },
  trendingHeartBtn: {
    position: 'absolute',
    right: 8,
    bottom: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  trendingHeartBtnActive: {
    position: 'absolute',
    right: 8,
    bottom: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  trendingProductInfo: { flex: 1 },
  trendingProductName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  trendingProductPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.accentPink,
    marginBottom: 4,
  },
  trendingProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  soldText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default YouMayLike;