import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { CustomSwitchProps, RootStackParamList } from '../types';
import { useCreateAddressMutation } from '../hooks/useAddressMutations';
import { AddressSearchModal } from '../components';

type AddNewAddressScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddNewAddress'>;
type AddNewAddressScreenRouteProp = RouteProp<RootStackParamList, 'AddNewAddress'>;

const AddNewAddressScreen: React.FC = () => {
  const navigation = useNavigation<AddNewAddressScreenNavigationProp>();
  const route = useRoute<AddNewAddressScreenRouteProp>();
  
  const [formData, setFormData] = useState({
    street: '',
    apiSuiteNumber: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [isPrimary, setIsPrimary] = useState(false);
  const [isStoreAddress, setIsStoreAddress] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  
  const { 
    mutate: createAddress, 
    isLoading, 
    isError, 
    error,
    isSuccess
  } = useCreateAddressMutation({
    onSuccess: (data) => {
      Alert.alert(
        'Success',
        'Your address has been saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', error || 'Failed to save address. Please try again.');
    }
  });
  
  // Check if we came from shipping settings
  const fromShippingSettings = route.params?.fromShippingSettings || false;

  const handleSelectAddress = (address: any) => {
    setFormData(prev => ({
      ...prev,
      apiSuiteNumber: address.roadAddress,
      zipCode: address.postalCode,
    }));
  };

  const handleSaveAddress = () => {
    if ( !formData.street || !formData.city || !formData.state || !formData.zipCode) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Validate ZIP code is a number
    const zipCodeNumber = parseInt(formData.zipCode, 10);
    if (isNaN(zipCodeNumber)) {
      Alert.alert('Invalid ZIP Code', 'Please enter a valid numeric ZIP code.');
      return;
    }

    // Create the address data
    const addressData = {
      address: formData.street,
      apt: formData.apiSuiteNumber,
      city: formData.city,
      state: formData.state,
      zip_code: zipCodeNumber,
      is_primary_address: isPrimary ? 1 : 0,
      is_store_address: isStoreAddress ? 1 : 0,
      phone: '',
    };

    // Call the create address mutation
    createAddress({ addressData, moduleId: 2 });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Add Shipping Address</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const CustomSwitch: React.FC<CustomSwitchProps> = ({
    value,
    onChange,
    activeColor = "#ff007f",
    inactiveColor = "#ccc",
    style,
  }) => {
    const [animation] = useState(new Animated.Value(value ? 1 : 0));

    useEffect(() => {
      Animated.timing(animation, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [value]);

    const interpolateBackground = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [inactiveColor, activeColor],
    });

    const translateX = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 22],
    });

    const toggleSwitch = () => {
      onChange(!value);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleSwitch}
        style={style}
      >
        <Animated.View
          style={[
            styles.switchBackground,
            { backgroundColor: interpolateBackground },
          ]}
        >
          <Animated.View
            style={[
              styles.circle,
              { transform: [{ translateX }] },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Type Selection */}
          <View style={styles.typeSection}>
            <Text style={styles.typeLabel}>
              Type<Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.typeOptions}>
              <TouchableOpacity
                style={styles.typeOption}
                onPress={() => setIsStoreAddress(false)}
                disabled={isLoading}
              >
                <View style={[styles.radioButton, !isStoreAddress && styles.radioButtonSelected]}>
                  {!isStoreAddress && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.typeOptionText}>Personal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.typeOption}
                onPress={() => setIsStoreAddress(true)}
                disabled={isLoading}
              >
                <View style={[styles.radioButton, isStoreAddress && styles.radioButtonSelected]}>
                  {isStoreAddress && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.typeOptionText}>Business</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recipient Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Recipient<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.street}
              onChangeText={(text) => setFormData(prev => ({ ...prev, street: text }))}
              placeholder="Please enter the recipient's real name"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isLoading}
            />
          </View>

          {/* Basic Address */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>
                Basic Address<Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity onPress={() => setShowAddressSearch(true)}>
                <Text style={styles.importLink}>Import</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.apiSuiteNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, apiSuiteNumber: text }))}
              placeholder="Please enter your address"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isLoading}
            />
            <Text style={styles.helperText}>Please enter the recipient's real name</Text>
          </View>

          {/* Detailed Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Detailed Address</Text>
            <TextInput
              style={styles.textInput}
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              placeholder="Detailed Address"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isLoading}
            />
          </View>

          {/* Postal Code */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Postal Code<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.zipCode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, zipCode: text }))}
              placeholder="Postal Code"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>

          {/* Contact Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Contact Number<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.state}
              onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
              placeholder="Contact Number"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          {/* Unified Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Please enter your unified number<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Please enter your unified number"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isLoading}
            />
          </View>

          {/* Delivery Note */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Note</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Please enter delivery note."
              placeholderTextColor={COLORS.gray[400]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          {/* Set as Default */}
          <TouchableOpacity 
            style={styles.defaultAddressContainer}
            onPress={() => setIsPrimary(!isPrimary)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.defaultAddressText}>Set as Default Address</Text>
            <CustomSwitch
              value={isPrimary}
              onChange={setIsPrimary}
              activeColor={COLORS.accentPink}
              inactiveColor={COLORS.gray[300]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveAddress}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddressSearchModal
        visible={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        onSelectAddress={handleSelectAddress}
      />
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
    paddingVertical: SPACING.sm,
    paddingTop: SPACING['2xl'],
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  typeSection: {
    marginBottom: SPACING.lg,
  },
  typeLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  required: {
    color: COLORS.error,
    marginLeft: 2,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.accentPink,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accentPink,
  },
  typeOptionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  importLink: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  helperText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  defaultAddressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  defaultAddressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  checkboxSelected: {
    backgroundColor: COLORS.accentPink,
    borderColor: COLORS.accentPink,
  },
  bottomContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    paddingBottom: SPACING['3xl'],
  },
  saveButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.smmd,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.accentPinkLight,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  switchBackground: {
    width: SPACING['2xl'],
    height: SPACING.lg,
    borderRadius: 20,
    justifyContent: "center",
    padding: 2,
  },
  circle: {
    width: SPACING.mdlg,
    height: SPACING.mdlg,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
  },
});

export default AddNewAddressScreen;