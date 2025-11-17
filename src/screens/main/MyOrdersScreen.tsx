import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { RootStackParamList, CustomerOrderDetails } from '../../types';
import { Ionicons } from '@expo/vector-icons';
// Import the new customer orders hook
import { useGetCustomerOrdersMutation } from '../../hooks/useCustomerOrders';
import { useAuth } from '../../context/AuthContext';

type MyOrdersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyOrders'>;

// Helper function to transform CustomerOrderDetails status to the status used in UI
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

// Helper function to get status color
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

const MyOrdersScreen = () => {
  const navigation = useNavigation<MyOrdersScreenNavigationProp>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'On Process' | 'sent' | 'cancelled'>('all');
  const [orders, setOrders] = useState<CustomerOrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemImage, setItemImage] = useState<String>('');
  const { mutate: getCustomerOrders, data, error, isLoading, isSuccess, isError } = useGetCustomerOrdersMutation();

  useEffect(() => {
    loadOrders();
  }, [navigation]);

  useEffect(() => {
    if (isSuccess && data) {
      console.log('Received customer orders data:');
      setOrders(data.orders);
    }
    
    if (isError && error) {
      // console.error('Error fetching customer orders:', error);
    }
  }, [isSuccess, data, isError, error]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Fetch orders from the new customer orders API
      await getCustomerOrders(50, 1, 'all'); // Get 50 orders, offset 1, all statuses
    } catch (error) {
      console.error('Error loading orders:', error);
      // Set empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    const transformedStatus = transformOrderStatus(order.order_status);
    if (activeTab === 'On Process') return transformedStatus === 'On Process' || transformedStatus === 'Waiting for payment';
    if (activeTab === 'sent') return transformedStatus === 'Sent';
    if (activeTab === 'cancelled') return transformedStatus === 'Cancelled';
    return true;
  });

  const renderOrderItem = ({item}: {item: CustomerOrderDetails}) => {
    console.log("Item Details: ", item);
    let detailOrders = item.details;
    if (typeof detailOrders === 'string') {
      detailOrders = JSON.parse(detailOrders);
    }
    let itemDetails = detailOrders[0].item_details;
    if (typeof itemDetails === 'string') {
      itemDetails = JSON.parse(itemDetails);
    }
    let variations = itemDetails[0].variation;
    if (typeof variations === 'string') {
      variations = JSON.parse(variations);
    }
    console.log ("Detail Orders: ", variations);
    let options = variations[0].options;
    if (typeof options === 'string') {
      options = JSON.parse(options);
    }
    return (
      <View style={styles.orderContainer}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>Order: #{detailOrders[0].order_id}</Text>
          <Text style={[styles.status, {color: getStatusColor(transformOrderStatus(item.order_status))}]}>
            {transformOrderStatus(item.order_status)}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.orderItem}
          onPress={() => navigation.navigate('DetailOrder', {orderData: item})}
        >
          {/* For now, we'll show a simple representation of the order */}
          <View style={styles.productImagePlaceholder}>
            {/* <Text style={styles.placeholderText}>Order</Text> */}
            <Image source={{uri: options[0].image}} width={100} height={120} />
          </View>
          
          <View style={styles.productDetails}>
            <Text style={styles.storeName}>{itemDetails[0].item_name || 'Store'}</Text>
            <Text style={styles.productName}>Order Amount: ${item?.order_amount || '0'}</Text>
            <Text style={styles.quantity}>Payment Status: {item.payment_status || 'Not paid'}</Text>
            <Text style={styles.sizeVariant}>
              Created: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.arrowIcon}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accentPink} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Order</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'On Process' && styles.activeTab]}
          onPress={() => setActiveTab('On Process')}
        >
          <Text style={[styles.tabText, activeTab === 'On Process' && styles.activeTabText]}>On Process</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>Sent</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'cancelled' && styles.activeTab]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>Cancelled</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </View>
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
    paddingVertical: SPACING.md,
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
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingTop: SPACING.sm,
    paddingBottom: 0,
    borderBottomColor: COLORS.gray[100],
    borderBottomWidth: 1,
  },
  tabButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.black,
    borderBottomWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  orderContainer: {
    margin: SPACING.md,
    marginBottom: 0,
    padding: SPACING.smmd,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[100],
  },
  storeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  status: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS.sm,
  },
  productImagePlaceholder: {
    width: 100,
    height: 120,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholderText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  productDetails: {
    marginLeft: SPACING.smmd,
    flex: 1,
  },
  productName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  quantity: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
  },
  sizeVariant: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  arrowIcon: {
    marginRight: 8,
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  arrow: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyOrdersScreen;