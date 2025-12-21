import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import { translations } from '../../../../i18n/translations';
import { PhotoCaptureModal } from '../../../../components';
import { InputCheckServiceModal } from '../../../../components';
import { OrderServiceModal } from '../../../../components';
import { TransferMethodModal } from '../../../../components';
import { CouponModal } from '../../../../components';
import { useAuth } from '../../../../context/AuthContext';
import { Address } from '../../../../types';
import { useCreateOrderMutation } from '../../../../hooks/useCreateOrderMutation';
import { useToast } from '../../../../context/ToastContext';

interface PaymentScreenParams {
  items: Array<{
    id: string;
    _id?: string; // Cart item ID from backend
    name: string;
    color?: string;
    size?: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  fromCart?: boolean;
  selectedAddress?: Address;
}

const PaymentScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { items = [], totalAmount = 0, fromCart = false } = route.params as PaymentScreenParams;

  // i18n
  const locale = useAppSelector((s) => s.i18n.locale);
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Auth context
  const { user } = useAuth();

  // State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('deposit');
  const [selectedTransportType, setSelectedTransportType] = useState<string>('air'); // 'air' or 'ship'
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>('general'); // 'general', 'vvic', or 'rocket'
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [orderMemos, setOrderMemos] = useState<Record<string, string>>({});
  const [usePoints, setUsePoints] = useState(false);
  const [useCoupon, setUseCoupon] = useState(false);
  const [photoCaptureVisible, setPhotoCaptureVisible] = useState(false);
  const [selectedProductForPhoto, setSelectedProductForPhoto] = useState<any>(null);
  const [designatedShootingData, setDesignatedShootingData] = useState<Record<string, { quantity: number; request: string; photos: string[] }>>({});
  const [inputCheckServiceVisible, setInputCheckServiceVisible] = useState(false);
  const [orderServiceVisible, setOrderServiceVisible] = useState(false);
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const { showToast } = useToast();

