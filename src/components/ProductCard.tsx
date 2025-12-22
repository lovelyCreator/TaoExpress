import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import HeartPlusIcon from '../assets/icons/HeartPlusIcon';
import FamilyStarIcon from '../assets/icons/FamilyStarIcon';
import { useTranslation } from '../hooks/useTranslation';

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - SPACING.md * 2 - SPACING.md) / 2;

// Generate dynamic live messages based on product data from API
// Returns exactly 3 messages: monthSold, repurchaseRate, and Fast delivery
const generateLiveMessages = (product?: Product, t?: (key: string) => string): string[] => {
  const allMessages: string[] = [];
  const translate = t || ((key: string) => key);
  
  // Month sold count - from real API data (monthSold mapped to orderCount)
  if (product?.orderCount && product.orderCount > 0) {
    allMessages.push(`${product.orderCount}+ ${translate('home.soldThisMonth')}`);
  }
  
  // Repurchase rate - from real API data (repurchaseRate)
  if (product?.repurchaseRate) {
    const repurchaseRate = typeof product.repurchaseRate === 'string' 
      ? product.repurchaseRate 
      : `${product.repurchaseRate}%`;
    allMessages.push(`${repurchaseRate} ${translate('home.repurchaseRate')}`);
  }
  
  // Fast delivery - with i18n
  allMessages.push(translate('home.fastDelivery'));
  
  // Ensure we have exactly 3 messages
  // If we have less than 3, add generic messages to fill
  while (allMessages.length < 3) {
    if (allMessages.length === 0) {
      allMessages.push(translate('home.trustedByThousands'));
    } else if (allMessages.length === 1) {
      allMessages.push(translate('home.securePaymentGuaranteed'));
    } else {
      allMessages.push(translate('home.qualityGuaranteed'));
    }
  }
  
  // Return only the first 3 messages (shuffled)
  return allMessages.slice(0, 3).sort(() => Math.random() - 0.5);
};

