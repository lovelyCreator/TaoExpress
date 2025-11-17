import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { Notification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/localDatabase';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'shopping' | 'promotions'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const notifications = await getNotifications(user.id);
      setNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    try {
      await markNotificationAsRead(user?.id || '', notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        if (notification.data?.orderId) {
          (navigation as any).navigate('DetailOrder', { orderId: notification.data.orderId });
        }
        break;
      case 'offer':
        if (notification.data?.promoCode) {
          navigation.navigate('Cart' as never);
        }
        break;
      case 'activity':
        if (notification.data?.sellerId) {
          navigation.navigate('MyStore' as never);
        }
        break;
      default:
        break;
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return require('../../assets/icons/orderconfirmed.png');
      case 'offer':
        return 'gift-outline';
      case 'activity':
        return 'heart-outline';
      case 'promotion':
        return 'megaphone-outline';
      case 'stock':
        return require('../../assets/icons/backinstock.png');
      case 'review':
        return require('../../assets/icons/reviewreminder.png');
      case 'sale':
        return require('../../assets/icons/flashsale.png');
      case 'cart':
        return require('../../assets/icons/cartreminder.png');
      case 'arrival':
        return require('../../assets/icons/newarrival.png');
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return COLORS.info;
      case 'offer':
        return COLORS.warning;
      case 'activity':
        return COLORS.primary;
      case 'promotion':
        return COLORS.secondary;
      case 'stock':
        return COLORS.success;
      case 'review':
        return '#FFD700';
      case 'sale':
        return COLORS.error;
      case 'cart':
        return '#06B6D4';
      case 'arrival':
        return '#EF4444';
      default:
        return COLORS.text.secondary;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'orders') return notification.type === 'order';
    if (activeTab === 'shopping') return ['stock', 'cart', 'arrival'].includes(notification.type);
    if (activeTab === 'promotions') return ['offer', 'promotion', 'sale'].includes(notification.type);
    return true;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderTabs = () => {
    if (notifications.length === 0) return null;
    
    return (
      <View>
        <View style={styles.tabsContainer}>
          {[
            { key: 'all', label: 'All' },
            { key: 'orders', label: 'Orders' },
            { key: 'shopping', label: 'Shopping' },
            { key: 'promotions', label: 'Promotions' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.notificationSummary}>
          <Text style={styles.notificationCount}>{notifications.length} Notifications</Text>
          {notifications.some(n => !n.isRead) && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          // !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          {/* <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={24}
            color={getNotificationColor(item.type)}
          /> */}
          <Image source={getNotificationIcon(item.type)} />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {formatNotificationTime(item.createdAt)}
          </Text>
        </View>
        
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const formatNotificationTime = (createdAt: Date) => {
    const now = new Date();
    const notificationDate = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return notificationDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups: { [key: string]: Notification[] } = {
      'Today': [],
      'Yesterday': [],
      'Earlier': []
    };
    
    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      const isToday = notificationDate.toDateString() === today.toDateString();
      const isYesterday = notificationDate.toDateString() === yesterday.toDateString();
      
      if (isToday) {
        groups['Today'].push(notification);
      } else if (isYesterday) {
        groups['Yesterday'].push(notification);
      } else {
        groups['Earlier'].push(notification);
      }
    });
    
    return groups;
  };

  const renderGroupedNotifications = () => {
    const groupedNotifications = groupNotificationsByDate(filteredNotifications);
    
    return (
      <View style={styles.groupedContainer}>
        {Object.entries(groupedNotifications).map(([groupName, groupNotifications]) => {
          if (groupNotifications.length === 0) return null;
          
          return (
            <View key={groupName}>
              <Text style={styles.groupHeader}>{groupName}</Text>
              {groupNotifications.map((notification) => (
                <View key={notification.id}>
                  {renderNotification({ item: notification })}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.bellContainer}>
          <View style={styles.bellIcon}>
            <Image source={require('../../assets/icons/notification.png')} />
          </View>
          <View style={styles.exclamationBadge}>
            <Text style={styles.exclamationText}>!</Text>
          </View>
        </View>
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        Your notifications will be shown here. You can change your notifications based on your preferences anytime.
      </Text>
      <TouchableOpacity
        style={styles.startExploringButton}
        onPress={() => navigation.navigate('Main' as never)}
      >
        <Text style={styles.startExploringButtonText}>Start Exploring</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {filteredNotifications.length !== 0 && renderTabs()}
      
      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          renderEmptyState()
        ) : (
          renderGroupedNotifications()
        )}
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
    paddingTop:SPACING['2xl'],
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 1, height:1},
    shadowOpacity: 0.1,
    shadowRadius: 50
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 32, // Same width as back button for centering
  },
  markAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomColor: COLORS.black,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.black,
    fontWeight: '600',
  },
  notificationSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  notificationCount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '400',
    color: COLORS.text.primary,
  },
  groupedContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  groupHeader: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: SPACING.md,

  },
  unreadNotification: {
    backgroundColor: COLORS.primary + '05',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    // borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    // backgroundColor: COLORS.gray[100],
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginHorizontal: SPACING.sm,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    // flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    // height: '100%',
  },
  emptyIconContainer: {
    // marginBottom: SPACING.lg,
    flexDirection: 'column',
    alignItems: 'center'
  },
  bellContainer: {
    // position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    width: 300,
    height: 300,
    marginTop: SPACING['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  exclamationBadge: {
    position: 'absolute',
    top: 10,
    right: 25,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exclamationText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  startExploringButton: {
    backgroundColor: COLORS.black,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  startExploringButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    color: COLORS.white,
  },
});

export default NotificationsScreen;