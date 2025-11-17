import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Variation, VariationData } from '../../types';

// Components
import Button from '../../components/Button';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useVariations } from '../../context/VariationContext';

type SetUpVariationsInfoScreenRouteProp = RouteProp<RootStackParamList, 'SetUpVariationsInfo'>;
type SetUpVariationsInfoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SetUpVariationsInfo'>;

// Updated type to properly handle variations with options
type VariationWithOptions = {
  id: number;
  name: string;
  options: {
    id: number;
    value: string;
    price: number;
    stock: number;
    image: string;
    imageName?: string;
  }[];
};

const {width, height} = Dimensions.get('window');

const SetUpVariationsInfoScreen = ({ 
  navigation,
  route
}: { 
  navigation: SetUpVariationsInfoScreenNavigationProp;
  route: SetUpVariationsInfoScreenRouteProp;
}) => {
  const { variations: contextVariations, setVariations } = useVariations();
  const [activeTab, setActiveTab] = useState<string>('');
  const [variations, setLocalVariations] = useState<VariationWithOptions[]>([]);
  const [variationNames, setVariationNames] = useState<string[]>([]);

  // Initialize variations from route params or context
  useEffect(() => {
    const routeVariations = route.params?.variations;
    let variationsToUse: Variation[] = [];
    
    // Use route params if available, otherwise use context
    if (routeVariations && routeVariations.length > 0) {
      variationsToUse = routeVariations;
    } else if (contextVariations && contextVariations.length > 0) {
      // Convert VariationData to Variation format
      variationsToUse = contextVariations.map(variation => ({
        id: Date.now() + Math.random(), // Generate new IDs
        name: variation.name,
        options: variation.options.map(option => ({
          id: option.id,
          value: option.value,
          image: option.image || '',
          imageName: option.imageName || '',
        }))
      }));
    }
    
    if (variationsToUse.length > 0) {
      // Convert to our local format
      const localVariations: VariationWithOptions[] = variationsToUse.map(variation => ({
        id: variation.id,
        name: variation.name,
        options: variation.options.map(option => {
          // Find existing price/stock from context if available
          const existingOption = contextVariations
            ?.find(v => v.name === variation.name)
            ?.options.find(o => o.id === option.id);
            
          return {
            id: option.id,
            value: option.value,
            price: existingOption?.price || 0,
            stock: existingOption?.stock || 0,
            image: option.image || '',
            imageName: option.imageName || '',
          };
        })
      }));
      
      setLocalVariations(localVariations);
      
      // Get unique variation names
      const names = [...new Set(localVariations.map(v => v.name))];
      setVariationNames(names);
      
      // Set active tab to the first variation name
      if (names.length > 0) {
        setActiveTab(names[0]);
      }
    }
  }, [route.params, contextVariations]);

  const handleSave = async () => {
    try {
      // Upload variation images to Cloudinary
      const updatedVariations = [...variations];
      
      // Upload images for all variations
      for (let i = 0; i < updatedVariations.length; i++) {
        for (let j = 0; j < updatedVariations[i].options.length; j++) {
          const option = updatedVariations[i].options[j];
          
          // Upload image if it exists and is not already a URL
          if (option.image && !option.image.startsWith('http')) {
            try {
              console.log(`Uploading variation image for ${updatedVariations[i].name} - ${option.value}`);
              const { uploadToCloudinary } = await import('../../services/cloudinary');
              
              // Extract filename from URI
              let fileName = option.imageName || `variation_${option.id}_${Date.now()}.jpg`;
              if (option.image.includes('/')) {
                const uriParts = option.image.split('/');
                fileName = uriParts[uriParts.length - 1];
              }
              
              const result = await uploadToCloudinary(option.image, fileName);
              updatedVariations[i].options[j].image = result.secure_url;
              console.log(`Successfully uploaded variation image:`, result.secure_url);
              
              // Update the local state with the Cloudinary URL
              setLocalVariations(prev => {
                const newVariations = [...prev];
                newVariations[i] = { ...newVariations[i] };
                newVariations[i].options = [...newVariations[i].options];
                newVariations[i].options[j] = { 
                  ...newVariations[i].options[j], 
                  image: result.secure_url 
                };
                return newVariations;
              });
            } catch (uploadError) {
              console.error(`Error uploading variation image:`, uploadError);
              // Continue with other variations even if one fails
            }
          }
        }
      }
      
      // Convert to VariationData format for context
      const groupedVariations: VariationData = updatedVariations.map(variation => ({
        name: variation.name,
        options: variation.options.map(option => ({
          id: option.id,
          value: option.value,
          price: option.price,
          stock: option.stock,
          image: option.image || '',
          imageName: option.imageName || '',
        }))
      }));
      
      // Save to context
      setVariations(groupedVariations);
      
      // Navigate back to AddProduct
      navigation.navigate('AddProduct');
    } catch (error) {
      console.error('Error saving variations:', error);
    }
  };

  const handlePriceChange = (variationId: number, optionId: number, value: string) => {
    const updatedVariations = variations.map(variation => {
      if (variation.id === variationId) {
        return {
          ...variation,
          options: variation.options.map(option => 
            option.id === optionId ? { ...option, price: parseFloat(value) || 0 } : option
          )
        };
      }
      return variation;
    });
    setLocalVariations(updatedVariations);
  };

  const handleStockChange = (variationId: number, optionId: number, value: string) => {
    const updatedVariations = variations.map(variation => {
      if (variation.id === variationId) {
        return {
          ...variation,
          options: variation.options.map(option => 
            option.id === optionId ? { ...option, stock: parseInt(value) || 0 } : option
          )
        };
      }
      return variation;
    });
    setLocalVariations(updatedVariations);
  };

  // Add function to handle image updates for variation options
  const handleImageChange = (variationId: number, optionId: number, imageUri: string, imageName?: string) => {
    const updatedVariations = variations.map(variation => {
      if (variation.id === variationId) {
        return {
          ...variation,
          options: variation.options.map(option => 
            option.id === optionId ? { 
              ...option, 
              image: imageUri,
              imageName: imageName || option.imageName
            } : option
          )
        };
      }
      return variation;
    });
    setLocalVariations(updatedVariations);
  };



  // Filter variations by active tab
  const getVariationsForActiveTab = () => {
    const variation = variations.find(variation => variation.name === activeTab);
    return variation || { id: 0, name: activeTab || '', options: [] };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Set-up Variations Info</Text>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {variationNames.map((name) => (
            <TouchableOpacity 
              key={name}
              style={[styles.tab, activeTab === name && styles.activeTab]}
              onPress={() => setActiveTab(name)}
            >
              <Text style={[styles.tabText, activeTab === name && styles.activeTabText]}>{name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>      
          {getVariationsForActiveTab().options.map((option) => (
            <View key={option.id} style={styles.variationItem}>
              <Text style={styles.variationName}>{option.value}</Text>
              <View style={styles.priceStockContainer}>
                <View style={styles.priceContainer}>
                  <Text style={styles.label}>Price ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={option.price.toString()}
                    onChangeText={(value) => handlePriceChange(getVariationsForActiveTab().id, option.id, value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                
                <View style={styles.stockContainer}>
                  <Text style={styles.label}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    value={option.stock.toString()}
                    onChangeText={(value) => handleStockChange(getVariationsForActiveTab().id, option.id, value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

      </View>
      {/* Dynamic tabs based on variation names */}
      
      <View style={styles.footer}> 
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingTop: SPACING.xl,
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
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    width: '100%',
    borderBottomColor: COLORS.gray[100],
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.black,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 3*SPACING['3xl']
  },
  variationItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: SPACING.md,
  },
  variationName: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  variationImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    marginTop: 4,
  },
  priceStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
    marginRight: 8,
  },
  stockContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: FONTS.sizes.md,
  },
  footer: {
    position:'absolute',
    alignItems: 'center',
    top: height-3*SPACING.xl,
    width: '100%',
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  saveButton: {
    width: '90%',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    height: SPACING['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
});

export default SetUpVariationsInfoScreen;