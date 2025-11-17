import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants';
import { RootStackParamList } from '../../types';
import { useUpdateProductMutation, useDeleteProductMutation } from '../../hooks/useProductMutations';

type EditProductRouteProp = RouteProp<RootStackParamList, 'EditProduct'>;

const EditProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditProductRouteProp>();
  const { product } = route.params;

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    brand: '',
    stock: '',
    images: [] as string[],
  });

  // Product mutation hooks
  const { mutate: updateProduct, isLoading: isUpdatingProduct } = useUpdateProductMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Product updated successfully');
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert('Error', error || 'Failed to update product');
    }
  });

  const { mutate: deleteProduct, isLoading: isDeletingProduct } = useDeleteProductMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Product deleted successfully');
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert('Error', error || 'Failed to delete product');
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load product data
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      // TODO: Load product data from API
      setFormData({
        name: 'Sample Product',
        price: '29.99',
        description: 'Sample product description',
        category: 'Electronics',
        brand: 'Sample Brand',
        stock: '100',
        images: ['https://via.placeholder.com/300'],
      });
    } catch (error) {
      console.error('Error loading product:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Create FormData object for file uploads
      const formDataToSend = new FormData();
      
      // Add product ID for update
      formDataToSend.append('id', product.id);
      
      // Add basic product information
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('current_stock', formData.stock);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('category_id', '1'); // You'll need to map category to ID
      formDataToSend.append('weight', '0'); // Add weight field to form if needed
      formDataToSend.append('width', '0'); // Add dimensions fields to form if needed
      formDataToSend.append('height', '0');
      formDataToSend.append('length', '0');
      formDataToSend.append('discount', '0'); // Add discount field to form if needed
      formDataToSend.append('discount_type', 'percent');
      formDataToSend.append('store_id', '1'); // You'll need to get the actual store ID
      
      // Add variations if needed
      // formDataToSend.append('variations[]', []); // Add variations handling
      
      // Add shipping options
      formDataToSend.append('shipping_options', '1'); // You'll need to map this properly
      
      // Call the API to update the product using the hook
      await updateProduct({ formData: formDataToSend });
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call the API to delete the product using the hook
              await deleteProduct({ productId: product.id });
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          <View style={styles.imageContainer}>
            {formData.images.map((image, index) => (
              <View key={`image-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.productImage} />
                <TouchableOpacity style={styles.removeImageButton}>
                  <Ionicons name="close" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageButton}>
              <Ionicons name="camera" size={24} color={COLORS.primary} />
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter product name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter product description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Category *</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="Select category"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholder="Enter brand"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock Quantity *</Text>
            <TextInput
              style={styles.input}
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
  },
  addImageText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray[300],
  },
  saveButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default EditProductScreen;
