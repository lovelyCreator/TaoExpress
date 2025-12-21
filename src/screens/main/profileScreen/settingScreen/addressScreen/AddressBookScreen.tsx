import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../constants';
import { RootStackParamList, Address } from '../../../../../types';
import { useAuth } from '../../../../../context/AuthContext';

type AddressBookScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddressBook'>;
type AddressBookScreenRouteProp = RouteProp<RootStackParamList, 'AddressBook'>;

const AddressBookScreen: React.FC = () => {
  const navigation = useNavigation<AddressBookScreenNavigationProp>();
  const route = useRoute<AddressBookScreenRouteProp>();
  const { user, updateUser } = useAuth();
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  // Check if we came from shipping settings
  const fromShippingSettings = route.params?.fromShippingSettings || false;
  
  // Get addresses from saved user data
  const addresses = user?.addresses || [];

  const handleAddAddress = () => {
    // Pass info about whether we came from shipping settings
    const fromShippingSettings = route.params?.fromShippingSettings || false;
    navigation.navigate('AddNewAddress', { fromShippingSettings });
  };

  const handleEditAddress = (address: Address) => {
    // Pass info about whether we came from shipping settings
    const fromShippingSettings = route.params?.fromShippingSettings || false;
    
    navigation.navigate('EditAddress', { address, fromShippingSettings });
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Remove address from saved addresses
            const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
            await updateUser({ addresses: updatedAddresses });
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
      <Text style={styles.headerTitle}>Your Address</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderAddressItem = ({ item }: { item: Address }) => {
    const isSelected = selectedAddressId === item.id;
    
    return (
      <View style={styles.addressCard}>
        <View style={styles.addressRow}>
          <View style={{height: '90%'}}>
            <Ionicons name="location" size={20} color={COLORS.red} />
          </View>
          <TouchableOpacity 
            style={styles.addressInfo}
            onPress={() => handleEditAddress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.addressHeader}>
              <Text style={styles.addressName}>{item.name || user?.name || 'Unnamed'}</Text>
              <Text style={styles.addressPhone}>{item.phone || ''}</Text>
            </View>
            <Text style={styles.addressText}>
              {item.street || ''} {item.zipCode ? `, ${item.zipCode}` : ''}
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
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id}
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
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  addNewButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.smmd,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  addNewButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
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