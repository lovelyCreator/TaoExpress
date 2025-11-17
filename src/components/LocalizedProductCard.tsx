import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';
import { useAppSelector } from '../store/hooks';
import { ProductI18n, getLocalizedProduct } from '../data/mockProductsI18n';
import { getLocalizedText, formatCurrency } from '../utils/i18nHelpers';

interface LocalizedProductCardProps {
  product: ProductI18n;
  onPress?: () => void;
  onWishlistPress?: () => void;
  isWishlisted?: boolean;
}

const LocalizedProductCard: React.FC<LocalizedProductCardProps> = ({
  product,
  onPress,
  onWishlistPress,
  isWishlisted = false,
}) => {
  const locale = useAppSelector((state) => state.i18n.locale);
  
  // Get localized product data
  const localizedProduct = getLocalizedProduct(product, locale);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        
        {/* Discount Badge */}
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
        
        {/* Wishlist Button */}
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={onWishlistPress}
        >
          <Ionicons 
            name={isWishlisted ? "heart" : "heart-outline"} 
            size={20} 
            color={isWishlisted ? COLORS.error : COLORS.white} 
          />
        </TouchableOpacity>
        
        {/* Badge (Hot, Trending, etc.) */}
        {product.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {getLocalizedText(product.badge, locale)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>
          {localizedProduct.name}
        </Text>
        
        {/* Seller Name */}
        {localizedProduct.seller && (
          <Text style={styles.sellerName} numberOfLines={1}>
            {localizedProduct.seller.name}
          </Text>
        )}
        
        {/* Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            {formatCurrency(product.price, locale)}
          </Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatCurrency(product.originalPrice, locale)}
            </Text>
          )}
        </View>
        
        {/* Rating and Orders */}
        <View style={styles.statsContainer}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.ratingCount}>({product.ratingCount})</Text>
          </View>
          <Text style={styles.orderCount}>
            {product.orderCount} sold
          </Text>
        </View>
        
        {/* Colors (if available) */}
        {localizedProduct.colors && localizedProduct.colors.length > 0 && (
          <View style={styles.colorsContainer}>
            {localizedProduct.colors.slice(0, 3).map((color, index) => (
              <View 
                key={index}
                style={[styles.colorDot, { backgroundColor: color.hex }]}
              />
            ))}
            {localizedProduct.colors.length > 3 && (
              <Text style={styles.moreColors}>
                +{localizedProduct.colors.length - 3}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  wishlistButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: SPACING.xs,
  },
  badge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  content: {
    padding: SPACING.md,
  },
  productName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  sellerName: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  currentPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    marginLeft: 2,
  },
  ratingCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    marginLeft: 2,
  },
  orderCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  moreColors: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
  },
});

export default LocalizedProductCard;