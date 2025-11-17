import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList, Product } from '../../types';
import { productsApi } from '../../services/api';
import { useDeleteProductMutation } from '../../hooks/useProductMutations';
import { useAuth } from '../../context/AuthContext';
import { useProductDetails } from '../../hooks/useProductDetails'; // Import the new hook

type MyProductsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyProducts'>;

const MyProductsScreen: React.FC = () => {
  const navigation = useNavigation<MyProductsScreenNavigationProp>();
  const { user } = useAuth();
  const { fetchProductDetails, data: productDetails, isLoading: isFetchingDetails } = useProductDetails();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [removeProductId, setRemoveProductId] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Product mutation hooks
  const { mutate: deleteProduct, isLoading: isDeletingProduct } = useDeleteProductMutation({
    onSuccess: () => {
      // Remove the product from the local state
      setProducts(products.filter(p => p.id !== removeProductId));
      // Refresh the product list from the backend
      loadProducts();
    },
    onError: (error) => {
      Alert.alert('Error', error || 'Failed to delete product');
    }
  });

  useEffect(() => {
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Check if user exists
      if (!user) {
        setProducts([]);
        return;
      }
      
      // Get store ID from user context (in a real app, this would come from the user's store)
      // For now, we'll use the store ID from the example (1)
      const storeId = 1;
      
      // Fetch products for this store using the new API function
      console.log('Products fetched:');
      const response = await productsApi.getProductsByStore(storeId);
      if (response.success && response.data) {
        // Map the API response to the Product type
        const mappedProducts = response.data.map((item: any) => {
          // Extract price from variations if available
          let price = item.price || 0;
          
          // Handle variations data - it might be a string that needs parsing
          if (item.variations) {
            try {
              let variationsData = item.variations;
              
              // If variations is a string, try to parse it
              if (typeof variationsData === 'string') {
                // Handle different string formats
                if (variationsData.startsWith('[') || variationsData.startsWith('{')) {
                  variationsData = JSON.parse(variationsData);
                } else {
                  // If it's just a string like "Color,Size", convert to array
                  variationsData = variationsData.split(',').map((v: string) => v.trim());
                }
              }
              
              // If we have an array and it's not empty, try to extract price
              if (Array.isArray(variationsData) && variationsData.length > 0) {
                // Check if it's an array of variation objects with options
                if (variationsData[0] && typeof variationsData[0] === 'object' && variationsData[0].options) {
                  // Get price from first variation's first option if available
                  if (variationsData[0].options[0] && variationsData[0].options[0].price) {
                    price = variationsData[0].options[0].price || price;
                  }
                }
              }
            } catch (e) {
              console.log('Error parsing variations for item', item.id, ':', e);
            }
          }
          
          // Extract images - handle different possible formats
          let images: string[] = [];
          if (item.images_full_url && Array.isArray(item.images_full_url) && item.images_full_url.length > 0) {
            images = item.images_full_url.filter((url: any) => url && typeof url === 'string');
          } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            // Filter out any non-string values
            images = item.images.filter((img: any) => img && typeof img === 'string');
          }
          
          // Ensure we always have a valid string for name and description
          const name = (item.name && typeof item.name === 'string') ? item.name : 'Unnamed Product';
          const description = (item.description && typeof item.description === 'string') ? item.description : '';
          
          // Ensure all numeric values are properly converted
          const numericPrice = Number(price) || 0;
          const numericOriginalPrice = Number(item.price) || 0;
          const numericDiscount = Number(item.discount) || 0;
          const numericRating = Number(item.avg_rating) || 0;
          const numericReviewCount = Number(item.rating_count) || 0;
          const numericStockCount = Number(item.stock) || 0;
          
          return {
            id: String(item.id || ''),
            name: name,
            description: description,
            price: numericPrice,
            originalPrice: numericOriginalPrice,
            discount: numericDiscount,
            images: images,
            category: {
              id: String(item.category_id || ''),
              name: 'Category',
              icon: '',
              image: '',
              subcategories: []
            },
            subcategory: 'Default',
            brand: (item.brand && typeof item.brand === 'string') ? item.brand : '',
            seller: {
              id: '1',
              name: 'Seller',
              avatar: '',
              rating: 0,
              reviewCount: 0,
              isVerified: false,
              followersCount: 0,
              description: '',
              location: '',
              joinedDate: new Date()
            },
            rating: numericRating,
            reviewCount: numericReviewCount,
            inStock: true,
            stockCount: numericStockCount,
            sizes: [],
            colors: [],
            tags: [],
            isNew: false,
            isFeatured: false,
            isOnSale: numericDiscount > 0,
            createdAt: new Date(item.created_at || Date.now()),
            updatedAt: new Date(item.updated_at || Date.now()),
            rating_count: numericReviewCount, // Add the missing rating_count property
          };
        });
        console.log("Mapped Products:", response.data);
        setProducts(mappedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      // Call the API to delete the product using the hook
      await deleteProduct({ productId });
      Alert.alert('Success', 'Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const handleEditProduct = async (product: Product) => {
    // Set the editing product ID to show loading for this specific product
    setEditingProductId(product.id);
    
    // Fetch product details from the backend using store ID
    try {
      // Get store ID from user context (in a real app, this would come from the user's store)
      // For now, we'll use the store ID from the example (1)
      const storeId = 1;
      await fetchProductDetails(storeId);
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
      setEditingProductId(null); // Reset the editing state on error
    }
  };

  useEffect(() => {
    // When product details are fetched, navigate to AddProduct screen
    if (productDetails && !isFetchingDetails) {
      setEditingProductId(null); // Reset the editing state
      // The response is an array of products
      // In a real implementation, you would find the specific product in the array
      // For now, we'll use the first product as an example
      if (productDetails.length > 0) {
        const productData = productDetails[0];
        // Extract variations if they exist
        let variationsData: any[] = [];
        if (productData.variations) {
          try {
            // Handle different possible formats of variations data
            if (typeof productData.variations === 'string') {
              if (productData.variations.startsWith('[') || productData.variations.startsWith('{')) {
                variationsData = JSON.parse(productData.variations);
              }
            } else if (Array.isArray(productData.variations)) {
              variationsData = productData.variations;
            }
          } catch (e) {
            console.log('Error parsing variations:', e);
          }
        }
        
        // Extract category information
        let categoryName = 'Shoes'; // Default category
        let categoryId = '1'; // Default category ID
        
        if (productData.category) {
          if (typeof productData.category === 'string') {
            categoryName = productData.category;
          } else if (typeof productData.category === 'object') {
            categoryName = productData.category.name || categoryName;
            categoryId = productData.category.id || categoryId;
          }
        }
        
        // Extract dimensions if available (as strings since formData uses strings)
        const weight = productData.weight?.toString() || '';
        const height = productData.height?.toString() || '';
        const width = productData.width?.toString() || '';
        const length = productData.length?.toString() || '';
        // Navigate to AddProduct screen with the product data
        navigation.navigate('AddProduct', { 
          product: {
            ...productData,
            // Map the API response to the Product type
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price || 0,
            stockCount: productData.stock || 0,
            images: productData.images || [],
            videos: productData.video || [],
            category: {
              id: categoryId,
              name: categoryName,
              icon: '',
              image: '',
              subcategories: []
            },
            // Add other necessary fields
          } as Product,
          variations: variationsData,
          selectedCategory: categoryName,
          service_name: productData.service_name || '', // Safely access service_name
          // Pass dimensions as route params since they're not part of Product type
          weight: weight,
          height: height,
          width: width,
          length: length
        });
      }
    }
  }, [productDetails, isFetchingDetails, navigation]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Products</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Ionicons name="add" size={18} color={COLORS.black} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={24} color={COLORS.text.primary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={COLORS.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    // Ensure we have valid data for display
    const displayName = item.name && typeof item.name === 'string' ? item.name : 'Unnamed Product';
    const displayPrice = typeof item.price === 'number' ? item.price : 0;
    const displayOriginalPrice = typeof item.originalPrice === 'number' ? item.originalPrice : 0;
    const displayDiscount = typeof item.discount === 'number' ? item.discount : 0;
    
    // Get the first image URL safely
    let firstImageUrl = 'https://via.placeholder.com/60';
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      if (typeof firstImage === 'string' && firstImage.length > 0) {
        firstImageUrl = firstImage;
      }
    }
    
    // Check if this specific product is being edited
    const isEditing = editingProductId === item.id;
    
    return (
      <View style={styles.productCard}>
        <Image
          source={{ uri: firstImageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{displayName}</Text>
          <View style={styles.priceContainer}>
            {displayOriginalPrice && displayOriginalPrice !== displayPrice && (
              <Text style={styles.originalPrice}>${displayOriginalPrice.toFixed(2)}</Text>
            )}
            <Text style={styles.currentPrice}>${displayPrice.toFixed(2)}</Text>
            {displayDiscount && displayDiscount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{displayDiscount}%</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditProduct(item)}
            disabled={isEditing}
          >
            {isEditing ? (
              <ActivityIndicator size="small" color={COLORS.text.primary} />
            ) : (
              <Ionicons name="pencil-outline" size={16} color={COLORS.text.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => {setDeleteModal(true); setRemoveProductId(item.id);}}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderDeleteModal = () => (
    <Modal
      visible={deleteModal}
      transparent={true}
      statusBarTranslucent
      animationType='slide'
      onRequestClose={() => setDeleteModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center'}}>
            <View style={styles.stickbar}/>
          </View>
          <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Confirm Delete</Text>
                      </View>
                      <View style={styles.modalTextContainer}>
                        <Text style={styles.modalText}>Are you sure you want to delete this product? This action cannot be undone.</Text>
                      </View>
                      <View style={styles.modalActions}>
                        <TouchableOpacity 
                          style={styles.applyButton}
                          onPress={() => setDeleteModal(false)}
                        >
                          <Text style={styles.applyButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.clearButton}
                          onPress={async () => {setDeleteModal(false); await handleRemoveProduct(removeProductId);}}
                        >
                          <Text style={styles.clearButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={80} color={COLORS.gray[300]} />
      <Text style={styles.emptyTitle}>No Products Yet</Text>
      <Text style={styles.emptyMessage}>
        Start adding products to your store to begin selling
      </Text>
      {/* <TouchableOpacity 
        style={styles.addFirstProductButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.addFirstProductButtonText}>Add Your First Product</Text>
      </TouchableOpacity> */}
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.black} />
      <Text style={styles.loadingText}>Loading your products...</Text>
    </View>
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      
      {loading ? (
        renderLoadingState()
      ) : filteredProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      )}
      {renderDeleteModal()}
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
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    // paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
  },
  productsList: {
    padding: SPACING.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    // ...SHADOWS.sm,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '400',
    color: COLORS.gray[500],
    paddingTop: SPACING.xs,
    // marginBottom: SPACING.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
  },
  currentPrice: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '700',
    color: COLORS.error,
    marginRight: SPACING.sm,
  },
  discountBadge: {
    backgroundColor: COLORS.accentPink + 10,
    paddingHorizontal: SPACING.xs,
    // paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '400',
    color: COLORS.accentPink,
  },
  productActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  editButton: {
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  removeButton: {
    borderColor: COLORS.gray[100],
    borderWidth: 1,
    paddingHorizontal: SPACING.smmd,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xl,
  },
  removeButtonText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  addFirstProductButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  addFirstProductButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  stickbar: {
    width: '10%',
    height: 15,
    borderTopColor: COLORS.white,
    borderTopWidth: 3,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    paddingTop: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    marginBottom: SPACING.xl
  },
  clearButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.black,
    borderRadius: 8,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '400',
  },
  modalTextContainer: {
    paddingHorizontal: SPACING.md,
  },
  modalText: {
    color: COLORS.gray[500],
  }
});

export default MyProductsScreen;