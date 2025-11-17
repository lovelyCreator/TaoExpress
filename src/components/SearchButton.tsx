import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants';

interface SearchButtonProps {
  placeholder: string;
  onPress: () => void;
  onCameraPress?: () => void;
  style?: ViewStyle;
}

const SearchButton: React.FC<SearchButtonProps> = ({
  placeholder,
  onPress,
  onCameraPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color={COLORS.gray[400]} style={styles.searchIcon} />
      <TouchableOpacity style={styles.input} onPress={onPress}>
        <Text style={styles.placeholder}>{placeholder}</Text>
      </TouchableOpacity>
      {onCameraPress && (
        <TouchableOpacity style={styles.cameraButton} onPress={onCameraPress}>
          <Ionicons name="camera-outline" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
  },
  placeholder: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
  },
  cameraButton: {
    marginLeft: SPACING.xs,
  },
});

export default SearchButton;
