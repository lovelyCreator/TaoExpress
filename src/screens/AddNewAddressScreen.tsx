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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { CustomSwitchProps, RootStackParamList } from '../types';
import { useCreateAddressMutation } from '../hooks/useAddressMutations';

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
      <Text style={styles.headerTitle}>New Address</Text>
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
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.textInput}
              value={formData.street}
              onChangeText={(text) => setFormData(prev => ({ ...prev, street: text }))}
              placeholder="Enter your street address"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Apt or suite number</Text>
            <TextInput
              style={styles.textInput}
              value={formData.apiSuiteNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, apiSuiteNumber: text }))}
              placeholder="Enter your apt or suite number"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              style={styles.textInput}
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              placeholder="Enter city"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>State</Text>
            <TextInput
              style={styles.textInput}
              value={formData.state}
              onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
              placeholder="Enter state"
              placeholderTextColor={COLORS.gray[400]}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ZIP Code</Text>
            <TextInput
              style={styles.textInput}
              value={formData.zipCode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, zipCode: text }))}
              placeholder="Enter ZIP code"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity 
            style={styles.primaryAddressContainer}
            onPress={() => setIsPrimary(!isPrimary)}
            activeOpacity={0.7}
            disabled={isLoading}
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
              disabled={isLoading}
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
  placeholder: {
    width: 24,
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
  },
  saveButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  saveButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
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