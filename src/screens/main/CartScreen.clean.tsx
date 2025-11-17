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
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useGetCartMutation, useRemoveFromCartMutation, useUpdateCartItemMutation } from '../../hooks/useCartMutations';
import { useBatchUpdateCartMutation } from '../../hooks/useBatchUpdateCartMutation';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { Product, CartItem } from '../../types';
import { YouMayLike, CategoryCard, QuickCategoryCard, ProductCard } from '../../components';
import { useCategoriesMutation } from '../../hooks/useCategories';
import { useForYouProductsMutation } from '../../hooks/useHomeScreenMutations';

// Add type for navigation - Fixed to remove the specific route name
type CartScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CartScreen: React.FC = () => {
  console.log('CartScreen: Component initializing');
  
  const navigation = useNavigation<CartScreenNavigationProp>();
  
  // State variables
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { variationIndex: number; optionIndex: number }>>({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  
  // Use the mutation hooks directly
  const { mutate: getCart, data: cartData, isLoading: isCartLoading, isError: isCartError } = useGetCartMutation();
  const { mutate: removeFromCart } = useRemoveFromCartMutation();
  const { mutate: updateCartItem } = useUpdateCartItemMutation();
  const { mutate: batchUpdateCart } = useBatchUpdateCartMutation();

  // Fetch cart data on focus
  useFocusEffect(
    useCallback(() => {
      console.log('CartScreen: Fetching cart data');
      getCart();
    }, [getCart])
  );

  // Process cart data
  const cart = useMemo(() => {
    if (!cartData) return { items: [], total: 0 };
    
    // If cartData is already in the correct format, return it
    if (Array.isArray(cartData) && cartData.length > 0 && cartData[0].hasOwnProperty('carts')) {
      return {
        items: cartData.flatMap((store: any) => store.carts || []),
        total: cartData.reduce((sum, store) => sum + (store.total || 0), 0),
        stores: cartData
      };
    }
    
    // If cartData is in the old format, convert it
    return {
      items: Array.isArray(cartData) ? cartData : [],
      total: Array.isArray(cartData) ? cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0
    };
  }, [cartData]);

  // Toggle store expansion
  const toggleStoreExpansion = (storeId: string) => {
    const newExpanded = new Set(expandedStores);
    if (newExpanded.has(storeId)) {
      newExpanded.delete(storeId);
    } else {
      newExpanded.add(storeId);
    }
    setExpandedStores(newExpanded);
  };

  // Render cart item
  const renderCartItem = ({ item }: { item: any }) => {
    const quantity = localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity;
    const isSelected = selectedItems.has(item.id);
    
    return (
      <View style={styles.cartItem}>
        <TouchableOpacity 
          style={styles.itemCheckbox}
          onPress={() => {
            const newSelected = new Set(selectedItems);
            if (isSelected) {
              newSelected.delete(item.id);
            } else {
              newSelected.add(item.id);
            }
            setSelectedItems(newSelected);
          }}
        >
          <View style={[styles.checkboxOuter, isSelected && styles.checkboxSelected]}>
            {isSelected && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>
        
        <Image source={{ uri: item.product?.images?.[0] }} style={styles.itemImage} />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.product?.name}</Text>
          <Text style={styles.itemPrice}>${item.price}</Text>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.removeItem}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>
    );
  };

  // Render store section
  const renderStoreSection = ({ item: store }: { item: any }) => {
    const storeId = store.store_id?.toString() || 'unknown';
    const storeName = store.store_name || 'Unknown Store';
    const storeItems = store.carts || [];
    const isExpanded = expandedStores.has(storeId);
    const hasSelectedItems = storeItems.some((item: any) => selectedItems.has(item.id));
    
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
          onPress={() => navigation.navigate('SellerProfile', { sellerId: storeId.toString() })}
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
    }
  };

  // Check if all items are selected to update the "Select All" checkbox
  useEffect(() => {
    const allCartItems = Array.isArray(cartData) 
      ? cartData.flatMap(store => store.carts || []) 
      : (Array.isArray(cart.items) ? cart.items : []);
      
    if (Array.isArray(allCartItems) && allCartItems.length > 0) {
      setSelectAllChecked(selectedItems.size === allCartItems.length);
    } else {
      setSelectAllChecked(false);
    }
  }, [selectedItems, cartData, cart.items]);

  if (isCartLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accentPink} />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isCartError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load cart. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => getCart()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const storeData = Array.isArray(cartData) && cartData.length > 0 && cartData[0].hasOwnProperty('carts') 
    ? cartData 
    : [{ store_id: 'default', store_name: 'Items', carts: cart.items, total: cart.total }];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>
      
      {cart.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={COLORS.gray[300]} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some items to your cart</Text>
        </View>
      ) : (
        <>
          <View style={styles.selectAllContainer}>
            <TouchableOpacity 
              style={styles.selectAllCheckbox}
              onPress={handleSelectAll}
            >
              <View style={[styles.checkboxOuter, selectAllChecked && styles.checkboxSelected]}>
                {selectAllChecked && <View style={styles.checkboxInner} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.selectAllText}>Select All</Text>
          </View>
          
          <FlatList
            data={storeData}
            renderItem={renderStoreSection}
            keyExtractor={(item) => item.store_id?.toString() || 'default'}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.bottomBar}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalAmount}>${cart.total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutButton, selectedItems.size === 0 && styles.checkoutButtonDisabled]}
              disabled={selectedItems.size === 0}
              onPress={() => {
                // Navigate to checkout or handle selected items
                console.log('Proceeding with selected items:', selectedItems);
              }}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.accentPink,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  selectAllCheckbox: {
    marginRight: SPACING.md,
  },
  selectAllText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  cartList: {
    paddingBottom: 100,
  },
  storeSection: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
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
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  storeExpandButton: {
    padding: SPACING.sm,
  },
  cartItem: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  itemCheckbox: {
    marginRight: SPACING.md,
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: COLORS.accentPink,
    backgroundColor: COLORS.accentPink,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.white,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.sm,
  },
  quantityButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  quantityText: {
    marginHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  removeItem: {
    padding: SPACING.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
  },
  totalAmount: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.accentPink,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  checkoutButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
});

export default CartScreen;