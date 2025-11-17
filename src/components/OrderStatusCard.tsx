import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

interface OrderStatusCardProps {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'waiting_for_payment';
  orderId?: string;
  onPress?: () => void;
  style?: object;
}

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  status,
  orderId,
  onPress,
  style,
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: 'time-outline',
          label: 'Pending',
          color: COLORS.warning,
        };
      case 'confirmed':
        return {
          icon: 'checkmark-circle-outline',
          label: 'Confirmed',
          color: COLORS.info,
        };
      case 'processing':
        return {
          icon: 'refresh-outline',
          label: 'Processing',
          color: COLORS.primary,
        };
      case 'shipped':
        return {
          icon: 'car-outline',
          label: 'Shipped',
          color: COLORS.secondary,
        };
      case 'delivered':
        return {
          icon: 'checkmark-done-outline',
          label: 'Delivered',
          color: COLORS.success,
        };
      case 'cancelled':
        return {
          icon: 'close-circle-outline',
          label: 'Cancelled',
          color: COLORS.error,
        };
      case 'returned':
        return {
          icon: 'return-down-back-outline',
          label: 'Returned',
          color: COLORS.error,
        };
      case 'waiting_for_payment':
        return {
          icon: 'wallet-outline',
          label: 'Waiting for Payment',
          color: COLORS.warning,
        };
      default:
        return {
          icon: 'help-circle-outline',
          label: 'Unknown',
          color: COLORS.text.secondary,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]}>
          <Ionicons name={statusInfo.icon as any} size={16} color={COLORS.white} />
        </View>
        <View style={styles.textContainer}>
          {orderId && <Text style={styles.orderId}>Order #{orderId}</Text>}
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  statusText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});

export default OrderStatusCard;