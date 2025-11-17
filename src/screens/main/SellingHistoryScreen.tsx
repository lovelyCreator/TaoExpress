// // src/screens/main/SellingHistoryScreen.tsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { orderBy } from 'lodash';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';

// // Import components
// // Removed incorrect imports for Header and OrderItem that don't exist
// import { RootStackParamList } from '../../types';
// import { COLORS, FONTS, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants';

// type SellingHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SellingHistory'>;

// const SellingHistoryScreen = () => {
//   const navigation = useNavigation<SellingHistoryScreenNavigationProp>();
//   const [activeTab, setActiveTab] = useState('All Order');

//   // Mock data for orders
//   const orders = [
//     {
//       id: '1',
//       buyerName: 'Buyer Name',
//       buyerAvatar: 'https://via.placeholder.com/40',
//       productName: 'Asics',
//       productDescription: 'Asics Gel-Nunobiki trainers in white and silver',
//       size: 'EU 37',
//       productAmount: '1x',
//       variant: 'White',
//       orderNumber: '#9912818281',
//       status: 'On Process',
//       imageUrl: 'https://via.placeholder.com/100x100',
//     },
//   ];

//   const orderColor = (val: string) => {
//     switch (val) {
//       case 'Sent': return COLORS.accentPink; break;
//       case 'On Process': return COLORS.success; break;
//       case 'Waiting for payment': return COLORS.warning; break;
//       case 'Calcelled': return COLORS.error; break;
//       default: return COLORS.black;
//     }
//   } 

//   const renderOrderItem = ({ item }: { item: any }) => (
//     <View style={styles.orderContainer}>
//       <View style={styles.orderHeader}>
//         <View style={styles.avatarContainer}>
//           <Image source={require('../../assets/images/tops.png')} style={styles.avatar} />
//         </View>
//         <View style={styles.orderInfo}>
//           <Text style={styles.buyerName}>{item.buyerName}</Text>
//         </View>
//         <View style={styles.statusContainer}>
//           <Text style={[styles.status, {color: orderColor(item.status)}]}>{item.status}</Text>
//         </View>
//       </View>
//       <View style={styles.orderBody}> 
//         <Image source={require('../../assets/images/tops.png')} style={styles.productImage} />
//         <View style={styles.productInfo}>
//           <Text style={styles.sizeVariant}>{item.productName}</Text>
//           <Text style={styles.productName}>{item.productDescription}</Text>
//           <Text style={styles.sizeVariant}>{item.productAmount}</Text>
//           <Text style={styles.sizeVariant}>Size: {item.size} • Var: {item.variant}</Text>
//         </View>
//       </View>
//       <View style={styles.orderFooter}>
//         <Text style={styles.orderNumber}>Order Number</Text>
//         <Text style={styles.orderNumberValue}>{item.orderNumber}</Text>
//       </View>
//     </View>
//   );

