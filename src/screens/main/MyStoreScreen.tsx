import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useStoreMutation } from '../../hooks/useStoreMutation';

type MyStoreScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyStore'>;

const MyStoreScreen: React.FC = () => {
  const navigation = useNavigation<MyStoreScreenNavigationProp>();
  const { user } = useAuth();
  const { getStore, getOrderStats, data: storeData, orderStats, loading: storeLoading } = useStoreMutation();
  
  // Fetch store data when component mounts
  useEffect(() => {
    console.log("USER INFORMATION: ", user);
    if (user?.id) {
      getStore(user.id);
      console.log("STORE DATA: ", storeData?.logo);
    }
  }, [user?.id, getStore]);

  // Fetch order statistics when store data is available
  useEffect(() => {
    if (storeData?.id) {
      getOrderStats(storeData.id);
    }
  }, [storeData?.id, getOrderStats]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => console.log('Logout'), style: 'destructive' },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Store</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('MyStoreSettings')}
        >
          <Ionicons name="settings-outline" size={18} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Image source={require('../../assets/icons/bell.png')} style={{width: 16, height: 18}} />
          {/* <Ionicons name="notifications-outline" size={18} color={COLORS.text.primary} /> */}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Chat', {})}
        >
          <Image source={require('../../assets/icons/chat.png')} style={{width: 16, height: 18}} />
          {/* <Ionicons name="chatbubble-outline" size={18} color={COLORS.text.primary} /> */}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStoreProfile = () => (
    <View style={styles.storeProfileCard}>
      <TouchableOpacity onPress={() => navigation.navigate('Profile' as any)}>
        <Image
          source={storeData?.logo ? { uri: storeData?.logo } : require('../../assets/images/avatar.png')}
          style={styles.storeAvatar}
        />
      </TouchableOpacity>
      <View style={styles.storeInfo}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile' as any)}>
          <Text style={styles.storeName}>{storeData?.name || 'User'}</Text>
        </TouchableOpacity>
        <Text style={styles.storeUrl}>taoexpress.com/{storeData?.name || 'username'}</Text>
        <View style={styles.userStats}>
          <TouchableOpacity 
            style={styles.statItem} 
            onPress={() => navigation.navigate('Followers')}
          >
            <Text style={styles.statNumber}>{storeData?.followers?.toString() || '0'}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <View style={styles.statSeparator} />
          <TouchableOpacity 
            style={styles.statItem} 
            onPress={() => navigation.navigate('Following')}
          >
            <Text style={styles.statNumber}>{storeData?.following?.toString() || '0'}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('SellerProfile', { sellerId: storeData?.id?.toString() || '1' })}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
    </View>
  );

  const renderOrderStatus = () => (
    <View style={styles.orderStatusSection}>
      <View style={styles.orderStatusHeader}>
        <Text style={styles.orderStatusTitle}>Order Status</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SellingHistory', {store_id: storeData?.id?.toString() || '1'})}
        >
          <Text style={styles.sellingHistoryText}>Selling History</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.orderStatsContainer}>
        <View style={styles.orderStatCard}>
          <Text style={styles.orderStatNumber}>{storeData?.confirmedCount.toString() || '0'}</Text>
          <Text style={styles.orderStatLabel}>On Process</Text>
        </View>
        <View style={styles.orderStatCard}>
          <Text style={styles.orderStatNumber}>{storeData?.canceledCount.toString() || '0'}</Text>
          <Text style={styles.orderStatLabel}>Cancelled</Text>
        </View>
        <View style={styles.orderStatCard}>
          <Text style={styles.orderStatNumber}>{storeData?.completedCount.toString() || '0'}</Text>
          <Text style={styles.orderStatLabel}>Sent</Text>
        </View>
      </View>
    </View>
  );

  const renderActivitySection = () => {
    const activityItems = [
      {
        icon: require('../../assets/icons/myproduct.png'),
        title: 'My products',
        onPress: () => navigation.navigate('MyProducts'),
      },
      {
        icon: require('../../assets/icons/finance.png'),
        title: 'Finance',
        onPress: () => navigation.navigate('Finance'),
      },
      {
        icon: require('../../assets/icons/performance.png'),
        title: 'Performance',
        onPress: () => navigation.navigate('StorePerformance'),
      },
    ];

    return (
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Activity</Text>
        {activityItems.map((item, index) => (
          <TouchableOpacity
            key={`activity-item-${index}`}
            style={styles.activityItem}
            onPress={item.onPress}
          >
            <View style={styles.activityItemLeft}>
              <View style={styles.activityIcon}>
                {/* <Ionicons name={item.icon as any} size={20} color={COLORS.text.primary} /> */}
                <Image source={item.icon as any} width={20} height={20} />
              </View>
              <Text style={styles.activityText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStoreProfile()}
        {renderOrderStatus()}
        {renderActivitySection()}
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
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
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
    marginLeft: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  storeProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  storeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  storeUrl: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    // width: '100%',
    // marginTop: SPACING.md,
    // backgroundColor: COLORS.gray[50],
    // borderRadius: BORDER_RADIUS.lg,
    // paddingVertical: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statNumber: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  statSeparator: {
    width: 1,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: SPACING.md,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  statDivider: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.sm,
  },
  orderStatusSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    // padding: SPACING.md,
    // ...SHADOWS.sm,
  },
  orderStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orderStatusTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sellingHistoryText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.accentPink,
  },
  orderStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderStatCard: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.smmd,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  orderStatNumber: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  orderStatLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'left',
  },
  activitySection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginVertical: SPACING.md,
    // ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    // padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.smmd,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.gray[100],
  },
  activityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  activityText: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '400',
    color: COLORS.text.primary,
  },
});

export default MyStoreScreen;