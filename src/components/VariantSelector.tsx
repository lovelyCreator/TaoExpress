import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface VariantOption {
  id: string;
  name: string;
  value: string;
}

interface VariantSelectorProps {
  label: string;
  options: VariantOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  style?: object;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              selectedValue === option.value && styles.selectedOption,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === option.value && styles.selectedOptionText,
              ]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  option: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  selectedOption: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  optionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  selectedOptionText: {
    color: COLORS.white,
  },
});

export default VariantSelector;