// Component for displaying live text with sliding animation
const LiveText: React.FC<{ product?: Product }> = ({ product }) => {
  const { t } = useTranslation();
  const [messages] = useState(() => generateLiveMessages(product, t));
  // Random starting index for each product to create different timing
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * messages.length));
  const translateY = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(0);
  // Random initial delay (0-2000ms) so each product starts at different time
  const [initialDelay] = useState(() => Math.floor(Math.random() * 2000));

  useEffect(() => {
    if (messages.length <= 1) return;
    
    // Initialize ref with current index
    currentIndexRef.current = currentIndex;
    let intervalId: NodeJS.Timeout | null = null;

    // Initial delay to stagger different products
    const initialTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        // Animate current message sliding down (disappear)
        Animated.timing(translateY, {
          toValue: 20, // Move down and out of view
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // After animation completes, move to next message
          currentIndexRef.current = (currentIndexRef.current + 1) % messages.length;
          setCurrentIndex(currentIndexRef.current);
          
          // Reset position to top (above view) for new message
          translateY.setValue(-20);
          
          // Animate new message sliding down from top to center
          Animated.timing(translateY, {
            toValue: 0, // Move to center
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      }, 5000); // Change message every 5 seconds
    }, initialDelay);

    return () => {
      clearTimeout(initialTimer);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [messages.length, translateY, currentIndex, initialDelay]);

  // Show current message
  const currentMessage = messages.length > currentIndex ? messages[currentIndex] : (messages.length > 0 ? messages[0] : '');

  return (
    <View style={styles.liveTextContainer}>
      <Animated.Text 
        style={[
          styles.liveText,
          { transform: [{ translateY }] }
        ]} 
        numberOfLines={1}
      >
        {currentMessage}
      </Animated.Text>
    </View>
  );
};

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
  const { user, isGuest } = useAuth();

  const handleLikePress = (e: any) => {
    e.stopPropagation();
    
    // Always call onLikePress - let parent handle login check
    if (onLikePress) {
      onLikePress();
    }
  };

  // Calculate discount percentage if not provided
  const discountPercentage = product.discount || 
    (product.originalPrice && product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  // New In variant - vertical card with image, discount, like button, and product info
  if (variant === 'newIn') {
    // Calculate width for 3 items per line: (width - padding - gaps) / 3
    // Default calculation if cardWidth not provided
    const defaultCardW = cardWidth || Math.floor((width - SPACING.md * 2 - SPACING.xs * 2) / 3);
    const cardW = cardWidth || defaultCardW;
    const cardH = Math.floor(cardW * 1.55);
    
    return (
      <TouchableOpacity
        style={[styles.newInCard, { width: cardW }, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={{ position: 'relative', width: cardW, height: cardW }}>
          {/* Product image */}
          {product.image && (
            <Image
              source={{ uri: product.image }}
              style={[styles.newInImage, { width: cardW, height: cardW }, imageStyle]}
              resizeMode="cover"
              fadeDuration={0}
            />
          )}
          
          {/* Like button */}
          {showLikeButton && (
            <TouchableOpacity
              style={styles.newInLikeButton}
              onPress={handleLikePress}
            >
              <HeartPlusIcon
                width={20}
                height={20}
                color={isLiked ? COLORS.red : COLORS.black}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Product info below image */}
        <View style={styles.newInInfo}>
          <Text style={styles.newInName} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={styles.newInPriceContainer}>
            <Text style={styles.newInPrice}>
              <Text style={styles.newInCurrency}>¥</Text>
              {product.price.toFixed(2)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.newInOriginalPrice}>
                <Text style={styles.newInCurrency}>¥</Text>
                {product.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
          {discountPercentage > 0 && (
            <View style={styles.newInDiscountBadge}>
              <Text style={styles.newInDiscountText}>
                -{discountPercentage}%
              </Text>
            </View>
          )}
        </View>
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
            {product.image && 
              <Image
                source={{ uri: product.image }}
                style={[styles.gridImage, { width: imageW, height: imageH }, isFullWidth && styles.fullWidthImage, imageStyle]}
                resizeMode="cover"
                fadeDuration={0}
              />
            }
          </ScrollView>
          
          {/* Like button - bottom right */}
          {showLikeButton && (
            <TouchableOpacity
              style={styles.likeButtonRight}
              onPress={handleLikePress}
            >
              <HeartPlusIcon
                width={22}
                height={22}
                color={isLiked ? COLORS.red : COLORS.black}
              />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.gridInfo, isFullWidth && styles.fullWidthInfo]}>
          <Text style={styles.gridName} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={styles.gridPriceRow}>
            <Text style={styles.gridPrice}>¥{product.price?.toFixed(2) || '0.00'}</Text>
            {product.originalPrice && (
              <Text style={styles.gridOriginalPrice}>
                ¥{product.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
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
            {product.image && 
              <Image
                source={{ uri: product.image }}
                style={[styles.horizontalImage, { width: cardW, height: imageH }, imageStyle]}
                resizeMode="cover"
                fadeDuration={0}
              />
            }
          </ScrollView>
          
          {/* Like button - bottom right */}
          {showLikeButton && (
            <TouchableOpacity
              style={styles.likeButtonRight}
              onPress={handleLikePress}
            >
              <HeartPlusIcon
                width={22}
                height={22}
                color={isLiked ? COLORS.red : COLORS.black}
              />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.horizontalInfo}>
          <Text style={styles.horizontalName} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={styles.horizontalPriceRow}>
            <Text style={styles.horizontalPrice}>¥{product.price?.toFixed(2) || '0.00'}</Text>
            {product.originalPrice && (
              <Text style={styles.horizontalOriginalPrice}>
                ¥{product.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
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
        <View style={{ position: 'relative' }}>
          <View style={{ position: 'relative', width: cardW, height: imageH }}>
            {/* Show imageUrl from API - only one image comes from API */}
            {product.image && (
              <Image
                source={{ uri: product.image }}
                style={[styles.moreToLoveImage, { width: cardW, height: imageH }, imageStyle]}
                resizeMode="cover"
                fadeDuration={0}
              />
            )}
          </View>
          {/* <MoreToLoveImage /> */}
          
          {/* Like button - bottom right */}
          {showLikeButton && (
            <TouchableOpacity
              style={styles.likeButtonRight}
              onPress={handleLikePress}
            >
              <HeartPlusIcon
                width={22}
                height={22}
                color={isLiked ? COLORS.red : COLORS.black}
              />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.moreToLoveInfo}>
          {/* Line 1: Product Name and Review in one line */}
          <View style={styles.moreToLoveNameRow}>
            <Text style={styles.moreToLoveName} numberOfLines={1}>
              {product.name}
            </Text>
            {showRating && product.rating > 0 && (
              <View style={styles.moreToLoveReview}>
                <FamilyStarIcon width={12} height={12} color="#E5B546" />
                <Text style={styles.moreToLoveReviewText}>
                  {product.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          
          {/* Line 2: Price with discount in same line */}
          <View style={styles.moreToLovePriceRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
              <Text style={styles.moreToLovePrice}>
                <Text style={styles.moreToLoveCurrency}>¥</Text>
                {product.price?.toFixed(2) || '0.00'}
              </Text>
              {product.originalPrice && product.originalPrice > product.price && (
                <Text style={styles.moreToLoveOriginalPrice}>
                  <Text style={styles.moreToLoveCurrency}>¥</Text>
                  {product.originalPrice.toFixed(2)}
                </Text>
              )}
            </View>
            {discountPercentage > 0 && (
              <Text style={styles.moreToLoveDiscount}>
                -{discountPercentage}%
              </Text>
            )}
          </View>
          
          {/* Line 3: Live Text with scrolling animation */}
          <LiveText product={product} />
        </View>
      </TouchableOpacity>
    );
  }

  // Simple variant - for category page (image, name, price only)
  if (variant === 'simple') {
    const cardW = cardWidth || GRID_CARD_WIDTH;
    const imageH = cardW; // Square image (height = width)
    
    return (
      <TouchableOpacity
        style={[styles.simpleCard, { width: cardW }, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: product.image || '' }}
          style={[styles.simpleImage, { width: cardW, height: imageH }, imageStyle]}
          resizeMode="cover"
        />
        <View style={styles.simpleInfo}>
          <Text style={styles.simpleName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.simplePrice}>¥{product.price?.toFixed(2) || '0.00'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant
  const DefaultImageWithPlaceholder = React.memo(() => {
    const imageUri = product.image || '';
    
    return (
      <View style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Real product image only */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={[styles.productImage, imageStyle]}
            resizeMode="cover"
            fadeDuration={0}
          />
        )}
      </View>
    );
  });
  
  return (
    <TouchableOpacity
      style={[styles.productCard, style]}
      onPress={onPress}
    >
      <View style={styles.productImageContainer}>
        <DefaultImageWithPlaceholder />
        
        {showLikeButton && (
          <TouchableOpacity
            style={styles.likeButtonRight}
            onPress={handleLikePress}
          >
            <HeartPlusIcon
              width={22}
              height={22}
              color={isLiked ? COLORS.red : COLORS.black}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceContainer}>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>¥{product.originalPrice.toFixed(2)}</Text>
          )}
          <Text style={styles.productPrice}>¥{product.price?.toFixed(2) || '0.00'}</Text>
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    color: COLORS.red,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // New In variant
  newInCard: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  newInImage: {
    borderRadius: 8,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  newInLikeButton: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newInInfo: {
    padding: SPACING.xs,
  },
  newInName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  newInPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  newInPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  newInOriginalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  newInCurrency: {
    fontSize: FONTS.sizes.xs,
  },
  newInDiscountBadge: {
    marginTop: SPACING.xs / 2,
    backgroundColor: COLORS.red,
    paddingHorizontal: SPACING.xs,
    borderRadius: 4,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 0,
    alignSelf: 'flex-start',
  },
  newInDiscountText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '700',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gridPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.red,
  },
  gridOriginalPrice: {
    fontSize: FONTS.sizes.smmd,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  horizontalInfo: {
    flex: 1,
  },
  horizontalName: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  horizontalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.red,
  },
  horizontalOriginalPrice: {
    fontSize: FONTS.sizes.smmd,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
  },
  
  // More to Love variant
  moreToLoveCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: SPACING.sm,
  },
  moreToLoveImage: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  moreToLoveInfo: {
    flex: 1,
    paddingHorizontal: 4,
  },
  moreToLoveNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  moreToLoveName: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.xs,
    maxWidth: '75%', // Reduce width to make room for review
  },
  moreToLoveReview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moreToLoveReviewText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  moreToLovePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    marginTop: 2,
  },
  moreToLovePrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  moreToLoveCurrency: {
    fontSize: FONTS.sizes.xs,
  },
  moreToLoveOriginalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  moreToLoveDiscount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.red,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    color: COLORS.red,
  },
  
  // Shared styles
  imageWrapper: {
    position: 'relative',
  },
  likeButtonRight: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF33',
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
    backgroundColor: COLORS.red,
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
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  
  // Live text styles
  liveTextContainer: {
    height: 20,
    marginVertical: 2,
    overflow: 'hidden',
  },
  liveText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default ProductCard;
