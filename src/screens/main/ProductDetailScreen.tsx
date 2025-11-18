import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  Modal,
  StatusBar,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

import { ProductCard } from '../../components';
import PhotoCaptureModal from '../../components/PhotoCaptureModal';
import mockProducts from '../../data/mockProducts.json';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 400;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { productId } = route.params;
  const { likedProductIds, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  


  // Find product from mock data
  const [product, setProduct] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [photoCaptureVisible, setPhotoCaptureVisible] = useState(false);

  // Live stats data
  const liveStats = [
    { icon: 'star', color: '#FFD700', text: '155+ people gave 5-star reviews' },
    { icon: 'cart-outline', color: COLORS.primary, text: '900+ people bought this item' },
    { icon: 'heart-outline', color: COLORS.accentPink, text: '3,000+ people added to cart' },
  ];

  // Rotate through live stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % liveStats.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load product from mock data
    const allProducts = [
      ...mockProducts.newIn,
      ...mockProducts.trending,
      ...mockProducts.forYou,
    ];
    console.log('Looking for product ID:', productId);
    console.log('Available products:', allProducts.map(p => ({ id: p.id, name: p.name })));
    
    const foundProduct = allProducts.find((p: any) => p.id === productId);
    if (foundProduct) {
      console.log('Found product:', foundProduct.name);
      console.log('Product has colors:', foundProduct.colors?.length || 0);
      console.log('Product has sizes:', foundProduct.sizes?.length || 0);
      setProduct(foundProduct);
    } else {
      console.log('Product not found for ID:', productId);
    }
  }, [productId]);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isLiked = likedProductIds.includes(productId);
  const canAddToCart = selectedColor && selectedSize;

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please login first', 'warning');
      return;
    }

    if (!canAddToCart) {
      showToast('Please select color and size', 'warning');
      return;
    }

    try {
      // Pass the entire product object as expected by addToCart function
      await addToCart(product, quantity);
      showToast('Added to cart', 'success');
      navigation.navigate('Cart');
    } catch (error) {
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleCartIconPress = () => {
    if (!isAuthenticated) {
      showToast('Please login to view cart', 'warning');
      return;
    }
    navigation.navigate('Cart');
  };

  const handlePhotoCaptureConfirm = (data: { quantity: number; request: string; photos: string[] }) => {
    // Handle photo capture confirmation
    // In a real app, this would send the data to the server
    console.log('Photo capture data:', data);
    showToast('Photo capture request submitted successfully', 'success');
  };

  // Get similar products (other products from same category)
  const similarProducts = [
    ...mockProducts.newIn,
    ...mockProducts.trending,
    ...mockProducts.forYou,
  ]
    .filter((p: any) => p.id !== productId && p.category === product.category)
    .slice(0, 6);

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `Check out this amazing product: ${product.name}\nPrice: $${product.price.toFixed(2)}\n\nShared from TaoExpress`,
        url: `https://taoexpress.com/product/${productId}`, // Replace with your actual app URL
      };
      
      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing:', error);
      showToast('Failed to share product', 'error');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.black} />
      </TouchableOpacity>
      
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product?.name || 'Product Details'}
        </Text>
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageGallery = () => {
    const totalImages = (product.images || [product.image]).length;
    const currentStat = liveStats[currentStatIndex];
    
    return (
      <View style={styles.imageGalleryContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setSelectedImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {(product.images || [product.image]).map((img: string, index: number) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => {
                setViewerImageIndex(index);
                setImageViewerVisible(true);
              }}
            >
              <Image
                source={{ uri: img }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Image indicators */}
        <View style={styles.imageIndicators}>
          {(product.images || [product.image]).map((_: any, index: number) => (
            <View
              key={index}
              style={[
                styles.indicator,
                selectedImageIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Animated live stat badge - bottom left overlay */}
        <View style={styles.liveStatBadge}>
          <View style={styles.liveStatIconContainer}>
            <Ionicons name={currentStat.icon as any} size={16} color={currentStat.color} />
          </View>
          <Text style={styles.liveStatBadgeText}>{currentStat.text}</Text>
        </View>

        {/* Item info bar - bottom of image */}
        <View style={styles.itemInfoBar}>
          <Text style={styles.itemInfoText}>
            Item {selectedImageIndex + 1}/{totalImages}
          </Text>
          
          <View style={{ flex: 1 }} />
          
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? COLORS.accentPink : COLORS.black}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleCopyProductCode = async () => {
    if (product.productCode) {
      await Clipboard.setStringAsync(product.productCode);
      setIsCopied(true);
      // Reset icon after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const renderProductInfo = () => (
    <View style={styles.productInfoContainer}>
      <Text style={styles.productName} numberOfLines={showFullDescription ? undefined : 2}>
        {product.description || product.name}
      </Text>
      
      <View style={styles.ratingRow}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {product.rating} | all reviews {product.ratingCount}
          </Text>
        </View>
        <Text style={styles.soldText}>{product.orderCount || 0} sold</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {product.originalPrice && (
          <>
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          </>
        )}
      </View>

      {/* Product Code with Copy Button */}
      {product.productCode && (
        <View style={styles.productCodeContainer}>
          <Text style={styles.productCodeLabel}>Product Code: </Text>
          <Text style={styles.productCodeText}>{product.productCode}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyProductCode}
          >
            <Ionicons 
              name={isCopied ? "checkmark-circle" : "copy-outline"} 
              size={16} 
              color={isCopied ? "#10B981" : COLORS.primary} 
            />
            <Text style={[
              styles.copyButtonText,
              isCopied && { color: "#10B981" }
            ]}>
              {isCopied ? 'Copied' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderColorSelector = () => {
    // Debug: Check if product has colors
    console.log('Product colors:', product.colors);
    
    if (!product.colors || product.colors.length === 0) {
      return null; // Don't render if no colors
    }
    
    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Color : {selectedColor || 'Select Color'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {product.colors.map((color: any, index: number) => {
            const isSelected = selectedColor === color.name;
            return (
              <TouchableOpacity
                key={index}
                style={styles.colorOption}
                onPress={() => setSelectedColor(color.name)}
              >
                <Image
                  source={{ uri: color.image || color.hex }}
                  style={[
                    styles.colorImage,
                    isSelected && styles.selectedColorImage,
                  ]}
                />
                <Text style={[
                  styles.colorName,
                  isSelected && styles.selectedColorName,
                ]}>
                  {color.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderSizeSelector = () => {
    // Debug: Check if product has sizes
    console.log('Product sizes:', product.sizes);
    
    if (!product.sizes || product.sizes.length === 0) {
      return null; // Don't render if no sizes
    }
    
    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Size</Text>
        <View style={styles.sizeGrid}>
          {product.sizes.map((size: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sizeOption,
                selectedSize === size && styles.selectedSizeOption,
              ]}
              onPress={() => setSelectedSize(size)}
            >
              <Text
                style={[
                  styles.sizeText,
                  selectedSize === size && styles.selectedSizeText,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSellerInfo = () => {
    const sellerId = product.seller?.id || 'seller_123';
    
    return (
      <TouchableOpacity 
        style={styles.sellerInfoContainer}
        onPress={() => navigation.navigate('SellerProfile', { sellerId })}
      >
        <Image
          source={{ uri: 'https://picsum.photos/seed/seller/100/100' }}
          style={styles.sellerAvatar}
        />
        <View style={styles.sellerDetails}>
          <Text style={styles.sellerNameBold}>
            bsbsrfywoo888Boy zTaylorkng
          </Text>
          <View style={styles.sellerStats}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.sellerStatsText}>5.0 | 1.3K+ sold</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
    );
  };

  const renderReviews = () => (
    <View style={styles.reviewsContainer}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.reviewsTitle}>Reviews ({product.ratingCount || '5.5K'})</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Reviews', { productId })}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {(product.reviews || []).slice(0, 2).map((review: any, index: number) => (
        <View key={index} style={styles.reviewItem}>
          <View style={styles.reviewHeader}>
            <Image
              source={{ uri: 'https://picsum.photos/seed/user/50/50' }}
              style={styles.reviewAvatar}
            />
            <View style={styles.reviewUserInfo}>
              <Text style={styles.reviewUserName}>{review.user || 'Artimus'}</Text>
              <View style={styles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={12}
                    color={i < (review.rating || 5) ? '#FFD700' : COLORS.gray[300]}
                  />
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.reviewText}>
            {review.comment || 'This product is absolutely Great.'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderProductDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Product Details</Text>
      {Object.entries(product.details || { Feeding: 'Bottle feeding' }).map(
        ([key, value], index) => (
          <View key={index} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{key}</Text>
            <Text style={styles.detailValue}>{value as string}</Text>
          </View>
        )
      )}
      <TouchableOpacity>
        <Text style={styles.readMoreText}>Read More</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProductImages = () => {
    const images = product.images || [product.image];
    
    return (
      <View style={styles.productImagesContainer}>
        <Text style={styles.productImagesTitle}>Product Images</Text>
        {images.map((img: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.productImageItem}
            onPress={() => {
              setViewerImageIndex(index);
              setImageViewerVisible(true);
            }}
          >
            <Image
              source={{ uri: img }}
              style={styles.productImageFull}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSimilarProducts = () => (
    <View style={styles.similarProductsContainer}>
      <Text style={styles.similarProductsTitle}>Similar Products</Text>
      <View style={styles.similarProductsGrid}>
        {similarProducts.map((item: any, index: number) => (
          <View key={index} style={styles.similarProductItem}>
            <ProductCard
              product={item}
              variant="moreToLove"
              onPress={() => navigation.push('ProductDetail', { productId: item.id })}
              onLikePress={() => toggleWishlist(item)}
              isLiked={likedProductIds.includes(item.id)}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderBottomBar = () => (
    <View style={styles.bottomBar}>
      {/* Top row with quantity and cart icon */}
      <View style={styles.topActionRow}>
        {/* Quantity Selector */}
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(false)}
          >
            <Ionicons name="remove" size={18} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(true)}
          >
            <Ionicons name="add" size={18} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Camera Button */}
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={() => setPhotoCaptureVisible(true)}
        >
          <Ionicons name="camera-outline" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        {/* Cart Icon Button */}
        <TouchableOpacity 
          style={styles.cartIconButton}
          onPress={handleCartIconPress}
        >
          <Ionicons name="cart-outline" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Bottom row with main action buttons */}
      <View style={styles.mainActionRow}>
        <TouchableOpacity
          style={[styles.addToCartButton, !canAddToCart && styles.disabledButton]}
          disabled={!canAddToCart}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={18} color={COLORS.black} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.buyNowButton, !canAddToCart && styles.disabledButton]}
          disabled={!canAddToCart}
          onPress={() => {
            if (!isAuthenticated) {
              showToast('Please login first', 'warning');
              return;
            }

            if (!canAddToCart) {
              showToast('Please select color and size', 'warning');
              return;
            }

            // Navigate to payment screen with current product
            const paymentItems = [{
              id: product.id,
              name: product.name,
              color: selectedColor,
              size: selectedSize,
              price: product.price,
              quantity: quantity,
              image: product.images?.[0] || product.image,
            }];

            navigation.navigate('Payment', {
              items: paymentItems,
              totalAmount: product.price * quantity,
              fromCart: false,
            });
          }}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageViewer = () => {
    const images = product.images || [product.image];
    
    return (
      <Modal
        visible={imageViewerVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageViewerVisible(false)}
          >
            <Ionicons name="close" size={32} color={COLORS.white} />
          </TouchableOpacity>

          {/* Image counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {viewerImageIndex + 1} / {images.length}
            </Text>
          </View>

          {/* Full screen image gallery */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setViewerImageIndex(index);
            }}
            scrollEventThrottle={16}
            contentOffset={{ x: viewerImageIndex * width, y: 0 }}
          >
            {images.map((img: string, index: number) => (
              <View key={index} style={styles.fullScreenImageContainer}>
                <Image
                  source={{ uri: img }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
      </SafeAreaView>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderProductInfo()}
        {renderColorSelector()}
        {renderSizeSelector()}
        {renderSellerInfo()}
        {renderReviews()}
        {renderProductDetails()}
        {renderProductImages()}
        {renderSimilarProducts()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {renderBottomBar()}
      {renderImageViewer()}
      
      <PhotoCaptureModal
        visible={photoCaptureVisible}
        onClose={() => setPhotoCaptureVisible(false)}
        onConfirm={handlePhotoCaptureConfirm}
        product={{
          id: product.id,
          name: product.name,
          image: product.images?.[0] || product.image,
          price: product.price,
        }}
      />
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
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  imageGalleryContainer: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: IMAGE_HEIGHT,
    backgroundColor: COLORS.gray[100],
  },
  imageIndicators: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    opacity: 0.5,
  },
  activeIndicator: {
    opacity: 1,
  },
  liveStatBadge: {
    position: 'absolute',
    bottom: 70,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    maxWidth: width - SPACING.md * 2,
  },
  liveStatIconContainer: {
    marginRight: SPACING.xs,
  },
  liveStatBadgeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '500',
  },
  itemInfoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  itemInfoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  itemInfoSeparator: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    marginHorizontal: SPACING.sm,
  },
  heartButton: {
    padding: SPACING.xs,
  },
  productInfoContainer: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  productName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  soldText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.accentPink,
    marginRight: SPACING.sm,
  },
  originalPrice: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
    marginRight: SPACING.sm,
  },
  discountBadge: {
    backgroundColor: COLORS.accentPink,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  productCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  productCodeLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  productCodeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  copyButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectorContainer: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  selectorTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  colorOption: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  colorImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
  },
  selectedColorImage: {
    borderColor: COLORS.accentPink,
    borderWidth: 3,
  },
  colorName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedColorName: {
    color: COLORS.accentPink,
    fontWeight: '600',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  sizeOption: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
  },
  selectedSizeOption: {
    borderColor: COLORS.accentPink,
    backgroundColor: COLORS.white,
  },
  sizeText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedSizeText: {
    color: COLORS.accentPink,
    fontWeight: '600',
  },
  sellerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.md,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameBold: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerStatsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  reviewsContainer: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  reviewsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  reviewItem: {
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  detailsContainer: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  detailsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  detailValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  readMoreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    textDecorationLine: 'underline',
  },
  productImagesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  productImagesTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  productImageItem: {
    width: '100%',
  },
  productImageFull: {
    width: '100%',
    height: width,
    backgroundColor: COLORS.gray[100],
  },
  similarProductsContainer: {
    padding: SPACING.lg,
  },
  similarProductsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  similarProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  similarProductItem: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    ...SHADOWS.lg,
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    ...SHADOWS.small,
  },
  quantityText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.lg,
    minWidth: 40,
    textAlign: 'center',
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  cartIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  mainActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  addToCartButton: {
    flex: 1.2,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: 50, // Full round button
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
    elevation: 4,
  },
  addToCartText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 50, // Full round button
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
    elevation: 4,
  },
  buyNowText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounter: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  imageCounterText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  fullScreenImageContainer: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: '100%',
  },
});

export default ProductDetailScreen;
