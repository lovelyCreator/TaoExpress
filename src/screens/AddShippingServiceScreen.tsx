import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert, // Add Alert import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ShippingService, ShippingLocation } from '../types';

// Components
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, FONTS, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import CheckIcon from '../assets/icons/CheckIcon'; // Import the updated CheckIcon

// Context
import { useShipping } from '../context/ShippingContext'; // Added import for ShippingContext

// Hooks
import { useCreateShippingServiceMutation, useUpdateShippingServiceMutation, useDeleteShippingServiceMutation } from '../hooks/useShippingServiceMutations';

// Define the location type
interface LocationItem {
  id: number;
  location: string;
  service: string;
  charge_type: string;
  one_item: string;
  additional_item: string;
}

// Simple Dropdown Component
const Dropdown = ({ value, setValue, items }: { 
  value: string; 
  setValue: (value: string) => void; 
  items: string[]; 
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (item: string) => {
    setValue(item);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <Ionicons name='chevron-down' size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      
      <Modal
        visible={visible}
        statusBarTranslucent
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.stickbarContainer}>
              <View style={styles.stickbar} />
            </View>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Option</Text>
                </View>
                <ScrollView>
                  {items.map((item, index) => (
                    <TouchableOpacity
                      key={`item-${index}`}
                      style={styles.modalItem}
                      onPress={() => handleSelect(item)}
                    >
                      <View style={styles.modalItemContent}>
                        <Text style={styles.modalItemText}>
                          {item}
                        </Text>
                        <CheckIcon 
                          size={24} 
                          isSelected={value === item} 
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

type AddShippingServiceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddShippingService'>;
type AddShippingServiceScreenRouteProp = RouteProp<RootStackParamList, 'AddShippingService'>;

const AddShippingServiceScreen = ({ 
  navigation,
  route
}: { 
  navigation: AddShippingServiceScreenNavigationProp;
  route: AddShippingServiceScreenRouteProp;
}) => {
  // Get route params with proper typing
  const { mode = 'add', shippingService } = route.params || {};
  
  const { addShippingService, updateShippingService, removeShippingService } = useShipping(); // Updated useShipping hook
  
  // Add a listener for when we navigate back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // This will run when the screen comes into focus
      console.log('AddShippingServiceScreen focused');
    });

    return unsubscribe;
  }, [navigation]);

  // Use mutations for API calls
  const { mutate: createShippingService, isLoading: isCreating, error: createError } = useCreateShippingServiceMutation({
    onSuccess: (data) => {
      // Add to context
      addShippingService(data);
      // Navigate back
      navigation.goBack();
    },
    onError: (error) => {
      console.error('Error creating shipping service:', error);
      Alert.alert('Error', error);
    }
  });

  const { mutate: updateShippingServiceApi, isLoading: isUpdating, error: updateError } = useUpdateShippingServiceMutation({
    onSuccess: (data) => {
      // Update in context
      if (data.id) {
        updateShippingService(data.id, data);
      }
      // Navigate back
      navigation.goBack();
    },
    onError: (error) => {
      console.error('Error updating shipping service:', error);
      Alert.alert('Error', error);
    }
  });

  const { mutate: deleteShippingService, isLoading: isDeleting, error: deleteError } = useDeleteShippingServiceMutation({
    onSuccess: () => {
      // Remove from context
      if (shippingService?.id) {
        removeShippingService(shippingService.id);
      }
      // Navigate back
      navigation.goBack();
    },
    onError: (error) => {
      console.error('Error deleting shipping service:', error);
      Alert.alert('Error', error);
    }
  });

  const [serviceName, setServiceName] = useState(shippingService?.service_name || '');
  const [shippingPrices, setShippingPrices] = useState(shippingService?.shipping_price_type || 'Calculated');
  const [originZipCode, setOriginZipCode] = useState(shippingService?.origin_zip || '');
  const [processingTime, setProcessingTime] = useState(shippingService?.processing_time || '3-5 days');
  
  // Initialize locations from existing shipping service or default values
  const initialLocations = shippingService?.locations && shippingService.locations.length > 0 
    ? shippingService.locations.map((loc: ShippingLocation, index: number) => ({
        id: loc.id || Date.now() + index,
        location: loc.location || (index === 0 ? 'United States' : 'Else where'),
        service: loc.service || 'UPS Ground (1-5 business days)',
        charge_type: loc.charge_type || 'Fixed price',
        one_item: loc.one_item?.toString() || '',
        additional_item: loc.additional_item?.toString() || ''
      }))
    : [
        {
          id: 1,
          location: 'United States',
          service: 'UPS Ground (1-5 business days)',
          charge_type: 'Fixed price',
          one_item: '',
          additional_item: ''
        },
        {
          id: 2,
          location: 'Else where',
          service: 'UPS Ground (1-5 business days)',
          charge_type: 'Fixed price',
          one_item: '',
          additional_item: ''
        }
      ];

  const [locations, setLocations] = useState<LocationItem[]>(initialLocations);

  const addLocation = () => {
    const newLocation: LocationItem = {
      id: Date.now(),
      location: '',
      service: 'UPS Ground (1-5 business days)',
      charge_type: 'Fixed price',
      one_item: '',
      additional_item: ''
    };
    setLocations([...locations, newLocation]);
  };

  const removeLocation = (id: number) => {
    setLocations(locations.filter((loc: LocationItem) => loc.id !== id));
  };

  const handleDelete = () => {
    if (!shippingService?.id) {
      Alert.alert('Error', 'Cannot delete shipping service: Invalid service ID');
      return;
    }

    Alert.alert(
      'Delete Shipping Service',
      'Are you sure you want to delete this shipping service? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteShippingService(shippingService?.id || 0);
          },
        },
      ]
    );
  };

  // Show error messages
  useEffect(() => {
    if (createError) {
      Alert.alert('Error', createError);
    }
  }, [createError]);

  useEffect(() => {
    if (updateError) {
      Alert.alert('Error', updateError);
    }
  }, [updateError]);

  useEffect(() => {
    if (deleteError) {
      Alert.alert('Error', deleteError);
    }
  }, [deleteError]);

  const handleSave = () => {
    // Validate required fields
    if (!serviceName.trim()) {
      Alert.alert('Error', 'Service name is required');
      return;
    }

    // TODO: Get store ID from user context instead of hardcoding
    // For now, we'll use a placeholder value, but this should be replaced with actual store ID
    const storeId = 1; // This should come from user context

    // Prepare locations data for API with proper type conversion
    const locationsData: ShippingLocation[] = locations.map((loc: LocationItem) => ({
      location: loc.location,
      service: loc.service,
      charge_type: loc.charge_type,
      one_item: parseFloat(loc.one_item) || 0,
      additional_item: parseFloat(loc.additional_item) || 0
    }));

    // Prepare shipping service data with proper type conversion
    const shippingServiceData: Omit<ShippingService, 'id' | 'created_at' | 'updated_at'> = {
      service_name: serviceName,
      shipping_price_type: shippingPrices,
      origin_zip: originZipCode,
      processing_time: processingTime,
      store_id: storeId, // This should come from user context
      locations: locationsData
    };

    // Call appropriate mutation based on mode
    if (mode === 'edit' && shippingService?.id) {
      updateShippingServiceApi({ 
        serviceId: shippingService.id, 
        serviceData: shippingServiceData 
      });
    } else {
      createShippingService({ serviceData: shippingServiceData });
    }
    // navigation.goBack();
  };

  // Show loading indicator when saving
  const isLoading = isCreating || isUpdating;
  
  // Get error message
  const errorMessage = createError || updateError;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{mode === 'edit' ? 'Edit Shipping Service' : 'Add Shipping Service'}</Text>
        
        {mode === 'edit' ? (
          <TouchableOpacity onPress={handleDelete} style={styles.backButton} disabled={isDeleting}>
            {isDeleting ? (
              <ActivityIndicator size="small" color={COLORS.text.primary} />
            ) : (
              <Ionicons name="trash" size={18} color={COLORS.text.primary} />
            )}
          </TouchableOpacity>
        ): (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Show error message if there is one */}
        {/* {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null} */}
        
        <Input
          label="Service Name"
          placeholder="eg. shipping service pro"
          value={serviceName}
          onChangeText={setServiceName}
          style={styles.section}
          inputStyle={styles.inputStyle}
        />

        <View style={styles.section}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Shipping Prices</Text>
            <Dropdown
              value={shippingPrices}
              setValue={setShippingPrices}
              items={[
                'Calculated',
                'Fixed price',
                'Custom pricing'
              ]}
            />
          </View>

          <Input
            label="Origin ZIP code"
            value={originZipCode}
            onChangeText={setOriginZipCode}
            style={styles.input}
            inputStyle={styles.inputStyle}
            keyboardType="numeric"
          />

          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Processing Time</Text>
            <Dropdown
              value={processingTime}
              setValue={setProcessingTime}
              items={['1-2 days', '3-5 days', '5-7 days']}
            />
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <Text style={[styles.locationTitle, {fontSize: FONTS.sizes.md, fontWeight: '700'}]}>Standard Shipping</Text>
          {locations.map((location: LocationItem, index: number) => (
            <View key={location.id}  style={[styles.locationInfo, index == 0 && {borderTopWidth: 0}]}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationTitle}>{location.location}</Text>
                {locations.length > 1 && (
                  <TouchableOpacity onPress={() => removeLocation(location.id)}>
                    {index != 0 &&<Text style={styles.deleteButton}>Delete</Text>}
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.dropdownContainer}>
                <Text style={styles.label}>Shipping service</Text>
                <Dropdown
                  value={location.service}
                  setValue={(value: string) => {
                    setLocations(
                      locations.map((loc: LocationItem) => 
                        loc.id === location.id ? {...loc, service: value} : loc
                      )
                    );
                  }}
                  items={['UPS Ground (1-5 business days)', 'FedEx Express', 'USPS Priority Mail']}
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Text style={styles.label}>What you'll charge</Text>
                <Dropdown
                  value={location.charge_type}
                  setValue={(value: string) => {
                    setLocations(
                      locations.map((loc: LocationItem) => 
                        loc.id === location.id ? {...loc, charge_type: value} : loc
                      )
                    );
                  }}
                  items={['Fixed price', 'Weight-based', 'Distance-based']}
                />
              </View>

              <View style={styles.pricingContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>One Item</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="$"
                    value={location.one_item}
                    onChangeText={(value) => {
                      setLocations(
                        locations.map((loc: LocationItem) => 
                          loc.id === location.id ? {...loc, one_item: value} : loc
                        )
                      );
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Additional Item</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="$"
                    value={location.additional_item}
                    onChangeText={(value) => {
                      setLocations(
                        locations.map((loc: LocationItem) => 
                          loc.id === location.id ? {...loc, additional_item: value} : loc
                        )
                      );
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addLocationButton} onPress={addLocation}>
            <Text style={styles.addLocationText}>+ Add Another Location</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.nextButtonText}>Save</Text>
          )}
        </TouchableOpacity>
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
    padding: SPACING.md,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
  },
  section: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    borderColor: COLORS.gray[100],
    padding: SPACING.smmd,
    paddingBottom: 0,
    marginBottom: SPACING.md,
  },
  inputStyle: {
    backgroundColor: COLORS.gray[50], 
    borderColor: COLORS.gray[100], 
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONTS.sizes.sm,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    backgroundColor: COLORS.gray[50],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  locationContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: 8,
    padding: 16,
    paddingBottom: 0,
    marginBottom: 16,
  },
  locationInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.md,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
  deleteButton: {
    color: '#e74c3c',
    fontSize: FONTS.sizes.sm,
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    width: '45%'
  },
  priceLabel: {
    fontSize: FONTS.sizes.sm,
    color: '#555',
    paddingBottom: SPACING.sm,
  },
  priceInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    backgroundColor: COLORS.gray[50],
    borderRadius: 4,
    paddingHorizontal: 8,
    textAlign: 'right',
  },
  addLocationButton: {
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  addLocationText: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.md,
  },
  bottomContainer: {
    padding: 16,
  },
  nextButton: {
    backgroundColor: COLORS.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 50, // Ensure consistent height when loading indicator is shown
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '400',
    color: COLORS.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  stickbarContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stickbar: {
    width: '10%',
    height: 15,
    borderTopColor: COLORS.white,
    borderTopWidth: 3,
    borderRadius: 2,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: FONTS.sizes.md,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    opacity: 0.8,
  },
  errorText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
  },
});

export default AddShippingServiceScreen;