import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { Product } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - SPACING.md * 2 - SPACING.md) / 2;

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onLikePress?: () => void;
  isLiked?: boolean;
  showLikeButton?: boolean;
  showDiscountBadge?: boolean;
  showRating?: boolean;
  variant?: 'default' | 'grid' | 'horizontal' | 'newIn' | 'moreToLove' | 'simple';
  style?: object;
  imageStyle?: object;
  cardWidth?: number;
  onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onLikePress,
  isLiked = false,
  showLikeButton = true,
  showDiscountBadge = true,
  showRating = true,
  variant = 'default',
  style,
  imageStyle,
  cardWidth,
  onAddToCart,
}) => {
  const { showToast } = useToast();
  const { user, isGuest } = useAuth();

  const handleLikePress = (e: any) => {
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user || isGuest) {
      showToast('Please login first', 'warning');
      return;
    }
    
    if (onLikePress) {
      onLikePress();
    }
  };

  const handleCartPress = (e: any) => {
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user || isGuest) {
      showToast('Please login first', 'warning');
      return;
    }
    
    if (onAddToCart) {
      onAddToCart();
    } else {
      console.log('Add to cart');
    }
  };

  // Calculate discount percentage if not provided
  const discountPercentage = product.discount || 
    (product.originalPrice && product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  // New In variant - vertical card with overlay text
  if (variant === 'newIn') {
    const cardW = cardWidth || Math.floor(width * 0.28);
    const cardH = Math.floor(cardW * 1.55);
    
    return (
      <TouchableOpacity
        style={[styles.newInCard, { width: cardW }, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: product.images?.[0] || '' }}
          style={[styles.newInImage, { width: cardW, height: cardH }, imageStyle]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
          style={styles.newInOverlay}
        >
          <Text style={styles.newInTitle} numberOfLines={2}>
            {product.name}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Grid variant - flexible layout (can be 2 columns or full width)
  if (variant === 'grid') {
    const cardW = cardWidth || GRID_CARD_WIDTH;
    // For full-width cards, use a different aspect ratio
    const isFullWidth = cardW > GRID_CARD_WIDTH * 1.5;
    const imageW = cardW;
    const imageH = isFullWidth ? 180 : cardW * 1.0;
    
    return (
      <TouchableOpacity
        style={[styles.gridCard, { width: cardW }, isFullWidth && styles.fullWidthCard, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={[styles.imageWrapper, isFullWidth && styles.fullWidthImageWrapper]}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {product.images && product.images.length > 0 ? (
              product.images.map((img: string, idx: number) => (
                <Image
                  key={`img-${idx}`}
                  source={{ uri: img }}
                  style={[styles.gridImage, { width: imageW, height: imageH }, isFullWidth && styles.fullWidthImage, imageStyle]}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Image
                source={require('../assets/icons/man.png')}
                style={[styles.gridImage, { width: imageW, height: imageH }, isFullWidth && styles.fullWidthImage, imageStyle]}
                resizeMode="cover"
              />
            )}
          </ScrollView>
          
          {/* Like button - bottom left */}
          {showLikeButton && (
            <TouchableOpacity
              style={styles.likeButtonLeft}
              onPress={handleLikePress}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? COLORS.accentPink : COLORS.white}
              />
            </TouchableOpacity>
          )}
          
          {/* Cart button - bottom right */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleCartPress}
          >
            <Ionicons
              name="cart-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.gridInfo, isFullWidth && styles.fullWidthInfo]}>
          <Text style={styles.gridName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.gridPrice}>${product.price?.toFixed(2) || '0.00'}</Text>
          {product.originalPrice && (
            <View style={styles.originalPriceRow}>
              <Text style={styles.gridOriginalPrice}>
                ${product.originalPrice.toFixed(2)}
              </Text>
              {showDiscountBadge && discountPercentage > 0 && (
                <Text style={styles.gridDiscount}>-{discountPercentage}%</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Horizontal variant - for trending products
  if (variant === 'horizontal') {
    const cardW = cardWidth || GRID_CARD_WIDTH;
    const imageH = cardW * 1.0;
    
    return (
      <TouchableOpacity
        style={[styles.horizontalCard, { width: cardW }, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrapper}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {product.images && product.images.length > 0 ? (
              product.images.map((img: string, idx: number) => (
                <Image
                  key={`img-${idx}`}
                  source={{ uri: img }}
                  style={[styles.horizontalImage, { width: cardW, height: imageH }, imageStyle]}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Image
                source={require('../assets/icons/man.png')}
                style={[styles.horizontalImage, { width: cardW - SPACING.sm * 2, height: imageH }, imageStyle]}
                resizeMode="cover"
              />
            )}
          </ScrollView>
          
          {/* Like button - bottom left */}
          {showLikeButton && (
            <TouchableOpacity
              style={styles.likeButtonLeft}
              onPress={handleLikePress}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? COLORS.accentPink : COLORS.white}
              />
            </TouchableOpacity>
          )}
          
          {/* Cart button - bottom right */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleCartPress}
          >
            <Ionicons
              name="cart-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.horizontalInfo}>
          <Text style={styles.horizontalName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.horizontalPrice}>${product.price?.toFixed(2) || '0.00'}</Text>
          {product.originalPrice && (
            <View style={styles.originalPriceRow}>
              <Text style={styles.horizontalOriginalPrice}>
                ${product.originalPrice.toFixed(2)}
              </Text>
              {showDiscountBadge && discountPercentage > 0 && (
                <Text style={styles.horizontalDiscount}>-{discountPercentage}%</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // More to Love variant - shows full info with reviews and sold
  if (variant === 'moreToLove') {
    const cardW = cardWidth || GRID_CARD_WIDTH;
    const imageH = cardW * 1.0;
    
    return (
      <TouchableOpacity
        style={[styles.moreToLoveCard, { width: cardW }, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrapper}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {product.images && product.images.length > 0 ? (
              product.images.map((img: string, idx: number) => (
                <Image
                  key={`img-${idx}`}
                  source={{ uri: img }}
                  style={[styles.moreToLoveImage, { width: cardW, height: imageH }, imageStyle]}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Image
                source={require('../assets/icons/man.png')}
                style={[styles.moreToLoveImage, { width: cardW, height: imageH }, imageStyle]}
                resizeMode="cover"
              />
            )}
          </ScrollView>
          
          {/* Like button - bottom left */}
          {showLikeButton && (
            <TouchableOpacity
              style={styles.likeButtonLeft}
              onPress={handleLikePress}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? COLORS.accentPink : COLORS.white}
              />
            </TouchableOpacity>
          )}
          
          {/* Cart button - bottom right */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleCartPress}
          >
            <Ionicons
              name="cart-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.moreToLoveInfo}>
          <Text style={styles.moreToLoveName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.moreToLovePrice}>${product.price?.toFixed(2) || '0.00'}</Text>
            {showDiscountBadge && discountPercentage > 0 && (
              <View style={styles.discountBadgeInline}>
                <Text style={styles.discountTextInline}>{discountPercentage}%</Text>
              </View>
            )}
          </View>
          {showRating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>
                {product.rating || 0} ({product.reviewCount || product.rating_count || 0})
              </Text>
              <Text style={styles.soldText}>
                {product.orderCount || 0} sold
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Simple variant - for category page (image, name, price only)
  if (variant === 'simple') {
    const cardW = cardWidth || GRID_CARD_WIDTH;
    const imageH = cardW * 1.2;
    
    return (
      <TouchableOpacity
        style={[styles.simpleCard, { width: cardW }, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: product.images?.[0] || '' }}
          style={[styles.simpleImage, { width: cardW, height: imageH }, imageStyle]}
          resizeMode="cover"
        />
        <View style={styles.simpleInfo}>
          <Text style={styles.simpleName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.simplePrice}>${product.price?.toFixed(2) || '0.00'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity
      style={[styles.productCard, style]}
      onPress={onPress}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product.images?.[0] || '' }}
          style={[styles.productImage, imageStyle]}
          resizeMode="cover"
        />
        
        {showLikeButton && (
          <TouchableOpacity
            style={styles.likeButtonLeft}
            onPress={handleLikePress}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? COLORS.accentPink : COLORS.white}
            />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleCartPress}
        >
          <Ionicons
            name="cart-outline"
            size={22}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceContainer}>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          )}
          <Text style={styles.productPrice}>${product.price?.toFixed(2) || '0.00'}</Text>
        </View>
        
        {showRating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>
              {product.rating || 0} ({product.reviewCount || 0})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default variant
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  productImageContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  productImage: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.md,
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
  },
  productPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.accentPink,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // New In variant
  newInCard: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  newInImage: {
    borderRadius: 12,
  },
  newInOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.md,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  newInTitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: COLORS.white,
  },
  
  // Grid variant
  gridCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullWidthCard: {
    flexDirection: 'row',
    padding: SPACING.sm,
  },
  gridImage: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  fullWidthImage: {
    marginBottom: 0,
    marginRight: SPACING.md,
  },
  gridInfo: {
    flex: 1,
  },
  fullWidthInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  fullWidthImageWrapper: {
    width: 200,
    marginRight: SPACING.md,
  },
  gridName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  gridPrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.accentPink,
    marginBottom: 4,
  },
  gridOriginalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
  },
  gridDiscount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    fontWeight: '600',
  },
  
  // Horizontal variant (trending)
  horizontalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  horizontalImage: {
    marginBottom: SPACING.sm,
    marginRight: 0,
    borderRadius: 12,
  },
  horizontalInfo: {
    flex: 1,
  },
  horizontalName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  horizontalPrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.accentPink,
    marginBottom: 4,
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalOriginalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
  },
  horizontalDiscount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    fontWeight: '600',
  },
  
  // More to Love variant
  moreToLoveCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  moreToLoveImage: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  moreToLoveInfo: {
    flex: 1,
  },
  moreToLoveName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  moreToLovePrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.accentPink,
    marginBottom: 4,
  },
  
  // Simple variant (category page)
  simpleCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  simpleImage: {
    borderRadius: BORDER_RADIUS.md,
  },
  simpleInfo: {
    padding: SPACING.sm,
  },
  simpleName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  simplePrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.accentPink,
  },
  
  // Shared styles
  imageWrapper: {
    position: 'relative',
  },
  likeButtonLeft: {
    position: 'absolute',
    left: 8,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
    zIndex: 1,
  },
  cartButton: {
    position: 'absolute',
    right: 8,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
    zIndex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  discountBadgeInline: {
    backgroundColor: COLORS.accentPink,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountTextInline: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  soldText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ProductCard;
