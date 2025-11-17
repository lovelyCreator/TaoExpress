import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { RootStackParamList } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import { Address, PaymentMethod } from '../types';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Set default address and payment method if available
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddress);
    }
    if (user?.paymentMethods && user.paymentMethods.length > 0) {
      const defaultPayment = user.paymentMethods.find(pm => pm.isDefault) || user.paymentMethods[0];
      setSelectedPaymentMethod(defaultPayment);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    if (cart.items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user?.id || '1',
        items: cart.items,
        status: 'pending' as const,
        total: cart.total,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        promoCode: cart.promoCode,
        shippingAddress: selectedAddress,
        billingAddress: selectedAddress, // In a real app, this might be different
        paymentMethod: selectedPaymentMethod,
      };

      const response = await ordersApi.createOrder(orderData);
      if (response.success) {
        clearCart();
        navigation.navigate('OrderConfirmation', { orderId: response.data.id });
      } else {
        Alert.alert('Error', 'Failed to place order. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Checkout</Text>
    </View>
  );

  const renderAddressSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddressBook' as never)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      {selectedAddress ? (
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressName}>{selectedAddress.name}</Text>
            <Text style={styles.addressType}>{selectedAddress.type}</Text>
          </View>
          <Text style={styles.addressText}>
            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
          </Text>
          <Text style={styles.addressCountry}>{selectedAddress.country}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={() => navigation.navigate('AddressBook' as never)}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
          <Text style={styles.addAddressText}>Add Address</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPaymentSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      {selectedPaymentMethod ? (
        <View style={styles.paymentCard}>
          <View style={styles.paymentIcon}>
            <Ionicons
              name={selectedPaymentMethod.type === 'card' ? 'card' : 'wallet'}
              size={24}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentType}>
              {selectedPaymentMethod.type === 'card' 
                ? `${selectedPaymentMethod.brand} •••• ${selectedPaymentMethod.last4}`
                : selectedPaymentMethod.type.toUpperCase()
              }
            </Text>
            {selectedPaymentMethod.type === 'card' && (
              <Text style={styles.paymentExpiry}>
                Expires {selectedPaymentMethod.expiryMonth}/{selectedPaymentMethod.expiryYear}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addPaymentButton}
          onPress={() => navigation.navigate('PaymentMethods')}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
          <Text style={styles.addPaymentText}>Add Payment Method</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderOrderItems = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Items</Text>
      {cart.items.map((item) => (
        <View key={item.id} style={styles.orderItem}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product.name}
            </Text>
            <Text style={styles.itemDetails}>
              Qty: {item.quantity}
              {item.selectedSize && ` • Size: ${item.selectedSize}`}
              {item.selectedColor && ` • Color: ${item.selectedColor.name}`}
            </Text>
          </View>
          <Text style={styles.itemPrice}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Shipping</Text>
        <Text style={styles.summaryValue}>
          {cart.shipping === 0 ? 'Free' : `$${cart.shipping.toFixed(2)}`}
        </Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tax</Text>
        <Text style={styles.summaryValue}>${cart.tax.toFixed(2)}</Text>
      </View>
      
      {cart.discount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: COLORS.success }]}>Discount</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            -${cart.discount.toFixed(2)}
          </Text>
        </View>
      )}
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${cart.total.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderNotesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Add special instructions for your order..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        placeholderTextColor={COLORS.text.secondary}
      />
    </View>
  );

  const renderPlaceOrderButton = () => (
    <View style={styles.placeOrderContainer}>
      <View style={styles.orderSummary}>
        <View style={styles.orderTotalRow}>
          <Text style={styles.orderTotalLabel}>Total</Text>
          <Text style={styles.orderTotalValue}>${cart.total.toFixed(2)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.placeOrderButton}
        onPress={handlePlaceOrder}
        disabled={loading || !selectedAddress || !selectedPaymentMethod}
      >
        <LinearGradient
          colors={[COLORS.gradients.primary[0], COLORS.gradients.primary[1]]}
          style={styles.placeOrderGradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="card" size={20} color={COLORS.white} />
              <Text style={styles.placeOrderText}>Place Order</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderAddressSection()}
        {renderPaymentSection()}
        {renderOrderItems()}
        {renderOrderSummary()}
        {renderNotesSection()}
      </ScrollView>
      {renderPlaceOrderButton()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.sm,
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  editText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  addressName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  addressType: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textTransform: 'capitalize',
  },
  addressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  addressCountry: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  paymentExpiry: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addPaymentText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  itemName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
  },
  itemPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    textAlignVertical: 'top',
  },
  placeOrderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  orderSummary: {
    flex: 1,
    marginRight: SPACING.md,
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  orderTotalValue: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  placeOrderButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    minWidth: 160,
  },
  placeOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  placeOrderText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
});

export default CheckoutScreen;
