import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { RootStackParamList, CustomerOrderDetails, ApiAddress } from '../../types';
// Import the new customer orders API
import { useGetAddressesMutation } from '../../hooks/useAddressMutations';
import { useAuth } from '../../context/AuthContext';
import { useUpdateCustomerOrderMutation } from '../../hooks/useCustomerOrders';

type DetailOrderRouteProp = RouteProp<RootStackParamList, 'DetailOrder'>;
type DetailOrderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DetailOrder'>;

const DetailOrderScreen: React.FC = () => {
  const route = useRoute<DetailOrderRouteProp>();
  const navigation = useNavigation<DetailOrderScreenNavigationProp>();
  const { orderData } = route.params;
  
  const [order, setOrder] = useState<CustomerOrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [details, setItemDetails] = useState<any[]>([]);
  const [store_details, setStoreDetails] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(0);
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ApiAddress | null>(null);
  // const [isUpdating, setIsUpdating] = useState(false);
    const { 
    mutate: fetchAddresses, 
    data: addressesData, 
    isLoading: addressesLoading, 
    isError: addressesError 
  } = useGetAddressesMutation({
    onSuccess: (data) => {
      if (data && data.data) {
        setAddresses(data.data);
        
        // Find the primary address or use the first one
        const primaryAddress = data.data.find((addr: ApiAddress) => addr.is_primary_address === 1);
        if (primaryAddress) {
          setSelectedAddress(primaryAddress);
        } else if (data.data.length > 0) {
          setSelectedAddress(data.data[0]);
        } else {
          setSelectedAddress(null); // No addresses available
        }
      }
      // navigation.goBack();
    },
    onError: (error) => {
      console.error('Error fetching addresses:', error);
      setSelectedAddress(null); // Reset selected address on error
    }
  });
  const { 
    mutate: updateOrder, data, error, isLoading, isSuccess, isError
  } = useUpdateCustomerOrderMutation({
    onSuccess: (data) => {
      Alert.alert(
        'Success',
        'Your Order has been updated successfully!',
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
  
  useEffect(() => {
    // loadOrder();
    let details = orderData.details;
    if (typeof orderData.details === 'string'){
      details = JSON.parse(orderData.details);
    };
    let item_details = details[0].item_details;
    if (typeof item_details === 'string'){
      item_details = JSON.parse(item_details);
    };
    let total_quantity = 0;
    item_details.map((item: any) => {
      total_quantity += item.quantity;
    })
    setQuantity(total_quantity || 0)
    setItemDetails(item_details);
    setStoreDetails(details);
    setOrder(orderData);
    console.log("Store_Details", details);
    fetchAddresses(2);
  }, [orderData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Process':
        return COLORS.success; // Green
      case 'Sent':
        return COLORS.accentPink; // Red
      case 'Cancelled':
        return COLORS.error; // Red
      case 'Waiting for payment':
        return COLORS.warning; // Green
      default:
        return COLORS.gray[500]; // Gray
    }
  };

  const handleConfirmOrder = async (order_status: string) => {
    // console.log("Type of Order Id: ", typeof order?.order_id, store_details[0].order_id);
    // console.log("Order Status Updated", orderData?.order_id);
    // try {
    //   // await updateOrder({ update: order_status, order_id: order?.order_id || 0 });
    // }
    // catch (error) {
    //   console.error('Error updating order:', error);
    updateOrder({ update: order_status, order_id: store_details[0].order_id || 0 });
    // }
  }

  const handleGiveFeedback = (item: any) => {
    navigation.navigate('LeaveFeedback', { orderId: store_details[0].order_id, product: item });
  };
  const transformOrderStatus = (status: string): string => {
    switch (status) {
      case 'processing':
      case 'confirmed':
        return 'On Process';
      case 'pending':
        return 'Waiting for payment';
      case 'shipped':
      case 'sent':
      case 'delivered':
        return 'Sent';
      case 'cancelled':
      case 'refunded':
        return 'Cancelled';
      default:
        return 'Waiting for payment';
    }
  };
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Detail Order</Text>
      <TouchableOpacity style={styles.infoButton}>
        <Ionicons name="help-circle-outline" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderOrderHeader = () => {
    if (!order) return null;
    
    return (
      <View style={styles.orderHeaderContainer}>
        <View style={styles.orderNumberRow}>
          <Text style={styles.orderNumberLabel}>Order no: {order.order_id}</Text>
          <TouchableOpacity>
            <Text style={styles.clickToCopy}>Click for copy</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.combinedContainer, { backgroundColor: getStatusColor(transformOrderStatus(order.order_status)) }]}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName}>{details[0].store_name}</Text>
            <Text style={styles.storeStatus}>{transformOrderStatus(order.order_status)}</Text>
          </View>
          <View style={styles.itemsWhiteContainer}>
        
        {/* Combined container for store and order items */}
          {/* Store Header */}
          
          {/* Order Items in White Container */}
            {
              details.map((item: any, idx: number) => {
              let variatons = item.variation;
              if (typeof variatons === 'string') {
                variatons = JSON.parse(variatons);
              };
              let options = variatons[0].options;
              if (typeof options === 'string') {
                options = JSON.parse(options);
              };
              // const options = variatons ? JSON.parse(variatons[0].options) : null
              const imgUrl = options ? options[0].image : ''
              console.log("Variations", item);
              return(
                <View key={item.id}>
                  <View style={styles.orderItem}>
                    <Image
                      source={{uri: imgUrl}}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    
                    <View style={styles.itemInfo}>
                      {/* <Text style={styles.itemBrand}>{item.brand}</Text> */}
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.item_name}
                      </Text>
                      <Text style={styles.itemDetails}>
                        {variatons && variatons[0].name} - {options && options[0].value}
                      </Text>
                      
                      <View style={styles.priceRow}>
                        {/* {item.originalPrice && (
                          <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                        )} */}
                        <Text style={styles.currentPrice}>${(options[0].price || 0).toFixed(2)}</Text>
                        {/* {item.discount && (
                          <Text style={styles.discountText}>-{item.discount}%</Text>
                        )} */}
                      </View>
                      
                      {/* Give Feedback Button inside itemInfo */}
                      {order.order_status === "sent" && <TouchableOpacity 
                        style={styles.feedbackButton}
                        onPress={() => handleGiveFeedback(item)}
                      >
                        <Text style={styles.feedbackButtonText}>Give Feedback</Text>
                      </TouchableOpacity>}
                    </View>
                  </View>
                  
                  {/* Add separator between items except for the last one */}
                  {/* {index < order.items.length - 1 && <View style={styles.itemSeparator} />} */}
                </View>
              )                  
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderOrderItems = () => {
    // Items are now rendered within renderOrderHeader
    return null;
  };

  // const renderCustomerInfo = () => {
  //   if (!order) return null;

  //   return (
  //     <View style={styles.customerInfo}>
  //       <View style={styles.customerRow}>
  //         <Ionicons name="location" size={20} color={COLORS.accentPink} />
  //         {/* <View style={styles.customerDetails}>
  //           <View style={styles.customerInfoRow}> 
  //             <Text style={styles.customerName}>{order.customerName}</Text>
  //             <Text style={styles.customerPhone}>{order.customerPhone}</Text>
  //           </View>
  //           <Text style={styles.customerAddress}>{order.customerAddress}</Text>
  //         </View> */}
  //       </View>
  //     </View>
  //   );
  // };
    const renderCustomerInfo = () => {
    // Use the selected address or return null if none
    const addressToShow = selectedAddress;
    const addressName = useAuth().user?.name;
    console.log("Location Section: ", useAuth().user, " : ", addressName);
    
    // Don't show address section if there are no addresses
    if (!addressToShow) {
      return (
        <TouchableOpacity 
          style={styles.locationSection}
          onPress={() => (navigation as any).navigate('AddressBook')}
          activeOpacity={0.7}
        >
          <View style={{height: '100%'}}>
            <Ionicons name="location" size={18} color={COLORS.accentPink}/>
          </View>
          <View>
            <View style={styles.locationRow}>
              <Text style={styles.locationName}>No address available</Text>
            </View>
            <Text style={styles.locationAddress}>Please add an address</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity 
        style={styles.locationSection}
        onPress={() => (navigation as any).navigate('AddressBook')}
        activeOpacity={0.7}
      >
        <View style={{height: '100%'}}>
          <Ionicons name="location" size={18} color={COLORS.accentPink}/>
        </View>
        <View>
          <View style={styles.locationRow}>
            <Text style={styles.locationName}>{addressName || 'No name'}</Text>
            <Text style={styles.locationCode}>{addressToShow.phone}</Text>
          </View>
          <Text style={styles.locationAddress}>
            {addressToShow.address}, {addressToShow.city}, {addressToShow.state}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
    );
  };
  const renderOrderDetailSummary = () => {
    if (!order) return null;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Details</Text>
        
        {order.updated_at !== "" && <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date ordered</Text>
          <TouchableOpacity style={styles.summaryText}>
            <Text style={styles.summaryValue}>{order.updated_at}</Text>
            <Ionicons name='copy-outline' size={20} color={COLORS.text.secondary}/>
          </TouchableOpacity>
        </View>}
        
        {/* {order.airwaybill !== "" && <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Airway bill</Text>
          <TouchableOpacity style={styles.summaryText}>
            <Text style={styles.summaryValue}>{order.airwaybill}</Text>
            <Ionicons name='copy-outline' size={20} color={COLORS.text.secondary}/>
          </TouchableOpacity>
        </View>} */}
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{details[0].quantity} {details[0].quantity === 1 ? 'item' : 'items'}</Text>
        </View>
        
        {/* <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Payment</Text>
          <Text style={styles.totalValue}>${order.total}</Text>
        </View> */}
      </View>
    );
  };

  const renderOrderSummary = () => {
    if (!order) return null;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Total Order</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({quantity} {quantity === 1 ? 'product' : 'products'})</Text>
          <Text style={styles.summaryValue}>${order.order_amount}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal delivery</Text>
          <Text style={styles.summaryValue}>${order.total_tax_amount}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount voucher</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>-${order.store_discount_amount}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Payment</Text>
          <Text style={styles.totalValue}>${order.order_amount}</Text>
        </View>
      </View>
    );
  };

  const renderButtons = () => { 
    if (order) { 
      console.log("Order Status: ", order.order_status, transformOrderStatus(order.order_status));
    }
    return (
      order && transformOrderStatus(order.order_status) == 'On Process' ? (
        <View style={[styles.buttonsContainer, {marginBottom: SPACING['3xl']}]}>
          <TouchableOpacity style={styles.button} onPress={() => {handleConfirmOrder('sent')}}>
            <Text style={styles.buttonText}>Received</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {handleConfirmOrder('canceled')}}>
            <Text style={styles.buttonText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      ) : order && transformOrderStatus(order.order_status) == 'Waiting for payment' ? (
        <View style={[styles.buttonsContainer, {marginBottom: SPACING['3xl']}]}>
          <TouchableOpacity style={styles.button} onPress={() => {handleConfirmOrder('confirmed')}}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      ) : (<></>)
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show message if order not found
  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderOrderHeader()}
        {renderOrderItems()}
        {renderCustomerInfo()}
        {renderOrderDetailSummary()}
        {renderOrderSummary()}
        {order && renderButtons()}
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
    paddingTop: SPACING.xl,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 'auto',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 'auto',
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderHeaderContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  orderNumberLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
  },
  clickToCopy: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    fontWeight: '500',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  storeName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  storeStatus: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.white,
  },
  combinedContainer: {
    borderRadius: BORDER_RADIUS.lg,
    borderColor: COLORS.gray[100],
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    // padding: SPACING.md,
  },
  itemsWhiteContainer: {
    backgroundColor: COLORS.white,
    borderTopRightRadius: BORDER_RADIUS.lg,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    paddingBottom: SPACING.md,
  },
  individualFeedbackContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginVertical: SPACING.sm,
  },
  itemsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  itemImage: {
    width: 90,
    height: 120,
    borderRadius: BORDER_RADIUS.sm,    
  },
  itemInfo: {
    marginLeft: SPACING.smmd,
    flex: 1,
  },
  itemBrand: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  itemName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  itemDetails: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  originalPrice: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
  },
  currentPrice: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '700',
    color: COLORS.accentPink,
    marginRight: SPACING.xs,
  },
  discountText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    backgroundColor: COLORS.accentPink + 10,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    fontWeight: '600',
  },
  feedbackButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    // shadowColor: COLORS.black,
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    width: '100%',
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 1,
    // marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  feedbackButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.black,
    fontWeight: '500',
    textAlign: 'center',
  },
  customerInfoRow: {
    flexDirection: 'row',
  },
  customerInfo: {
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    borderColor: COLORS.gray[200],
    borderWidth: 1,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  customerDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  customerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  customerPhone: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  customerAddress: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    lineHeight: 18,
  },
  summaryContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  summaryTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.smmd,
    color: COLORS.text.secondary,
  },
  summaryText: {
    fontSize: FONTS.sizes.smmd,
    color: COLORS.gray[300],
    flexDirection: 'row',
    gap: SPACING.md,
  },
  summaryValue: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  locationSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    marginBottom:  SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    // marginLeft: SPACING.xs,
  },
  locationCode: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginLeft: SPACING.xs,
    flex: 1,
  },
  locationAddress: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
  },
  buttonsContainer: {
    width: '100%',
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    gap: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.smmd,
    borderRadius: BORDER_RADIUS.lg,
    // marginLeft: SPACING.md,
  },
  buttonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default DetailOrderScreen;