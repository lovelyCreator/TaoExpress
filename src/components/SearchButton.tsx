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
      {onCameraPress && (
        <TouchableOpacity style={styles.cameraButton} onPress={onCameraPress}>
          <Ionicons name="camera-outline" size={22} color={COLORS.text.primary} />
          <Text style={{color: COLORS.gray[500]}}> | </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.input} onPress={onPress}>
        <Text style={styles.placeholder}>{placeholder}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.searchButton} onPress={onPress}>
        <Ionicons name="search" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  input: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  placeholder: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
  },
  cameraButton: {
    padding: SPACING.xs,
    flexDirection: 'row',
  },
  searchButton: {
    backgroundColor: COLORS.text.primary,
    borderRadius: 8,
    width: 48,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchButton;
