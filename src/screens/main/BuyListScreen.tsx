import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONTS, SPACING } from '../../constants';
import { RootStackParamList, Product } from '../../types';
import { ProductCard } from '../../components';
import OrderFilterModal from '../../components/OrderFilterModal';

type BuyListScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'category' | 'waiting' | 'end' | 'progressing';
  items: {
    productName: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  totalAmount: number;
}

const BuyListScreen = () => {
  const navigation = useNavigation<BuyListScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'category' | 'waiting' | 'end' | 'progressing'>('category');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<{ orderNumber: string; startDate: Date | null; endDate: Date | null }>({
    orderNumber: '',
    startDate: null,
    endDate: null,
  });

  // Sample order data with images
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: '2024-11-18',
      status: 'category',
      items: [
        { 
          productName: 'Wireless Headphones', 
          quantity: 1, 
          price: 49.99,
          image: 'https://picsum.photos/seed/headphones/400/500'
        },
        { 
          productName: 'Phone Case', 
          quantity: 2, 
          price: 15.99,
          image: 'https://picsum.photos/seed/case/400/500'
        },
      ],
      totalAmount: 81.97,
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: '2024-11-17',
      status: 'waiting',
      items: [
        { 
          productName: 'Smart Watch', 
          quantity: 1, 
          price: 199.99,
          image: 'https://picsum.photos/seed/watch/400/500'
        },
      ],
      totalAmount: 199.99,
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      date: '2024-11-15',
      status: 'progressing',
      items: [
        { 
          productName: 'Laptop Stand', 
          quantity: 1, 
          price: 35.99,
          image: 'https://picsum.photos/seed/stand/400/500'
        },
        { 
          productName: 'USB Cable Set', 
          quantity: 3, 
          price: 9.99,
          image: 'https://picsum.photos/seed/cable/400/500'
        },
      ],
      totalAmount: 65.96,
    },
  ];

  // Sample products for "More to love" section
  const recommendedProducts: Product[] = [
    {
      id: '1',
      name: 'Summer Floral Dress',
      price: 45.99,
      originalPrice: 65.99,
      discount: 30,
      rating: 4.5,
      ratingCount: 128,
      image: 'https://picsum.photos/seed/dress1/400/500',
      images: ['https://picsum.photos/seed/dress1/400/500'],
      company: '1688',
      category: '1688_women',
      subcategory: '1688_women_dresses',
      orderCount: 456,
    },
    {
      id: '2',
      name: 'Wireless Headphones',
      price: 89.99,
      originalPrice: 129.99,
      discount: 31,
      rating: 4.8,
      ratingCount: 256,
      image: 'https://picsum.photos/seed/headphones/400/500',
      images: ['https://picsum.photos/seed/headphones/400/500'],
      company: '1688',
      category: '1688_electronics',
      subcategory: '1688_electronics_audio',
      orderCount: 789,
    },
    {
      id: '3',
      name: 'Smart Watch',
      price: 199.99,
      originalPrice: 299.99,
      discount: 33,
      rating: 4.7,
      ratingCount: 512,
      image: 'https://picsum.photos/seed/watch/400/500',
      images: ['https://picsum.photos/seed/watch/400/500'],
      company: '1688',
      category: '1688_electronics',
      subcategory: '1688_electronics_wearables',
      orderCount: 1234,
    },
    {
      id: '4',
      name: 'Laptop Stand',
      price: 35.99,
      originalPrice: 49.99,
      discount: 28,
      rating: 4.6,
      ratingCount: 89,
      image: 'https://picsum.photos/seed/stand/400/500',
      images: ['https://picsum.photos/seed/stand/400/500'],
      company: '1688',
      category: '1688_home',
      subcategory: '1688_home_office',
      orderCount: 345,
    },
    {
      id: '5',
      name: 'Phone Case',
      price: 15.99,
      originalPrice: 24.99,
      discount: 36,
      rating: 4.9,
      ratingCount: 678,
      image: 'https://picsum.photos/seed/case/400/500',
      images: ['https://picsum.photos/seed/case/400/500'],
      company: '1688',
      category: '1688_accessories',
      subcategory: '1688_accessories_phone',
      orderCount: 2345,
    },
    {
      id: '6',
      name: 'USB Cable Set',
      price: 12.99,
      originalPrice: 19.99,
      discount: 35,
      rating: 4.4,
      ratingCount: 234,
      image: 'https://picsum.photos/seed/cable/400/500',
      images: ['https://picsum.photos/seed/cable/400/500'],
      company: '1688',
      category: '1688_electronics',
      subcategory: '1688_electronics_cables',
      orderCount: 567,
    },
  ];

  const handleApplyFilters = (newFilters: { orderNumber: string; startDate: Date | null; endDate: Date | null }) => {
    setFilters(newFilters);
    console.log('Filters applied:', newFilters);
    // Here you would filter the orders based on the filters
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
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
        <Text style={styles.headerTitle}>Buy List</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Tab Navigation */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabScrollContent}
          >
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'category' && styles.tabActive]}
                onPress={() => setActiveTab('category')}
              >
                <Text style={[styles.tabText, activeTab === 'category' && styles.tabTextActive]}>
                  Category
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'waiting' && styles.tabActive]}
                onPress={() => setActiveTab('waiting')}
              >
                <Text style={[styles.tabText, activeTab === 'waiting' && styles.tabTextActive]}>
                  Waiting
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'end' && styles.tabActive]}
                onPress={() => setActiveTab('end')}
              >
                <Text style={[styles.tabText, activeTab === 'end' && styles.tabTextActive]}>
                  End
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'progressing' && styles.tabActive]}
                onPress={() => setActiveTab('progressing')}
              >
                <Text style={[styles.tabText, activeTab === 'progressing' && styles.tabTextActive]}>
                  Progressing
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Orders List or Empty State */}
          {orders.filter(order => order.status === activeTab).length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="basket-outline" size={80} color="#CCC" />
              <Text style={styles.emptyTitle}>No orders</Text>
              <Text style={styles.emptySubtitle}>Add orders</Text>
            </View>
          ) : (
            <View style={styles.ordersContainer}>
              {orders.filter(order => order.status === activeTab).map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                  
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.orderItemImage}
                        resizeMode="cover"
                      />
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.itemName}>{item.productName}</Text>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.orderFooter}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* More to Love Section */}
          <View style={styles.moreToLoveSection}>
            <Text style={styles.sectionTitle}>More to love</Text>
            
            <FlatList
              data={recommendedProducts}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  variant="grid"
                />
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.productGrid}
            />
          </View>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <OrderFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  filterButton: {
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  tabScrollView: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  tabScrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tabActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  ordersContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderNumber: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  orderDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  orderItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  itemPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalAmount: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: '#4A90E2',
  },
  moreToLoveSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  productGrid: {
    paddingBottom: SPACING.lg,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
});

export default BuyListScreen;
