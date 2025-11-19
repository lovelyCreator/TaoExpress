import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants';

interface Coupon {
  id: number;
  code: string;
  discount: string;
  minAmount: number;
  title: string;
  description: string;
  endDate: string;
  status: 'active' | 'ended' | 'used';
}

const CouponScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'my' | 'ended' | 'using'>('my');
  const [couponCode, setCouponCode] = useState('');

  // Sample coupon data
  const coupons: Coupon[] = [
    {
      id: 1,
      code: 'TRANSPORT66',
      discount: '$10',
      minAmount: 10,
      title: 'Free Shipping Voucher',
      description: 'Valid for purchases and shipping fees',
      endDate: '2025-11-29 00:00:00',
      status: 'active',
    },
    {
      id: 2,
      code: 'WELCOME20',
      discount: '$20',
      minAmount: 50,
      title: 'Welcome Bonus',
      description: 'Special discount for new customers',
      endDate: '2024-12-31 23:59:59',
      status: 'active',
    },
    {
      id: 3,
      code: 'SAVE15',
      discount: '$15',
      minAmount: 30,
      title: 'Special Savings',
      description: 'Limited time promotional offer',
      endDate: '2024-11-20 00:00:00',
      status: 'ended',
    },
    {
      id: 4,
      code: 'SHIP5',
      discount: '$5',
      minAmount: 20,
      title: 'Shipping Discount',
      description: 'Reduced shipping cost on eligible orders',
      endDate: '2024-11-15 00:00:00',
      status: 'used',
    },
  ];

  const filteredCoupons = coupons.filter(coupon => {
    if (activeTab === 'my') return coupon.status === 'active';
    if (activeTab === 'ended') return coupon.status === 'ended';
    if (activeTab === 'using') return coupon.status === 'used';
    return false;
  });

  const handleChangeCoupon = () => {
    if (couponCode.trim()) {
      console.log('Adding coupon:', couponCode);
      // Handle coupon code submission
      setCouponCode('');
    }
  };

  const handleUseCoupon = (coupon: Coupon) => {
    console.log('Using coupon:', coupon.code);
    // Handle coupon usage
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
        <Text style={styles.headerTitle}>Coupon</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'my' && styles.tabActive]}
              onPress={() => setActiveTab('my')}
            >
              <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
                Available
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'ended' && styles.tabActive]}
              onPress={() => setActiveTab('ended')}
            >
              <Text style={[styles.tabText, activeTab === 'ended' && styles.tabTextActive]}>
                Expired
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'using' && styles.tabActive]}
              onPress={() => setActiveTab('using')}
            >
              <Text style={[styles.tabText, activeTab === 'using' && styles.tabTextActive]}>
                Used
              </Text>
            </TouchableOpacity>
          </View>

          {/* Coupon Code Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter coupon code"
              placeholderTextColor="#999"
              value={couponCode}
              onChangeText={setCouponCode}
            />
            <TouchableOpacity 
              style={styles.changeButton}
              onPress={handleChangeCoupon}
            >
              <Text style={styles.changeButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Coupon List */}
          {filteredCoupons.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={80} color="#CCC" />
              <Text style={styles.emptyText}>No coupons available</Text>
            </View>
          ) : (
            <View style={styles.couponList}>
              {filteredCoupons.map((coupon) => (
                <View key={coupon.id} style={styles.couponCard}>
                  <View style={styles.couponHeader}>
                    <Text style={styles.discountAmount}>{coupon.discount}</Text>
                    {coupon.status === 'active' && (
                      <TouchableOpacity 
                        style={styles.useButton}
                        onPress={() => handleUseCoupon(coupon)}
                      >
                        <Text style={styles.useButtonText}>Use</Text>
                      </TouchableOpacity>
                    )}
                    {coupon.status === 'ended' && (
                      <View style={styles.expiredBadge}>
                        <Text style={styles.expiredText}>Expired</Text>
                      </View>
                    )}
                    {coupon.status === 'used' && (
                      <View style={styles.usedBadge}>
                        <Text style={styles.usedText}>Used</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.minAmount}>
                    Minimum purchase: ${coupon.minAmount}
                  </Text>

                  <Text style={styles.couponTitle}>{coupon.title}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.endDate}>Expires: {coupon.endDate}</Text>
                  <Text style={styles.description}>{coupon.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    marginTop: -20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: FONTS.sizes.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  changeButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  changeButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  couponList: {
    gap: SPACING.md,
  },
  couponCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  discountAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A90E2',
  },
  useButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  useButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  expiredBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  expiredText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  usedBadge: {
    backgroundColor: '#999',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  usedText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  minAmount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  couponTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: SPACING.sm,
  },
  endDate: {
    fontSize: FONTS.sizes.sm,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 3,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
    fontWeight: '500',
  },
});

export default CouponScreen;
