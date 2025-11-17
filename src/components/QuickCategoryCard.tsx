import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface QuickCategoryCardProps {
  category: {
    id: string;
    name: string;
    image: string | ImageSourcePropType;
  };
  onPress: (categoryId: string) => void;
}

const QuickCategoryCard: React.FC<QuickCategoryCardProps> = ({ category, onPress }) => {
  const imageSource: ImageSourcePropType =
    typeof category.image === 'string' ? { uri: category.image } : category.image;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(category.id)}
    >
      <Image 
        source={imageSource}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.name}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default QuickCategoryCard;
