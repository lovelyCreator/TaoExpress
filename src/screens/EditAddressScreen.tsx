import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { RootStackParamList, Address, CustomSwitchProps, ApiAddress } from '../types';
import { useUpdateAddressMutation, useDeleteAddressMutation } from '../hooks/useAddressMutations';

type EditAddressScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditAddress'>;
type EditAddressScreenRouteProp = RouteProp<RootStackParamList, 'EditAddress'>;

const EditAddressScreen: React.FC = () => {
  const navigation = useNavigation<EditAddressScreenNavigationProp>();
  const route = useRoute<EditAddressScreenRouteProp>();
  const fromShippingSettings = route.params?.fromShippingSettings || false;
  const { address } = route.params;
  
  const [formData, setFormData] = useState({
    street: address.street || '',
    apiSuiteNumber: address.phone || '',
    city: address.city || '',
    state: address.state || '',
    zipCode: address.zipCode || '',
    isPrimary: address.isDefault || false,
  });
  const [isPrimary, setIsPrimary] = useState(address.isDefault);
  const [isStoreAddress, setIsStoreAddress] = useState((address as any).isStoreAddress || false);
  
  const { 
    mutate: updateAddress, 
    isLoading: isUpdating, 
    isError: isUpdateError, 
    error: updateError,
    isSuccess: isUpdateSuccess
  } = useUpdateAddressMutation({
    onSuccess: (data) => {
      Alert.alert(
        'Success',
        'Your address has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', error || 'Failed to update address. Please try again.');
    }
  });
  
  const { 
    mutate: deleteAddressApi, 
    isLoading: isDeleting, 
    isError: isDeleteError, 
    error: deleteError,
    isSuccess: isDeleteSuccess
  } = useDeleteAddressMutation({
    onSuccess: (data) => {
      Alert.alert(
        'Success',
        'Your address has been deleted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', error || 'Failed to delete address. Please try again.');
    }
  });

  const handleSaveAddress = () => {
    if (!formData.apiSuiteNumber || !formData.street || !formData.city || !formData.state || !formData.zipCode) {
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
      id: parseInt(address.id, 10),
      address: formData.street,
      apt: '', // Keep this for type compatibility but we're not using it
      city: formData.city,
      state: formData.state,
      zip_code: zipCodeNumber,
      is_primary_address: isPrimary ? 1 : 0,
      is_store_address: isStoreAddress ? 1 : 0,
      phone: formData.apiSuiteNumber,
    };

    // Call the update address mutation
    updateAddress({ addressData, moduleId: 2 });
  };

  const handleDeleteAddress = () => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Call the delete address mutation
            deleteAddressApi({ addressId: parseInt(address.id, 10), moduleId: 2 });
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Edit Address</Text>
      <TouchableOpacity
        style={styles.deleteButtonHeader}
        onPress={handleDeleteAddress}
        disabled={isUpdating || isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={COLORS.error} />
        ) : (
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        )}
      </TouchableOpacity>
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
        disabled={isUpdating || isDeleting}
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
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.textInput}
              value={formData.street}
              onChangeText={(text) => setFormData(prev => ({ ...prev, street: text }))}
              placeholder="Enter street address"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isUpdating && !isDeleting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.apiSuiteNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, apiSuiteNumber: text }))}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="phone-pad"
              editable={!isUpdating && !isDeleting}
            />
          </View>


          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>City *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              placeholder="Enter city"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isUpdating && !isDeleting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>State *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.state}
              onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
              placeholder="Enter state"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isUpdating && !isDeleting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ZIP Code *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.zipCode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, zipCode: text }))}
              placeholder="Enter ZIP code"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
              editable={!isUpdating && !isDeleting}
            />
          </View>

          <TouchableOpacity 
            style={styles.primaryAddressContainer}
            onPress={() => setIsPrimary(!isPrimary)}
            activeOpacity={0.7}
            disabled={isUpdating || isDeleting}
          >
            <View style={styles.primaryAddressRow}>
              <Text style={styles.primaryAddressText}>Set as Primary Address</Text>
              <View style={styles.checkbox}>
                <CustomSwitch
                  value={isPrimary}
                  onChange={setIsPrimary}
                  activeColor={COLORS.accentPink}
                  inactiveColor={COLORS.gray[300]}
                />
              </View>
            </View>
          </TouchableOpacity>
          
          {fromShippingSettings && (
            <TouchableOpacity 
              style={styles.primaryAddressContainer}
              onPress={() => setIsStoreAddress(!isStoreAddress)}
              activeOpacity={0.7}
              disabled={isUpdating || isDeleting}
            >
              <View style={styles.primaryAddressRow}>
                <View style={styles.checkbox}>
                  <CustomSwitch
                    value={isStoreAddress}
                    onChange={setIsStoreAddress}
                    activeColor={COLORS.accentPink}
                    inactiveColor={COLORS.gray[300]}
                  />
                </View>
                <Text style={styles.primaryAddressText}>Set as Store Address</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.deleteButton, (isUpdating || isDeleting) && styles.buttonDisabled]}
            onPress={handleDeleteAddress}
            activeOpacity={0.8}
            disabled={isUpdating || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={COLORS.black} />
            ) : (
              <Text style={styles.deleteButtonText}>Delete</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, (isUpdating || isDeleting) && styles.buttonDisabled]}
            onPress={handleSaveAddress}
            activeOpacity={0.8}
            disabled={isUpdating || isDeleting}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  deleteButtonHeader: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    backgroundColor: COLORS.gray[50],
  },
  row: {
    flexDirection: 'row',
  },
  primaryAddressContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.smmd,
    marginBottom: SPACING.md,
  },
  primaryAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  primaryAddressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    gap: '5%',
    justifyContent: 'space-between',
  },
  deleteButton: {
    backgroundColor: COLORS.gray[50],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
    width: '45%',
  },
  deleteButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
  },
  saveButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    width: '45%',
  },
  saveButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.5,
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

export default EditAddressScreen;