import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../constants';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

const LocationScreen: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      // Remove mock data and use empty array instead
      // Mock data - in a real app, this would come from the API
      // const mockAddresses: Address[] = [
      //   {
      //     id: '1',
      //     name: 'John Doe',
      //     street: '123 Main Street',
      //     city: 'New York',
      //     state: 'NY',
      //     zipCode: '10001',
      //     phone: '+1 (555) 123-4567',
      //     isDefault: true,
      //   },
      //   {
      //     id: '2',
      //     name: 'John Doe',
      //     street: '456 Oak Avenue',
      //     city: 'Los Angeles',
      //     state: 'CA',
      //     zipCode: '90210',
      //     phone: '+1 (555) 987-6543',
      //     isDefault: false,
      //   },
      // ];
      // setAddresses(mockAddresses);
      
      // Use empty array instead of mock data
      setAddresses([]);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
    });
    setShowAddForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
    });
    setShowAddForm(true);
  };

  const handleSaveAddress = () => {
    if (!formData.name || !formData.street || !formData.city || !formData.state || !formData.zipCode || !formData.phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const newAddress: Address = {
      id: editingAddress?.id || Date.now().toString(),
      name: formData.name,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      phone: formData.phone,
      isDefault: editingAddress?.isDefault || addresses.length === 0,
    };

    if (editingAddress) {
      setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? newAddress : addr));
    } else {
      setAddresses(prev => [...prev, newAddress]);
    }

    setShowAddForm(false);
    setEditingAddress(null);
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
    });
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
          onPress: () => {
            setAddresses(prev => prev.filter(addr => addr.id !== addressId));
          },
        },
      ]
    );
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    })));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {/* Handle back */}}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Addresses</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddAddress}
      >
        <Ionicons name="add" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderAddressForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {editingAddress ? 'Edit Address' : 'Add New Address'}
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Enter your full name"
          placeholderTextColor={COLORS.gray[400]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Street Address *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.street}
          onChangeText={(text) => setFormData(prev => ({ ...prev, street: text }))}
          placeholder="Enter street address"
          placeholderTextColor={COLORS.gray[400]}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 2 }]}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.city}
            onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
            placeholder="City"
            placeholderTextColor={COLORS.gray[400]}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
          <Text style={styles.inputLabel}>State *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.state}
            onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
            placeholder="State"
            placeholderTextColor={COLORS.gray[400]}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>ZIP Code *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.zipCode}
            onChangeText={(text) => setFormData(prev => ({ ...prev, zipCode: text }))}
            placeholder="ZIP"
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 2, marginLeft: SPACING.sm }]}>
          <Text style={styles.inputLabel}>Phone *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            placeholder="Phone number"
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowAddForm(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveAddress}
        >
          <Text style={styles.saveButtonText}>Save Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <Text style={styles.addressName}>{item.name}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(item)}
          >
            <Ionicons name="pencil" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(item.id)}
          >
            <Ionicons name="trash" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.addressDetails}>
        <Text style={styles.addressText}>{item.street}</Text>
        <Text style={styles.addressText}>
          {item.city}, {item.state} {item.zipCode}
        </Text>
        <Text style={styles.addressText}>{item.phone}</Text>
      </View>

      {!item.isDefault && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(item.id)}
        >
          <Text style={styles.setDefaultButtonText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="location-outline" size={64} color={COLORS.gray[400]} />
      </View>
      <Text style={styles.emptyTitle}>No Addresses Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first address to get started with faster checkout.
      </Text>
      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={handleAddAddress}
      >
        <Text style={styles.addFirstButtonText}>Add Address</Text>
      </TouchableOpacity>
    </View>
  );

  if (showAddForm) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.scrollView}>
          {renderAddressForm()}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {addresses.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id}
          style={styles.addressesList}
          contentContainerStyle={styles.addressesListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  addButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  formTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
  },
  row: {
    flexDirection: 'row',
  },
  formButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '500',
    color: COLORS.white,
  },
  addressesList: {
    flex: 1,
  },
  addressesListContent: {
    padding: SPACING.md,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  addressInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  defaultBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  addressDetails: {
    marginBottom: SPACING.sm,
  },
  addressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  setDefaultButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  addFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  addFirstButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default LocationScreen;
