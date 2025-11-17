import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';
import { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  style?: object;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  style,
}) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'order':
        return require('../assets/icons/orderconfirmed.png');
      case 'offer':
        return 'gift-outline';
      case 'activity':
        return 'heart-outline';
      case 'promotion':
        return 'megaphone-outline';
      case 'stock':
        return require('../assets/icons/backinstock.png');
      case 'review':
        return require('../assets/icons/reviewreminder.png');
      case 'sale':
        return require('../assets/icons/flashsale.png');
      case 'cart':
        return require('../assets/icons/cartreminder.png');
      case 'arrival':
        return require('../assets/icons/newarrival.png');
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
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

  const iconSource = getNotificationIcon();
  const iconColor = getNotificationColor();

  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unreadContainer, style]}
      onPress={() => onPress(notification)}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          {typeof iconSource === 'string' ? (
            <Ionicons name={iconSource as any} size={20} color={COLORS.white} />
          ) : (
            <Image source={iconSource} style={styles.iconImage} />
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, !notification.isRead && styles.unreadTitle]}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.time}>
            {new Date(notification.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {!notification.isRead && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  unreadContainer: {
    backgroundColor: COLORS.gray[50],
  },
  content: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconImage: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  message: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  time: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
  },
  unreadIndicator: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});

export default NotificationItem;