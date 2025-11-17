import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minQuantity?: number;
  maxQuantity?: number;
  style?: object;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  minQuantity = 1,
  maxQuantity = 99,
  style,
}) => {
  const canDecrement = quantity > minQuantity;
  const canIncrement = quantity < maxQuantity;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, !canDecrement && styles.disabledButton]}
        onPress={onDecrement}
        disabled={!canDecrement}
      >
        <Ionicons
          name="remove"
          size={16}
          color={canDecrement ? COLORS.text.primary : COLORS.gray[300]}
        />
      </TouchableOpacity>
      
      <Text style={styles.quantityText}>{quantity}</Text>
      
      <TouchableOpacity
        style={[styles.button, !canIncrement && styles.disabledButton]}
        onPress={onIncrement}
        disabled={!canIncrement}
      >
        <Ionicons
          name="add"
          size={16}
          color={canIncrement ? COLORS.text.primary : COLORS.gray[300]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  button: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginHorizontal: SPACING.md,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default QuantitySelector;