  // Set default address on mount
  React.useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [user]);

  // Refresh address selection when returning from AddNewAddress screen
  useFocusEffect(
    React.useCallback(() => {
      if (user?.addresses && user.addresses.length > 0) {
        // If no address is selected, select default or first address
        if (!selectedAddress) {
          const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
          setSelectedAddress(defaultAddress);
        } else {
          // Verify selected address still exists in the list
          const addressExists = user.addresses.find(addr => addr.id === selectedAddress.id);
          if (!addressExists) {
            // If selected address no longer exists, select default or first
            const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
            setSelectedAddress(defaultAddress);
          }
        }
      }
    }, [user, selectedAddress])
  );


  // Helper function to update memo for specific product
  const updateOrderMemo = (productId: string, memo: string) => {
    setOrderMemos(prev => ({
      ...prev,
      [productId]: memo
    }));
  };

  // Handle camera button press
  const handleCameraPress = (item: any) => {
    setSelectedProductForPhoto(item);
    setPhotoCaptureVisible(true);
  };

  // Handle photo capture confirmation
  const handlePhotoCaptureConfirm = (data: { quantity: number; request: string; photos: string[] }) => {
    if (selectedProductForPhoto?.id) {
      setDesignatedShootingData(prev => ({
        ...prev,
        [selectedProductForPhoto.id]: data,
      }));
    }
    setPhotoCaptureVisible(false);
    setSelectedProductForPhoto(null);
  };

  // Handle input check service confirmation
  const handleInputCheckServiceConfirm = (selectedServices: string[]) => {
    console.log('Selected services:', selectedServices);
    // showToast('Input check services updated', 'success');
  };

  // Handle order service confirmation
  const handleOrderServiceConfirm = (selectedServices: string[]) => {
    console.log('Selected order services:', selectedServices);
    // showToast('Order services updated', 'success');
  };

  // Handle address selection from route params
  React.useEffect(() => {
    const params = route.params as PaymentScreenParams;
    if (params?.selectedAddress) {
      setSelectedAddress(params.selectedAddress);
    }
  }, [route.params]);

  // Update address when screen comes into focus (e.g., returning from SelectAddress)
  useFocusEffect(
    React.useCallback(() => {
      const params = route.params as PaymentScreenParams;
      if (params?.selectedAddress) {
        setSelectedAddress(params.selectedAddress);
      }
    }, [route.params])
  );

  // Handle coupon confirmation
  const handleCouponConfirm = (coupon: any) => {
    setSelectedCoupon(coupon);
    if (coupon) {
      // showToast(`Coupon "${coupon.name}" applied successfully`, 'success');
    } else {
      // showToast('Coupon removed', 'success');
    }
  };

  // Mock data
  const paymentMethods = [
    { 
      id: 'deposit', 
      name: 'Deposit', 
      iconType: 'icon',
      iconName: 'wallet-outline'
    },
    { 
      id: 'kakaopay', 
      name: 'KakaoPay', 
      iconType: 'text',
      iconText: 'K',
      iconColor: '#FFCD00',
      textColor: '#000000'
    },
    { 
      id: 'naverpay', 
      name: 'NaverPay', 
      iconType: 'text',
      iconText: 'N',
      iconColor: '#03C75A',
      textColor: '#FFFFFF'
    },
    { 
      id: 'newcard', 
      name: 'New Card', 
      iconType: 'icon',
      iconName: 'card-outline'
    },
  ];

  const cardOptions = [
    { id: 'visa', name: 'VISA', color: '#1A1F71', textColor: '#FFFFFF' },
    { id: 'mastercard', name: 'MC', color: '#EB001B', textColor: '#FFFFFF' },
    { id: 'paypal', name: 'PayPal', color: '#0070BA', textColor: '#FFFFFF' },
    { id: 'amex', name: 'AMEX', color: '#006FCF', textColor: '#FFFFFF' },
  ];

  // Calculate pricing
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const warehouseFee = 1.00;
  const areaTransport = 2.00;
  const internationalTransport = 0.00;
  const serviceFee = 3.00;
  const pointsDiscount = usePoints ? 0.10 : 0;
  const couponDiscount = selectedCoupon ? 
    (selectedCoupon.discountType === 'percentage' ? 
      (subtotal * selectedCoupon.discount / 100) : 
      selectedCoupon.discount) : 0;
  const finalTotal = subtotal + warehouseFee + areaTransport + internationalTransport + serviceFee - pointsDiscount - couponDiscount;

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.black} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Order Confirm</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSellerSection = () => (
    <View style={styles.sellerSection}>
      <View style={styles.sellerRow}>
        <Image 
          source={{ uri: 'https://picsum.photos/seed/seller/32/32' }}
          style={styles.sellerAvatar}
        />
        <Text style={styles.sellerName}>bbbxffvwo083i5cyz7jxtprkg</Text>
      </View>
    </View>
  );

  const renderOrderItems = () => (
    <View>
      {items.map((item, index) => (
        <View key={item.id || index}>
          {/* Product Item */}
          <View style={styles.orderItemsSection}>
            <View style={styles.orderItem}>
              <Image 
                source={{ uri: item.image }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.color && <Text style={styles.itemVariant}>{item.color}</Text>}
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.itemQuantity}>
                <TouchableOpacity 
                  style={styles.cameraButton}
                  onPress={() => handleCameraPress(item)}
                >
                  <Ionicons name="camera-outline" size={16} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>×{item.quantity}</Text>
              </View>
            </View>
          </View>

          {/* Input Check Service for this product */}
          <TouchableOpacity 
            style={styles.serviceSection}
            onPress={() => setInputCheckServiceVisible(true)}
          >
            <View style={styles.serviceTitleRow}>
              <Text style={styles.serviceTitle}>Input Check Service</Text>
              <TouchableOpacity onPress={() => setInputCheckServiceVisible(true)}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>
            <View style={styles.serviceRow}>
              <View style={styles.serviceCheck}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.serviceName}>Camera</Text>
              </View>
              <Text style={styles.servicePrice}>$1</Text>
            </View>
          </TouchableOpacity>

          {/* Order Service for this product */}
          <TouchableOpacity 
            style={styles.orderServiceSection}
            onPress={() => setOrderServiceVisible(true)}
          >
            <View style={styles.serviceTitleRow}>
              <Text style={styles.serviceTitle}>Order Service</Text>
              <TouchableOpacity onPress={() => setOrderServiceVisible(true)}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>
            <View style={styles.serviceRow}>
              <View style={styles.serviceCheck}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.serviceName}>Camera</Text>
              </View>
              <Text style={styles.servicePrice}>$1</Text>
            </View>
          </TouchableOpacity>

          {/* Order Memo for this product */}
          <View style={styles.memoSection}>
            <Text style={styles.sectionTitle}>Order Memo</Text>
            <TextInput
              style={styles.memoInput}
              placeholder="Please make memo for this order"
              placeholderTextColor={COLORS.gray[400]}
              value={orderMemos[item.id] || ''}
              onChangeText={(text) => updateOrderMemo(item.id, text)}
              multiline
            />
          </View>
        </View>
      ))}
    </View>
  );



  const renderPaymentMethods = () => (
    <View style={styles.paymentSection}>
      <Text style={styles.sectionTitle}>Payment Methods</Text>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={styles.paymentMethod}
          onPress={() => setSelectedPaymentMethod(method.id)}
        >
          <View style={[
            styles.radioButton,
            selectedPaymentMethod === method.id && styles.radioButtonSelected
          ]}>
            {selectedPaymentMethod === method.id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
          <View style={styles.paymentMethodContent}>
            <Text style={styles.paymentMethodText}>{method.name}</Text>
            {method.iconType === 'text' && (
              <View style={[styles.paymentMethodIconBadge, { backgroundColor: method.iconColor }]}>
                <Text style={[styles.paymentMethodIconText, { color: method.textColor }]}>
                  {method.iconText}
                </Text>
              </View>
            )}
            {method.iconType === 'icon' && (
              <Ionicons 
                name={method.iconName as any} 
                size={20} 
                color={COLORS.gray[400]} 
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
      
      <View style={styles.cardOptions}>
        {cardOptions.map((card) => (
          <TouchableOpacity 
            key={card.id} 
            style={[styles.cardOption, { backgroundColor: card.color }]}
          >
            <Text style={[styles.cardText, { color: card.textColor }]}>
              {card.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );





  const renderAddress = () => {
    const addresses = user?.addresses || [];
    
    // If no addresses, navigate to select address page
    if (addresses.length === 0) {
      return (
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Address</Text>
          <TouchableOpacity 
            style={styles.addressRow}
            onPress={() => navigation.navigate('SelectAddress')}
          >
            <Ionicons name="location-outline" size={20} color={COLORS.black} />
            <Text style={styles.addressText}>Add address</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
          </TouchableOpacity>
        </View>
      );
    }

    // Show all addresses with radio buttons for selection
    return (
      <View style={styles.addressSection}>
        <View style={styles.addressSectionHeader}>
          <Text style={styles.sectionTitle}>Address</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('SelectAddress', {
              selectedAddressId: selectedAddress?.id
            })}
          >
            <Text style={styles.editAddressText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.addressList}>
          {addresses.map((address) => {
            const isSelected = selectedAddress?.id === address.id;
            return (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressCard,
                  isSelected && styles.addressCardSelected
                ]}
                onPress={() => setSelectedAddress(address)}
                activeOpacity={0.7}
              >
                <View style={styles.addressInfo}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressName}>
                      {address.name || address.recipient || user?.name || 'Unnamed'}
                    </Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressPhone}>{address.phone || address.contact || ''}</Text>
                  <Text style={styles.addressText}>
                    {address.street || address.detailedAddress || ''}
                    {address.zipCode ? `, ${address.zipCode}` : ''}
                  </Text>
                  {address.city && (
                    <Text style={styles.addressCity}>{address.city}</Text>
                  )}
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add New Address Button */}
        <TouchableOpacity 
          style={styles.addAddressButton}
          onPress={() => navigation.navigate('AddNewAddress', {})}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.addAddressButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTransferMethod = () => (
    <View style={styles.transferSection}>
      <Text style={styles.sectionTitle}>Transfer Method</Text>
      
      {/* Option 1: Air or Ship */}
      <View style={styles.transferSubSection}>
        <Text style={styles.transferSubTitle}>Option 1</Text>
        <View style={styles.transferOptions}>
          <TouchableOpacity
            style={[
              styles.transferOption,
              selectedTransportType === 'air' && styles.transferOptionSelected
            ]}
            onPress={() => setSelectedTransportType('air')}
          >
            <View style={styles.transferOptionContent}>
              <View style={styles.transferIcon}>
                <Ionicons name="airplane" size={24} color={selectedTransportType === 'air' ? COLORS.primary : COLORS.gray[500]} />
              </View>
              <View style={styles.transferInfo}>
                <Text style={[styles.transferType, selectedTransportType === 'air' && styles.transferTypeSelected]}>
                  Air
                </Text>
              </View>
            </View>
            <View style={[styles.radioCircle, selectedTransportType === 'air' && styles.radioCircleSelected]}>
              {selectedTransportType === 'air' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.transferOption,
              selectedTransportType === 'ship' && styles.transferOptionSelected
            ]}
            onPress={() => setSelectedTransportType('ship')}
          >
            <View style={styles.transferOptionContent}>
              <View style={styles.transferIcon}>
                <Ionicons name="boat" size={24} color={selectedTransportType === 'ship' ? COLORS.primary : COLORS.gray[500]} />
              </View>
              <View style={styles.transferInfo}>
                <Text style={[styles.transferType, selectedTransportType === 'ship' && styles.transferTypeSelected]}>
                  Ship
                </Text>
              </View>
            </View>
            <View style={[styles.radioCircle, selectedTransportType === 'ship' && styles.radioCircleSelected]}>
              {selectedTransportType === 'ship' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Option 2: General, VVIC, or Rocket */}
      <View style={styles.transferSubSection}>
        <Text style={styles.transferSubTitle}>Option 2</Text>
        <View style={styles.transferOptions}>
          <TouchableOpacity
            style={[
              styles.transferOption,
              selectedDeliveryMethod === 'general' && styles.transferOptionSelected
            ]}
            onPress={() => setSelectedDeliveryMethod('general')}
          >
            <View style={styles.transferOptionContent}>
              <View style={styles.transferIcon}>
                <Ionicons name="cube" size={24} color={selectedDeliveryMethod === 'general' ? COLORS.primary : COLORS.gray[500]} />
              </View>
              <View style={styles.transferInfo}>
                <Text style={[styles.transferType, selectedDeliveryMethod === 'general' && styles.transferTypeSelected]}>
                  General
                </Text>
              </View>
            </View>
            <View style={[styles.radioCircle, selectedDeliveryMethod === 'general' && styles.radioCircleSelected]}>
              {selectedDeliveryMethod === 'general' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.transferOption,
              selectedDeliveryMethod === 'vvic' && styles.transferOptionSelected
            ]}
            onPress={() => setSelectedDeliveryMethod('vvic')}
          >
            <View style={styles.transferOptionContent}>
              <View style={styles.transferIcon}>
                <Ionicons name="flash" size={24} color={selectedDeliveryMethod === 'vvic' ? COLORS.primary : COLORS.gray[500]} />
              </View>
              <View style={styles.transferInfo}>
                <Text style={[styles.transferType, selectedDeliveryMethod === 'vvic' && styles.transferTypeSelected]}>
                  VVIC
                </Text>
              </View>
            </View>
            <View style={[styles.radioCircle, selectedDeliveryMethod === 'vvic' && styles.radioCircleSelected]}>
              {selectedDeliveryMethod === 'vvic' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.transferOption,
              selectedDeliveryMethod === 'rocket' && styles.transferOptionSelected
            ]}
            onPress={() => setSelectedDeliveryMethod('rocket')}
          >
            <View style={styles.transferOptionContent}>
              <View style={styles.transferIcon}>
                <Ionicons name="rocket" size={24} color={selectedDeliveryMethod === 'rocket' ? COLORS.primary : COLORS.gray[500]} />
              </View>
              <View style={styles.transferInfo}>
                <Text style={[styles.transferType, selectedDeliveryMethod === 'rocket' && styles.transferTypeSelected]}>
                  Rocket
                </Text>
              </View>
            </View>
            <View style={[styles.radioCircle, selectedDeliveryMethod === 'rocket' && styles.radioCircleSelected]}>
              {selectedDeliveryMethod === 'rocket' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPriceBreakdown = () => (
    <View style={styles.priceSection}>
      <Text style={styles.sectionTitle}>Price</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Total products:</Text>
        <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Arrive warehouse:</Text>
        <Text style={styles.priceValue}>${warehouseFee.toFixed(2)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Area transport:</Text>
        <Text style={styles.priceValue}>${areaTransport.toFixed(2)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>International transport:</Text>
        <Text style={styles.priceValue}>${internationalTransport.toFixed(2)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Service:</Text>
        <Text style={styles.priceValue}>${serviceFee.toFixed(2)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Use points:</Text>
        <View style={styles.pointsRow}>
          <Text style={[styles.priceValue, { color: COLORS.red }]}>
            ${pointsDiscount.toFixed(1)}
          </Text>
          <Switch
            value={usePoints}
            onValueChange={setUsePoints}
            trackColor={{ false: COLORS.gray[300], true: COLORS.success }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
      
      <View style={styles.priceRow}>
        <View style={styles.availablePointsRow}>
          <Ionicons name="card-outline" size={16} color={COLORS.primary} />
          <Text style={styles.availablePointsText}>Available points:</Text>
        </View>
        <Text style={styles.priceValue}>$10</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.priceRow}
        onPress={() => setCouponModalVisible(true)}
      >
        <View style={styles.couponRow}>
          <Ionicons name="ticket-outline" size={16} color={COLORS.primary} />
          <Text style={styles.couponText}>
            {selectedCoupon ? selectedCoupon.name : 'Coupon:'}
          </Text>
        </View>
        <View style={styles.couponRightSection}>
          <Text style={[styles.priceValue, { color: COLORS.red }]}>
            ${couponDiscount.toFixed(0)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <View style={[styles.priceRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
      </View>
    </View>
  );

  // Create order mutation
  const { mutate: createOrder, isLoading: isCreatingOrder } = useCreateOrderMutation({
    onSuccess: (data) => {
      console.log('Order created successfully:', data);
      showToast('Order created successfully', 'success');
      // Navigate back to cart page
      navigation.navigate('Cart');
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
      Alert.alert('Error', error || 'Failed to create order. Please try again.');
    },
  });

  const handleConfirm = () => {
    // Validate required fields
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'No items to order');
      return;
    }

    // Get cart item IDs - use _id if available (from cart), otherwise use id
    const cartItemIds = items
      .map(item => item._id || item.id)
      .filter(id => id);

    if (cartItemIds.length === 0) {
      Alert.alert('Error', 'Invalid cart items');
      return;
    }

    // Map orderType from selectedDeliveryMethod
    const orderTypeMap: Record<string, 'General' | 'VVIC' | 'Rocket'> = {
      'general': 'General',
      'vvic': 'VVIC',
      'rocket': 'Rocket',
    };
    const orderType = orderTypeMap[selectedDeliveryMethod] || 'General';

    // Map transferMethod from selectedTransportType
    const transferMethod = selectedTransportType === 'ship' ? 'ship' : 'air';

    // Build itemDetails object
    const itemDetails: Record<string, any> = {};
    items.forEach(item => {
      const itemId = item._id || item.id;
      const memo = orderMemos[item.id] || '';
      const designatedShooting = designatedShootingData[item.id];

      itemDetails[itemId] = {
        ...(memo && { notes: memo }),
        ...(designatedShooting && {
          designatedShooting: designatedShooting.photos.map((photo, index) => ({
            note: designatedShooting.request || '',
            photo: photo,
          })),
        }),
      };
    });

    // Create order request
    const orderRequest = {
      cartItemIds,
      orderType,
      transferMethod,
      itemDetails,
      flow: 'general' as const,
      addressId: selectedAddress.id,
    };

    console.log('Creating order with request:', JSON.stringify(orderRequest, null, 2));
    createOrder(orderRequest);
  };

  const renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <Text style={styles.bottomTotal}>${finalTotal.toFixed(2)}</Text>
      <TouchableOpacity 
        style={[styles.confirmButton, (isCreatingOrder || !selectedAddress) && styles.confirmButtonDisabled]}
        onPress={handleConfirm}
        disabled={isCreatingOrder || !selectedAddress}
      >
        {isCreatingOrder ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.confirmButtonText}>Confirm</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSellerSection()}
        {renderOrderItems()}
        {renderPaymentMethods()}
        {renderAddress()}
        {renderTransferMethod()}
        {renderPriceBreakdown()}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {renderBottomBar()}
      
      {selectedProductForPhoto && (
        <PhotoCaptureModal
          visible={photoCaptureVisible}
          onClose={() => {
            setPhotoCaptureVisible(false);
            setSelectedProductForPhoto(null);
          }}
          onConfirm={handlePhotoCaptureConfirm}
          product={{
            id: selectedProductForPhoto.id,
            name: selectedProductForPhoto.name,
            image: selectedProductForPhoto.image,
            price: selectedProductForPhoto.price,
          }}
        />
      )}
      
      <InputCheckServiceModal
        visible={inputCheckServiceVisible}
        onClose={() => setInputCheckServiceVisible(false)}
        onConfirm={handleInputCheckServiceConfirm}
      />
      
      <OrderServiceModal
        visible={orderServiceVisible}
        onClose={() => setOrderServiceVisible(false)}
        onConfirm={handleOrderServiceConfirm}
      />
      
      <CouponModal
        visible={couponModalVisible}
        onClose={() => setCouponModalVisible(false)}
        onConfirm={handleCouponConfirm}
        selectedCouponId={selectedCoupon?.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  sellerSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  sellerName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
  },
  orderItemsSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.gray[100],
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  itemVariant: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  itemQuantity: {
    alignItems: 'center',
  },
  cameraButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantityText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  serviceSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  serviceTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceCheck: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  servicePrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  paymentSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  paymentMethodText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  paymentMethodIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodIconText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardOptions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  cardOption: {
    width: 60,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  orderServiceSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  memoSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  memoInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addressSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  transferSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  transferSubSection: {
    marginBottom: SPACING.lg,
  },
  transferSubTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transferText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  transferOptions: {
    gap: SPACING.sm,
  },
  transferOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
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
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  transferInfo: {
    flex: 1,
  },
  transferType: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  transferTypeSelected: {
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
  addressSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  editAddressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addressList: {
    gap: SPACING.sm,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  addressCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  addressInfo: {
    flex: 1,
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
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  addressCity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  defaultBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  addAddressButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  priceSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  priceLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
  },
  priceValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  availablePointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  availablePointsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  couponText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
  },
  couponRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bottomSpace: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    ...SHADOWS.lg,
  },
  bottomTotal: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  confirmButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  confirmButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
});

export default PaymentScreen;