import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface OrderItemProps {
  brand: string;
  name: string;
  size: string;
  color: string;
  originalPrice?: number;
  currentPrice: number;
  discount?: number;
  image: any;
  onGiveFeedback?: () => void;
  status?: string;
  style?: any;
}

const OrderItem: React.FC<OrderItemProps> = ({
  brand,
  name,
  size,
  color,
  originalPrice,
  currentPrice,
  discount,
  image,
  onGiveFeedback,
  status,
  style,
}) => {
  return (
    <View style={[styles.orderItem, style]}>
      <Image
        source={image}
        style={styles.itemImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemBrand}>{brand}</Text>
        <Text style={styles.itemName} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.itemDetails}>
          Size: {size}  Color: {color}
        </Text>
        
        <View style={styles.priceRow}>
          {originalPrice && (
            <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
          )}
          <Text style={styles.currentPrice}>${currentPrice.toFixed(2)}</Text>
          {discount && (
            <Text style={styles.discountText}>-{discount}%</Text>
          )}
        </View>
        
        {/* Give Feedback Button */}
        {status === "Sent" && onGiveFeedback && (
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={onGiveFeedback}
          >
            <Text style={styles.feedbackButtonText}>Give Feedback</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.accentPink + '10',
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
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  feedbackButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.black,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default OrderItem;