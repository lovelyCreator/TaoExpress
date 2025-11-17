import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { RootStackParamList, CustomerOrderDetails } from '../../types';
import { useGetSellerOrdersMutation } from '../../hooks/useCustomerOrders';

type ChatOrdersScreenRouteProp = RouteProp<RootStackParamList, 'ChatOrders'>;
type ChatOrdersScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ChatOrdersScreen: React.FC = () => {
  const route = useRoute<ChatOrdersScreenRouteProp>();
  const navigation = useNavigation<ChatOrdersScreenNavigationProp>();
  const [orders, setOrders] = useState<CustomerOrderDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const { 
    mutate: getSellerOrders, 
    data, 
    error, 
    isLoading, 
    isSuccess, 
    isError 
  } = useGetSellerOrdersMutation();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders using the seller orders API
      // We'll use a default store_id of "1" for now, but in a real app this would come from route params
      await getSellerOrders("1", 25, 1, "all");
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  // Handle data updates from the mutation
  useEffect(() => {
    if (isSuccess && data) {
      console.log('Received seller orders data:', data);
      setOrders(data.orders || []);
      setLoading(false);
    }
    
    if (isError && error) {
      console.error('Error fetching seller orders:', error);
      setLoading(false);
    }
  }, [isSuccess, data, isError, error]);

  const handleOrderPress = (order: CustomerOrderDetails) => {
    // Navigate to order detail screen
    navigation.navigate('DetailOrder', { orderData: order });
  };

  const handleAskPress = (order: CustomerOrderDetails) => {
    // Navigate back to chat screen with the order context
    navigation.navigate('Chat', { 
      orderId: order.order_id?.toString() || order.id?.toString() || '',
      orderDetails: order
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return COLORS.warning;
      case 'confirmed':
        return COLORS.info;
      case 'processing':
        return COLORS.primary;
      case 'shipped':
        return COLORS.secondary;
      case 'sent':
        return COLORS.success;
      case 'delivered':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    // Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderOrderItem = ({ item }: { item: CustomerOrderDetails }) => {
    // Extract product details from order
    let details = item.details;
    if (typeof item.details === 'string') {
      try {
        details = JSON.parse(item.details);
      } catch (e) {
        details = [];
      }
    }
    
    // Get first item details if available
    let firstItem = null;
    if (Array.isArray(details) && details.length > 0) {
      let itemDetails = details[0].item_details;
      if (typeof itemDetails === 'string') {
        try {
          itemDetails = JSON.parse(itemDetails);
        } catch (e) {
          itemDetails = [];
        }
      }
      
      if (Array.isArray(itemDetails) && itemDetails.length > 0) {
        firstItem = itemDetails[0];
      }
    }
    
    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item)}>
        <View style={styles.orderHeader}>
          <Text style={styles.storeName}>{item.module?.module_name || 'Store'}</Text>
          <Text style={[styles.statusText, { color: getStatusColor(item.order_status) }]}>
            {getStatusText(item.order_status)}
          </Text>
        </View>
        
        <View style={styles.orderContent}>
          {firstItem && firstItem.image && (
            <Image
              source={{ uri: firstItem.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.productInfo}>
            {firstItem && (
              <>
                <Text style={styles.brandText}>{firstItem.brand || 'Brand'}</Text>
                <Text style={styles.productName} numberOfLines={2}>
                  {firstItem.name || 'Product Name'}
                </Text>
                <Text style={styles.quantity}>Qty: {firstItem.quantity || 1}</Text>
                {firstItem.variation && (
                  <Text style={styles.details}>Variant: {JSON.stringify(firstItem.variation)}</Text>
                )}
              </>
            )}
            
            <TouchableOpacity 
              style={styles.askButton}
              onPress={() => handleAskPress(item)}
            >
              <Text style={styles.askButtonText}>Ask</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.orderId}>Order #{item.order_id || item.id}</Text>
          <Text style={styles.orderTotal}>${item.order_amount?.toFixed(2) || '0.00'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Order</Text>
      <View style={styles.placeholder} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accentPink} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id?.toString() || item.order_id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders available</Text>
          </View>
        }
      />
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
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.white,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
  },
  ordersList: {
    padding: SPACING.md,
    // paddingTop: SPACING.lg,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    padding: SPACING.smmd,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.smmd,
  },
  storeName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statusText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  orderContent: {
    flexDirection: 'row',
    marginBottom: SPACING.smmd,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
    marginRight: SPACING.sm,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  quantity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  details: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  askButton: {
    backgroundColor: COLORS.accentPink,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    alignSelf: 'flex-end',
  },
  askButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
  },
  orderId: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
  },
  orderTotal: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});

export default ChatOrdersScreen;