//   const renderHeader = () => (
//     <View style={styles.header}>
//           <TouchableOpacity 
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="arrow-back" size={18} color="#333" />
//           </TouchableOpacity>
//       <Text style={styles.headerTitle}>Selling History</Text>
//       <View style={styles.placeholder} />
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {renderHeader()}
      
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[
//             styles.tabButton,
//             activeTab === 'All Order' && styles.activeTab,
//           ]}
//           onPress={() => setActiveTab('All Order')}
//         >
//           <Text style={[styles.tabText, activeTab === 'All Order' && styles.activeTabText]}>
//             All Order
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.tabButton,
//             activeTab === 'On Process' && styles.activeTab,
//           ]}
//           onPress={() => setActiveTab('On Process')}
//         >
//           <Text style={[styles.tabText, activeTab === 'On Process' && styles.activeTabText]}>
//             On Process
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.tabButton,
//             activeTab === 'Sent' && styles.activeTab,
//           ]}
//           onPress={() => setActiveTab('Sent')}
//         >
//           <Text style={[styles.tabText, activeTab === 'Sent' && styles.activeTabText]}>
//             Sent
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.tabButton,
//             activeTab === 'Cancelled' && styles.activeTab,
//           ]}
//           onPress={() => setActiveTab('Cancelled')}
//         >
//           <Text style={[styles.tabText, activeTab === 'Cancelled' && styles.activeTabText]}>
//             Cancelled
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={orders.filter(order => {
//           if (activeTab === 'All Order') return true;
//           if (activeTab === 'On Process') return order.status === 'On Process';
//           if (activeTab === 'Sent') return order.status === 'Sent';
//           if (activeTab === 'Cancelled') return order.status === 'Cancelled';
//           return false;
//         })}
//         renderItem={renderOrderItem}
//         keyExtractor={(item) => item.id}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             {/* <Text style={styles.emptyText}>No orders found</Text> */}
//           </View>
//         }
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: SPACING.md,
//   },
//   backButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: COLORS.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//     // marginLeft: 'auto',
//     ...SHADOWS.small,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   placeholder: {
//     width: 40,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     // paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e5e5',
//   },
//   tabButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//   },
//   activeTab: {
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.black,
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.text.secondary,
//   },
//   activeTabText: {
//     color: COLORS.black,
//     fontWeight: '600',
//   },
//   orderContainer: {
//     margin: 16,
//     borderWidth: 1,
//     borderColor: COLORS.gray[100],
//     padding: SPACING.smmd,
//     borderRadius: BORDER_RADIUS.lg,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: SPACING.sm,
//   },
//   orderBody: { 
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   productInfo: { 
//     flex: 1,
//     marginLeft: 12,
//   },
//   productImage: { 
//     width: 90,
//     height: 120,
//     borderRadius: 8,
//   },
//   avatarContainer: {
//     marginRight: SPACING.sm,
//   },
//   avatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 20,
//   },
//   orderInfo: {
//     flex: 1,
//   },
//   buyerName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },
//   productName: {
//     fontSize: 14,
//     color: '#111',
//     marginTop: 4,
//     fontWeight: '700',
//   },
//   sizeVariant: {
//     fontSize: FONTS.sizes.sm,
//     color: '#999',
//     marginTop: 4,
//   },
//   statusContainer: {
//     marginLeft: 'auto',
//   },
//   status: {
//     fontSize: FONTS.sizes.sm,
//     fontWeight: '600',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   sentStatus: {
//     color: COLORS.accentPink,
//     // backgroundColor: 'rgba(255, 107, 107, 0.1)',
//   },
//   orderFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   orderNumber: {
//     fontSize: FONTS.sizes.sm,
//     color: '#999',
//   },
//   orderNumberValue: {
//     fontSize: FONTS.sizes.sm,
//     color: '#999',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: SPACING.lg,
//   },
//   emptyText: {
//     fontSize: FONTS.sizes.md,
//     color: '#999',
//   },
// });

// export default SellingHistoryScreen;

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
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { RootStackParamList, CustomerOrderDetails } from '../../types';
import { Ionicons } from '@expo/vector-icons';
// Import the new customer orders hook
import { useGetCustomerOrdersMutation, useGetSellerOrdersMutation } from '../../hooks/useCustomerOrders';
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

type SellingHistoryRouteProp = RouteProp<RootStackParamList, 'SellingHistory'>;
const SellingHistoryScreen = () => {
  const navigation = useNavigation<MyOrdersScreenNavigationProp>();
  const route = useRoute<SellingHistoryRouteProp>();
  const { store_id } = route.params;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'On Process' | 'sent' | 'cancelled'>('all');
  const [orders, setOrders] = useState<CustomerOrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemImage, setItemImage] = useState<String>('');
  const { mutate: getSellerOrders, data, error, isLoading, isSuccess, isError } = useGetSellerOrdersMutation();

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
      await getSellerOrders(store_id, 50, 1, 'all'); // Get 50 orders, offset 1, all statuses
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
          <Text style={styles.storeName}>{itemDetails[0].username || 'Buyer Name'}</Text>
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
        <Text style={styles.storeName}>Order: #{detailOrders[0].order_id}</Text>
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

export default SellingHistoryScreen;