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

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../constants';
import { RootStackParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Address, PaymentMethod } from '../../../types';
import { useRoute, RouteProp } from '@react-navigation/native';
import PhotoCaptureModal from '../../../components/PhotoCaptureModal';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const route = useRoute<CheckoutScreenRouteProp>();
  // Cart context removed - using local state
  const [cart, setCart] = useState({
    items: [] as any[],
    total: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    promoCode: '',
  });
  const clearCart = () => {
    // Cart API removed
    setCart({
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      promoCode: '',
    });
  };
  const { user } = useAuth();
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    route.params?.selectedAddress || null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('deposit'); // 'deposit', 'kakao', 'naver', 'card'
  const [selectedTransferMethod, setSelectedTransferMethod] = useState<string>('air_ship'); // 'air_ship' or 'general'
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [photoCaptureVisible, setPhotoCaptureVisible] = useState(false);
  const [designatedShootingData, setDesignatedShootingData] = useState<{
    quantity: number;
    request: string;
    photos: string[];
  } | null>(null);

  useEffect(() => {
    // Set default address if available and no address from params
    if (!selectedAddress && user?.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [user, selectedAddress]);

  // Update selected address when route params change
  useEffect(() => {
    if (route.params?.selectedAddress) {
      setSelectedAddress(route.params.selectedAddress);
    }
  }, [route.params?.selectedAddress]);

  const handlePhotoCaptureConfirm = (data: { quantity: number; request: string; photos: string[] }) => {
    setDesignatedShootingData(data);
    setPhotoCaptureVisible(false);
  };

  const handleSelectAddress = () => {
    navigation.navigate('SelectAddress', {
      selectedAddressId: selectedAddress?.id,
      onSelect: (address: Address) => {
        setSelectedAddress(address);
      },
    });
  };

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
        transferMethod: selectedTransferMethod,
        designatedShooting: designatedShootingData,
      };

      // API call removed
      const response = { success: false, message: 'API removed' };
      if (response.success) {
        clearCart();
        // navigation.navigate('OrderConfirmation', { orderId: response.data.id });
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
        <TouchableOpacity onPress={handleSelectAddress}>
          <Text style={styles.editText}>Select</Text>
        </TouchableOpacity>
      </View>
      
      {selectedAddress ? (
        <TouchableOpacity 
          style={styles.addressCard}
          onPress={handleSelectAddress}
          activeOpacity={0.7}
        >
          <View style={styles.addressHeader}>
            <Text style={styles.addressName}>{selectedAddress.name}</Text>
            <Text style={styles.addressType}>{selectedAddress.type}</Text>
          </View>
          <Text style={styles.addressText}>
            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
          </Text>
          <Text style={styles.addressCountry}>{selectedAddress.country}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={handleSelectAddress}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
          <Text style={styles.addAddressText}>Select Address</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDesignatedShootingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Designated Shooting</Text>
        <TouchableOpacity 
          onPress={() => setPhotoCaptureVisible(true)}
          style={styles.cameraIconButton}
        >
          <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {designatedShootingData ? (
        <View style={styles.designatedShootingCard}>
          <View style={styles.designatedShootingInfo}>
            <Text style={styles.designatedShootingLabel}>Quantity: {designatedShootingData.quantity}</Text>
            {designatedShootingData.request && (
              <Text style={styles.designatedShootingText} numberOfLines={2}>
                Request: {designatedShootingData.request}
              </Text>
            )}
            {designatedShootingData.photos.length > 0 && (
              <Text style={styles.designatedShootingText}>
                Photos: {designatedShootingData.photos.length}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setPhotoCaptureVisible(true)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addDesignatedShootingButton}
          onPress={() => setPhotoCaptureVisible(true)}
        >
          <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
          <Text style={styles.addDesignatedShootingText}>Add Designated Shooting</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPaymentSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
      </View>
      
      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === 'deposit' && styles.paymentOptionSelected
          ]}
          onPress={() => setSelectedPaymentMethod('deposit')}
        >
          <View style={styles.paymentOptionContent}>
            <View style={[styles.paymentIcon, selectedPaymentMethod === 'deposit' && styles.paymentIconSelected]}>
              <Ionicons name="wallet" size={24} color={selectedPaymentMethod === 'deposit' ? COLORS.white : COLORS.primary} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentType, selectedPaymentMethod === 'deposit' && styles.paymentTypeSelected]}>
                Deposit
              </Text>
              <Text style={[styles.paymentDescription, selectedPaymentMethod === 'deposit' && styles.paymentDescriptionSelected]}>
                Pay with deposit balance
              </Text>
            </View>
          </View>
          <View style={[styles.radioCircle, selectedPaymentMethod === 'deposit' && styles.radioCircleSelected]}>
            {selectedPaymentMethod === 'deposit' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === 'kakao' && styles.paymentOptionSelected
          ]}
          onPress={() => setSelectedPaymentMethod('kakao')}
        >
          <View style={styles.paymentOptionContent}>
            <View style={[styles.paymentIcon, selectedPaymentMethod === 'kakao' && styles.paymentIconSelected]}>
              <Ionicons name="chatbubble" size={24} color={selectedPaymentMethod === 'kakao' ? COLORS.white : '#FEE500'} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentType, selectedPaymentMethod === 'kakao' && styles.paymentTypeSelected]}>
                Kakao Pay
              </Text>
              <Text style={[styles.paymentDescription, selectedPaymentMethod === 'kakao' && styles.paymentDescriptionSelected]}>
                Pay with Kakao Pay
              </Text>
            </View>
          </View>
          <View style={[styles.radioCircle, selectedPaymentMethod === 'kakao' && styles.radioCircleSelected]}>
            {selectedPaymentMethod === 'kakao' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === 'naver' && styles.paymentOptionSelected
          ]}
          onPress={() => setSelectedPaymentMethod('naver')}
        >
          <View style={styles.paymentOptionContent}>
            <View style={[styles.paymentIcon, selectedPaymentMethod === 'naver' && styles.paymentIconSelected]}>
              <Ionicons name="logo-html5" size={24} color={selectedPaymentMethod === 'naver' ? COLORS.white : '#03C75A'} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentType, selectedPaymentMethod === 'naver' && styles.paymentTypeSelected]}>
                Naver Pay
              </Text>
              <Text style={[styles.paymentDescription, selectedPaymentMethod === 'naver' && styles.paymentDescriptionSelected]}>
                Pay with Naver Pay
              </Text>
            </View>
          </View>
          <View style={[styles.radioCircle, selectedPaymentMethod === 'naver' && styles.radioCircleSelected]}>
            {selectedPaymentMethod === 'naver' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === 'card' && styles.paymentOptionSelected
          ]}
          onPress={() => setSelectedPaymentMethod('card')}
        >
          <View style={styles.paymentOptionContent}>
            <View style={[styles.paymentIcon, selectedPaymentMethod === 'card' && styles.paymentIconSelected]}>
              <Ionicons name="card" size={24} color={selectedPaymentMethod === 'card' ? COLORS.white : COLORS.primary} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentType, selectedPaymentMethod === 'card' && styles.paymentTypeSelected]}>
                New Card
              </Text>
              <Text style={[styles.paymentDescription, selectedPaymentMethod === 'card' && styles.paymentDescriptionSelected]}>
                Pay with new card
              </Text>
            </View>
          </View>
          <View style={[styles.radioCircle, selectedPaymentMethod === 'card' && styles.radioCircleSelected]}>
            {selectedPaymentMethod === 'card' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransferMethodSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transfer Method</Text>
      </View>
      
      <View style={styles.transferOptions}>
        <TouchableOpacity
          style={[
            styles.transferOption,
            selectedTransferMethod === 'air_ship' && styles.transferOptionSelected
          ]}
          onPress={() => setSelectedTransferMethod('air_ship')}
        >
          <View style={styles.transferOptionContent}>
            <View style={styles.transferIcon}>
              <Ionicons name="airplane" size={24} color={selectedTransferMethod === 'air_ship' ? COLORS.primary : COLORS.gray[500]} />
            </View>
            <View style={styles.transferInfo}>
              <Text style={[styles.transferType, selectedTransferMethod === 'air_ship' && styles.transferTypeSelected]}>
                Air or Ship
              </Text>
            </View>
          </View>
          <View style={[styles.radioCircle, selectedTransferMethod === 'air_ship' && styles.radioCircleSelected]}>
            {selectedTransferMethod === 'air_ship' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.transferOption,
            selectedTransferMethod === 'general' && styles.transferOptionSelected
          ]}
          onPress={() => setSelectedTransferMethod('general')}
        >
          <View style={styles.transferOptionContent}>
            <View style={styles.transferIcon}>
              <Ionicons name="cube" size={24} color={selectedTransferMethod === 'general' ? COLORS.primary : COLORS.gray[500]} />
            </View>
            <View style={styles.transferInfo}>
              <Text style={[styles.transferType, selectedTransferMethod === 'general' && styles.transferTypeSelected]}>
                General, VVIC, Rocket
              </Text>
            </View>
          </View>
          <View style={[styles.radioCircle, selectedTransferMethod === 'general' && styles.radioCircleSelected]}>
            {selectedTransferMethod === 'general' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </View>
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
        disabled={loading || !selectedAddress}
      >
        <LinearGradient
          colors={[COLORS.gradients.primary[0], COLORS.gradients.primary[1]]}
          style={styles.placeOrderGradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons 
                name={
                  selectedPaymentMethod === 'deposit' ? 'wallet' :
                  selectedPaymentMethod === 'kakao' ? 'chatbubble' :
                  selectedPaymentMethod === 'naver' ? 'logo-html5' :
                  'card'
                } 
                size={20} 
                color={COLORS.white} 
              />
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
        {renderDesignatedShootingSection()}
        {renderTransferMethodSection()}
        {renderPaymentSection()}
        {renderOrderItems()}
        {renderOrderSummary()}
        {renderNotesSection()}
      </ScrollView>
      {renderPlaceOrderButton()}

      {cart.items.length > 0 && (
        <PhotoCaptureModal
          visible={photoCaptureVisible}
          onClose={() => setPhotoCaptureVisible(false)}
          onConfirm={handlePhotoCaptureConfirm}
          product={{
            id: cart.items[0]?.product?.id || cart.items[0]?.id || 'checkout',
            name: cart.items[0]?.product?.name || cart.items[0]?.name || 'Checkout Order',
            image: cart.items[0]?.product?.image || cart.items[0]?.image || '',
            price: cart.items[0]?.product?.price || cart.items[0]?.price || cart.total,
          }}
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
  cameraIconButton: {
    padding: SPACING.xs,
  },
  designatedShootingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  designatedShootingInfo: {
    flex: 1,
  },
  designatedShootingLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  designatedShootingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  editButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addDesignatedShootingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  addDesignatedShootingText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: '500',
  },
  paymentOptions: {
    gap: SPACING.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  paymentDescriptionSelected: {
    color: COLORS.primary,
  },
  paymentTypeSelected: {
    color: COLORS.primary,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  paymentIconSelected: {
    backgroundColor: COLORS.primary,
  },
  transferOptions: {
    gap: SPACING.sm,
  },
  transferOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transferOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  transferOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transferIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  transferInfo: {
    flex: 1,
  },
  transferType: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  transferTypeSelected: {
    color: COLORS.primary,
  },
});

export default CheckoutScreen;
