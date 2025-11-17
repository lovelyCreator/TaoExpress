import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface CategorySelectorProps {
  label: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
  style?: object;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  label,
  value,
  placeholder = 'Select category',
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.selectorContent}>
        <Text style={styles.valueText}>{value || placeholder}</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  valueText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
});

export default CategorySelector;