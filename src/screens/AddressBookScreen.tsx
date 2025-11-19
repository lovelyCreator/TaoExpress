import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { RootStackParamList, Address, ApiAddress } from '../types';
import { useAuth } from '../context/AuthContext';
import { useGetAddressesMutation, useDeleteAddressMutation } from '../hooks/useAddressMutations';

type AddressBookScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddressBook'>;
type AddressBookScreenRouteProp = RouteProp<RootStackParamList, 'AddressBook'>;

const AddressBookScreen: React.FC = () => {
  const navigation = useNavigation<AddressBookScreenNavigationProp>();
  const route = useRoute<AddressBookScreenRouteProp>();
  const { user, updateUser } = useAuth();
  
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  // Check if we came from shipping settings
  const fromShippingSettings = route.params?.fromShippingSettings || false;
  
  const { 
    mutate: fetchAddresses, 
    isLoading: isFetchingAddresses,
    isError: isFetchAddressesError,
    error: fetchAddressesError
  } = useGetAddressesMutation({
    onSuccess: (data) => {
      if (data && data.data.length > 0) {
        setAddresses(data.data);
        // Set the first address as selected by default
        setSelectedAddressId(data.data[0].id);
      } else {
        setAddresses([]);
        setSelectedAddressId(null);
      }
    },
    onError: (error) => {
      Alert.alert('Error', error || 'Failed to fetch addresses');
    }
  });
  
  const { 
    mutate: deleteAddressApi, 
    isLoading: isDeletingAddress,
    isError: isDeleteAddressError,
    error: deleteAddressError
  } = useDeleteAddressMutation({
    onSuccess: (data) => {
      // Refresh the addresses list
      fetchAddresses(2);
      Alert.alert('Success', 'Address deleted successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error || 'Failed to delete address');
    }
  });

  // Fetch addresses only once when the component mounts
  useEffect(() => {
    fetchAddresses(2);
  }, []);

  const handleAddAddress = () => {
    // Pass info about whether we came from shipping settings
    const fromShippingSettings = route.params?.fromShippingSettings || false;
    navigation.navigate('AddNewAddress', { fromShippingSettings });
  };

  const handleEditAddress = (address: ApiAddress) => {
    // Pass info about whether we came from shipping settings
    const fromShippingSettings = route.params?.fromShippingSettings || false;
    
    // Convert ApiAddress to Address for navigation
    const convertedAddress: Address = {
      id: address.id.toString(),
      name: user?.name || address.contact_person_name || '',
      phone: address.phone,
      street: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code.toString(),
      country: '', // Not provided in API
      type: address.address_type === '1' ? 'home' : address.address_type === '2' ? 'work' : 'other',
      isDefault: address.is_primary_address === 1,
      // Pass store address info as a custom property
      isStoreAddress: address.is_store_address === 1,
    } as Address & { isStoreAddress: boolean };
    
    navigation.navigate('EditAddress', { address: convertedAddress, fromShippingSettings });
  };

  const handleDeleteAddress = (addressId: number) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddressApi({ addressId, moduleId: 2 }),
        },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#FFE4E6', '#FFF0F1', '#FFFFFF']}
      style={styles.header}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Your Address</Text>
      <View style={styles.placeholder} />
    </LinearGradient>
  );

  const renderAddressItem = ({ item }: { item: ApiAddress }) => {
    const isSelected = selectedAddressId === item.id;
    
    return (
      <View style={styles.addressCard}>
        <View style={styles.addressRow}>
          <View style={{height: '90%'}}>
            <Ionicons name="location" size={20} color={COLORS.accentPink} />
          </View>
          <TouchableOpacity 
            style={styles.addressInfo}
            onPress={() => handleEditAddress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.addressHeader}>
              <Text style={styles.addressName}>{user?.name || item.contact_person_name || 'Unnamed'}</Text>
              <Text style={styles.addressPhone}>{item.phone}</Text>
            </View>
            <Text style={styles.addressText}>
              {item.address}, {item.city}, {item.state} {item.zip_code}
            </Text>
          </TouchableOpacity>
          <View style={styles.addressActions}>
            <TouchableOpacity 
              style={styles.radioButton}
              onPress={() => setSelectedAddressId(item.id)}
            >
              <View style={[styles.cartCheckBox, isSelected && styles.cartCheckBoxSelected]}>
                {isSelected && (
                  <Ionicons name="checkmark-sharp" size={14} color={COLORS.white} />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteAddress(item.id)}
              disabled={isDeletingAddress}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isFetchingAddresses && addresses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.addressListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No addresses found</Text>
              <Text style={styles.emptySubtext}>Add a new address to get started</Text>
            </View>
          }
        />
        
        <TouchableOpacity 
          style={styles.addNewButton}
          onPress={handleAddAddress}
          activeOpacity={0.7}
          disabled={isFetchingAddresses || isDeletingAddress}
        >
          <Text style={styles.addNewButtonText}>Add New Address</Text>
        </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  addressListContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.smmd,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  addressInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  addressName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  addressPhone: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
  },
  addressText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  cartCheckBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCheckBoxSelected: {
    backgroundColor: COLORS.accentPink,
    borderColor: COLORS.accentPink,
  },
  addNewButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addNewButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
});

export default AddressBookScreen;