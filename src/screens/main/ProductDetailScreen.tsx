import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// Removed WebView import - using simpler HTML rendering approach
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

import { ProductCard } from '../../components';
import { PhotoCaptureModal } from '../../components';
import mockProducts from '../../data/mockProducts.json';
import { useProductDetailMutation, useSearchProductsByKeywordMutation } from '../../hooks/useHomeScreenMutations';
import { usePlatformStore } from '../../store/platformStore';
import { useAppSelector } from '../../store/hooks';
import { ActivityIndicator } from 'react-native';
import { Product } from '../../types';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 400;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { productId, offerId } = route.params;
  const { likedProductIds, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  // Get platform and locale
  const { selectedPlatform } = usePlatformStore();
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';
  
  // Product detail mutation
  const {
    mutate: fetchProductDetail,
    data: productDetailData,
    isLoading: productDetailLoading,
    error: productDetailError,
  } = useProductDetailMutation({
    onSuccess: (data) => {
      console.log('Product detail fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Product detail fetch error:', error);
      showToast('Failed to load product details', 'error');
    }
  });

  // Find product from mock data or API
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullSpecifications, setShowFullSpecifications] = useState(false);
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

  // Get similar products using the same API as "for you" products in category screen
  // IMPORTANT: All hooks must be called before any conditional returns
  const { 
    mutate: fetchSimilarProducts, 
    data: similarProductsData, 
    isLoading: similarProductsLoading 
  } = useSearchProductsByKeywordMutation();
  
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [similarProductsPage, setSimilarProductsPage] = useState(1);
  const [similarProductsHasMore, setSimilarProductsHasMore] = useState(true);
  const [similarProductsLoadingMore, setSimilarProductsLoadingMore] = useState(false);
  const isFetchingSimilarProductsRef = useRef(false);
  const loadedPagesRef = useRef<Set<number>>(new Set());

  // Rotate through live stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % liveStats.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Load product from API
  useEffect(() => {
    // For "more to love" products, use offerId if available, otherwise use productId
    const idToUse = offerId || productId;
    if (idToUse) {
      setLoading(true);
      const country = locale === 'zh' ? 'zh' : locale === 'ko' ? 'ko' : 'en';
      fetchProductDetail(idToUse, selectedPlatform, country);
    }
  }, [productId, offerId, selectedPlatform, locale]);

  // Update product when API data is received
  useEffect(() => {
    if (productDetailData) {
      setProduct(productDetailData);
      setLoading(false);
    } else if (productDetailError) {
      // Fallback to mock data on error
      const allProducts = [
        ...mockProducts.newIn,
        ...mockProducts.trending,
        ...mockProducts.forYou,
      ];
      const foundProduct = allProducts.find((p: any) => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }
      setLoading(false);
    }
  }, [productDetailData, productDetailError, productId]);
  
  // Fetch similar products when product is loaded (first page)
  useEffect(() => {
    if (product?.name) {
      // Reset pagination when product changes
      setSimilarProducts([]);
      setSimilarProductsPage(1);
      setSimilarProductsHasMore(true);
      loadedPagesRef.current.clear();
      isFetchingSimilarProductsRef.current = false;
      // Use product name as keyword for similar products
      const keyword = product.name;
      loadedPagesRef.current.add(1);
      fetchSimilarProducts(keyword, selectedPlatform, locale as 'en' | 'zh' | 'ko', 1, 20);
    }
  }, [product?.name, selectedPlatform, locale, fetchSimilarProducts]);
  
  // Update similar products when data is received
  useEffect(() => {
    if (similarProductsData && Array.isArray(similarProductsData)) {
      // Filter out the current product
      const filtered = similarProductsData
        .filter((p: Product) => p.id?.toString() !== productId?.toString());
      
      // Always filter out duplicates when appending
      setSimilarProducts(prev => {
        if (similarProductsPage === 1) {
          // First page, replace existing data
          return filtered;
        } else {
          // Subsequent pages, append to existing data but filter out duplicates
          const existingIds = new Set(prev.map(p => p.id?.toString()));
          const newProducts = filtered.filter(p => !existingIds.has(p.id?.toString()));
          return [...prev, ...newProducts];
        }
      });
      
      // Check if there are more pages (if we got a full page, there might be more)
      setSimilarProductsHasMore(similarProductsData.length >= 20);
      setSimilarProductsLoadingMore(false);
      isFetchingSimilarProductsRef.current = false;
    }
  }, [similarProductsData, productId, similarProductsPage]);
  
  // Load more similar products
  const loadMoreSimilarProducts = useCallback(() => {
    const nextPage = similarProductsPage + 1;
    
    // Prevent duplicate requests for the same page
    if (!similarProductsLoadingMore && 
        !isFetchingSimilarProductsRef.current && 
        similarProductsHasMore && 
        product?.name &&
        !loadedPagesRef.current.has(nextPage)) {
      isFetchingSimilarProductsRef.current = true;
      setSimilarProductsLoadingMore(true);
      setSimilarProductsPage(nextPage);
      loadedPagesRef.current.add(nextPage);
      // Use product name as keyword for similar products
      const keyword = product.name;
      fetchSimilarProducts(keyword, selectedPlatform, locale as 'en' | 'zh' | 'ko', nextPage, 20);
    }
  }, [similarProductsPage, similarProductsHasMore, similarProductsLoadingMore, product?.name, selectedPlatform, locale, fetchSimilarProducts]);

  // Extract image URLs from HTML description
  const extractImagesFromHtml = useCallback((html: string): string[] => {
    if (!html) return [];
    
    // Match all img tags with src attribute
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const images: string[] = [];
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1]) {
        images.push(match[1]);
      }
    }
    
    return images;
  }, []);

  // Get product images from API only (not from HTML description)
  const getApiProductImages = useCallback((currentProduct: any): string[] => {
    if (!currentProduct) return [];
    
    // Use images array from API, or fallback to single image
    const apiImages = (currentProduct as any).images || [];
    if (apiImages.length > 0) {
      return apiImages;
    }
    
    // Fallback to single image if images array is empty
    if (currentProduct.image) {
      return [currentProduct.image];
    }
    
    return [];
  }, []);

  if (loading || productDetailLoading || !product) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.md, color: COLORS.text.secondary }}>Loading product...</Text>
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

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `Check out this amazing product: ${product.name}\nPrice: $${product.price.toFixed(2)}\n\nShared from TodayMall`,
        url: `https://todaymall.com/product/${productId}`, // Replace with your actual app URL
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
    // Use only API images (not from HTML description)
    const apiImages = getApiProductImages(product);
    const totalImages = apiImages.length;
    const currentStat = liveStats[currentStatIndex];
    
    if (totalImages === 0) {
      return null;
    }
    
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
          {apiImages.map((img: string, index: number) => (
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
                fadeDuration={300}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Image indicators */}
        <View style={styles.imageIndicators}>
          {apiImages.map((_: any, index: number) => (
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
        {/* <View style={styles.liveStatBadge}>
          <View style={styles.liveStatIconContainer}>
            <Ionicons name={currentStat.icon as any} size={16} color={currentStat.color} />
          </View>
          <Text style={styles.liveStatBadgeText}>{currentStat.text}</Text>
        </View> */}

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

  const renderProductInfo = () => {
    // Strip HTML tags from description for display
    const stripHtml = (html: string) => {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    };
    
    return (
      <View style={styles.productInfoContainer}>
        <Text style={styles.productName} numberOfLines={showFullDescription ? undefined : 2}>
          {product.name || 'Product'}
        </Text>
        
        {/* Description with HTML stripped */}
        {/* {product.description && (
          <Text style={styles.productDescription} numberOfLines={showFullDescription ? undefined : 3}>
            {stripHtml(product.description)}
          </Text>
        )} */}
      </View>
    );
  };
  
  const renderRatingRow = () => {
    // Get soldOut number from product
    const soldOut = (product as any).soldOut || '0';
    
    return (
      <View style={styles.ratingRow}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {product.rating?.toFixed(1) || '0'}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={styles.soldText}>{soldOut || 0} sold</Text>
      </View>
    );
  };

  const renderPriceRow = () => (
    <View style={styles.priceRow}>
      <Text style={styles.price}>¥{product.price.toFixed(2)}</Text>
      {product.originalPrice && product.originalPrice > product.price && (
        <>
          <Text style={styles.originalPrice}>¥{product.originalPrice.toFixed(2)}</Text>
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderProductCode = () => (
    <>
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
    </>
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
    // Use companyName from seller, which is already set in the transformation
    const companyName = product.seller?.name || 'Seller Name';
    
    return (
      <TouchableOpacity 
        style={styles.sellerInfoContainer}
        onPress={() => navigation.navigate('SellerProfile', { sellerId })}
      >
        <Image
          source={{ uri: product.seller?.avatar || 'https://picsum.photos/seed/seller/100/100' }}
          style={styles.sellerAvatar}
        />
        <View style={styles.sellerDetails}>
          <Text style={styles.sellerNameBold}>
            {companyName}
          </Text>
          <View style={styles.sellerStats}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.sellerStatsText}>
              {product.seller?.rating?.toFixed(1) || '5.0'}
            </Text>
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

  const renderProductDetails = () => {
    const specifications = (product as any).specifications || {};
    
    if (!specifications || Object.keys(specifications).length === 0) {
      return null;
    }
    
    const specificationEntries = Object.entries(specifications);
    const INITIAL_SPECS_COUNT = 5; // Show first 5 specifications initially
    const shouldShowReadMore = specificationEntries.length > INITIAL_SPECS_COUNT;
    const displayedSpecs = showFullSpecifications 
      ? specificationEntries 
      : specificationEntries.slice(0, INITIAL_SPECS_COUNT);
    
    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Specifications</Text>
        {displayedSpecs.map(
          ([key, value], index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{key}</Text>
              <Text style={styles.detailValue} numberOfLines={0}>{String(value)}</Text>
            </View>
          )
        )}
        {shouldShowReadMore && (
          <TouchableOpacity onPress={() => setShowFullSpecifications(!showFullSpecifications)}>
            <Text style={styles.readMoreText}>
              {showFullSpecifications ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderProductDescription = () => {
    // Render HTML description by extracting images and text
    if (!product || !product.description) {
      return null;
    }
    
    // Extract images from HTML
    const descriptionImages = extractImagesFromHtml(product.description);
    
    // Strip HTML tags and get plain text
    const stripHtml = (html: string) => {
      if (!html) return '';
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const plainText = stripHtml(product.description);
    
    return (
      <View style={styles.productDescriptionContainer}>
        <Text style={styles.productDescriptionTitle}>Product Description</Text>
        <View style={styles.htmlContentContainer}>
          {/* Display images from HTML description */}
          {descriptionImages.length > 0 && (
            <View style={styles.descriptionImagesContainer}>
              {descriptionImages.map((imgUrl: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: imgUrl }}
                  style={styles.descriptionImage}
                  resizeMode="contain"
                />
              ))}
            </View>
          )}
          
          {/* Display plain text description */}
          {plainText && (
            <View style={styles.descriptionTextContainer}>
              <Text style={styles.descriptionText}>{plainText}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSimilarProducts = () => {
    if (similarProducts.length === 0 && !similarProductsLoading && !similarProductsLoadingMore) {
      return null;
    }
    
    return (
      <View style={styles.similarProductsContainer}>
        <Text style={styles.similarProductsTitle}>For You</Text>
        <FlatList
          data={similarProducts}
          renderItem={({ item }) => (
            <View style={styles.similarProductItem}>
              <ProductCard
                product={item}
                variant="moreToLove"
                onPress={() => navigation.push('ProductDetail', { productId: item.id })}
                onLikePress={() => toggleWishlist(item)}
                isLiked={likedProductIds.includes(item.id?.toString())}
              />
            </View>
          )}
          keyExtractor={(item, index) => `similar-${item.id?.toString() || index}-${index}`}
          numColumns={2}
          scrollEnabled={false}
          nestedScrollEnabled={true}
          columnWrapperStyle={styles.similarProductsGrid}
          onEndReached={loadMoreSimilarProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (similarProductsLoadingMore) {
              return (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View>
              );
            }
            return null;
          }}
        />
      </View>
    );
  };

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
    // Use only API images for viewer
    const images = getApiProductImages(product);
    
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
        {renderRatingRow()}
        {renderPriceRow()}
        {renderColorSelector()}
        {renderSizeSelector()}
        {renderSellerInfo()}
        {/* {renderReviews()} */}
        {renderProductDetails()}
        {renderProductDescription()}
        {renderSimilarProducts()}
        <View style={{ height: 200 }} />
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
    paddingTop: SPACING['2xl'],
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
    paddingBottom: 0,
  },
  productName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  productDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  soldOutText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
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
    paddingHorizontal: SPACING.lg,
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
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    flex: 1,
    marginRight: SPACING.md,
  },
  detailValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    flex: 2,
    flexWrap: 'wrap',
    textAlign: 'right',
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
  productDescriptionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  productDescriptionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  htmlContentContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  descriptionImagesContainer: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  descriptionImage: {
    width: '100%',
    height: 300,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
  },
  descriptionTextContainer: {
    width: '100%',
  },
  descriptionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    lineHeight: 24,
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
    justifyContent: 'space-between',
  },
  similarProductItem: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
  },
  loadingMoreContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  loadingMoreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
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
    // paddingVertical: SPACING.smmd,
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
    paddingVertical: SPACING.smmd,
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
