import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useGetCartMutation, useRemoveFromCartMutation, useUpdateCartItemMutation } from '../../hooks/useCartMutations'; // Import the mutation hooks directly
import { useBatchUpdateCartMutation } from '../../hooks/useBatchUpdateCartMutation';
import { useCheckoutOrderMutation } from '../../hooks/useCartMutations'; // Add checkout mutation import
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { Product, CartItem, ApiAddress } from '../../types';
import { YouMayLike, CategoryCard, QuickCategoryCard, ProductCard } from '../../components';
import { useCategoriesMutation } from '../../hooks/useCategories';
import { useForYouProductsMutation } from '../../hooks/useHomeScreenMutations';
import { useGetAddressesMutation } from '../../hooks/useAddressMutations';
import { useAuth } from '../../context/AuthContext';



const CartScreen: React.FC = () => {
  console.log('CartScreen: Component initializing');
  
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Use the mutation hooks directly
  const { mutate: fetchCartData, data: cartData, isLoading: isCartDataLoading, isSuccess, isError, error } = useGetCartMutation();
  const { mutate: removeFromCart, isLoading: isRemoveFromCartLoading } = useRemoveFromCartMutation({
    onSuccess: () => {
      // Refresh the cart data after successful removal
      fetchCartData();
    },
    onError: (error: string) => {
      console.error('Failed to remove item:', error);
      Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
    }
  });
  const { mutate: updateQuantity, isLoading: isUpdateCartItemLoading } = useUpdateCartItemMutation();
  const { mutate: batchUpdateCart, isLoading: isBatchUpdateLoading } = useBatchUpdateCartMutation({
    onSuccess: () => {
      // Navigate to order success screen after successful batch update
      navigation.navigate('OrderSuccess' as never);
    },
    onError: (error: string) => {
      console.error('Failed to update cart items:', error);
      Alert.alert('Error', 'Failed to update cart items. Please try again.');
    }
  });
  
  // Add category hooks
  const { mutate: fetchCategories, data: categoriesData, isLoading: categoriesLoading } = useCategoriesMutation();
  
  // Add "For You" hooks
  const { mutate: fetchForYouProducts, data: forYouData, isLoading: forYouLoading, error: forYouError } = useForYouProductsMutation();
  
  // Add address hook
  const { 
    mutate: fetchAddresses, 
    data: addressesData, 
    isLoading: addressesLoading, 
    isError: addressesError 
  } = useGetAddressesMutation({
    onSuccess: (data) => {
      if (data && data.data) {
        setAddresses(data.data);
        
        // Find the primary address
        const primaryAddress = data.data.find((addr: ApiAddress) => addr.is_primary_address === 1);
        if (primaryAddress) {
          setSelectedAddress(primaryAddress);
        } else if (data.data.length > 0) {
          setSelectedAddress(data.data[0]);
        } else {
          setSelectedAddress(null); // No addresses available
        }
      }
    },
    onError: (error) => {
      console.error('Error fetching addresses:', error);
      setSelectedAddress(null); // Reset selected address on error
    }
  });
  
  // Add checkout order mutation hook
  const { 
    mutate: checkoutOrder, 
    isLoading: isCheckoutLoading, 
    isSuccess: isCheckoutSuccess, 
    isError: isCheckoutError, 
    error: checkoutError 
  } = useCheckoutOrderMutation({
    onSuccess: (data) => {
      console.log('Checkout successful:', data);
      // Navigate to order success screen
      navigation.navigate('OrderSuccess' as never);
      // Refresh cart data
      fetchCartData();
    },
    onError: (error) => {
      console.error('Checkout failed:', error);
      Alert.alert('Checkout Failed', error || 'Failed to place order. Please try again.');
    }
  });
  
  console.log('CartScreen: useGetCartMutation hook returned', { 
    hasCartData: !!cartData,
    cartDataLength: cartData ? cartData.length : 0,
    isCartDataLoading,
    isSuccess,
    isError,
    hasError: !!error,
    cartData: cartData,
  });
  
  // Use cart data from mutation hook instead of context
  const cart = {
    items: cartData || [],
    total: 0, // These would need to be calculated
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0
  };
  
  // State to track expanded stores
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());
  
  // Local state for item quantities (to avoid immediate API calls)
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
  
  // Local state for selected items
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Local state for selected options for each item
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { variationIndex: number; optionIndex: number }>>({});
  
  // Add category state
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState('All');
  
  // Add "For You" state
  const [forYouProducts, setForYouProducts] = useState<any[]>([]);
  const [forYouOffset, setForYouOffset] = useState(1);
  const [forYouHasMore, setForYouHasMore] = useState(true);
  
  // Add address state
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ApiAddress | null>(null);
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch the latest cart data when the screen loads
  useEffect(() => {
    console.log('CartScreen: Fetching cart data on mount');
    console.log('CartScreen: About to call fetchCartData (mutate)');
    fetchCartData();
    // Fetch categories as well
    fetchCategories();
    // Fetch user addresses with correct module ID
    fetchAddresses(2);
    console.log('CartScreen: Finished calling fetchCartData', selectedItems);
  }, []); // Empty dependency array means this runs only once on mount

  // Update categories state when API data is received
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      // Transform API data to extract category names
      const categoryNames = categoriesData
        .filter((category: any) => category && (category.name || category.id))
        .map((category: any) => {
          if (category.name) return category.name;
          if (category.id) return `Category ${category.id}`;
          return 'Unknown Category';
        });
      setCategories(categoryNames as string[]);
      
      // Fetch "For You" products when categories are available
      const categoryIds = categoriesData.map((cat: any) => cat.id).filter((id: any) => id !== undefined);
      if (categoryIds.length > 0) {
        fetchForYouProducts(
          categoryIds,
          1,
          10,
          'all',
          '[]',
          '',
          0.0,
          9999999999.0,
          ''
        );
      }
    }
  }, [categoriesData]);

  // Update "For You" products state when data is received
  useEffect(() => {
    if (forYouData && Array.isArray(forYouData)) {
      // For first page, replace existing data
      if (forYouOffset === 1) {
        setForYouProducts(forYouData);
      } else {
        // For subsequent pages, append to existing data
        setForYouProducts(prev => [...prev, ...forYouData]);
      }
      
      // Check if there are more products to fetch
      setForYouHasMore(forYouData.length >= 10); // Assuming 10 is the limit
    }
  }, [forYouData, forYouOffset]);

  // Fetch cart data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('CartScreen: Screen focused, fetching cart data');
      fetchCartData();
    }, [fetchCartData]) // Add fetchCartData to dependencies
  );

  // Initialize all items as selected when cart items change
  useEffect(() => {
    // console.log('CartScreen: Cart items updated', cart.items);
    // // Ensure cart.items is an array before processing
    // if (Array.isArray(cart.items)) {
    //   // Only update selected items if they haven't been initialized yet
    //   // or if the cart items have actually changed
    //   const currentItemIds = new Set(cart.items.map(item => item.id));
    //   const selectedIds = Array.from(selectedItems);
    //   console.log("CurrentItemIds: ", currentItemIds, " : ", selectedIds);
    //   // Check if the sets are different
    //   const hasSameItems = currentItemIds.size === selectedItems.size && 
    //     selectedIds.every(id => currentItemIds.has(id));
      
    //   if (!hasSameItems) {
    //     console.log('CartScreen: Updating selected items');
    //     setSelectedItems(currentItemIds);
    //   }
    // } else {
      setSelectedItems(new Set());
    // }
  }, [cart.items]); // Only depend on cart.items

  const onRefresh = async () => {
    console.log('CartScreen: Refreshing cart data');
    setRefreshing(true);
    try {
      await fetchCartData();
      // Refresh categories as well
      await fetchCategories();
      
      // Refresh "For You" products
      if (categoriesData && categoriesData.length > 0) {
        const categoryIds = categoriesData.map((cat: any) => cat.id).filter((id: any) => id !== undefined);
        if (categoryIds.length > 0) {
          setForYouOffset(1);
          fetchForYouProducts(
            categoryIds,
            1,
            10,
            'all',
            '[]',
            '',
            0.0,
            9999999999.0,
            ''
          );
        }
      }
    } catch (error) {
      console.error('CartScreen: Error refreshing cart data', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Check if we're performing cart operations (add, update, remove)
  const isCartOperationLoading = isUpdateCartItemLoading || isRemoveFromCartLoading || isBatchUpdateLoading;

  const renderLocationSection = () => {
    // Use the selected address or return null if none
    const addressToShow = selectedAddress;
    
    // Don't show address section if there are no addresses
    if (!addressToShow) {
      return (
        <TouchableOpacity 
          style={styles.locationSection}
          onPress={() => (navigation as any).navigate('AddressBook')}
          activeOpacity={0.7}
        >
          <View style={{height: '100%'}}>
            <Ionicons name="location" size={18} color={COLORS.accentPink}/>
          </View>
          <View>
            <View style={styles.locationRow}>
              <Text style={styles.locationName}>No address available</Text>
            </View>
            <Text style={styles.locationAddress}>Please add an address</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      );
    }
    
    // Use username from AuthContext or fallback to contact_person_name from address
    const displayName = user?.name || addressToShow.contact_person_name || 'No name';
    
    return (
      <TouchableOpacity 
        style={styles.locationSection}
        onPress={() => (navigation as any).navigate('AddressBook')}
        activeOpacity={0.7}
      >
        <View style={{height: '100%'}}>
          <Ionicons name="location" size={18} color={COLORS.accentPink}/>
        </View>
        <View>
          <View style={styles.locationRow}>
            <Text style={styles.locationName}>{displayName}</Text>
            <Text style={styles.locationCode}>{addressToShow.phone}</Text>
          </View>
          <Text style={styles.locationAddress}>
            {addressToShow.address}, {addressToShow.city}, {addressToShow.state}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
    );
  };

  // Add category tabs rendering function
  const renderCategoryTabs = () => (
    <View style={styles.categoryTabsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
      >
        <TouchableOpacity
          style={[styles.categoryTab, activeCategoryTab === 'All' && styles.activeCategoryTab]}
          onPress={() => setActiveCategoryTab('All')}
        >
          <Text style={[styles.categoryTabText, activeCategoryTab === 'All' && styles.activeCategoryTabText]}>
            All
          </Text>
        </TouchableOpacity>
        
        {Array.isArray(categories) && categories.map((category, index) => (
          <TouchableOpacity
            key={`category-${category}-${index}`}
            style={[styles.categoryTab, activeCategoryTab === category && styles.activeCategoryTab]}
            onPress={() => setActiveCategoryTab(category)}
          >
            <Text style={[styles.categoryTabText, activeCategoryTab === category && styles.activeCategoryTabText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Add quick categories rendering function
  const renderQuickCategories = () => {
    // Sample quick categories data - in a real implementation, you would fetch this from an API
    const quickCategories = [
      { id: '1', name: 'Electronics', image: 'https://via.placeholder.com/50' },
      { id: '2', name: 'Fashion', image: 'https://via.placeholder.com/50' },
      { id: '3', name: 'Home', image: 'https://via.placeholder.com/50' },
      { id: '4', name: 'Beauty', image: 'https://via.placeholder.com/50' },
      { id: '5', name: 'Sports', image: 'https://via.placeholder.com/50' },
    ];

    return (
      <View style={styles.quickCategoriesContainer}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <View style={styles.quickCategoriesGrid}>
          {quickCategories.map((category) => (
            <QuickCategoryCard
              key={category.id}
              category={category}
              onPress={(categoryId) => {
                // Navigate to category screen
                (navigation as any).navigate('Category', { categoryId });
              }}
            />
          ))}
        </View>
      </View>
    );
  };

  // Add "For You" rendering function
  const renderForYouSection = () => {
    // Don't render if no "For You" products or still loading
    if ((!forYouProducts || forYouProducts.length === 0) && !forYouLoading) {
      return null;
    }

    return (
      <View style={styles.forYouSection}>
        <Text style={styles.sectionTitle}>For You</Text>
        {forYouLoading && forYouProducts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.accentPink} />
            <Text style={styles.loadingText}>Loading personalized products...</Text>
          </View>
        ) : (
          <View style={styles.forYouGrid}>
            {forYouProducts.map((product: any, index: number) => {
              // Safety check for product
              if (!product || !product.id) {
                return null;
              }
              
              // Parse variation data if it exists
              let variations = [];
              let price = product.price || 0;
              let productImage = '';
              
              if (product.variation) {
                try {
                  variations = JSON.parse(product.variation);
                  // Get the first variation's first option price
                  if (Array.isArray(variations) && variations.length > 0 && variations[0].options && variations[0].options.length > 0) {
                    price = variations[0].options[0].price;
                    productImage = variations[0].options[0].image;
                  }
                } catch (e) {
                  console.error('Error parsing variations:', e);
                }
              }
              
              // Calculate discount if available
              const hasDiscount = product.discount && product.discount > 0;
              
              // Create a proper Product object for navigation
              const productForNavigation: Product = {
                id: product.id?.toString() || '',
                name: product.name || 'Unknown Product',
                description: product.description || '',
                price: price,
                originalPrice: product.originalPrice,
                discount: product.discount,
                images: product.images || [productImage || ''],
                category: product.category || { id: '', name: '', icon: '', image: '', subcategories: [] },
                subcategory: product.subcategory || '',
                brand: product.brand || '',
                seller: product.seller || {
                  id: '',
                  name: '',
                  avatar: '',
                  rating: 0,
                  reviewCount: 0,
                  isVerified: false,
                  followersCount: 0,
                  description: '',
                  location: '',
                  joinedDate: new Date()
                },
                rating: product.rating || 0,
                reviewCount: product.reviewCount || product.rating_count || 0,
                inStock: product.inStock !== undefined ? product.inStock : true,
                stockCount: product.stockCount || product.stock_count || 0,
                sizes: product.sizes || [],
                colors: product.colors || [],
                tags: product.tags || [],
                isNew: product.isNew !== undefined ? product.isNew : false,
                isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
                isOnSale: product.isOnSale !== undefined ? product.isOnSale : false,
                createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
                updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
                rating_count: 0
              };
              
              return (
                <TouchableOpacity
                  key={`foryou-${product.id || index}`}
                  style={styles.forYouItem}
                  onPress={() => {
                    // Navigate to product detail
                    (navigation as any).navigate('ProductDetail', { productId: product.id });
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.trendingImageWrap}>
                    {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}> */}
                      {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                        product.images.map((img: string, idx: number) => (
                          <Image 
                            key={`foryou-img-${product.id || index}-${idx}`} 
                            source={require('../../assets/icons/man.png')} 
                            style={styles.forYouImage} 
                            resizeMode="cover" 
                          />
                        ))
                      ) : productImage ? (
                        <Image 
                          key={`foryou-img-${product.id || index}-variation`} 
                          source={{uri: productImage}} 
                          style={styles.forYouImage} 
                          resizeMode="cover" 
                        />
                      ) : (
                        <Image 
                          key={`foryou-img-${product.id || index}-default`} 
                          source={require('../../assets/icons/man.png')} 
                          style={styles.forYouImage} 
                          resizeMode="cover" 
                        />
                      )}
                    {/* </ScrollView> */}
                    {hasDiscount && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{`${product.discount}% OFF`}</Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.trendingHeartBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        // Handle wishlist toggle if needed
                        console.log('Toggle wishlist for product:', product.id);
                      }}
                    >
                      <Ionicons 
                        name="heart-outline" 
                        size={18} 
                        color={COLORS.white} 
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.trendingProductInfo}>
                    <Text style={styles.trendingProductName} numberOfLines={2}>{product.name || 'Unknown Product'}</Text>
                    <Text style={styles.trendingProductPrice}>${price.toFixed(2)}</Text>
                    <View style={styles.trendingProductRating}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>{product.rating || 0} ({product.rating_count || 0})</Text>
                      <Text style={styles.soldText}>{product.order_count || 0} sold</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        
        {/* Load more button */}
        {forYouHasMore && !forYouLoading && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={() => {
              if (categoriesData && categoriesData.length > 0) {
                const categoryIds = categoriesData.map((cat: any) => cat.id).filter((id: any) => id !== undefined);
                if (categoryIds.length > 0) {
                  const newOffset = forYouOffset + 1;
                  setForYouOffset(newOffset);
                  fetchForYouProducts(
                    categoryIds,
                    newOffset,
                    10,
                    'all',
                    '[]',
                    '',
                    0.0,
                    9999999999.0,
                    ''
                  );
                }
              }
            }}
          >
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
        
        {forYouLoading && forYouProducts.length > 0 && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={COLORS.accentPink} />
            <Text style={styles.loadingText}>Loading more products...</Text>
          </View>
        )}
      </View>
    );
  };

  // Toggle store expansion
  const toggleStoreExpansion = (storeId: string) => {
    setExpandedStores(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(storeId)) {
        newExpanded.delete(storeId);
      } else {
        newExpanded.add(storeId);
      }
      return newExpanded;
    });
  };

  // Update the renderStoreSection to use actual store data
  const renderStoreSection = (store: any) => {
    // Extract store information with fallbacks
    console.log("Render Store Section: ", store);
    const storeId = store.store_id || store.id || 'unknown-store';
    const storeName = store.store_name || store.name || 'Unknown Store';
    
    // Check if this store is expanded
    const isExpanded = expandedStores.has(storeId);
    
    // Check if any items in this store are selected
    const storeItems = store.carts || [];
    const hasSelectedItems = storeItems.some((item: any) => selectedItems.has(item.id));
    
    // Function to toggle selection of all items in this store
    const toggleStoreItemsSelection = () => {
      const newSelected = new Set(selectedItems);
      const allSelected = storeItems.every((item: any) => newSelected.has(item.id));
      
      if (allSelected) {
        // Deselect all items in this store
        storeItems.forEach((item: any) => newSelected.delete(item.id));
      } else {
        // Select all items in this store
        storeItems.forEach((item: any) => newSelected.add(item.id));
      }
      
      setSelectedItems(newSelected);
    };
    
    return (
      <View style={styles.storeSection} key={storeId}>
        <TouchableOpacity 
          style={styles.storeRow}
          // onPress={() => navigation.navigate('SellerProfile', { sellerId: storeId })}
        >
          <TouchableOpacity 
            style={styles.storeRadio}
            onPress={(e) => {
              e.stopPropagation();
              toggleStoreItemsSelection();
            }}
          >
            <View style={[styles.radioOuter, hasSelectedItems && { borderColor: COLORS.accentPink }]}>
              {hasSelectedItems && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
          <Text style={styles.storeName}>{storeName}</Text>
          <TouchableOpacity 
            style={styles.storeExpandButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleStoreExpansion(storeId);
            }}
          >
            <Ionicons 
              name={isExpanded ? "chevron-down" : "chevron-forward"} 
              size={16} 
              color={COLORS.gray[400]} 
            />
          </TouchableOpacity>
        </TouchableOpacity>
        
        {/* Render store items if expanded */}
        {isExpanded && store.carts && (
          <FlatList
            data={store.carts}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  // Update local quantity without API call
  const updateLocalQuantity = (itemId: string, newQuantity: number) => {
    setLocalQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  // Handle quantity change with local update only
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    // Update local state immediately for UI feedback
    updateLocalQuantity(itemId, newQuantity);
    
    // No API call is sent - changes are only local
  };

  // Handle option selection with local update only
  const handleOptionSelect = (itemId: string, variationIndex: number, optionIndex: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [itemId]: { variationIndex, optionIndex }
    }));
    
    // No API call is sent - changes are only local
  };

  // Get all selected products data
  const getAllSelectedProductsData = () => {
    const selectedData: any[] = [];
    
    // Get data for all items in cart
    cart.items.forEach((item: any) => {
      const data = getSelectedProductData(item.id);
      if (data) {
        selectedData.push({
          ...data,
          itemId: item.id,
          quantity: localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity
        });
      }
    });
    
    return selectedData;
  };

  // Get selected product data for future updates
  const getSelectedProductData = (itemId: string) => {
    // Get the cart item
    console.log("CartItem:", cart.items, itemId);
    const cartItem = cart.items.find((item: any) => item.id === itemId);
    if (!cartItem) return null;
    
    // Parse variations
    let variations = [];
    try {
      variations = JSON.parse(cartItem.variation);
    } catch (error) {
      console.error('Error parsing variation:', error);
      return null;
    }
    
    // Get selected option or default
    const selectedItemOption = selectedOptions[itemId] || { 
      variationIndex: cartItem.variation_index, 
      optionIndex: cartItem.option_index 
    };
    
    // Get the selected variation and option
    const { variationIndex, optionIndex } = selectedItemOption;
    const variation = variations[variationIndex];
    const option = variation?.options?.[optionIndex];
    
    if (!variation || !option) return null;
    
    return {
      productId: cartItem.product_id || cartItem.id,
      variationIndex,
      optionIndex,
      price: option.price || cartItem.price || 0
    };
  };

  const handleRemoveItem = (itemId: string) => {
    const cartId = parseInt(itemId, 10);
    if (isNaN(cartId)) {
      console.error('Invalid cart item ID:', itemId);
      return;
    }
    
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
            console.log('Removing cart item:', cartId);
            // Remove the item from selected items if it was selected
            const newSelected = new Set(selectedItems);
            newSelected.delete(itemId);
            setSelectedItems(newSelected);
            
            // Call the remove mutation
            removeFromCart({ cartId });
          } 
        },
      ]
    );
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
      // Initialize selectedOptions with default values if not already set
      if (!selectedOptions[itemId]) {
        // Find the cart item to get default variation and option indices
        const cartItem = Array.isArray(cartData) 
          ? cartData.flatMap(store => store.carts || []).find((item: any) => item.id === itemId)
          : cart.items.find((item: any) => item.id === itemId);
        
        if (cartItem) {
          setSelectedOptions(prev => ({
            ...prev,
            [itemId]: {
              variationIndex: cartItem.variation_index || 0,
              optionIndex: cartItem.option_index || 0
            }
          }));
        }
      }
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    // Flatten all store items to get all item IDs
    const allCartItems = Array.isArray(cartData) ? cartData.flatMap(store => store.carts || []) : (Array.isArray(cart.items) ? cart.items : []);
    
    if (!Array.isArray(allCartItems)) {
      setSelectedItems(new Set());
      return;
    }
    
    if (selectedItems.size === allCartItems.length) {
      // If all items are selected, deselect all
      setSelectedItems(new Set());
    } else {
      // Select all items
      const allItemIds = new Set(allCartItems.map((item: any) => item.id));
      setSelectedItems(allItemIds);
      
      // Initialize selectedOptions with default values for all items
      const newSelectedOptions = { ...selectedOptions };
      allCartItems.forEach((item: any) => {
        if (!newSelectedOptions[item.id]) {
          newSelectedOptions[item.id] = {
            variationIndex: item.variation_index || 0,
            optionIndex: item.option_index || 0
          };
        }
      });
      setSelectedOptions(newSelectedOptions);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode);
      setPromoCode('');
      // Here you would typically validate the promo code with your backend
    }
  };

  const handleCheckout = async () => {
    console.log("selectedItems: ", selectedItems.size);
    if (selectedItems.size === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to checkout.');
      return;
    }
    
    // Prepare the items to update
    const itemsToUpdate: any[] = [];
    const cartIds: number[] = [];
    
    // Get data for all selected items
    selectedItems.forEach(itemId => {
      // Get the selected options for this item, or use default values
      let selectedItemOption = selectedOptions[itemId];
      
      // If no selected options, try to get default values from the cart item
      if (!selectedItemOption) {
        const cartItem = Array.isArray(cartData) 
          ? cartData.flatMap(store => store.carts || []).find((item: any) => item.id === itemId)
          : cart.items.find((item: any) => item.id === itemId);
        
        if (cartItem) {
          selectedItemOption = {
            variationIndex: cartItem.variation_index || 0,
            optionIndex: cartItem.option_index || 0
          };
        }
      }
      
      console.log("SelectedItemOption: ", selectedOptions, selectedItemOption);
      // Get the cart item
      const cartItem = Array.isArray(cartData) 
        ? cartData.flatMap(store => store.carts || []).find((item: any) => item.id === itemId)
        : cart.items.find((item: any) => item.id === itemId);
      
      if (cartItem && selectedItemOption) {
        // Use local quantity if available, otherwise use item.quantity
        const quantity = localQuantities[itemId] !== undefined ? localQuantities[itemId] : cartItem.quantity;
        
        itemsToUpdate.push({
          cartId: parseInt(itemId, 10),
          quantity: quantity,
          variation: selectedItemOption.variationIndex,
          option: selectedItemOption.optionIndex
        });
        
        // Collect cart IDs for checkout
        cartIds.push(parseInt(itemId, 10));
      }
    });
    
    console.log("Valid items to update:", itemsToUpdate);
    console.log("Cart IDs for checkout:", cartIds);
    
    try {
      // First, update the cart items
      if (itemsToUpdate.length > 0) {
        await batchUpdateCart(itemsToUpdate);
      }
      
      // Then, place the order
      if (cartIds.length > 0) {
        checkoutOrder({
          orderAmount: total,
          cartIds: cartIds
        });
      } else {
        Alert.alert('Error', 'No valid items to checkout.');
      }
    } catch (error) {
      console.error('Checkout process failed:', error);
      Alert.alert('Error', 'Failed to process checkout. Please try again.');
    }
  };

  // Flatten all store items to get selected items data
  const allCartItems = Array.isArray(cartData) ? cartData.flatMap(store => store.carts || []) : (Array.isArray(cart.items) ? cart.items : []);
  const selectedItemsData = Array.isArray(allCartItems) ? allCartItems.filter((item: any) => item && selectedItems.has(item.id)) : [];
  console.log('Selected items data:', selectedItemsData);
  
  const subtotal = Array.isArray(selectedItemsData) ? selectedItemsData.reduce((sum, item: any) => {
    // Skip undefined or null items
    if (!item) return sum;
    
    // Parse variations if it's a string
    let variations = [];
    try {
      variations = typeof item.variation === 'string' ? JSON.parse(item.variation) : item.variation;
    } catch (error) {
      console.error('Error parsing variation:', error);
    }
    
    // Get price from selected options or fallback to item price
    let price = item.price || 0;
    const selectedItemOption = selectedOptions[item.id] || { 
      variationIndex: item.variation_index, 
      optionIndex: item.option_index 
    };
    
    try {
      const { variationIndex, optionIndex } = selectedItemOption;
      if (variations[variationIndex] && 
          variations[variationIndex].options && 
          variations[variationIndex].options[optionIndex] && 
          variations[variationIndex].options[optionIndex].price) {
        price = variations[variationIndex].options[optionIndex].price;
      }
    } catch (error) {
      console.error('Error getting selected option price:', error);
    }
    
    // Use local quantity if available, otherwise use item.quantity
    const quantity = localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity;
    
    console.log('Calculating subtotal for item:', { item, price, quantity });
    return sum + (price * quantity);
  }, 0) : 0;

  // const shipping = selectedItemsData.length > 0 ? 5.99 : 0;
  const discount = appliedPromo ? subtotal * 0.1 : 0; // 10% discount for demo
  const total = subtotal - discount; // Removed shipping from total calculation
  
  console.log('Cart totals:', { subtotal, discount, total });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={{width:48, height:24}}/>
      <Text style={styles.headerTitle}>Cart</Text>
      <View style={styles.headerIcons}>
        {
          Array.isArray(cart.items) && cart.items.length != 0 ?
          <TouchableOpacity onPress={handleSelectAll}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.accentPink} />
          </TouchableOpacity> :
          <View style={{width:24, height:24}}/>
        }
      </View>
    </View>
  );

  const renderCartItem = ({ item }: { item: any }) => {
    // Parse variations if it's a string
    let variations = [];
    try {
      variations = typeof item.variation === 'string' ? JSON.parse(item.variation) : item.variation;
    } catch (error) {
      console.error('Error parsing variation:', error);
    }
    
    // Get price from selected options or fallback to item price
    let price = item.price || 0;
    const selectedItemOption = selectedOptions[item.id] || { 
      variationIndex: item.variation_index, 
      optionIndex: item.option_index 
    };
    
    try {
      const { variationIndex, optionIndex } = selectedItemOption;
      if (variations[variationIndex] && 
          variations[variationIndex].options && 
          variations[variationIndex].options[optionIndex] && 
          variations[variationIndex].options[optionIndex].price) {
        price = variations[variationIndex].options[optionIndex].price;
      }
    } catch (error) {
      console.error('Error getting selected option price:', error);
    }
    
    // Use local quantity if available, otherwise use item.quantity
    const quantity = localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity;
    
    return (
      <View style={styles.cartItem}>
        <TouchableOpacity 
          style={styles.cartItemRadio}
          onPress={() => handleSelectItem(item.id)}
        >
          <View style={[styles.radioOuter, selectedItems.has(item.id) && { borderColor: COLORS.accentPink }]}>
            {selectedItems.has(item.id) && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
        <View style={styles.cartItemInfo}>
          <Text style={styles.cartItemName}>{item.name}</Text>
          <Text style={styles.cartItemPrice}>${price.toFixed(2)}</Text>
          <View style={styles.cartItemOptions}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => {
                // Handle option selection here
                console.log('Select option for item:', item.id);
              }}
            >
              <Text style={styles.optionButtonText}>Select Option</Text>
            </TouchableOpacity>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, quantity - 1)}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={18} color={quantity > 1 ? COLORS.accentPink : COLORS.gray[400]} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, quantity + 1)}
              >
                <Ionicons name="add" size={18} color={COLORS.accentPink} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.removeItemButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Ionicons name="trash" size={24} color={COLORS.red} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Subtotal</Text>
          <Text style={styles.footerValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Discount</Text>
          <Text style={styles.footerValue}>${discount.toFixed(2)}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.footerRow}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter promo code"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity 
            style={styles.applyPromoButton}
            onPress={handleApplyPromo}
          >
            <Text style={styles.applyPromoButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={isCartOperationLoading || isCheckoutLoading}
        >
          <Text style={styles.checkoutButtonText}>
            {isCartOperationLoading || isCheckoutLoading ? 'Processing...' : 'Checkout'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
          (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => (navigation as any).navigate('Chat')}
            >
              <View style={styles.chatIcon}>
                {/* <Ionicons name="chatbubble-outline" size={24} color={COLORS.text.primary} /> */}
                <Image source={require('../../assets/icons/chat.png')} />
                <View style={styles.chatBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => (navigation as any).navigate('Chat')}
            >
              <View style={styles.chatIcon}>
                {/* <Ionicons name="chatbubble-outline" size={24} color={COLORS.text.primary} /> */}
                <View style={{width: 24, height: 24}}/>
                {/* <View style={styles.chatBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View> */}
              </View>
            </TouchableOpacity>
          )
        }
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => (navigation as any).navigate('Search')}
        >
          <Ionicons name="search-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCartItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedItems.has(item.id);
    
    // Use local quantity if available, otherwise use item.quantity
    const currentQuantity = localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity;
    
    // Get selected option for this item, or use default from item
    const selectedItemOption = selectedOptions[item.id] || { 
      variationIndex: item.variation_index, 
      optionIndex: item.option_index 
    };
    
    // Get variation data
    let variations = [];
    try {
      variations = JSON.parse(item.variation);
    } catch (error) {
      console.error('Error parsing variation:', error);
    }
    console.log("Render cart item:", item.variation_index, item.option_index);
    
    // Get image from selected variation/option or fallback to product images
    let productImage;
    try {
      const { variationIndex, optionIndex } = selectedItemOption;
      if (variations[variationIndex] && 
          variations[variationIndex].options && 
          variations[variationIndex].options.length > 0 && 
          variations[variationIndex].options[optionIndex] && 
          variations[variationIndex].options[optionIndex].image) {
        productImage = { uri: variations[variationIndex].options[optionIndex].image };
      } else {
        productImage = require('../../assets/images/sneakers.png');
      }
    } catch (error) {
      console.error('Error getting product image:', error);
      productImage = require('../../assets/images/sneakers.png');
    }
    
    // Get price from selected variation/option or fallback to item price
    let currentPrice;
    try {
      const { variationIndex, optionIndex } = selectedItemOption;
      if (variations[variationIndex] && 
          variations[variationIndex].options && 
          variations[variationIndex].options[optionIndex] && 
          variations[variationIndex].options[optionIndex].price) {
        currentPrice = variations[variationIndex].options[optionIndex].price;
      } else {
        currentPrice = item.price || 0;
      }
    } catch (error) {
      console.error('Error getting product price:', error);
      currentPrice = item.price || 0;
    }
    
    return (
      <View style={styles.cartItem}>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Ionicons name="close-outline" size={24} color={COLORS.gray[400]} />
        </TouchableOpacity>
        
        <View style={styles.productRow}>
          <TouchableOpacity style={styles.cartImageContainer}
            onPress={() => handleSelectItem(item.id)}
          >
            <Image source={productImage} style={styles.productImage} />
            <TouchableOpacity 
              style={styles.cartCheckButton}
              onPress={() => handleSelectItem(item.id)}
            >
              <View style={[styles.cartCheckBox, isSelected && styles.cartCheckBoxSelected]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={12} color={COLORS.white} />
                )}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
          
          <View style={styles.productDetails}>
            {/* <Text style={styles.productBrand}>{brand}</Text> */}
            <Text style={styles.productName} numberOfLines={2}>
              {item.item_name}
            </Text>
            
            <View style={styles.priceRow}>
              {/* {item.product.isOnSale && originalPrice !== currentPrice && (
                <Text style={styles.originalPrice}>$ {originalPrice.toFixed(2)}</Text>
              )} */}
              <Text style={styles.currentPrice}>$ {currentPrice.toFixed(2)}</Text>
              {/* {item.product.isOnSale && originalPrice !== currentPrice && (
                <View style={styles.discountBadges}>
                  <Text style={styles.discountTexts}>-{item.product.discount}%</Text>
                </View>
              )} */}
            </View>
            
            {variations.map((variation: any, variationIndex: number) => (
              variation.options.length > 0 && (
                <View style={styles.variantRow} key={variationIndex}>
                  <View style={styles.variantOptionsContainer}>
                    <Text style={styles.variantLabel}>{variation.name}:</Text>
                    <View style={styles.optionsRow}>
                      {variation.options.map((option: any, optionIndex: number) => {
                        const isOptionSelected = selectedOptions[item.id] 
                          ? selectedOptions[item.id].variationIndex === variationIndex && 
                            selectedOptions[item.id].optionIndex === optionIndex
                          : item.variation_index === variationIndex && 
                            item.option_index === optionIndex;
                        
                        return (
                          <TouchableOpacity 
                            key={optionIndex}
                            style={[
                              styles.optionButton, 
                              isOptionSelected && styles.optionButtonSelected
                            ]}
                            onPress={() => handleOptionSelect(item.id, variationIndex, optionIndex)}
                          >
                            <Text style={[
                              styles.optionText,
                              isOptionSelected && styles.optionTextSelected
                            ]}>
                              {option.value}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )
            ))}
            
            
            <View style={styles.quantityRow}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => {
                  const newQuantity = Math.max(1, currentQuantity - 1);
                  handleQuantityChange(item.id, newQuantity);
                }}
              >
                <Ionicons name="remove" size={16} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{currentQuantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => {
                  const newQuantity = currentQuantity + 1;
                  handleQuantityChange(item.id, newQuantity);
                }}
              >
                <Ionicons name="add" size={16} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTotalOrder = () => {
    const selectedCount = selectedItemsData.filter(item => item !== undefined).length;
    console.log("Selected Items: ", selectedItems);
    const subtotalText = selectedCount === 1 ? '1 product' : `${selectedCount} products`;
    
    return (
      <View style={styles.totalOrderSection}>
        <Text style={styles.sectionTitle}>Total Order</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({subtotalText})</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        
        {/* <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal delivery</Text>
          <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
        </View> */}
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: COLORS.success }]}>Discount voucher</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>-${discount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payment</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  const renderCardDetails = () => (
    <View style={styles.cardDetailsSection}>
      <Text style={styles.sectionTitle}>Card Details</Text>
      
      <View style={styles.cardForm}>
        <Text style={styles.formLabel}>Card Number</Text>
        <View style={styles.cardNumberRow}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray[400]} />
          <TextInput
            style={styles.cardInput}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={COLORS.gray[400]}
          />
        </View>
        
        <View style={styles.cardRow}>
          <View style={styles.cardField}>
            <Text style={styles.formLabel}>Expired</Text>
            <TextInput
              style={[styles.cardInput, {borderWidth: 1}]}
              placeholder="mm/yyyy"
              placeholderTextColor={COLORS.gray[400]}
            />
          </View>
          
          <View style={styles.cardField}>
            <Text style={styles.formLabel}>CVV</Text>
            <TextInput
              style={[styles.cardInput, {borderWidth: 1}]}
              placeholder="123"
              placeholderTextColor={COLORS.gray[400]}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderYouMayLike = () => {
    // Create some sample products for the "You May Like" section
    // In a real implementation, you would fetch these from an API
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Sample Product 1',
        price: 29.99,
        images: ['https://via.placeholder.com/150'],
        description: 'Sample product description',
        category: { id: '1', name: 'Category 1', icon: '', image: '', subcategories: [] },
        subcategory: 'Subcategory 1',
        brand: 'Brand 1',
        seller: { 
          id: '1', 
          name: 'Seller 1', 
          avatar: '', 
          rating: 4.5, 
          reviewCount: 100, 
          isVerified: true, 
          followersCount: 500, 
          description: '', 
          banner: '', 
          location: '', 
          joinedDate: new Date(), 
          orderCount: 0 
        },
        rating: 4.5,
        reviewCount: 100,
        inStock: true,
        stockCount: 10,
        tags: [],
        isNew: true,
        isFeatured: false,
        isOnSale: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        rating_count: 100
      },
      {
        id: '2',
        name: 'Sample Product 2',
        price: 39.99,
        images: ['https://via.placeholder.com/150'],
        description: 'Sample product description',
        category: { id: '2', name: 'Category 2', icon: '', image: '', subcategories: [] },
        subcategory: 'Subcategory 2',
        brand: 'Brand 2',
        seller: { 
          id: '2', 
          name: 'Seller 2', 
          avatar: '', 
          rating: 4.2, 
          reviewCount: 80, 
          isVerified: true, 
          followersCount: 300, 
          description: '', 
          banner: '', 
          location: '', 
          joinedDate: new Date(), 
          orderCount: 0 
        },
        rating: 4.2,
        reviewCount: 80,
        inStock: true,
        stockCount: 5,
        tags: [],
        isNew: false,
        isFeatured: true,
        isOnSale: true,
        discount: 10,
        originalPrice: 44.99,
        createdAt: new Date(),
        updatedAt: new Date(),
        rating_count: 80
      }
    ];

    return (
      <View style={styles.youMayLikeSection}>
        <Text style={styles.sectionTitle}>You May Like</Text>
        <View style={styles.youGridContainer}>
          {/* <Text style={styles.emptyText}>No recommendations available</Text> */}
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <View style={styles.emptyIconContainer}>
        {/* Using a shopping cart emoji or icon instead of bag */
}
        {/* <Text style={styles.cartEmoji}>🛒</Text> */}
        <Image source={require('../../assets/icons/cart_image.png')} />
      </View>
      <Text style={styles.emptyTitle}>Your Cart is Empty!</Text>
      <Text style={styles.emptySubtitle}>
        Your cart is currently empty.{"\n"}
        Start adding items to it to keep track of your favorites!
      </Text>
      <TouchableOpacity
        style={styles.continueShoppingButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.continueShoppingButtonText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Ensure cart.items is an array before checking its length
  if (!Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {/* {renderCategoryTabs()}
        {renderQuickCategories()}
        {renderForYouSection()} */}
        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderLocationSection()}
        {/* {renderCategoryTabs()}
        {renderQuickCategories()} */}
        <View style={styles.storePart}>
          {/* Render stores and their items */}
          {Array.isArray(cartData) && cartData.length > 0 ? (
            cartData.map((store) => {
              // Filter cart items for this specific store
              console.log("Render Cart Data Array", store);
              
              return (
                <View key={store.store_id || store.id}>
                  {renderStoreSection(store)}
                </View>
              );
            })
          ) : (
            // Fallback to original structure if no stores data
            <>
              {renderStoreSection({ store_name: 'Rolland Official Store', store_id: 'rolland-official' })}
              <FlatList
                data={Array.isArray(cart.items) ? cart.items : []}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </>
          )}
        </View>
        
        {renderTotalOrder()}
        {renderCardDetails()}
        {renderForYouSection()}
        {/* {renderYouMayLike()} */}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* Show loading overlay only when performing cart operations */}
      {isCartOperationLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{isBatchUpdateLoading ? 'Processing checkout...' : 'Updating cart...'}</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.voucherBanner}>
          <Ionicons name="gift-outline" size={20} color={COLORS.white} />
          <Text style={styles.voucherText}>Additional voucher up to 12% discount!</Text>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.checkoutContainer}>
          <View style={styles.checkoutLeft}>
            <TouchableOpacity 
              style={styles.allProductCheckbox}
              onPress={handleSelectAll}
            >
              <View style={[styles.cartCheckBox, selectedItems.size > 0 && selectedItems.size === (Array.isArray(cart.items) ? cart.items.length : 0) && styles.cartCheckBoxSelected]}>
                {selectedItems.size > 0 && selectedItems.size === (Array.isArray(cart.items) ? cart.items.length : 0) && (
                  <Ionicons name="checkmark" size={12} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.allProductText}>All Product</Text>
            </TouchableOpacity>
            <Text style={styles.checkoutTotal}>${total.toFixed(2)}</Text>
          </View>
          
          <View style={styles.checkoutActions}>
            {/* <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveAllQuantityChanges}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
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
    paddingTop: SPACING['2xl'],
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 'auto',
    ...SHADOWS.small,
  },
  chatIcon: {
    position: 'relative',
  },
  chatBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accentPink,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  locationSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    marginBottom:  SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    // marginLeft: SPACING.xs,
  },
  locationCode: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginLeft: SPACING.xs,
    flex: 1,
  },
  locationAddress: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
  },
  storePart: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    paddingBottom: 0,
    marginBottom:  SPACING.md,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    // ...SHADOWS.md
  },
  storeSection: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.lg,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  storeRadio: {
    marginRight: SPACING.md,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accentPink,
  },
  storeName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    paddingRight: SPACING.sm,
    flex: 1,
  },
  storeExpandButton: {
    padding: SPACING.sm,
  },
  cartItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.sm,
    zIndex: 1,
  },
  productRow: {
    flexDirection: 'row',
  },
  productImage: {
    width: 100,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  checkButton: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 1,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxSelected: {
    backgroundColor: COLORS.accentPink,
    borderColor: COLORS.accentPink,
  },
  productDetails: {
    flex: 1,
  },
  productBrand: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    width: '90%',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
  },
  currentPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.accentPink,
    marginRight: SPACING.xs,
  },
  discountBadges: {
    backgroundColor: "#FFF5F7",
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  discountTexts: {
    color: "#FE2C55"
  },
  variantRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    width: '100%',
    justifyContent: 'space-between',
  },
  sizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.mdlg,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.md,
  },
  colorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.mdlg,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.md,
  },
  variantLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  variantOptionsContainer: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  optionButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray[100],
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.accentPink,
  },
  optionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
  },
  optionTextSelected: {
    color: COLORS.white,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 16,
    // backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginHorizontal: SPACING.md,
    minWidth: 20,
    textAlign: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.gray[100],
    // paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  totalOrderSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.gray[100],
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    marginLeft: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendingProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  // Add missing cart item styles
  cartItemOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  optionButton: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  optionButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginHorizontal: SPACING.md,
    minWidth: 20,
    textAlign: 'center',
  },
  removeItemButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: SPACING.sm,
  },
});

export default CartScreen;

    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginHorizontal: SPACING.md,
    minWidth: 20,
    textAlign: 'center',
  },
  removeItemButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: SPACING.sm,
  },
});

    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[600],
  },
  summaryValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  totalLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cardDetailsSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.gray[100],
  },
  cardForm: {
    // marginTop: SPACING.sm,
  },
  formLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: 8,
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  cardInput: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    borderColor: COLORS.gray[100],
    borderRadius: 8,
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    // marginLeft: SPACING.sm,
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '5%',
  },
  cardField: {
    flex: 1,
    // marginRight: SPACING.md,
  },
  youMayLikeSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  youGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  youCard: {
    width: '48%',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  productImageContainer: {
    position: 'relative',
  },
  youImage: {
    width: '100%',
    height: 220,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  heartButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  productInfo: {
    flex: 1,
  },
  productPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.accentPink,
    marginBottom: SPACING.xs,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
    marginLeft: 2,
    marginRight: SPACING.xs,
  },
  soldText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
  },
  bottomSpace: {
    height: SPACING.xl,
  },
  footer: {
    borderTopRightRadius: BORDER_RADIUS.xl,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.accentPink,
  },
  voucherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  voucherText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '500',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  checkoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopRightRadius: BORDER_RADIUS.xl,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    width: '100%',
  },
  checkoutLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allProductCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allProductText: {
    color: COLORS.gray[400],
    marginLeft: SPACING.sm,
  },
  checkoutTotal: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.error,
  },
  checkoutButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.smmd,
    borderRadius: BORDER_RADIUS.lg,
    marginLeft: SPACING.md,
  },
  checkoutButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
  },
  checkoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.accentPink,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.smmd,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  emptyIconContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
    // paddingHorizontal: SPACING.lg,
  },
  continueShoppingButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.smmd,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 200,
    width: '100%',
  },
  continueShoppingButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
  },
  cartImageContainer: {
    position: 'relative',
  },
  cartCheckButton: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 1,
  },
  cartCheckBox: {
    width: 16,
    height: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCheckBoxSelected: {
    backgroundColor: COLORS.accentPink,
    borderColor: COLORS.accentPink,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  // Add missing cart item styles
  cartItemRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cartItemRadioSelected: {
    backgroundColor: COLORS.accentPink,
    borderColor: COLORS.accentPink,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  cartItemPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.accentPink,
  },
  // Add category styles
  categoryTabsContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
  },
  categoryTabs: {
    paddingHorizontal: SPACING.md,
  },
  categoryTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100],
  },
  activeCategoryTab: {
    backgroundColor: COLORS.accentPink,
  },
  categoryTabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  activeCategoryTabText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  quickCategoriesContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
  },
  quickCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  // Add "For You" styles
  forYouSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    // paddingHorizontal: SPACING.md,
  },
  forYouGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  forYouItem: {
    width: '48%',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  loadMoreButton: {
    backgroundColor: COLORS.accentPink,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'center',
    marginTop: SPACING.md,
  },
  loadMoreText: {
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  // Add styles for "For You" product cards (copied from HomeScreen)
  trendingImageWrap: { 
    position: 'relative' 
  },
  forYouImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: SPACING.sm,
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
  trendingProductInfo: {
    flex: 1,
  },
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
});

export default CartScreen;
