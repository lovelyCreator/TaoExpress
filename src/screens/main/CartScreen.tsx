import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';
import { ProductCard } from '../../components';
import { useWishlist } from '../../context/WishlistContext';
import mockProducts from '../../data/mockProducts.json';

const { width } = Dimensions.get('window');

// Mock cart data
const mockCartData = [
  {
    id: '1',
    sellerId: 'seller_123',
    sellerName: 'bbbxffvwo083i5cyz7jxtprkg',
    items: [
      {
        id: 'cart_item_1',
        productId: 'shoes_001',
        name: 'Shoes',
        color: 'space',
        size: 'M',
        price: 5.99,
        originalPrice: 7.00,
        quantity: 1,
        image: 'https://picsum.photos/seed/shoes1/300/300',
        selected: true,
      }
    ]
  }
];

// Mock "More to love" products - using proper Product type
const mockMoreToLoveProducts = [
  {
    id: 'bed_1',
    name: 'bed',
    description: 'Comfortable bed for your home',
    price: 5.99,
    originalPrice: 7.00,
    discount: 25,
    rating: 4.9,
    reviewCount: 156,
    orderCount: 234,
    images: ['https://picsum.photos/seed/bed1/300/300'],
    category: { id: '1', name: 'Furniture', icon: '', image: '', subcategories: [] },
    subcategory: 'Bedroom',
    brand: 'HomeComfort',
    seller: {
      id: '1',
      name: 'Furniture Store',
      avatar: '',
      rating: 4.8,
      reviewCount: 1200,
      isVerified: true,
      followersCount: 500,
      description: '',
      location: '',
      joinedDate: new Date(),
    },
    inStock: true,
    stockCount: 50,
    sizes: ['Single', 'Double', 'Queen'],
    colors: ['White', 'Brown', 'Black'],
    tags: ['furniture', 'bedroom'],
    isNew: false,
    isFeatured: true,
    isOnSale: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    rating_count: 156,
  },
  {
    id: 'bed_2',
    name: 'bed',
    description: 'Stylish bed with modern design',
    price: 5.99,
    originalPrice: 7.00,
    discount: 25,
    rating: 4.9,
    reviewCount: 203,
    orderCount: 189,
    images: ['https://picsum.photos/seed/bed2/300/300'],
    category: { id: '1', name: 'Furniture', icon: '', image: '', subcategories: [] },
    subcategory: 'Bedroom',
    brand: 'ModernLiving',
    seller: {
      id: '2',
      name: 'Modern Store',
      avatar: '',
      rating: 4.7,
      reviewCount: 890,
      isVerified: true,
      followersCount: 320,
      description: '',
      location: '',
      joinedDate: new Date(),
    },
    inStock: true,
    stockCount: 30,
    sizes: ['Single', 'Double', 'Queen'],
    colors: ['Gray', 'Beige', 'Navy'],
    tags: ['furniture', 'modern'],
    isNew: true,
    isFeatured: false,
    isOnSale: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    rating_count: 203,
  },
  {
    id: 'bed_3',
    name: 'bed',
    description: 'Luxury bed with premium materials',
    price: 5.99,
    originalPrice: 7.00,
    discount: 25,
    rating: 4.9,
    reviewCount: 178,
    orderCount: 145,
    images: ['https://picsum.photos/seed/bed3/300/300'],
    category: { id: '1', name: 'Furniture', icon: '', image: '', subcategories: [] },
    subcategory: 'Bedroom',
    brand: 'LuxuryHome',
    seller: {
      id: '3',
      name: 'Luxury Furniture',
      avatar: '',
      rating: 4.9,
      reviewCount: 567,
      isVerified: true,
      followersCount: 890,
      description: '',
      location: '',
      joinedDate: new Date(),
    },
    inStock: true,
    stockCount: 15,
    sizes: ['Queen', 'King'],
    colors: ['Cream', 'Gold', 'Silver'],
    tags: ['furniture', 'luxury'],
    isNew: false,
    isFeatured: true,
    isOnSale: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    rating_count: 178,
  },
  {
    id: 'bed_4',
    name: 'bed',
    description: 'Affordable bed with great quality',
    price: 5.99,
    originalPrice: 7.00,
    discount: 25,
    rating: 4.9,
    reviewCount: 267,
    orderCount: 312,
    images: ['https://picsum.photos/seed/bed4/300/300'],
    category: { id: '1', name: 'Furniture', icon: '', image: '', subcategories: [] },
    subcategory: 'Bedroom',
    brand: 'ValueHome',
    seller: {
      id: '4',
      name: 'Budget Furniture',
      avatar: '',
      rating: 4.6,
      reviewCount: 1100,
      isVerified: true,
      followersCount: 234,
      description: '',
      location: '',
      joinedDate: new Date(),
    },
    inStock: true,
    stockCount: 75,
    sizes: ['Single', 'Double'],
    colors: ['White', 'Pine', 'Oak'],
    tags: ['furniture', 'budget'],
    isNew: false,
    isFeatured: false,
    isOnSale: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    rating_count: 267,
  },
];

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { likedProductIds, toggleWishlist } = useWishlist();
  const [cartData, setCartData] = useState(mockCartData);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(['cart_item_1']));
  const [allSelected, setAllSelected] = useState(true);

  // i18n
  const locale = useAppSelector((s) => s.i18n.locale);
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Calculate totals
  const selectedCartItems = cartData.flatMap(store => 
    store.items.filter(item => selectedItems.has(item.id))
  );
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedCount = selectedCartItems.length;

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    
    // Update all selected state
    const allItemIds = cartData.flatMap(store => store.items.map(item => item.id));
    setAllSelected(newSelected.size === allItemIds.length);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
      setAllSelected(false);
    } else {
      const allItemIds = cartData.flatMap(store => store.items.map(item => item.id));
      setSelectedItems(new Set(allItemIds));
      setAllSelected(true);
    }
  };

  const handleQuantityChange = (itemId: string, increment: boolean) => {
    setCartData(prevData => 
      prevData.map(store => ({
        ...store,
        items: store.items.map(item => {
          if (item.id === itemId) {
            const newQuantity = increment 
              ? item.quantity + 1 
              : Math.max(1, item.quantity - 1);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      }))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartData(prevData => 
      prevData.map(store => ({
        ...store,
        items: store.items.filter(item => item.id !== itemId)
      })).filter(store => store.items.length > 0)
    );
    
    const newSelected = new Set(selectedItems);
    newSelected.delete(itemId);
    setSelectedItems(newSelected);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.black} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>
        Cart ({selectedCount})
      </Text>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="heart-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="trash-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSellerSection = (store: any) => (
    <View style={styles.sellerSection} key={store.id}>
      <View style={styles.sellerRow}>
        <TouchableOpacity 
          style={styles.sellerCheckbox}
          onPress={() => {
            // Toggle all items in this store
            const storeItemIds = store.items.map((item: any) => item.id);
            const allStoreItemsSelected = storeItemIds.every((id: string) => selectedItems.has(id));
            
            const newSelected = new Set(selectedItems);
            if (allStoreItemsSelected) {
              storeItemIds.forEach((id: string) => newSelected.delete(id));
            } else {
              storeItemIds.forEach((id: string) => newSelected.add(id));
            }
            setSelectedItems(newSelected);
          }}
        >
          <View style={[
            styles.checkbox,
            store.items.every((item: any) => selectedItems.has(item.id)) && styles.checkboxSelected
          ]}>
            {store.items.every((item: any) => selectedItems.has(item.id)) && (
              <Ionicons name="checkmark" size={12} color={COLORS.white} />
            )}
          </View>
        </TouchableOpacity>
        
        <Image 
          source={{ uri: 'https://picsum.photos/seed/seller/40/40' }}
          style={styles.sellerAvatar}
        />
        
        <Text style={styles.sellerName}>{store.sellerName}</Text>
      </View>
    </View>
  );

  const renderCartItem = (item: any) => (
    <View style={styles.cartItem} key={item.id}>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="close" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        <TouchableOpacity 
          style={styles.itemCheckbox}
          onPress={() => handleSelectItem(item.id)}
        >
          <View style={[
            styles.checkbox,
            selectedItems.has(item.id) && styles.checkboxSelected
          ]}>
            {selectedItems.has(item.id) && (
              <Ionicons name="checkmark" size={12} color={COLORS.white} />
            )}
          </View>
        </TouchableOpacity>
        
        <Image 
          source={{ uri: item.image }}
          style={styles.productImage}
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productVariant}>{item.color}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
            )}
          </View>
          
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, false)}
            >
              <Ionicons name="remove" size={16} color={COLORS.black} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, true)}
            >
              <Ionicons name="add" size={16} color={COLORS.black} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMoreToLove = () => (
    <View style={styles.moreToLoveSection}>
      <Text style={styles.sectionTitle}>More to love</Text>
      
      <View style={styles.productsGrid}>
        {mockMoreToLoveProducts.map((product) => (
          <View key={product.id} style={styles.productCardWrapper}>
            <ProductCard
              product={product}
              variant="moreToLove"
              onPress={() => (navigation as any).navigate('ProductDetail', { productId: product.id })}
              onLikePress={() => toggleWishlist(product)}
              isLiked={likedProductIds.includes(product.id)}
              showLikeButton={true}
              showDiscountBadge={true}
              showRating={true}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <View style={styles.bottomContent}>
        <TouchableOpacity 
          style={styles.allCheckbox}
          onPress={handleSelectAll}
        >
          <View style={[
            styles.checkbox,
            allSelected && styles.checkboxSelected
          ]}>
            {allSelected && (
              <Ionicons name="checkmark" size={12} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.allText}>All</Text>
        </TouchableOpacity>
        
        <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
        
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => {
            // Navigate to payment screen with selected items
            const paymentItems = selectedCartItems.map(item => ({
              id: item.id,
              name: item.name,
              color: item.color,
              size: item.size,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            }));
            
            (navigation as any).navigate('Payment', {
              items: paymentItems,
              totalAmount: totalPrice,
              fromCart: true,
            });
          }}
        >
          <Text style={styles.payButtonText}>Pay ({selectedCount})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show empty cart if no items
  if (cartData.length === 0 || cartData.every(store => store.items.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.emptyCart}>
          <Image 
            source={require('../../assets/icons/cart_image.png')} 
            style={styles.emptyCartImage}
          />
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {cartData.map((store) => (
          <View key={store.id}>
            {renderSellerSection(store)}
            {store.items.map((item) => renderCartItem(item))}
          </View>
        ))}
        
        {renderMoreToLove()}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {renderBottomBar()}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  headerIcon: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  sellerSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerCheckbox: {
    marginRight: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.accentPink,
    borderColor: COLORS.accentPink,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  sellerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  cartItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.lg,
    zIndex: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemCheckbox: {
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.gray[100],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productVariant: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  currentPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  moreToLoveSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    marginBottom: SPACING.md,
  },
  bottomSpace: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    ...SHADOWS.lg,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  allCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  allText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  totalPrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  payButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyCartImage: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
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
  },
  continueShoppingButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
  },
  continueShoppingButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default CartScreen;