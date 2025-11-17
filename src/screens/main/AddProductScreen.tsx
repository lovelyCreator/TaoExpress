import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useToast } from '../../context/ToastContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList, VariationData, ShippingService } from '../../types';
import { useCreateProductMutation, useUpdateProductMutation } from '../../hooks/useProductMutations';
import { useProduct } from '../../context/ProductContext';
import { useVariations } from '../../context/VariationContext';
import { useShipping } from '../../context/ShippingContext';
import { useGetShippingServicesMutation } from '../../hooks/useShippingServices';
import { Video } from 'expo-av';

// Helper function to convert image to base64
const convertToBase64 = (uri: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      const reader = new FileReader();
      reader.onloadend = function() {
        resolve(reader.result as string);
      };
      reader.onerror = function(error) {
        reject(error);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = function(error) {
      reject(error);
    };
    xhr.open('GET', uri);
    xhr.responseType = 'blob';
    xhr.send();
  });
};

type AddProductScreenRouteProp = RouteProp<RootStackParamList, 'AddProduct'>;
type AddProductScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddProduct'>;

const AddProductScreen: React.FC = () => {
  const navigation = useNavigation<AddProductScreenNavigationProp>();
  const route = useRoute<AddProductScreenRouteProp>();
  const { category, setCategory } = useProduct();
  const { variations, setVariations, addVariation, removeVariation } = useVariations();
  const { shippingServices, setShippingServices } = useShipping();
  const { mutate: fetchShippingServices, isLoading: isLoadingShipping } = useGetShippingServicesMutation();
  const { showToast } = useToast();
  
  // State for selected shipping service
  const [selectedShippingService, setSelectedShippingService] = useState<ShippingService | null>(null);
  const [showShippingOptionsModal, setShowShippingOptionsModal] = useState(false);

  // Check if we're in edit mode - preserve this state
  const [isEditMode, setIsEditMode] = useState(!!route.params?.product);
  const [productToEdit, setProductToEdit] = useState(route.params?.product || null);
  const [weight, setWeight] = useState(route?.params?.weight || null);
  const [height, setHeight] = useState(route?.params?.height || null);
  const [length, setLength] = useState(route?.params?.length || null);
  const [width, setWidth] = useState(route?.params?.width || null);
  const [service_name, setService_name] = useState(route?.params?.service_name || null);

  // Preserve original product images when coming from MyProducts page
  const [originalProductImages, setOriginalProductImages] = useState<string[]>([]);
  const [originalProductVideos, setOriginalProductVideos] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: category, // Use category from context
    categoryId: '', // Add category ID
    price: '',
    stock: '',
    weight: '',
    height: '',
    width: '',
    length: '',
    shippingOptions: 'Bows',
    discount: '',
    brand: '', // Add brand field
  });
  
  // State for product images and videos (separated)
  const [productImages, setProductImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [productVideos, setProductVideos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [showImages, setShowImages] = useState<string[]>([]);
  const [showVideos, setShowVideos] = useState<string[]>([]);
  const [imageNumber, setImageNumber] = useState<number>(0);
  const [videoNumber, setVideoNumber] = useState<number>(0);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [selectedShippingOption, setSelectedShippingOption] = useState('Bows');
  const [isUploading, setIsUploading] = useState(false);

  // Get variations from route params if available
  const routeVariations = route.params?.variations;
  console.log("Route Variations:", routeVariations);

  // Product mutation hooks
  const { mutate: createProduct, isLoading: isCreatingProduct } = useCreateProductMutation({
    onSuccess: () => {
      setIsUploading(false);
      showToast('Product successfully published', 'success');
      navigation.goBack();
    },
    onError: (error) => {
      setIsUploading(false);
      showToast(error || 'You are not success to publish product', 'error');
    }
  });

  const { mutate: updateProduct, isLoading: isUpdatingProduct } = useUpdateProductMutation({
    onSuccess: () => {
      setIsUploading(false);
      showToast('Product successfully updated', 'success');
      navigation.goBack();
    },
    onError: (error) => {
      setIsUploading(false);
      showToast(error || 'You are not success to update product', 'error');
    }
  });

  // Update variations context when route variations change
  useEffect(() => {
    if (routeVariations) {
      console.log('Updating variations from route params:', routeVariations);
      setVariations(routeVariations);
    }
  }, [routeVariations, setVariations]);

  // Pre-fill form if in edit mode or if category is passed from category selection
  useEffect(() => {
    // Update edit mode state when route params change
    if (route.params?.product) {
      setIsEditMode(true);
      setProductToEdit(route.params.product);
    }
    if (route.params?.weight) {
      setWeight(route.params.weight);
    }
    if (route.params?.height) {
      setHeight(route.params.height);
    }
    if (route.params?.length) {
      setLength(route.params.length);
    }
    if (route.params?.width) {
      setWidth(route.params.width);
    }
    if (route.params?.service_name) {
      setService_name(route.params.service_name);
    }
    
    const product = route.params?.product || productToEdit;
    const product_weight = route.params?.weight || weight;
    const product_height = route.params?.height || height;
    const product_width = route.params?.width || width;
    const product_length = route.params?.length || length;
    const product_service_name = route.params?.service_name || service_name;

    if (product) {
      console.log('Pre-filling form with product data:', product.videos);
      
      // Preserve original product images and videos when coming from MyProducts page
      if (product.images && Array.isArray(product.images)) {
        setOriginalProductImages([...product.images]);
        setShowImages([...product.images]);
        setImageNumber(product.images.length);
      }
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?.name || '',
        categoryId: product.category?.id?.toString() || '', // Add category ID
        price: product.price?.toString() || '',
        stock: product.stockCount?.toString() || '',
        weight: weight || '',
        height: height || '',
        width: width || '',
        length: length || '',
        shippingOptions: service_name || '',
        discount: product.discount?.toString() || '',
        brand: product.brand || '', // Add brand field
      });
      
      // Set images if they exist
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        console.log('Setting images from product data:', product.images);
        setShowImages([...product.images]);
        setImageNumber(product.images.length);
      }
      console.log("Images Number:", showImages, " ", imageNumber);

      if (product.videos && Array.isArray(product.videos) && product.videos.length > 0) {
        console.log('Setting videos from product data:', product.videos);
        setOriginalProductVideos([...product.videos]);
        setShowVideos([...product.videos]);
        setVideoNumber(product.videos.length);
        console.log("Videos Number:", showVideos, " ", videoNumber)
      }
      
      // Set variations if they exist in the route params
      if (route.params?.variations && Array.isArray(route.params.variations)) {
        console.log('Setting variations from route params:', route.params.variations);
        setVariations(route.params.variations);
      }
    }
    
    // Handle category selection from category page - this should work for both new and edit modes
    if (route.params?.selectedCategory) {
      // Update category from route params (when coming back from category selection)
      const selectedCategory = route.params.selectedCategory;
      const selectedCategoryId = route.params.selectedCategoryId || '';
      setCategory(selectedCategory);
      setFormData(prev => ({ ...prev, category: selectedCategory, categoryId: selectedCategoryId }));
    }
  }, [route.params, productToEdit, setCategory, setVariations, weight, height, width, length, service_name]);

  // Effect to update category when it changes in context
  useEffect(() => {
    if (category) {
      setFormData(prev => ({ ...prev, category }));
    }
  }, [category]);

  // Effect to pre-select shipping service when in edit mode and shipping services are loaded
  useEffect(() => {
    if (isEditMode && route.params?.service_name && shippingServices && Array.isArray(shippingServices) && shippingServices.length > 0) {
      // Find the shipping service that matches the service_name
      const matchingService = shippingServices.find(
        (service: ShippingService) => service.service_name === route.params?.service_name
      );
      
      if (matchingService) {
        setSelectedShippingService(matchingService);
      }
    }
  }, [isEditMode, route.params?.service_name, shippingServices]);

  // Effect to update price range and total stock when variations change
  useEffect(() => {
    console.log('Variations changed:', variations);
    if (variations && variations.length > 0) {
      // Calculate price range
      const allPrices = variations.flatMap(variation => 
        variation.options.map(option => option.price)
      ).filter(price => price > 0);
      
      console.log('All prices:', allPrices);
      
      if (allPrices.length > 0) {
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);
        const priceRange = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;
        console.log('Setting price range:', priceRange);
        setFormData(prev => ({ ...prev, price: priceRange }));
      }
      
      // Calculate total stock
      const totalStock = variations.reduce((total, variation) => {
        return total + variation.options.reduce((variationTotal, option) => {
          return variationTotal + (option.stock || 0);
        }, 0);
      }, 0);
      
      console.log('Setting total stock:', totalStock);
      setFormData(prev => ({ ...prev, stock: totalStock.toString() }));
    }
  }, [variations]);

  const categories = ['Shoes', 'Clothing', 'Accessories', 'Electronics', 'Home'];
  const defaultShippingOptions = [
    { id: '1', name: 'Bows Shipping', deliveryTime: '2-3 days', activeNum: '35', order: '03076' },
    { id: '2', name: 'Standard Shipping', deliveryTime: '5-7 days', activeNum: '35', order: '03076' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to request media permissions
  const requestMediaPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
        return false;
      }
    }
    return true;
  };

  // Function to add a new image from gallery (allowing multiple selections)
  const handleAddImage = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    try {
      // Use launchImageLibraryAsync for selecting images from gallery
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disable editing to avoid issues
        quality: 1, // Full quality
        allowsMultipleSelection: true, // Allow multiple image selection
        selectionLimit: 10, // Limit to 10 images
      });

      console.log('ImagePicker result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Assets count:', result.assets.length);
        console.log('First asset:', result.assets[0]);
        
        const newImages = result.assets.map((asset: ImagePicker.ImagePickerAsset, index: number) => {
          console.log(`Asset ${index}:`, asset);
          console.log(`Asset ${index} URI:`, asset.uri);
          console.log(`Asset ${index} type:`, typeof asset.uri);
          
          // Validate the URI
          if (!asset.uri || asset.uri === '') {
            console.log(`Skipping empty URI for asset ${index}`);
            return null;
          }
          
          // Log the extracted properties for Cloudinary upload
          console.log(`Asset ${index} fileName:`, asset.fileName);
          console.log(`Asset ${index} mimeType:`, asset.mimeType);
          console.log(`Asset ${index} type:`, asset.type);
          
          // Return the full asset object to preserve metadata and maintain type compatibility
          return asset;
        }).filter((asset): asset is ImagePicker.ImagePickerAsset => asset !== null); // Filter out null values and ensure type safety
        
        console.log('Selected images:', newImages);
        console.log('Filtered images count:', newImages.length);
        
        if (newImages.length > 0) {
          setProductImages(prev => {
            const updated = [...prev, ...newImages];
            console.log('Previous images:', prev);
            console.log('New images to add:', newImages);
            console.log('Updated images array:', updated);
            return updated;
          });
          newImages.map(newImage => {
            setShowImages(prev => [...prev, newImage.uri]);
            // console.log('Updated showImages array:', prev);
          });
        } else {
          console.log('No valid images to add');
        }
      } else {
        console.log('No images selected or operation cancelled');
        console.log('Result cancelled:', result.canceled);
        console.log('Result assets:', result.assets);
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
    }
  };

  // Function to add a new video from gallery
  const handleAddVideo = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    try {
      // Use launchImageLibraryAsync for selecting videos from gallery
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1, // Full quality
        allowsMultipleSelection: true, // Allow multiple video selection
        selectionLimit: 10, // Limit to 10 videos
      });

      console.log('VideoPicker result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Assets count:', result.assets.length);
        console.log('First asset:', result.assets[0]);
        
        const newVideos = result.assets.map((asset: ImagePicker.ImagePickerAsset, index: number) => {
          console.log(`Asset ${index}:`, asset);
          console.log(`Asset ${index} URI:`, asset.uri);
          console.log(`Asset ${index} type:`, typeof asset.uri);
          
          // Validate the URI
          if (!asset.uri || asset.uri === '') {
            console.log(`Skipping empty URI for asset ${index}`);
            return null;
          }
          
          // Log the extracted properties for Cloudinary upload
          console.log(`Asset ${index} fileName:`, asset.fileName);
          console.log(`Asset ${index} mimeType:`, asset.mimeType);
          console.log(`Asset ${index} type:`, asset.type);
          
          // Return the full asset object to preserve metadata and maintain type compatibility
          return asset;
        }).filter((asset): asset is ImagePicker.ImagePickerAsset => asset !== null); // Filter out null values and ensure type safety
        
        console.log('Selected videos:', newVideos);
        console.log('Filtered videos count:', newVideos.length);
        
        if (newVideos.length > 0) {
          setProductVideos(prev => {
            const updated = [...prev, ...newVideos];
            console.log('Previous videos:', prev);
            console.log('New videos to add:', newVideos);
            console.log('Updated videos array:', updated);
            return updated;
          });
          newVideos.map(newVideo => {
            setShowVideos(prev => [...prev, newVideo.uri]);
            // console.log('Updated showVideos array:', prev);
          });
        } else {
          console.log('No valid videos to add');
        }
      } else {
        console.log('No videos selected or operation cancelled');
        console.log('Result cancelled:', result.canceled);
        console.log('Result assets:', result.assets);
      }
    } catch (error) {
      console.error('Error selecting videos:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  // Function to remove an image
  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setShowImages(prev => prev.filter((_, i) => i !== index + imageNumber-1));
  };

  // Function to remove a video
  const handleRemoveVideo = (index: number) => {
    console.log("RemoveVideo: ", index );
    setProductVideos(prev => prev.filter((_, i) => i !== index));
    setShowVideos(prev => prev.filter((_, i) => i !== index + videoNumber-1));
  };

  // Function to handle category selection
  const handleCategorySelect = () => {
    // Navigate to SellerCategory screen for category selection
    // Pass the current edit mode state so we can preserve it
    navigation.navigate('SellerCategory');
  };

  // Fetch shipping services when component mounts
  useEffect(() => {
    // Assuming store_id is 1 for now, you might want to get this from context or props
    fetchShippingServices(1).catch(error => {
      console.error('Failed to fetch shipping services:', error);
    });
  }, [fetchShippingServices]);

  const renderVariations = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.categorySelector}
        onPress={() => setShowShippingOptionsModal(true)}
      >
        <Text style={styles.inputLabel}>Shipping Options</Text>
        <View style={styles.categorySelectorContent}>
          {/* Show selected shipping service name or placeholder */}
          <Text style={styles.categoryText}>
            {selectedShippingService 
              ? selectedShippingService.service_name 
              : (isEditMode && formData.shippingOptions 
                ? formData.shippingOptions 
                : 'Select shipping option')}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.black} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.variationsButton}
        onPress={() => navigation.navigate('Variations', { variations })}
      >
        <View style={styles.variationsButtonContent}>
          <Text style={styles.inputLabel}>Variations</Text>
          <View style={styles.categorySelectorContent}>
            {/* <Text style={styles.categoryText}>{formData.shippingOptions}</Text> */}
            <Text style={styles.variationsDisplayText}>{formatVariationsForDisplay()}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.black} />
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Display variations if they exist */}
      {/* {renderVariationsDisplay()} */}
      
      {renderPricing()}
    </View>
  );

  const renderPricing = () => (
    <View style={{flexDirection: 'column'}}>
      {/* <Text style={styles.sectionTitle}>Pricing & Inventory</Text> */}
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Price ($)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Price range from variations"
          value={formData.price}
          placeholderTextColor={COLORS.gray[400]}
          editable={false} // Make it non-editable
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Stock</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Total stock from variations"
          value={formData.stock}
          placeholderTextColor={COLORS.gray[400]}
          editable={false} // Make it non-editable
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderShipping = () => (
    <View style={styles.section}>
      {/* <Text style={styles.sectionTitle}>Shipping & Dimensions</Text> */}
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Package weight (g)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Input weight"
          value={formData.weight}
          placeholderTextColor={COLORS.gray[400]}
          onChangeText={(value) => handleInputChange('weight', value)}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.inputLabel}>Product Dimensions (cm)</Text>
      <View style={styles.dimensionsContainer}>
        <View style={styles.dimensionInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Height"
            value={formData.height}
            placeholderTextColor={COLORS.gray[400]}
            onChangeText={(value) => handleInputChange('height', value)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.dimensionInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Width"
            value={formData.width}
            placeholderTextColor={COLORS.gray[400]}
            onChangeText={(value) => handleInputChange('width', value)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.dimensionInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Length"
            placeholderTextColor={COLORS.gray[400]}
            value={formData.length}
            onChangeText={(value) => handleInputChange('length', value)}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      statusBarTranslucent
      transparent
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select Category</Text>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.categoryOption}
              onPress={() => {
                handleInputChange('category', category);
                setShowCategoryModal(false);
              }}
            >
              <Text style={styles.categoryOptionText}>{category}</Text>
              {formData.category === category && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const renderVariationsModal = () => (
    <Modal
      visible={showVariationsModal}
      statusBarTranslucent
      transparent
      animationType="slide"
      onRequestClose={() => setShowVariationsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Variations</Text>
          
          {variations.map((variation, index) => (
            <View key={`variation-${index}`} style={styles.variationItem}>
              <TextInput
                style={styles.variationInput}
                placeholder="Variation name"
                value={variation.name}
                onChangeText={(value) => {
                  const updatedVariations = [...variations];
                  updatedVariations[index] = { ...variation, name: value };
                  setVariations(updatedVariations);
                }}
              />
              <TouchableOpacity 
                style={styles.removeVariationButton}
                onPress={() => removeVariation(variation.name)}
              >
                <Text style={styles.removeVariationText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addVariationButton}
            onPress={() => {
              const newVariation = {
                name: '',
                options: [
                  {
                    id: Date.now(),
                    value: '',
                    price: 0,
                    stock: 0
                  }
                ]
              };
              addVariation(newVariation);
            }}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
            <Text style={styles.addVariationText}>Add option</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setShowVariationsModal(false)}
          >
            <Text style={styles.saveButtonText}>Set-up Variations Info</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderShippingOptionsModal = () => (
    <Modal
      visible={showShippingOptionsModal}
      statusBarTranslucent
      transparent
      animationType="slide"
      onRequestClose={() => setShowShippingOptionsModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowShippingOptionsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center'}}>
            <View style={styles.stickbar}/>
          </View>
          <TouchableWithoutFeedback>
            <View style={styles.shippingOptionsModalContent}>
              <Text style={styles.modalTitle}>Shipping Options</Text>
              
              {isLoadingShipping ? (
                <View style={styles.centeredContainer}>
                  <Text>Loading shipping options...</Text>
                </View>
              ) : shippingServices && Array.isArray(shippingServices) && shippingServices.length > 0 ? (
                shippingServices.map((service: ShippingService) => (
                  <TouchableOpacity 
                    key={service.id} 
                    style={styles.shippingOptionItem}
                    onPress={() => {
                      setSelectedShippingService(service);
                      setShowShippingOptionsModal(false);
                    }}
                  >
                    <View style={styles.shippingOptionLeft}>
                      <TouchableOpacity 
                        style={[styles.radioButton, 
                          selectedShippingService?.id === service.id && 
                          {backgroundColor: COLORS.accentPink, borderColor: COLORS.accentPink}
                        ]}
                        onPress={() => setSelectedShippingService(service)}
                      >
                        {selectedShippingService?.id === service.id ? (
                          <Ionicons name="checkmark" color={COLORS.white} size={14} />
                        ) : null}
                      </TouchableOpacity>
                      <View style={styles.shippingOptionInfo}>
                        <Text style={styles.shippingOptionDetails}>
                          {service.service_name}
                        </Text>
                        <Text style={styles.shippingOptionName}>
                          {service.processing_time} processing time
                        </Text>
                        <Text style={styles.shippingOptionDetails}>
                          {service.locations && Array.isArray(service.locations) ? service.locations.length : 0} locations
                        </Text>
                      </View>
                    </View>
                    <View style={styles.shippingOptionRight}>
                      <TouchableOpacity 
                        style={styles.editAddressButton}
                      >
                        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.centeredContainer}>
                  <Text>No shipping options available</Text>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={() => {
                      setShowShippingOptionsModal(false);
                      // navigation.navigate('AddShippingService');
                    }}
                  >
                    <Text style={styles.saveButtonText}>Add Shipping Service</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {shippingServices && Array.isArray(shippingServices) && shippingServices.length > 0 && (
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowShippingOptionsModal(false)}
                >
                  <Text style={styles.selectButtonText}>Select</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const handlePublish = async () => {
    // Validate form
    if (!formData.name) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Check if we have variations and it's an array
    if (!variations || !Array.isArray(variations) || variations.length === 0) {
      showToast('Please add at least one variation', 'error');
      return;
    }

    // Validate that all variations have names and options
    for (const variation of variations) {
      if (!variation.name || !variation.name.trim()) {
        showToast('Please provide names for all variations', 'error');
        return;
      }
      
      if (!variation.options || !Array.isArray(variation.options) || variation.options.length === 0) {
        showToast('Please add options to all variations', 'error');
        return;
      }
      
      for (const option of variation.options) {
        if (!option.value || !option.value.trim()) {
          showToast('Please provide values for all variation options', 'error');
          return;
        }
      }
    }

    // Check if there are any images (either original or newly added)
    const hasOriginalImages = isEditMode && originalProductImages.length > 0;
    const hasNewImages = productImages && productImages.length > 0;
    const hasImages = hasOriginalImages || hasNewImages;

    if (!hasImages) {
      Alert.alert(
        'Missing Images',
        'Please add images for this product.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload images and videos to Cloudinary first
      console.log('Starting Cloudinary uploads...');
      
      // Use original product images if editing, otherwise use current images
      let imageUrls: string[] = [];
      if (isEditMode && originalProductImages.length > 0) {
        // For edit mode, start with original product images
        imageUrls = [...originalProductImages];
        console.log('Using original product images:', originalProductImages);
      }
      
      // Add any newly selected images
      if (productImages && productImages.length > 0) {
        console.log('Uploading new images to Cloudinary...');
        console.log('Product images data:', productImages);
        
        for (const [index, image] of productImages.entries()) {
          try {
            console.log(`Uploading image ${index + 1}/${productImages.length}:`, image);
            console.log(`Image URI:`, image.uri);
            // Safely access image properties
            const mimeType = (image as any).mimeType || (image as any).type || '';
            console.log(`Image type:`, mimeType);
            
            // Extract filename from URI if fileName is not available
            let fileName = (image as any).fileName || null;
            if ((!fileName || fileName === null) && image.uri) {
              const uriParts = image.uri.split('/');
              fileName = uriParts[uriParts.length - 1];
            }
            console.log(`Image fileName:`, fileName);
            
            // Import the Cloudinary upload function
            const { uploadToCloudinary } = await import('../../services/cloudinary');
            const result = await uploadToCloudinary(image.uri, (fileName !== null && fileName !== undefined) ? fileName : undefined);
            imageUrls.push(result.secure_url);
            console.log(`Successfully uploaded image ${index + 1}:`, result.secure_url);
          } catch (uploadError) {
            console.error(`Error uploading image ${index + 1}:`, uploadError);
            setIsUploading(false);
            showToast('Failed to upload image. Please try again.', 'error');
            return; // Stop the process if any image fails to upload
          }
        }
        console.log('Completed image uploads. URLs:', imageUrls);
      } else {
        console.log('No new images to upload');
      }
      
      // Upload videos to Cloudinary
      let videoUrls: string[] = [];
      if (isEditMode && originalProductVideos.length > 0) {
        videoUrls = [...originalProductVideos];
      }
      if (productVideos && productVideos.length > 0) {
        console.log('Uploading videos to Cloudinary...');
        console.log('Product videos data:', productVideos);
        
        for (const [index, video] of productVideos.entries()) {
          try {
            console.log(`Uploading video ${index + 1}/${productVideos.length}:`, video);
            console.log(`Video URI:`, video.uri);
            // Safely access video properties
            const mimeType = (video as any).mimeType || (video as any).type || '';
            console.log(`Video type:`, mimeType);
            
            // Extract filename from URI if fileName is not available
            let fileName = (video as any).fileName || null;
            if ((!fileName || fileName === null) && video.uri) {
              const uriParts = video.uri.split('/');
              fileName = uriParts[uriParts.length - 1];
            }
            console.log(`Video fileName:`, fileName);
            
            // Import the Cloudinary upload function
            const { uploadVideoToCloudinary } = await import('../../services/cloudinary');
            const result = await uploadVideoToCloudinary(video.uri, (fileName !== null && fileName !== undefined) ? fileName : undefined);
            videoUrls.push(result.secure_url);
            console.log(`Successfully uploaded video ${index + 1}:`, result.secure_url);
          } catch (uploadError) {
            console.error(`Error uploading video ${index + 1}:`, uploadError);
            setIsUploading(false);
            showToast('Failed to upload video. Please try again.', 'error');
            return; // Stop the process if any video fails to upload
          }
        }
        console.log('Completed video uploads. URLs:', videoUrls);
      } else {
        console.log('No videos to upload');
      }
      
      // Calculate weighted average price from variations
      const calculateWeightedAveragePrice = () => {
        let totalWeightedPrice = 0;
        let totalStock = 0;
        
        // Iterate through all variations and their options
        for (const variation of variations) {
          if (variation.options && Array.isArray(variation.options)) {
            for (const option of variation.options) {
              const price = parseFloat(option.price.toString()) || 0;
              const stock = parseInt(option.stock.toString()) || 0;
              
              // Add to weighted sum (price * stock)
              totalWeightedPrice += price * stock;
              // Add to total stock
              totalStock += stock;
            }
          }
        }
        
        // Return weighted average price or 0 if no stock
        return totalStock > 0 ? totalWeightedPrice / totalStock : 0;
      };
      
      // Calculate the weighted average price
      const weightedAveragePrice = calculateWeightedAveragePrice();
      console.log('Calculated weighted average price:', weightedAveragePrice);
      
      // Prepare product data with uploaded URLs
      const productData: any = {
        name: formData.name,
        description: formData.description,
        category_id: parseInt(formData.categoryId) || 1, // Use the selected category ID
        price: weightedAveragePrice, // Use the calculated weighted average price instead of the range
        current_stock: parseInt(formData.stock) || 0,
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.height) || 0,
        width: parseFloat(formData.width) || 0,
        length: parseFloat(formData.length) || 0,
        discount: parseFloat(formData.discount) || 0,
        discount_type: "percent", // Add discount type
        brand: formData.brand || "", // Add brand field
        store_id: 1, // You might want to get this from the user context
        // Use selected shipping service ID or default to 1
        shipping_options: selectedShippingService?.id || 1,
        item_images: imageUrls, // Add the uploaded image URLs
        videos: videoUrls, // Add the uploaded video URLs
        service_name: selectedShippingService?.service_name || "",
        variations: variations && Array.isArray(variations) ? variations.map(variation => ({
          name: variation.name,
          options: variation.options && Array.isArray(variation.options) ? variation.options.map(option => ({
            value: option.value,
            price: option.price,
            stock: option.stock,
            image: option.image || null, // Include the Cloudinary URL for variation images
          })) : [],
        })) : []
      };
      
      // If in edit mode, add the product ID
      if (isEditMode && productToEdit) {
        productData.id = productToEdit.id;
      }
      if (isEditMode && weight) {
        productData.weight = formData.weight;
      }
      if (isEditMode && height) {
        productData.height = formData.height;
      }
      if (isEditMode && formData.width) {
        productData.width = formData.width;
      }
      if (isEditMode && formData.length) {
        productData.length = formData.length;
      }
      
      console.log('Sending product data to API:', productData);
      
      // Create FormData object for file uploads
      const formDataToSend = new FormData();
      
      // Add all product data to FormData
      Object.keys(productData).forEach(key => {
        const value = productData[key];
        if (key === 'variations') {
          // Add variations as JSON string
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'item_images' || key === 'videos') {
          // Add media URLs as arrays
          if (Array.isArray(value)) {
            value.forEach((url, index) => {
              formDataToSend.append(`${key}[${index}]`, url);
            });
          }
        } else {
          // Add other fields as strings
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Send product data to API with the uploaded URLs
      if (isEditMode && productToEdit) {
        // For update, we need to add the product ID
        updateProduct({ formData: formDataToSend });
      } else {
        // Create new product
        createProduct({ formData: formDataToSend });
      }
      
    } catch (error) {
      console.error('Error during product creation:', error);
      setIsUploading(false);
      showToast('An unexpected error occurred. Please try again.', 'error');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={isUploading}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{isEditMode ? 'Edit Product' : 'Add Your Product'}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderProductImage = ({ item, index }: { item: string; index: number }) => {
    console.log('Rendering product image:', item, 'at index:', index);
    console.log('Image URI:', item);
    console.log('Image type:', typeof item);
    
    // Check if the URI is valid
    if (!item || item === '') {
      console.log('Invalid image URI at index:', index);
      return null;
    }
    
    // Handle both local file URIs and remote URLs
    // For remote URLs (like Cloudinary), we can use them directly
    // For local files, we also use them directly
    const imageSource = { uri: item };
    console.log('Image source:', imageSource);
    
    return (
      <View style={styles.imageContainer}>
        <Image 
          source={imageSource} 
          style={styles.productImage} 
          resizeMode="cover"
          onError={(error) => console.log('Image load error:', error)}
          onLoad={() => console.log('Image loaded successfully:', item)}
        />
        <TouchableOpacity 
          style={styles.removeImageButton}
          onPress={() => handleRemoveImage(index)}
        >
          <Ionicons name="close-circle" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderProductVideo = ({ item, index }: { item: string; index: number }) => {
    console.log('Rendering product video:', item, 'at index:', index);
    
    // Check if the item is a local file URI (from ImagePicker) or a remote URL
    const isLocalFile = item.startsWith('file://') || item.startsWith('content://');
    
    return (
      <View style={styles.imageContainer}>
        {isLocalFile ? (
          // For local files, show a thumbnail with play icon
          <Image source={{ uri: item }} style={styles.productImage} />
        ) : (
          <Video source={{ uri: item }} style={styles.productImage} />
        )}
        <View style={styles.videoOverlay}>
          <Ionicons name="play-circle" size={30} color={COLORS.primary} />
        </View>
        <TouchableOpacity 
          style={styles.removeImageButton}
          onPress={() => handleRemoveVideo(index)}
        >
          <Ionicons name="close-circle" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderImageUpload = () => (
    <View style={{marginBottom: SPACING.md,}}>
      {/* <Text style={styles.sectionTitle}>Product Images</Text> */}
      {showImages.length > 0 && (
        <View>
          {/* <Text>Images count: {productImages.length}</Text> */}
          <FlatList
            data={showImages}
            renderItem={renderProductImage}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageList}
          />
        </View>
      )}
      <TouchableOpacity style={styles.imageUploadButton} onPress={handleAddImage}>
        <Ionicons name="add" size={24} color={COLORS.gray[500]} />
        {/* <Text style={styles.imageUploadText}>Add Image</Text> */}
      </TouchableOpacity>
    </View>
  );

  const renderVideoUpload = () => (
    <View style={{marginBottom: SPACING.md,}}>
      {showVideos.length > 0 && (
        <View>
          <Text>Videos count: {productVideos.length}</Text>
          <FlatList
            data={showVideos}
            renderItem={renderProductVideo}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageList}
          />
        </View>
      )}
      <TouchableOpacity style={styles.videoUploadButton} onPress={handleAddVideo}>
        <Ionicons name="add" size={24} color={COLORS.gray[500]} />
        {/* <Text style={styles.imageUploadText}>Add Video</Text> */}
      </TouchableOpacity>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      {/* <Text style={styles.sectionTitle}>Basic Information</Text> */}
      {renderImageUpload()}
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="ex. macbook pro"
          value={formData.name}
          placeholderTextColor={COLORS.gray[400]}
          onChangeText={(value) => handleInputChange('name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="ex. this macbook have 256gb"
          value={formData.description}
          placeholderTextColor={COLORS.gray[400]}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity 
        style={styles.categorySelector}
        onPress={handleCategorySelect}
      >
        <Text style={styles.inputLabel}>Category</Text>
        <View style={styles.categorySelectorContent}>
          <Text style={styles.categoryText}>{formData.category}</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.black} />
        </View>
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Video (optional)</Text>
        {renderVideoUpload()}
      </View>

      {/* New buttons for uploading media to Cloudinary */}
      {/* {productImages.length > 0 && (
        <TouchableOpacity 
          style={[styles.publishButton, { backgroundColor: COLORS.primary, marginBottom: SPACING.md }]}
          onPress={handleUploadImagesToCloudinary}
        >
          <Text style={styles.publishButtonText}>Upload Images to Cloudinary</Text>
        </TouchableOpacity>
      )}
      
      {productVideos.length > 0 && (
        <TouchableOpacity 
          style={[styles.publishButton, { backgroundColor: COLORS.secondary, marginBottom: SPACING.md }]}
          onPress={handleUploadVideosToCloudinary}
        >
          <Text style={styles.publishButtonText}>Upload Videos to Cloudinary</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );

  // Function to format variations for display (compact format)
  const formatVariationsForDisplay = () => {
    if (variations && variations.length > 0) {
      // Show only variation names without sub-variation names
      // Display max 2 variation names and show "..." for additional ones
      const variationNames = variations.map(variation => variation.name);
      if (variationNames.length > 2) {
        return `${variationNames.slice(0, 2).join(', ')}...`;
      }
      return variationNames.join(', ');
    }
    return 'Add variations';
  };

  // Function to render variations display in the UI
  const renderVariationsDisplay = () => {
    if (variations && variations.length > 0) {
      return (
        <View style={styles.variationsDisplayContainer}>
          {variations.map((variation, index) => (
            <View key={`variation-display-${index}`} style={{ marginBottom: SPACING.sm }}>
              <Text style={styles.inputLabel}>{variation.name}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {variation.options && variation.options.map((option, optionIndex) => (
                  <View 
                    key={`option-${index}-${optionIndex}`} 
                    style={{
                      backgroundColor: COLORS.gray[100],
                      borderRadius: BORDER_RADIUS.md,
                      paddingHorizontal: SPACING.sm,
                      paddingVertical: SPACING.xs,
                      marginRight: SPACING.xs,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    <Text style={{ fontSize: FONTS.sizes.sm }}>
                      {option.value} - ${option.price} (Stock: {option.stock})
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderBasicInfo()}
        {renderVariations()}
        {renderShipping()}
      </ScrollView>

      <View style={styles.publishButtonContainer}>
        <TouchableOpacity 
          style={[styles.publishButton, isUploading && styles.disabledButton]} 
          onPress={handlePublish}
          disabled={isUploading}
        >
          {isUploading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.white} />
              <Text style={styles.loadingText}>Publishing...</Text>
            </View>
          ) : (
            <Text style={styles.publishButtonText}>Publish</Text>
          )}
        </TouchableOpacity>
      </View>

      {renderCategoryModal()}
      {renderVariationsModal()}
      {renderShippingOptionsModal()}
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
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 'auto',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    marginBottom: SPACING.xl,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    // ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  imageList: {
    paddingVertical: SPACING.sm,
  },
  imageContainer: {
    marginRight: SPACING.md,
    position: 'relative',
    paddingVertical: SPACING.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
  },
  videoPreview: {
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  imageUploadButton: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[100],
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  imageUploadText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    backgroundColor: COLORS.gray[50],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    marginBottom: SPACING.lg,
    marginLeft: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // borderWidth: 1,
    // borderColor: COLORS.gray[300],
    // borderRadius: BORDER_RADIUS.lg,
    // paddingHorizontal: SPACING.md,
    // paddingVertical: SPACING.sm,
  },
  categoryText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
  },
  videoUploadButton: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[100],
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  variationsButton: {
    marginBottom: SPACING.lg,
    marginLeft: SPACING.md,
  },
  variationsButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  variationsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  variationsText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
  },
  dimensionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  dimensionInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  publishButtonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    // borderTopWidth: 1,
    // borderTopColor: COLORS.gray[200],
  },
  publishButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  publishButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  categoryOptionText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  variationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  variationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
  },
  removeVariationButton: {
    padding: SPACING.sm,
  },
  removeVariationText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
  },
  addVariationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  addVariationText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  saveButton: {
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  dropdownItemText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
  },
  selectedDropdownItemText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  shippingOptionsModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    paddingBottom: SPACING['2xl'],
  },
  shippingOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.small,
    marginTop: SPACING.md
  },
  shippingOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  shippingOptionInfo: {
    flex: 1,
  },
  shippingOptionName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  shippingOptionDetails: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
  },
  shippingOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editAddressButton: {
    // padding: SPACING.sm,
  },
  selectButton: {
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
  },
  selectButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  variationsDisplayContainer: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  variationsDisplayText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  disabledButton: {
    opacity: 0.7,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loadingText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
    marginLeft: SPACING.sm,
  },
  
});

export default AddProductScreen;