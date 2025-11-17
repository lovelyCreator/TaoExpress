import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS, FONTS, SPACING } from '../constants';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  style?: object;
  priceStyle?: object;
  originalPriceStyle?: object;
  discountStyle?: object;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  discountPercentage,
  style,
  priceStyle,
  originalPriceStyle,
  discountStyle,
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const calculatedDiscount = discountPercentage || (hasDiscount ? Math.round(((originalPrice! - price) / originalPrice!) * 100) : 0);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.priceRow}>
        {hasDiscount && (
          <Text style={[styles.originalPrice, originalPriceStyle]}>
            ${originalPrice?.toFixed(2)}
          </Text>
        )}
        <Text style={[styles.currentPrice, priceStyle]}>
          ${price.toFixed(2)}
        </Text>
        {hasDiscount && (
          <View style={[styles.discountBadge, discountStyle]}>
            <Text style={styles.discountText}>
              {calculatedDiscount}% Off
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
  },
  currentPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.accentPink,
    marginRight: SPACING.xs,
  },
  discountBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default PriceDisplay;