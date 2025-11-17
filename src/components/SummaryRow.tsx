import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS, FONTS, SPACING } from '../constants';

interface SummaryRowProps {
  label: string;
  value: string;
  isTotal?: boolean;
  isDiscount?: boolean;
  style?: object;
  labelStyle?: object;
  valueStyle?: object;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  isTotal = false,
  isDiscount = false,
  style,
  labelStyle,
  valueStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.label,
          isTotal && styles.totalLabel,
          isDiscount && styles.discountLabel,
          labelStyle,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          isTotal && styles.totalValue,
          isDiscount && styles.discountValue,
          valueStyle,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  label: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[600],
  },
  value: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  totalLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  discountLabel: {
    color: COLORS.success,
  },
  discountValue: {
    color: COLORS.success,
  },
});

export default SummaryRow;