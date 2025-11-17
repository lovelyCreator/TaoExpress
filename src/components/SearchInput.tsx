import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: object;
  inputStyle?: object;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search',
  style,
  inputStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="search"
        size={20}
        color={COLORS.gray[400]}
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray[400]}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
        >
          <Ionicons
            name="close"
            size={20}
            color={COLORS.gray[400]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  clearButton: {
    padding: SPACING.xs,
  },
});

export default SearchInput;