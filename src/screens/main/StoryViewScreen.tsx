import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Share, Modal, TextInput, FlatList, Pressable, ScrollView, TouchableWithoutFeedback, Animated, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video, AVPlaybackStatus } from 'expo-av';
import { ResizeMode } from 'expo-av';
import { RootStackParamList, Story, Product, Review } from '../../types';
import { productsApi } from '../../services/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext'; // Add this import
import { useProductDetail } from '../../hooks/useProductDetail'; // Add this import
import { useSortProductsMutation } from '../../hooks/useSearchMutations';
import { SellerInfo, ReviewsBlock, YouMayLike, ProductPreviewRow, QuantitySelectorModal, ProductImageGallery } from '../../components';

type StoryViewNav = StackNavigationProp<RootStackParamList, 'StoryView'>;
type StoryViewRoute = RouteProp<RootStackParamList, 'StoryView'>;

const { width, height } = Dimensions.get('window');

const StoryViewScreen: React.FC = () => {
  const navigation = useNavigation<StoryViewNav>();
  const route = useRoute<StoryViewRoute>();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { likedProductIds, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { data: productDetail, fetchProductDetail, isLoading: isProductLoading } = useProductDetail();
  
  // State for story-related data
  const [showCatalog, setShowCatalog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSizeUnit, setSelectedSizeUnit] = useState<'EU' | 'UK' | 'US'>('EU');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedYouIds, setLikedYouIds] = useState<string[]>([]);
  const [youMayLike, setYouMayLike] = useState<Product[]>([]);
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [tempQty, setTempQty] = useState<number>(1);
  const videoRef = useRef<Video>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [productNumber, setProductNumber] = useState(0);

  // Add effect to fetch product details when component mounts
  useEffect(() => {
    // Get product ID from route params
    const productId = route.params?.productId;
    
    if (productId) {
      fetchProductDetail(productId);
    }
  }, [fetchProductDetail, route.params?.productId]);
  // Add effect to check like status when product details are loaded
  useEffect(() => {
    if (productDetail) {
      console.log("Product details loaded:", productDetail);
      // Set like status based on wishlist context
      const liked = likedProductIds.includes(productDetail.id);
      setIsLiked(liked);
      let productNum = 0;
      if (productDetail.variations && productDetail.variations.length > 0) {
        productDetail.variations.map(variation => {
          productNum += variation.options.length;
        })
      }
      setProductNumber(productNum);
      // Set like count from product details
      setLikeCount(productDetail.wishlists_count || 0);
    }
  }, [productDetail, likedProductIds]);

  // Load "You May Like" products when product detail is loaded
  useEffect(() => {
    const loadYouMayLikeProducts = async () => {
      if (productDetail && productDetail.id) {
        try {
          const res = await productsApi.getYouMayLikeProducts(productDetail.id, 8);
          if (res.success) {
            setYouMayLike(res.data);
          }
        } catch (error) {
          console.error('Error loading "You May Like" products:', error);
        }
      }
    };
    
    loadYouMayLikeProducts();
  }, [productDetail?.id]);

  useEffect(() => { 
    console.log("ProductDetail Category Id: ", productDetail?.category.id)
    if (productDetail?.category.id) {
      
    }
  }, [productDetail?.category.id]);

  // Add effect to ensure video plays
  useEffect(() => {
    if (videoRef.current && productDetail?.videos?.[0]) {
      console.log("videoRef.current", productDetail.videos[0]);
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        videoRef.current?.playAsync().catch(error => {
          console.log('Error attempting to play video:', error);
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [productDetail?.videos]);

  // Create a filtered products array for the UI
  const filteredProducts = productDetail ? [productDetail].filter(p => !search || p!.name.toLowerCase().includes(search.toLowerCase())) as Product[] : [];

  if (isProductLoading) {
    return (
      <View style={styles.center}> 
        <Text>Loading story...</Text>
      </View>
    );
  }

  if (!productDetail) {
    return (
      <View style={styles.center}> 
        <Text>No product data available</Text>
      </View>
    );
  }

  // Create a story object based on the actual product data
  const story = {
    id: productDetail.id,
    userId: productDetail.seller.id,
    user: {
      id: productDetail.seller.id,
      email: '', // Not available in product data
      name: productDetail.seller.name,
      avatar: productDetail.seller.avatar || 'https://via.placeholder.com/60',
      phone: '',
      birthday: '',
      addresses: [],
      paymentMethods: [],
      wishlist: [],
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: true,
        },
        language: 'en',
        currency: 'USD',
      },
      followersCount: productDetail.seller.followersCount || 0,
      followingsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    type: 'video' as const,
    media: productDetail.videos?.[0] || productDetail.images[0] || 'https://via.placeholder.com/60', // Use first video or image
    product: productDetail,
    duration: 10000,
    variations: productDetail.variations || [{name: '', options: ''}],
    isViewed: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    productNumber: productNumber,
  };

  const handleShare = async () => {
    try {
      const url = story.product?.images?.[0] || story.media;
      await Share.share({ message: story.product?.name || 'Check this out', url });
    } catch {}
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.durationMillis) {
      const progress = status.positionMillis / status.durationMillis;
      setProgress(progress);
    }
  };

  // Add error handling for video playback
  const onError = (error: any) => {
    console.log('Video playback error:', error);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleShopNow = () => {
    // Navigate to Main navigator with Cart tab as the target
    navigation.navigate('Main', { screen: 'Cart' } as never);
  };

  // Toggle like status
  const toggleLike = async () => {
    if (!story.product || !isAuthenticated) return;
    
    try {
      // Use the wishlist context to toggle like status
      await toggleWishlist(story.product);
      
      // Update local state
      setIsLiked(!isLiked);
      
      // Update like count
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddToCart = () => {
    if (!story.product) return;
    
    // For story items, variation ID is 0
    const variationId = 0;
    
    // If product has sizes but none selected (selector hidden), use first available
    const sizeToUse = story.product.sizes && story.product.sizes.length > 0
      ? (selectedSize || story.product.sizes[0])
      : undefined;

    addToCart(
      story.product,
      quantity,
      variationId, // Pass variation ID to add to cart
      0 // Default option ID
    );
    // Go to Cart after adding
    (navigation as any).navigate('Cart');
  };

  const handleWishlistToggle = async () => {
    if (!story.product) return;
    
    try {
      // Use the new toggleWishlist function from WishlistContext
      await toggleWishlist(story.product);
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (change: number) => {
    if (!story.product) return;
    
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (story.product.stockCount || 10)) {
      setQuantity(newQuantity);
    }
  };

  const renderImageGallery = () => {
    if (!story.product) return null;
    
    // Use sample images for now, in a real app you would use story.product.images
    const images = [
      'https://via.placeholder.com/400x400',
      'https://via.placeholder.com/400x400',
      'https://via.placeholder.com/400x400',
    ];
    
    // Check if product is in wishlist using the context
    const isInWishlist = story.product ? likedProductIds.includes(story.product.id) : false;
    
    return (
      <ProductImageGallery
        images={images}
        showLikeButton={true}
        isLiked={isInWishlist}
        onLikePress={handleWishlistToggle}
        wishlists_count={story.product.wishlists_count || likeCount}
      />
    );
  };

  const renderVariations = () => {
    const variations = [
      { title: 'Light soft blue', image: require('../../assets/images/sneakers.png') },
      { title: 'Classic white', image: require('../../assets/images/heels.png') },
      { title: 'Cream', image: require('../../assets/images/sandles.png') },
    ];
    return (
      <View style={styles.variationsSection}>
        <Text style={styles.sectionHeading}>Variations</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.variationsRow}
        >
          {variations.map((v, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.variationCard}
              onPress={() => setSelectedVariation(idx)}
              activeOpacity={0.9}
            >
              <Image source={v.image} style={styles.variationImage} resizeMode="cover" />
              {selectedVariation === idx && (
                <View style={styles.variationPill}>
                  <Text style={styles.variationPillText}>{v.title}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderProductDetails = () => {
    if (!story.product) return null;
    const allDetails = [
      'Low-profile design',
      'Pull tab for easy entry',
      'Lace-up fastening',
      'Padded tongue and cuff',
      'Signature Asics branding',
      'Rearfoot GEL technology provides lightweight cushioning',
      'Chunky sole',
      'Textured grip tread',
    ];
    const visibleDetails = showFullDetails ? allDetails : allDetails.slice(0, 4);
    return (
      <View style={styles.detailsSection}>
        <Text style={styles.sectionHeading}>Product Details</Text>
        {visibleDetails.map((d, i) => (
          <View key={i} style={styles.detailRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.detailText} numberOfLines={showFullDetails ? 3 : 1}>{d}</Text>
          </View>
        ))}
        {showFullDetails && (
          <Text style={styles.productCode}>Product Code: 148488593</Text>
        )}
        <TouchableOpacity onPress={() => setShowFullDetails(!showFullDetails)}>
          <Text style={styles.readMoreText}>{showFullDetails ? 'Read less' : 'Read more'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSellerSection = () => {
    if (!story.product) return null;
    return (
      <SellerInfo 
        seller={story.product.seller} 
        showFollowButton={true}
        onFollowChange={(isFollowing) => setIsFollowing(isFollowing)}
      />
    );
  };

  const renderReviewsBlock = () => {
    if (!story.product) return null;
    return (
      <ReviewsBlock
        productId={story.product.id}
        reviews={[]} // We're using sample reviews in this component
        reviewCount={story.product.reviewCount}
        averageRating={story.product.rating}
      />
    );
  };

  const renderYouMayLike = () => (
    <YouMayLike products={youMayLike} />
  );

  const maskName = (name: string) => {
    if (!name) return 'User';
    if (name.length <= 2) return name[0] + '*';
    return name.slice(0, 2) + '**' + name.slice(-1);
  };

  const renderPreviewRow = () => {
    const previews = [
      { src: require('../../assets/images/sample_newin.jpg'), available: true },
      { src: require('../../assets/images/heels.png'), available: true },
      { src: require('../../assets/images/sneakers.png'), available: true },
      { src: require('../../assets/images/sandles.png'), available: false },
      { src: require('../../assets/images/long_pants.png'), available: true },
      { src: require('../../assets/images/blouses.png'), available: false },
      { src: require('../../assets/images/hand_bags.png'), available: true },
    ];
    
    return <ProductPreviewRow previews={previews} />;
  };

  const formatCount = (n?: number) => {
    if (!n && n !== 0) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `${n}`;
  };

  const renderRatingSummary = () => {
    if (!story.product) return null;
    return (
      <View style={styles.ratingSummaryContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingCompactText}>
          {formatCount(Number((story.product.rating || 5).toFixed(1)))} ({formatCount(story.product.reviewCount)})
        </Text>
        <Text style={styles.dotDivider}>|</Text>
        <Text style={styles.soldCompactText}>10k+ sold</Text>
      </View>
    );
  };

  const renderProductInfo = () => {
    if (!story.product) return null;
    
    // Check if product is in wishlist using the context
    const isInWishlist = story.product ? likedProductIds.includes(story.product.id) : false;
    
    return (
      <View style={styles.productInfos}>
        {/* Price above title */}
        <View style={styles.priceTopRow}>
          {story.product.originalPrice && story.product.originalPrice > story.product.price && (
            <Text style={styles.originalPriceTop}>${story.product.originalPrice.toFixed(2)}</Text>
          )}
          <Text style={styles.mainPrice}>${story.product.price.toFixed(2)}</Text>
        </View>
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.productName}>
              <View style={styles.titleBadge}>
                <Image source={require('../../assets/icons/hot.png')} />
                <Text style={styles.titleBadgeText}>HOT</Text>
              </View>
              &nbsp;{story.product.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.titleHeartBtn}
            onPress={handleWishlistToggle}
            activeOpacity={0.85}
          >
            <Ionicons 
              name={isInWishlist ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isInWishlist ? COLORS.accentPink : COLORS.gray[400]} 
            />
          </TouchableOpacity>
        </View>
        {renderRatingSummary()}
        {renderVariations()}
        
      </View>
    );
  };

  const renderSizeSelector = () => {
    const sizeMap: Record<'EU' | 'UK' | 'US', string[]> = {
      EU: ['5', '5.5', '6', '6.5', '7', '7.5', '8'],
      UK: ['3', '3.5', '4', '4.5', '5', '5.5'],
      US: ['5', '5.5', '6', '6.5', '7', '7.5'],
    };
    const sizes = sizeMap[selectedSizeUnit];
    return (
      <View style={[styles.selectorContainer, {borderTopWidth: 0, paddingTop: 0}]}>
        <Text style={styles.selectorTitle}>Sizes</Text>
        <View style={styles.sizeTabsRow}>
          {(['EU','UK','US'] as const).map((unit) => (
            <TouchableOpacity
              key={unit}
              style={styles.sizeTab}
              onPress={() => setSelectedSizeUnit(unit)}
            >
              <Text style={selectedSizeUnit === unit ? styles.sizeTabActiveText : styles.sizeTabText}>{unit}</Text>
              {selectedSizeUnit === unit && <View style={styles.sizeTabIndicator} />}
            </TouchableOpacity>
          ))}
          <View style={{position: 'absolute', bottom: 0, width: '35%', borderTopWidth: 1, borderTopColor: COLORS.gray[200]}}/>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sizePillsRow}
        >
          {sizes.map((size) => (
            <TouchableOpacity
              key={`${selectedSizeUnit}-${size}`}
              style={[styles.sizePill, selectedSize === `${selectedSizeUnit}-${size}` && styles.sizePillActive]}
              onPress={() => setSelectedSize(`${selectedSizeUnit}-${size}`)}
              activeOpacity={0.85}
            >
              <Text style={styles.sizePillText}>{size}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleQuantitySelect = (selectedQuantity: number) => {
    setTempQty(selectedQuantity);
    setQtyModalVisible(false);
    setQuantity(selectedQuantity);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Video Player with Progress Bar */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          style={[styles.video, showFullDescription && {opacity: 0.7}]}
          source={{ uri: story.media, }} // Use productDetail videos URL for both video and image
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted // Mute the video to allow autoplay on all platforms
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onError={onError}
        />
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Right side floating actions */}
      <View style={styles.actionsCol}>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('SellerProfile', { sellerId: story.userId })}>
          {/* Use user avatar from auth context when available */}
          <Image 
            source={{ 
              uri: (story.user.avatar || 'https://via.placeholder.com/60') 
            }} 
            style={styles.avatarImg} 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundBtn} onPress={toggleLike}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={32} 
            color={isLiked ? COLORS.accentPink : COLORS.black} 
          />
          <Text style={styles.roundBtnLabel}>Likes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundBtn} onPress={handleShare}>
          <Ionicons name="arrow-redo" size={32} color={COLORS.black} />
          <Text style={styles.roundBtnLabel}>Share</Text>
        </TouchableOpacity>
      </View>
      <LinearGradient colors={["transparent","rgba(0,0,0,0.6)"]} style={styles.bottomOverlay}>
        {story.product && (
          <View>
            {/* Description text - expandable */}
            <TouchableOpacity onPress={toggleDescription} style={{margin: SPACING.md}}>
              <Text style={styles.productDescription} numberOfLines={showFullDescription ? undefined : 4}>
                {story.product.description || 'No description available for this product.'}
              </Text>
            </TouchableOpacity>
            
            {/* Product button with alert badge */}
            
            {/* Product card without the text */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: SPACING.lg}}>
              {/* Use a single product instead of mapping over stories */}
              {
                story.variations.map((variation: any) => 
                  variation.options && variation.options.map((option: any) => (
                    <TouchableOpacity key={story.product.id} style={[styles.productCard, {marginRight: SPACING.md, width: width-2*SPACING.lg}, {marginLeft: SPACING.md}]} onPress={() => setShowDetails(true)}>
                      {/* <Image source={{ uri: story.product.images[0] }} style={styles.productImage} /> */}
                      <Image source={option.image ? {uri: option.image} : require('../../assets/images/tops.png')} style={styles.productImage} />
                      <View style={{ flex: 1, }}>
                        <Text style={styles.productName} numberOfLines={2}>{story.product.name} - {variation.name}</Text>
                        <View style={[styles.productInfo, {width: '100%'}]}> 
                          <View style={[styles.productInfo, {gap: SPACING.sm}]}> 
                            {story.product.originalPrice && story.product.originalPrice > story.product.price && (
                              <Text style={styles.productOriginalPrice}>${story.product.originalPrice.toFixed(2)}</Text>
                            )}
                            <Text style={styles.productPrice}>${option.price.toFixed(2)}</Text>
                            {/* {story.product.discount && story.product.discount > 0 && (
                              <Text style={styles.discountPrice}>-{story.product.discount}%</Text>
                            )} */}
                          </View>
                          <TouchableOpacity style={styles.shopBtn} onPress={handleShopNow}>
                            <Text style={styles.shopBtnText}>Shop Now</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )
              }
            </ScrollView>
          </View>
        )}
      </LinearGradient>

      <View style={styles.productButton}>
        <TouchableOpacity style={styles.productBtn} onPress={() => setShowCatalog(true)}>
          <Image 
            source={require('../../assets/icons/store_lock.png')} 
            style={{ width: 40, height: 40, }} 
          />
          {/* Alert badge with product count */}
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>{productNumber}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={22} color={COLORS.black} />
      </TouchableOpacity>

      {/* Catalog Bottom Sheet */}
      <Modal transparent statusBarTranslucent visible={showCatalog} animationType="slide" onRequestClose={() => setShowCatalog(false)}>
        <TouchableWithoutFeedback onPress={() => setShowCatalog(false)}>
          <View style={styles.sheetBackdrop}>
            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center'}}>
              <View style={styles.stickbar}/>
            </View>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>({productNumber}) Products</Text>
                  <View style={styles.sheetHeaderActions}>                     
                    <TouchableOpacity style={styles.productBtn} onPress={() => navigation.navigate('Cart' as never)}>
                      <Image 
                        source={require('../../assets/icons/shopping_cart.png')} 
                        style={{ width: 28, height: 28, marginRight: SPACING.sm, marginTop: SPACING.xs }} 
                      />
                      {/* Alert badge with product count */}
                      {/* <View style={styles.alertBadge}>
                        <Text style={styles.alertText}>1</Text>
                      </View> */}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowCatalog(false)}>
                      <Ionicons name="close" size={28} color={COLORS.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.searchBox}>
                  <Ionicons name="search-outline" size={24} color={COLORS.black} />
                  <TextInput value={search} onChangeText={setSearch} placeholder="Search" placeholderTextColor={COLORS.gray[400]} style={styles.searchInput} />
                </View>
                <FlatList
                  data={story.variations}
                  // keyExtractor={(item) => item?. || ''}
                  renderItem={({ item, index }: {item:any, index: number}) => (
                    item.options ? ( 
                      item.options.map((option: any) => (
                        <TouchableOpacity style={styles.catalogItem} onPress={() => { setShowCatalog(false); 
                          navigation.navigate('ProductDetail', { productId: productDetail.id });}}>
                          {/* <Image source={{ uri: item.images[0] }} style={styles.catalogThumb} />
                          <View style={{ flex: 1 }}>
                          <Text style={styles.catalogName} numberOfLines={2}>{item.name}</Text>
                          <Text style={styles.catalogPrice}>${item.price.toFixed(2)} <Text style={styles.catalogDiscount}>-30%</Text></Text>
                          </View> */}
                          <Image source={require('../../assets/images/tops.png')} style={styles.productImage} />
                          <View style={styles.indexBadge}><Text style={styles.indexBadgeText}>{index + 1}</Text></View>
                          <View style={{ flex: 1, }}>
                            <Text style={styles.productName} numberOfLines={2}>{productDetail.name} - {item.name}</Text>
                            <View style={[styles.productInfo, {width: '100%'}]}> 
                              <View style={[styles.productInfo, {gap: SPACING.sm}]}> 
                                {/* {option.price && (
                                  <Text style={styles.productOriginalPrice}>${option.price.toFixed(2)}</Text>
                                )} */}
                                <Text style={styles.productPrice}>${option.price.toFixed(2)}</Text>
                                {/* {item.discount && item.discount > 0 && (
                                  <Text style={styles.discountPrice}>-{item.discount}%</Text>
                                )} */}
                              </View>
                              <TouchableOpacity style={styles.shopBtn} onPress={handleShopNow}>
                                <Text style={styles.shopBtnText}>Shop Now</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))                     
                      
                    ) : null
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  contentContainerStyle={{ paddingVertical: 8 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>          
        </TouchableWithoutFeedback>
      </Modal>

      {/* Product Details Sheet */}
      <Modal transparent visible={showDetails} animationType="slide" onRequestClose={() => setShowDetails(false)}>
        <TouchableWithoutFeedback onPress={() => setShowDetails(false)}>
          <View style={styles.sheetBackdrop}>
            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center'}}>
              <View style={styles.stickbar}/>
            </View>
            <TouchableWithoutFeedback>
              <View style={[styles.detailsSheet, {paddingTop: SPACING.xl}]}>
                <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                  {/* Product Detail Component */}
                  <View style={styles.container}>
                    <ScrollView
                      style={styles.scrollView}
                      contentContainerStyle={{ paddingTop: 0 }}
                      showsVerticalScrollIndicator={false}
                    >
                      {renderImageGallery()}
                      {renderProductInfo()}
                      {renderSizeSelector()}
                      {renderProductDetails()}
                      {renderSellerSection()}
                      {renderReviewsBlock()}
                      {renderPreviewRow()}
                      {renderYouMayLike()}
                    </ScrollView>
                    
                  </View>
                </ScrollView>
                <View style={styles.bottomContainer}>
                  <TouchableOpacity 
                    style={styles.bottomIconBtn} 
                    activeOpacity={0.9}
                    onPress={() => {
                      console.log('Chat button pressed');
                      (navigation as any).navigate('Chat', { 
                        sellerId: story.product?.seller?.id || '1',
                        productId: story.product?.id || '1'
                      });
                    }}
                  >
                    <Image source={require('../../assets/icons/chat.png')}/>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.qtyPill}
                    onPress={() => { setTempQty(quantity); setQtyModalVisible(true); }}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <Ionicons name="chevron-down" size={16} color={COLORS.text.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.addToBagButton} 
                    onPress={handleAddToCart}
                    activeOpacity={0.95}
                  >
                    <Text style={styles.addToBagText}>Add to Bag</Text>
                  </TouchableOpacity>
                </View>
                {/* Quantity Modal */}
                <QuantitySelectorModal
                  visible={qtyModalVisible}
                  onClose={() => setQtyModalVisible(false)}
                  onSelect={handleQuantitySelect}
                  currentQuantity={tempQty}
                />

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videoContainer: {
    width,
    height,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  progressBarContainer: {
    position: 'absolute',
    top: SPACING['2xl'],
    left: SPACING.md,
    right: SPACING.md,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.white,
  },
  actionsCol: { position: 'absolute', right: 12, bottom: height * 0.28, alignItems: 'center' },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  roundBtn: { width: 44, height: 60, marginBottom: 10, alignItems: 'center', justifyContent: 'center' },
  roundBtnLabel: { color: COLORS.white, fontSize: FONTS.sizes.sm, marginTop: 2 },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // padding: SPACING.md,
  },
  productName: { 
    fontSize: FONTS.sizes.sm, 
    color: COLORS.gray[500], 
    fontWeight: '700',
    marginBottom: SPACING.xs,
    width: '90%',
  },
  productInfo: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: { 
    fontSize: FONTS.sizes.md, 
    color: COLORS.error, 
    fontWeight: '600',
  },
  productOriginalPrice: { 
    fontSize: FONTS.sizes.sm, 
    color: COLORS.gray[400], 
    fontWeight: '600',
    textDecorationLine: 'line-through'
  },
  discountPrice: { 
    fontSize: FONTS.sizes.sm, 
    color: COLORS.accentPink, 
    backgroundColor: COLORS.accentPink+10,
    borderRadius: BORDER_RADIUS.sm,
    fontWeight: '600',
    paddingHorizontal: SPACING.sm,
  },
  productDescription: { 
    fontSize: FONTS.sizes.sm, 
    color: COLORS.white, 
    marginBottom: SPACING.md,
    lineHeight: 18,
    width: '85%',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  productImage: { width: 48, height: 48, borderRadius: 8, marginRight: SPACING.sm },
  alertBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.accentPink,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  alertText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  productButton: {
    position: 'absolute',
    bottom: height*0.22,
    right: SPACING.md,
  },
  productBtn: { 
    // width: 50, 
    // height: 50, 
    // borderRadius: 25, 
    // backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
  },
  stickbar: {
    width: '10%',
    height: 15,
    borderTopColor: COLORS.white,
    borderTopWidth: 3,
  },
  sheetHeaderActions: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  shopBtn: { backgroundColor: COLORS.accentPink, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginLeft: SPACING.sm },
  shopBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  closeBtn: { position: 'absolute', top: SPACING['3xl'], right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray[200], alignItems: 'center', justifyContent: 'center' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: height * 0.8, padding: SPACING.md },
  detailsSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: height * 0.9, flex: 1, overflow: 'hidden' },
  detailsImage: { width: width - SPACING.lg * 2, height: (width - SPACING.lg * 2) * 1.1, borderRadius: 12, alignSelf: 'center', marginTop: SPACING.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  sheetTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text.primary },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray[100], borderRadius: 20, paddingHorizontal: SPACING.md, height: 40, marginBottom: SPACING.md },
  searchInput: { marginLeft: 6, flex: 1, color: COLORS.text.primary },
  catalogItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray[50], padding: SPACING.sm, borderRadius: 12, marginHorizontal: 2, overflow:'hidden', marginBottom: SPACING.lg },
  indexBadge: { position: 'absolute', left: -10, top: -10, backgroundColor: COLORS.gray[800], borderRadius: 20, paddingRight: 12, paddingLeft: 22, paddingTop: 10, paddingVertical: 2 },
  indexBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  catalogThumb: { width: 48, height: 48, borderRadius: 8, marginRight: SPACING.sm },
  catalogName: { fontSize: FONTS.sizes.sm, color: COLORS.text.primary, fontWeight: '600' },
  catalogPrice: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700' },
  catalogDiscount: { color: COLORS.gray[500], fontWeight: '600' },
  catalogCTA: { backgroundColor: COLORS.accentPink, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  catalogCTAText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '700' },
  qtyBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: COLORS.gray[100], alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  addBtn: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: COLORS.white, fontWeight: '700' },
  closeDetailsBtns: {position: 'absolute', top: SPACING.md, right: 16, flexDirection: 'row', gap: SPACING.sm},
  closeDetailsBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  
  // New styles for product detail component
  imageContainer: {
    height: height * 0.5,
    marginLeft: '5%',
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: SPACING.md,
  },
  productDetailImage: {
    width: width*0.9,
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  likeOverlayBtn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  likeCountText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    marginRight: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: COLORS.white,
  },
  variationsSection: {
    backgroundColor: COLORS.white,
  },
  sectionHeading: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  variationsRow: {
  },
  variationCard: {
    width: 130,
    height: 170,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  variationImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  variationPill: {
    alignSelf: 'center',
    backgroundColor: COLORS.gray[400],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: SPACING.sm,
  },
  variationPillText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    marginBottom: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text.primary,
    marginTop: 8,
    marginRight: 10,
  },
  detailText: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
  },
  productCode: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
  },
  readMoreText: {
    marginVertical: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  sellerSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200]
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SPACING.md,
    backgroundColor: COLORS.gray[100],
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sellerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  sellerMetaText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  sellerActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sellerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
  },
  sellerActionText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  previewRowContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  youMayLikeSection: {
    backgroundColor: COLORS.white,
    paddingBottom: 130,
    marginHorizontal: SPACING.md,
    borderTopColor: COLORS.gray[200],
    borderTopWidth: 1,
    paddingTop: SPACING.smmd
  },
  youGridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  youCard: {
    width: (width - SPACING.md * 2 - SPACING.md) / 2,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  trendingImageWrap: { position: 'relative' },
  youImage: {
    width: (width - SPACING.md * 2 - SPACING.md) / 2,
    height: ((width - SPACING.md * 2 - SPACING.md) / 2) * 1.2,
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
  discountText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
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
  soldText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  youName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  youPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    fontWeight: '600',
  },
  previewOuterCircle: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.accentPink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
  },
  previewOuterCircleGray: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
  },
  previewInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInnerCircleGray: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray[50],
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  ratingSummaryContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingCompactText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  dotDivider: {
    color: COLORS.gray[200],
    marginHorizontal: 2,
  },
  soldCompactText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  productDetailInfo: {
    padding: SPACING.md,
    paddingRight: 0,
    backgroundColor: COLORS.white,
  },
  titleBadge: {
    backgroundColor: COLORS.accentPink,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
    gap: 3,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: SPACING.xs
  },
  titleBadgeText: {
    fontSize: SPACING.sm,
    color: COLORS.white
  },
  productInfos: { 
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  priceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPriceTop: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  mainPrice: {
    fontSize: FONTS.sizes.xl || 22,
    fontWeight: '700',
    color: COLORS.error,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingRight: SPACING.md,
  },
  titleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotBadge: {
    backgroundColor: COLORS.accentPink,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hotBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  titleHeartBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  reviewsBlock: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[200],
  },
  reviewsBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsBlockTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  reviewsSeeAll: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  reviewsScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  reviewsScoreText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  reviewsOutOf: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  reviewsStarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  reviewCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  reviewUserName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  selectorContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  selectorTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  sizeTabsRow: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  sizeTab: {
    alignItems: 'center',
  },
  sizeTabText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[400],
    fontWeight: '600',
  },
  sizeTabActiveText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  sizeTabIndicator: {
    marginTop: 6,
    height: 2,
    width: 28,
    backgroundColor: COLORS.text.primary,
    borderRadius: 2,
  },
  sizePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  sizePill: {
    minWidth: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  sizePillActive: {
    backgroundColor: COLORS.gray[100],
  },
  sizePillText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 50,
  },
  bottomIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 60,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  addToBagButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToBagText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
  qtyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  qtySheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  qtyTitle: {
    textAlign: 'center',
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  qtyList: {
    paddingVertical: SPACING.sm,
  },
  qtyRow: {
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  qtyRowActive: {
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  qtyValue: {
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[400],
  },
  qtyValueActive: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  qtyApplyBtn: {
    marginTop: SPACING.md,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyApplyText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

export default StoryViewScreen;
