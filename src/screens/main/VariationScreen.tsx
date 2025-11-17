import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Variation, VariationData } from '../../types';
import * as ImagePicker from 'expo-image-picker';

// Components
import Button from '../../components/Button';
import Input from '../../components/Input';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';

type VariationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Variations'>;
type VariationsScreenRouteProp = RouteProp<RootStackParamList, 'Variations'>;

const VariationsScreen = ({ 
  navigation,
  route
}: { 
  navigation: VariationsScreenNavigationProp;
  route: VariationsScreenRouteProp;
}) => {
  const [variations, setVariations] = useState<Variation[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [newVariationName, setNewVariationName] = useState('');
  const [variationType, setVariationType] = useState(''); // 'size' or 'custom'
  const [sizeType, setSizeType] = useState('');//'US', 'UK' or 'EU'

  // Initialize variations from route params
  useEffect(() => {
    const routeVariations = route.params?.variations;
    if (routeVariations && routeVariations.length > 0) {
      // Convert VariationData to Variation format
      const convertedVariations: Variation[] = routeVariations.map(variation => ({
        id: Date.now() + Math.random(), // Generate new IDs
        name: variation.name,
        options: variation.options.map(option => ({
          id: option.id,
          value: option.value,
          image: option.image || '',
          imageName: option.imageName || '',
        }))
      }));
      setVariations(convertedVariations);
    }
  }, [route.params]);

  const handleAddVariation = (value: string) => {
    console.log('Adding variation:', value);
    if (!value || value.trim() === '') {
        return;
    }
    console.log('Adding variation1' +newVariationName.trim());
    
    const newVariation = {
      id: Date.now(),
      name: value,
      options: []
    };
    console.log('Adding variation2');
    
    setVariations([...variations, newVariation]);
    console.log('Adding variation3');
    setNewVariationName('');
    console.log('Adding variation4');
    setShowModal(false);
    console.log('Adding variation5');
    setShowSizeModal(false);
    console.log('Adding variation6');
  };

  const handleAddOption = (variationId: number) => {
    const updatedVariations = variations.map(variation => {
      if (variation.id === variationId) {
        return {
          ...variation,
          options: [...variation.options, { id: Date.now(), value: '', image: '', imageName: '' }] // Ensure imageName is always a string
        };
      }
      return variation;
    });
    
    setVariations(updatedVariations);
  };

  const handleDeleteVariation = (variationId: number) => {
    setVariations(variations.filter(variation => variation.id !== variationId));
  };

  const handleDeleteOption = (variationId: number, optionId: number) => {
    const updatedVariations = variations.map(variation => {
      if (variation.id === variationId) {
        return {
          ...variation,
          options: variation.options.filter(option => option.id !== optionId)
        };
      }
      return variation;
    });
    
    setVariations(updatedVariations);
  };

  // Function to handle image upload for a variation option
  const handleUploadImage = async (variationId: number, optionId: number) => {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      
      // Update the variation option with the selected image URI
      const updatedVariations = variations.map(variation => {
        if (variation.id === variationId) {
          return {
            ...variation,
            options: variation.options.map(option => 
              option.id === optionId ? { 
                ...option, 
                image: selectedImage.uri, 
                imageName: selectedImage.uri.split('/').pop() || '' // Ensure this is always a string
              } : option
            )
          };
        }
        return variation;
      });
      
      setVariations(updatedVariations);
    }
  };

  // Function to remove image from a variation option
  const handleRemoveImage = (variationId: number, optionId: number) => {
    const updatedVariations = variations.map(variation => {
      if (variation.id === variationId) {
        return {
          ...variation,
          options: variation.options.map(option => 
            option.id === optionId ? { ...option, image: '' } : option
          )
        };
      }
      return variation;
    });
    
    setVariations(updatedVariations);
  };

  const handleSave = () => {
    // Convert Variation[] to VariationData format
    const variationData: VariationData = variations.map(variation => ({
      name: variation.name,
      options: variation.options.map(option => ({
        id: option.id,
        value: option.value,
        price: 0, // Default values, will be set in SetUpVariationsInfo
        stock: 0,
        image: option.image,
        imageName: option.imageName,
      }))
    }));
    
    // Navigate to Set-up Variations Info page with current variations
    navigation.navigate('SetUpVariationsInfo', { variations });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Variations</Text>
      <TouchableOpacity onPress={() => setShowModal(true)} style={styles.backButton}>
        <Ionicons name="add" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  )
  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {variations.map((variation) => (
          <View key={variation.id} style={styles.variationContainer}>
            <View style={styles.variationHeader}>
              <TextInput
                style={styles.variationNameInput}
                value={variation.name}
                onChangeText={(value) => {
                  const updatedVariations = variations.map(v => 
                    v.id === variation.id ? { ...v, name: value } : v
                  );
                  setVariations(updatedVariations);
                }}
                placeholder="Variation name"
                placeholderTextColor={COLORS.gray[400]}
              />
              <TouchableOpacity onPress={() => handleDeleteVariation(variation.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>

            {variation.options && variation.options.map((option) => (
              <View key={option.id} style={styles.optionContainer}>
                <TouchableOpacity 
                  style={styles.optionImageContainer}
                  onPress={() => option.image ? null : handleUploadImage(variation.id, option.id)}
                >
                  {option.image ? (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: option.image }} style={styles.optionImage} />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(variation.id, option.id)}
                      >
                        <Ionicons name="close-circle" size={20} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Ionicons name='add' size={24} color={COLORS.gray[400]} />
                  )}
                </TouchableOpacity>
                <TextInput
                  style={styles.optionInput}
                  value={option.value}
                  onChangeText={(value) => {
                    const updatedVariations = variations.map(v => {
                      if (v.id === variation.id) {
                        return {
                          ...v,
                          options: v.options.map(o => 
                            o.id === option.id ? { ...o, value: value } : o
                          )
                        };
                      }
                      return v;
                    });
                    setVariations(updatedVariations);
                  }}
                  placeholder="Enter option value"
                  placeholderTextColor={COLORS.gray[400]}
                />
                <TouchableOpacity style={styles.trushBtn} onPress={() => handleDeleteOption(variation.id, option.id)}>
                  {/* <Text style={styles.deleteOptionButton}>🗑️</Text> */}
                  <Ionicons name='trash-outline' size={20} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addOptionButton} onPress={() => handleAddOption(variation.id)}>
                  <Ionicons name='add' size={20} color={COLORS.text.primary} />
              <Text style={styles.addOptionText}> Add option</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}> 
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, variations.length === 0 && styles.disabledButton]}
          disabled={variations.length === 0}
        >
          <Text style={styles.saveButtonText}>Set-up Variations Info</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for adding new variation */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center'}}>
              <View style={styles.stickbar}/>
            </View>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Variations</Text>                
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    // setVariationType('size');
                    // setNewVariationName('Size');
                    // handleAddVariation();
                    setShowModal(false);
                    setShowSizeModal(true);
                  }}
                >
                  <Text style={styles.modalItemText}>Size</Text>
                  {/* <Text style={styles.modalItemArrow}>→</Text> */}
                  <Ionicons name="chevron-forward" size={16} color={COLORS.text.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setVariationType('custom');
                    setNewVariationName('Custom');
                    handleAddVariation('Custom');
                  }}
                >
                  <Text style={styles.modalItemText}>Custom</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.text.primary} />
                  {/* <Text style={styles.modalItemArrow}>→</Text> */}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Modal for adding new variation */}
      <Modal
        visible={showSizeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSizeModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSizeModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center'}}>
              <View style={styles.stickbar}/>
            </View>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Size Variations</Text>
                
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setVariationType('size-us');
                    setNewVariationName('Size-US');
                    handleAddVariation('Size-US');
                  }}
                >
                  <Text style={styles.modalItemText}>US</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.text.primary} />
                  {/* <Text style={styles.modalItemArrow}>→</Text> */}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setVariationType('size-uk');
                    console.log('UK')
                    setNewVariationName('Size-UK');
                    console.log('Size-UK')
                    handleAddVariation('Size-UK');
                  }}
                >
                  <Text style={styles.modalItemText}>UK</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.text.primary} />
                  {/* <Text style={styles.modalItemArrow}>→</Text> */}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setVariationType('size-eu');
                    setNewVariationName('Size-EU');
                    handleAddVariation('Size-EU');
                  }}
                >
                  <Text style={styles.modalItemText}>EU</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.text.primary} />
                  {/* <Text style={styles.modalItemArrow}>→</Text> */}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
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
    paddingTop: SPACING.xl,
    // borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
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
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: '#333',
  },
  plusButton: {
    fontSize: SPACING['2xl'],
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  variationContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  variationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: SPACING.md,
  },
  variationNameInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  deleteButton: {
    color: COLORS.error,
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.smmd,
  },
  optionImageContainer: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 8,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  optionImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  optionImagePlaceholder: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[300],
  },
  optionInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  trushBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 'auto',
    ...SHADOWS.small,
  },
  deleteOptionButton: {
    color: '#e74c3c',
    fontSize: FONTS.sizes.md,
  },
  addOptionButton: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexDirection: 'row',
  },
  addOptionText: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.md,
    // textDecorationLine: 'underline',
    textAlign: 'center'
  },
  footer: {
    padding: SPACING.md,
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    // paddingTop: SPACING.lg,

  },
  saveButton: {
    width: '100%',
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.smmd,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray[300],
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },

  // Modal styles
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
    borderTopLeftRadius: BORDER_RADIUS['2xl'],
    borderTopRightRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.gray[100],
  },
  modalItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  modalItemArrow: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
});

export default VariationsScreen;